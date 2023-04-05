use pulldown_cmark::{html, Options, Parser, Event, Tag, escape::{self, StrWrite}, CodeBlockKind, CowStr};
use smallvec::SmallVec;
use lazy_static::lazy_static;
use rusty_ulid::Ulid;
use regex::{Regex, Captures};
use quick_js::Context;
use std::time;

use crate::storage::DB;
use crate::util;
use util::{Slug, CONFIG};

#[derive(Debug)]
enum ExtEvent<'a> {
    Event(Event<'a>),
    Wikilink(String, String),
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

fn run_filter<'a, T: Clone, F: Fn(Captures, T) -> ExtEvent<'a>>(input: SmallVec<[ExtEvent<'a>; 3]>, re: &Regex, handler: F, context: T) -> SmallVec<[ExtEvent<'a>; 3]> {
    let mut out = SmallVec::new();
    for event in input {
        match event {
            ExtEvent::Event(Event::Text(text)) => {
                if text.len() != 0 {
                    let mut pos = 0;
                    for cap in re.captures_iter(&text) {
                        let mat = cap.get(0).unwrap();
                        out.push(ExtEvent::Event(Event::Text(text[pos..mat.start()].to_owned().into())));
                        out.push(handler(cap, context.clone()));
                        pos = mat.end();
                    }
                    out.push(ExtEvent::Event(Event::Text(text[pos..].to_owned().into())));
                }
            },
            e => out.push(e)
        }
    }
    out
}

fn wikilink_replacer<'a>(cap: Captures, (): ()) -> ExtEvent<'a> {
    let target = cap.get(1).unwrap().as_str();
    let display_name = cap.get(3).map(|x| x.as_str()).unwrap_or(target);
    ExtEvent::Wikilink(target.to_string(), display_name.to_string())
}

fn inline_maths_replacer<'a>(cap: Captures, (): ()) -> ExtEvent<'a> {
    ExtEvent::Maths(false, cap.get(1).unwrap().as_str().to_string())
}

fn redaction_replacer<'a>(cap: Captures, (): ()) -> ExtEvent<'a> {
    ExtEvent::Redaction(cap.get(1).unwrap().as_str().to_string())
}

fn strip_paragraphs<'a, I: Iterator<Item=ExtEvent<'a>>>(i: I) -> impl Iterator<Item=ExtEvent<'a>> {
    i.filter(|x| match x {
        ExtEvent::Event(Event::Start(Tag::Paragraph)) => false,
        ExtEvent::Event(Event::End(Tag::Paragraph)) => false,
        _ => true
    })
}

fn parse<'a>(input: &'a str) -> impl Iterator<Item=ExtEvent<'a>> {
    lazy_static! {
        static ref WL_REGEX: Regex = Regex::new(r"\[\[([^｜|\]]+)([\|｜]([^\]]+))?]\]").unwrap();
        static ref MATHS_REGEX: Regex = Regex::new(r"\$\$([^$]+)\$\$").unwrap();
        static ref REDACTION_REGEX: Regex = Regex::new(r"\|\|(.+)\|\|").unwrap();
    }
    let mut options = Options::empty();
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_HEADING_ATTRIBUTES);
    options.insert(Options::ENABLE_FOOTNOTES);
    let mut text_buf = String::new();
    let mut code_block = None;
    let mut image_content = None;
    Parser::new_ext(input, options).into_offset_iter().flat_map(move |(event, range)| {
        let mut resulting_events: SmallVec<[ExtEvent<'a>; 3]> = SmallVec::new();
        if is_event_start_of_block_element(&event) {
            resulting_events.push(ExtEvent::Position(range.start));
        }
        match event {
            Event::Start(Tag::Image(_, _, _)) => {
                image_content = Some(vec![]);
            },
            Event::End(Tag::Image(link_type, dest, title)) if image_content.is_some() => {
                let image_content = std::mem::replace(&mut image_content, None).unwrap();
                let is_captioned = image_content.get(0).map(|x| if let Event::Text(text) = x { text.starts_with("^") } else { false }).unwrap_or(false);
                if is_captioned {
                    resulting_events.push(ExtEvent::CaptionImageStart(dest, title));
                    let image_tag = &input[range.clone()];
                    let content_start = "![^".len();
                    let content_end = image_tag.rfind("](").unwrap();
                    resulting_events.extend(strip_paragraphs(parse(&image_tag[content_start..content_end])));
                    resulting_events.push(ExtEvent::CaptionImageEnd);
                } else {
                    resulting_events.push(ExtEvent::Event(Event::Start(Tag::Image(link_type, dest.clone(), title.clone()))));
                    resulting_events.extend(image_content.into_iter().map(ExtEvent::Event));
                    resulting_events.push(ExtEvent::Event(Event::End(Tag::Image(link_type, dest, title))));
                }
            },
            event if image_content.is_some() => {
                image_content.as_mut().unwrap().push(event);
            },
            Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(lang))) if &*lang == "maths" || &*lang == "math" => {
                code_block = Some((String::new(), CustomCodeblockType::Maths));
            },
            Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(lang))) if &*lang == "serverjs" => {
                code_block = Some((String::new(), CustomCodeblockType::ServerJS));
            },
            Event::End(Tag::CodeBlock(CodeBlockKind::Fenced(_))) if code_block.is_some() => { // codeblocks cannot contain other events, so this is valid
                if let Some((content, kind)) = std::mem::replace(&mut code_block, None) {
                    match kind {
                        CustomCodeblockType::Maths => resulting_events.push(ExtEvent::Maths(true, content)),
                        CustomCodeblockType::ServerJS => resulting_events.push(ExtEvent::ServerJS(content))
                    }
                } else {
                    unreachable!()
                }
            },
            Event::Text(text) => {
                if let Some((ref mut code, _)) = code_block {
                    code.push_str(&*text)
                } else {
                    text_buf.push_str(&*text);
                }
            },
            event => {
                let mut out = SmallVec::new();
                if text_buf.len() != 0 {
                    out.push(ExtEvent::Event(Event::Text(text_buf.clone().into())));
                    out = run_filter(out, &WL_REGEX, wikilink_replacer, ());
                    out = run_filter(out, &MATHS_REGEX, inline_maths_replacer, ());
                    out = run_filter(out, &REDACTION_REGEX, redaction_replacer, ());
                    text_buf.clear();
                }
                out.push(ExtEvent::Event(event));
                resulting_events.extend(out);
            }
        }
        resulting_events
    })
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
            ExtEvent::Wikilink(target, display_name) => {
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
    let new_len = paras.last().unwrap().1.trim_end().len();
    paras.last_mut().unwrap().1.truncate(new_len);
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
                    match events.get(events.len() - 1) {
                        Some(Event(HardBreak)) => (),
                        _ => {
                            events.push(Event(HardBreak));
                            lines += 1;
                        }
                    }
                }
            },
            Event(Text(ref str)) => {
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

fn preprocess_events<'a, I: Iterator<Item=ExtEvent<'a>>>(events: I, db: &'a DB) -> impl Iterator<Item=Event<'a>> {
    events
        .map(|e| {
            match e {
                ExtEvent::Event(ev) => ev,
                ExtEvent::Wikilink(target, display_name) => {
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
                            write!(buf, "\">").unwrap();
                            escape::escape_html(&mut buf, &display_name).unwrap();
                            write!(buf, "</a>").unwrap();
                            Event::Html(buf.into())
                        }
                    }
                },
                ExtEvent::Maths(block_mode, tex) => {
                    let katex_opts = katex::Opts::builder().display_mode(block_mode).throw_on_error(false).trust(true).build().unwrap();
                    Event::Html(katex::render_with_opts(&tex, &katex_opts).unwrap().into())
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