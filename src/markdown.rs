use pulldown_cmark::{html, Options, Parser, Event, Tag, escape::{self, StrWrite}, CodeBlockKind, CowStr, LinkType};
use rusty_ulid::Ulid;
use quick_js::Context;
use std::time;
use regex::Regex;
use std::ops::Range;
use std::collections::VecDeque;

use crate::storage::DB;
use crate::util;
use util::{Slug, CONFIG};

#[derive(Debug)]
enum ExtEvent<'a> {
    Event(Event<'a>),
    Wikilink(String, String, Option<String>),
    Maths(bool, String),
    CaptionImageStart(CowStr<'a>, CowStr<'a>),
    CaptionImageEnd,
    Redaction(String),
    Position(usize),
    ServerJS(String)
}

enum CustomCodeblockType {
    Maths,
    ServerJS
}

#[derive(Debug)]
pub enum Wikilink {
    ToPage(Ulid, String, usize, Slug), // target, text, context position, target name
    TargetMissing(Slug, String, usize) // target, text, context position
}

fn strip_paragraphs<'a, I: Iterator<Item=ExtEvent<'a>>>(i: I) -> impl Iterator<Item=ExtEvent<'a>> {
    i.filter(|x| match x {
        ExtEvent::Event(Event::Start(Tag::Paragraph)) => false,
        ExtEvent::Event(Event::End(Tag::Paragraph)) => false,
        _ => true
    })
}

#[derive(Debug)]
enum SpecialSyntaxMarker {
    Wikilink,
    InlineMaths,
    Redaction
}

fn special_marker_char(c: char) -> Option<SpecialSyntaxMarker> {
    use SpecialSyntaxMarker::*;
    match c {
        ':' => Some(Wikilink),
        '$' => Some(InlineMaths),
        '|' => Some(Redaction),
        _ => None
    }
}

// https://github.com/raphlinus/pulldown-cmark/issues/494
lazy_static::lazy_static! {
    static ref URL_REGEX: Regex = Regex::new(r#"(https?://)[^\s/$.?#].[^\s]*[^.^\s]"#).unwrap();
}

struct MarkdownReparser<'a, I> {
    stream: I,
    input: &'a str,
    text_buffer: VecDeque<CowStr<'a>>,
    output_buffer: VecDeque<ExtEvent<'a>>,
    code_block: Option<(String, CustomCodeblockType)>,
    image_content: Option<Vec<Event<'a>>>
}

impl<'a, I> MarkdownReparser<'a, I> {
    fn empty_text_buffer(&mut self) {
        let mut buffer = String::new();
        while let Some(x) = self.text_buffer.pop_front() {
            buffer.push_str(&*x);
        }
        if buffer.is_empty() {
            return;
        }
        let mut text = buffer.as_str();
        while let Some(re_match) = URL_REGEX.find(&text) {
            let leading = &text[..re_match.start()];
            self.output_buffer.push_back(ExtEvent::Event(Event::Text(CowStr::from(leading.to_string()))));
            let link_target = re_match.as_str().to_string();
            self.output_buffer.push_back(ExtEvent::Event(Event::Start(Tag::Link(LinkType::Inline, CowStr::from(link_target.clone()), "".into()))));
            self.output_buffer.push_back(ExtEvent::Event(Event::Text(CowStr::from(link_target.clone()))));
            self.output_buffer.push_back(ExtEvent::Event(Event::End(Tag::Link(LinkType::Inline, CowStr::from(link_target.clone()), "".into()))));
            text = &text[re_match.end()..];
        }
        // unnecessary allocation in case of no links, suffer, etc
        self.output_buffer.push_back(ExtEvent::Event(Event::Text(text.to_string().into())))
    }
}

impl<'a, I> Iterator for MarkdownReparser<'a, I> where I: Iterator<Item=(Event<'a>, Range<usize>)> {
    type Item = ExtEvent<'a>;

    fn next(&mut self) -> Option<Self::Item> {
        // this probably does not need to be 10, but it does need to be something
        while self.output_buffer.len() < 10 {
            if let Some((event, range)) = self.stream.next() {
                match &event {
                    Event::Text(_) | Event::Code(_) => (),
                    _ => self.empty_text_buffer()
                }
                if is_event_start_of_block_element(&event) {
                    self.output_buffer.push_back(ExtEvent::Position(range.start));
                }
                match event {
                    Event::Start(Tag::Image(_, _, _)) => {
                        self.image_content = Some(vec![]);
                    },
                    Event::End(Tag::Image(link_type, dest, title)) if self.image_content.is_some() => {
                        let image_content = std::mem::replace(&mut self.image_content, None).unwrap();
                        let is_captioned = image_content.get(0).map(|x| if let Event::Text(text) = x { text.starts_with("^") } else { false }).unwrap_or(false);
                        if is_captioned {
                            self.output_buffer.push_back(ExtEvent::CaptionImageStart(dest, title));
                            let image_tag = &self.input[range.clone()];
                            let content_start = "![^".len();
                            let content_end = image_tag.rfind("](").unwrap();
                            self.output_buffer.extend(strip_paragraphs(parse(&image_tag[content_start..content_end])));
                            self.output_buffer.push_back(ExtEvent::CaptionImageEnd);
                        } else {
                            self.output_buffer.push_back(ExtEvent::Event(Event::Start(Tag::Image(link_type, dest.clone(), title.clone()))));
                            self.output_buffer.extend(image_content.into_iter().map(ExtEvent::Event));
                            self.output_buffer.push_back(ExtEvent::Event(Event::End(Tag::Image(link_type, dest, title))));
                        }
                    },
                    event if self.image_content.is_some() => {
                        self.image_content.as_mut().unwrap().push(event);
                    },
                    Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(lang))) if &*lang == "maths" || &*lang == "math" => {
                        self.code_block = Some((String::new(), CustomCodeblockType::Maths));
                    },
                    Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(lang))) if &*lang == "serverjs" => {
                        self.code_block = Some((String::new(), CustomCodeblockType::ServerJS));
                    },
                    Event::End(Tag::CodeBlock(CodeBlockKind::Fenced(_))) if self.code_block.is_some() => { // codeblocks cannot contain other events, so this is valid
                        if let Some((content, kind)) = std::mem::replace(&mut self.code_block, None) {
                            match kind {
                                CustomCodeblockType::Maths => self.output_buffer.push_back(ExtEvent::Maths(true, content)),
                                CustomCodeblockType::ServerJS => self.output_buffer.push_back(ExtEvent::ServerJS(content))
                            }
                        } else {
                            unreachable!()
                        }
                    },
                    Event::Code(code) => {
                        match self.text_buffer.pop_back() {
                            Some(text) => {
                                if let Some((index, last_char)) = text.char_indices().last() {
                                    if let Some(special_syntax_type) = special_marker_char(last_char) {
                                        let previous_text = CowStr::from(text[..index].to_string()); // could probably avoid copying
                                        self.text_buffer.push_back(previous_text);
                                        self.empty_text_buffer();
                                        match special_syntax_type {
                                            SpecialSyntaxMarker::InlineMaths => self.output_buffer.push_back(ExtEvent::Maths(false, code.to_string())),
                                            SpecialSyntaxMarker::Redaction => self.output_buffer.push_back(ExtEvent::Redaction(code.to_string())),
                                            SpecialSyntaxMarker::Wikilink => {
                                                let link = match code.split_once(&[':', '|']) {
                                                    Some((target, display_name)) => {
                                                        match target.split_once('?') {
                                                            Some((target, tag_spec)) => ExtEvent::Wikilink(target.to_string(), display_name.to_string(), Some(tag_spec.to_string())),
                                                            None => ExtEvent::Wikilink(target.to_string(), display_name.to_string(), None)
                                                        }
                                                    },
                                                    None => ExtEvent::Wikilink(code.to_string(), code.to_string(), None)
                                                };
                                                self.output_buffer.push_back(link);
                                            }
                                        }
                                    } else {
                                        self.text_buffer.push_back(text);
                                        self.empty_text_buffer();
                                        self.output_buffer.push_back(ExtEvent::Event(Event::Code(code)));
                                    }
                                } else {
                                    self.empty_text_buffer();
                                    self.output_buffer.push_back(ExtEvent::Event(Event::Code(code)));
                                }
                            },
                            None => {
                                self.output_buffer.push_back(ExtEvent::Event(Event::Code(code)));
                            }
                        }
                    },
                    Event::Text(text) => {
                        if let Some((ref mut code, _)) = self.code_block {
                            code.push_str(&*text)
                        } else {
                            self.text_buffer.push_back(text);
                        }
                    },
                    event => {
                        self.output_buffer.push_back(ExtEvent::Event(event));
                    }
                }
            } else {
                break
            }
        }
        self.output_buffer.pop_front()
    }
}

fn parse<'a>(input: &'a str) -> impl Iterator<Item=ExtEvent<'a>> {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_HEADING_ATTRIBUTES);
    options.insert(Options::ENABLE_FOOTNOTES);
    let mdr = MarkdownReparser {
        stream: Parser::new_ext(input, options).into_offset_iter(),
        input,
        text_buffer: VecDeque::new(),
        output_buffer: VecDeque::new(),
        code_block: None,
        image_content: None
    };
    mdr
}

fn is_block_element(tag: &Tag) -> bool {
    use Tag::*;
    match tag {
        Emphasis => false,
        Strikethrough => false,
        Strong => false,
        Link(..) => false,
        _ => true
    }
}

fn is_event_start_of_block_element(event: &Event) -> bool {
    match event {
        Event::Start(tag) if is_block_element(tag) => true,
        _ => false
    }
}

fn is_start_of_block_element(ev: &ExtEvent) -> bool {
    match ev {
        ExtEvent::CaptionImageStart(_, _) => true,
        ExtEvent::Event(Event::Start(tag)) if is_block_element(&tag) => true,
        _ => false
    }
}

fn is_end_of_block_element(ev: &ExtEvent) -> bool {
    match ev {
        ExtEvent::CaptionImageEnd => true,
        ExtEvent::Event(Event::End(tag)) if is_block_element(&tag) => true,
        _ => false
    }
}

pub fn extract_info(input: &str, db: &DB) -> (Vec<(usize, String)>, Vec<Wikilink>) {
    let mut paras = Vec::new();
    let mut links = vec![];
    let mut position = 0;
    for e in parse(input) {
        match e {
            ExtEvent::Position(pos) => {
                paras.push((pos, String::new()));
                position = pos;
            }
            ExtEvent::Wikilink(target, display_name, _tag_spec) => {
                if display_name.starts_with('#') {
                    continue; // is tag link
                }
                paras.last_mut().unwrap().1.push_str(&display_name);
                let slug = Slug::new(&target);
                match db.read().page_lookup.get(&slug) {
                    Some(id) => links.push(Wikilink::ToPage(*id, display_name, position, slug)),
                    None => links.push(Wikilink::TargetMissing(slug, display_name, position))
                };
            },
            ExtEvent::Event(Event::Code(s)) | ExtEvent::Event(Event::Text(s)) => {
                paras.last_mut().unwrap().1.push_str(&s);
            },
            x if is_end_of_block_element(&x) => {
                paras.last_mut().unwrap().1.push_str("\n");
            },
            _ => ()
        }
    };
    if let Some(last_para) = paras.last_mut() {
        let new_len = last_para.1.trim_end().len();
        last_para.1.truncate(new_len);
    }
    (paras, links)
}

pub fn snippet<'a>(input: &'a str, db: &DB) -> String {
    use ExtEvent::*;
    use self::Event::*;
    let mut events = vec![];
    let mut depth = 0;
    let mut total_text = 0;
    let mut lines = 0;
    let mut in_codeblock = false;
    let mut finish = false;
    let mut just_did_linebreak = true;
    for x in parse(input) {
        match x {
            Event(Start(Tag::CodeBlock(_))) => {
                in_codeblock = true;
            },
            Event(End(Tag::CodeBlock(_))) => {
                in_codeblock = false;
            },
            _ if in_codeblock => (),
            _ if is_start_of_block_element(&x) => {
                depth += 1;
                if !finish {
                    if !just_did_linebreak {
                        events.push(Event(HardBreak));
                        lines += 1;
                        just_did_linebreak = true;
                    }
                }
            },
            _ if is_end_of_block_element(&x) => {
                depth -= 1;
                if total_text >= CONFIG.snippet.length_target || lines >= CONFIG.snippet.lines_target {
                    finish = true;
                    if depth == 0 {
                        break;
                    }
                }
                if !finish {
                    if !just_did_linebreak {
                        events.push(Event(HardBreak));
                        lines += 1;
                        just_did_linebreak = true;
                    }
                }
            },
            _ if finish => (),
            Event(Text(ref str)) | Event(Code(ref str)) => {
                just_did_linebreak = false;
                if !finish {
                    total_text += str.len();
                    events.push(x);
                }
            },
            ServerJS(_) => (),
            Event(FootnoteReference(_)) => (), // footnotes don't work in snippets
            _ => events.push(x)
        }
    }
    let mut html_output: String = String::with_capacity(input.len() * 3 / 2);
    html::push_html(&mut html_output, preprocess_events(events.into_iter(), db));
    html_output
}

fn run_script_blocks<'a, I: Iterator<Item=ExtEvent<'a>>>(events: I, db: &'a DB) -> impl Iterator<Item=ExtEvent<'a>> {
    let run_script = |script: String| {
        let context = Context::new().unwrap();
        let start = time::Instant::now();
        let allowed_runtime = time::Duration::from_millis(500);
        context.set_interrupt_handler(move || start.elapsed() > allowed_runtime);
        match context.eval_as::<String>(&script) {
            // no recursing allowed.
            Ok(res) => ExtEvent::Event(Event::Html(render(&res, db, false).into())),
            Err(e) => {
                let mut buf = String::new();
                write!(&mut buf, "<div class=\"error\">JS execution failed: ").unwrap();
                escape::escape_html(&mut buf, e.to_string().as_str()).unwrap();
                write!(&mut buf, "</div>").unwrap();
                ExtEvent::Event(Event::Html(buf.into()))
            }
        }
    };
    events.map(move |ev| match ev {
        ExtEvent::ServerJS(script) => run_script(script),
        x => x
    })
}

fn maths_config(block: bool) -> katex::Opts {
    let mut opts = katex::Opts::builder().display_mode(block).throw_on_error(false).trust(true).build().unwrap();
    for (kmacro, kdefn) in CONFIG.katex_macros.iter() {
        opts.add_macro(kmacro.to_string(), kdefn.to_string());
    }
    opts
}

fn preprocess_events<'a, I: Iterator<Item=ExtEvent<'a>>>(events: I, db: &'a DB) -> impl Iterator<Item=Event<'a>> {
    let katex_opts_block = maths_config(true);
    let katex_opts = maths_config(false);
    events
        .map(move |e| {
            match e {
                ExtEvent::Event(ev) => ev,
                ExtEvent::Wikilink(target, display_name, tag_spec) => {
                    if let Some(tag) = target.strip_prefix("#") {
                        let mut buf = String::new();
                        write!(buf, "<a class=\"wikilink tag\" href=\"#/search/%23{}\">#", util::to_slug(tag)).unwrap();
                        escape::escape_html(&mut buf, &tag).unwrap();
                        write!(buf, "</a>").unwrap();
                        return Event::Html(buf.into())
                    }
                    match db.read().page_lookup.get(&Slug::new(&target)) {
                        Some(target_id) => {
                            let mut buf = String::new();
                            write!(buf, "<a class=\"wikilink\" href=\"#/page/{}\">", target_id).unwrap();
                            escape::escape_html(&mut buf, &display_name).unwrap();
                            write!(buf, "</a>").unwrap();
                            Event::Html(buf.into())
                        },
                        None => {
                            let mut buf = String::new();
                            write!(buf, "<a class=\"wikilink nonexistent\" href=\"#/create/").unwrap();
                            escape::escape_href(&mut buf, &target).unwrap();
                            if let Some(tag_spec) = tag_spec {
                                write!(buf, "?tags=").unwrap();
                                escape::escape_href(&mut buf, &tag_spec).unwrap();
                            }
                            write!(buf, "\">").unwrap();
                            escape::escape_html(&mut buf, &display_name).unwrap();
                            write!(buf, "</a>").unwrap();
                            Event::Html(buf.into())
                        }
                    }
                },
                ExtEvent::Maths(block_mode, tex) => {
                    let opts = if block_mode { &katex_opts_block } else { &katex_opts };
                    Event::Html(katex::render_with_opts(&tex, opts).unwrap().into())
                },
                ExtEvent::CaptionImageStart(url, title) => {
                    let mut buf = String::new();
                    write!(buf, "<span class=\"captioned-image-block\"><img class=\"captioned-image\" src=\"").unwrap();
                    escape::escape_href(&mut buf, &url).unwrap();
                    write!(buf, "\" alt=\"").unwrap();
                    escape::escape_html(&mut buf, &title).unwrap();
                    write!(buf, "\" title=\"").unwrap();
                    escape::escape_html(&mut buf, &title).unwrap();
                    write!(buf, "\" /><span class=\"caption\">").unwrap();
                    Event::Html(buf.into())
                },
                ExtEvent::CaptionImageEnd => {
                    Event::Html(CowStr::Borrowed("</span></span>"))
                },
                ExtEvent::Redaction(content) => {
                    Event::Text(content.replace(|c| !(&[' ', ',', ':', ';', '.', '\n'].contains(&c)), "█").into())
                },
                ExtEvent::Position(_) => Event::Text("".into()),
                ExtEvent::ServerJS(_js) => Event::Text("[script not evaluated]".into())
            }
        }
    )
}

pub fn render(input: &str, db: &DB, run_scripts: bool) -> String {
    let mut html_output: String = String::with_capacity(input.len() * 3 / 2);
    write!(&mut html_output, "<div class=\"markdown\">").unwrap();
    if run_scripts {
        let events = preprocess_events(run_script_blocks(parse(input), db), db);
        html::push_html(&mut html_output, events);
    } else {
        let events = preprocess_events(parse(input), db);
        html::push_html(&mut html_output, events);
    };
    write!(&mut html_output, "</div>").unwrap();
    html_output
}