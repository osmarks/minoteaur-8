
use pulldown_cmark::{html, Options, Parser, Event, Tag};
use smallvec::SmallVec;
use lazy_static::lazy_static;
use percent_encoding::{utf8_percent_encode, AsciiSet, CONTROLS};
use rusty_ulid::Ulid;

use crate::storage::DB;
use crate::util;

const FRAGMENT: &AsciiSet = &CONTROLS.add(b' ').add(b'"').add(b'<').add(b'>').add(b'`');

enum ExtEvent<'a> {
    Event(Event<'a>),
    Wikilink(String, String)
}

#[derive(Debug)]
pub enum Wikilink {
    ToPage(Ulid, String, String),
    TargetMissing(String, String, String)
}

fn parse<'a>(input: &'a str) -> impl Iterator<Item=ExtEvent<'a>> {
    lazy_static! {
        static ref WL_REGEX: regex::Regex = regex::Regex::new(r"\[\[([^|\]]+)(\|([^\]]+))?]\]").unwrap();
    }
    let mut options = Options::empty();
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_HEADING_ATTRIBUTES);
    let mut text_buf = String::new();
    Parser::new_ext(input, options).flat_map(move |event| {
        match event {
            Event::Text(text) => {
                text_buf.push_str(&*text);
                SmallVec::<[ExtEvent; 3]>::new()
            },
            event => {
                let mut out = SmallVec::new();
                if text_buf.len() != 0 {
                    let mut pos = 0;
                    for cap in WL_REGEX.captures_iter(&text_buf) {
                        let mat = cap.get(0).unwrap();
                        out.push(ExtEvent::Event(Event::Text(text_buf[pos..mat.start()].to_owned().into())));
                        let target = cap.get(1).unwrap().as_str();
                        let display_name = cap.get(3).map(|x| x.as_str()).unwrap_or(target);
                        out.push(ExtEvent::Wikilink(target.to_string(), display_name.to_string()));
                        pos = mat.end();
                    }
                    out.push(ExtEvent::Event(Event::Text(text_buf[pos..].to_owned().into())));
                    text_buf.clear();
                }
                out.push(ExtEvent::Event(event));
                out
            }
        }
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

pub fn extract_info(input: &str, db: &DB) -> (String, Vec<Wikilink>) {
    let mut text = String::new();
    let mut recent_text = String::new();
    let mut links = vec![];
    let mut links_buffer = vec![];
    for e in parse(input) {
        match e {
            ExtEvent::Wikilink(target, display_name) => {
                recent_text.push_str(&display_name);
                text.push_str(&display_name);
                links_buffer.push((target, display_name));
            },
            ExtEvent::Event(Event::Code(s)) | ExtEvent::Event(Event::Text(s)) => {
                text.push_str(&s);
                recent_text.push_str(&s);
            },
            ExtEvent::Event(Event::End(tag)) if is_block_element(&tag) => {
                for (target, display_name) in links_buffer.drain(..) {
                    match db.read().page_lookup.get(&util::to_slug(&target)) {
                        Some(id) => links.push(Wikilink::ToPage(*id, display_name, recent_text.clone())),
                        None => links.push(Wikilink::TargetMissing(target, display_name, recent_text.clone()))
                    };
                }
                recent_text.clear();
                text.push_str("\n");
            },
            _ => ()
        }
    };
    text.truncate(text.trim_end().len());
    (text, links)
}

pub fn render(input: &str, db: &DB) -> String {
    let parser = parse(input);
    let events = parser.map(|e| {
        match e {
            ExtEvent::Event(ev) => ev,
            ExtEvent::Wikilink(target, display_name) => {
                match db.read().page_lookup.get(&util::to_slug(&target)) {
                    Some(target_id) => {
                        // TODO: escaping
                        Event::Html(format!("<a class=\"wikilink\" href=\"#/page/{}\">{}</a>", target_id, (display_name)).into())
                    },
                    None => {
                        Event::Html(format!("<a class=\"wikilink nonexistent\" href=\"#/create/{}\">{}</a>", utf8_percent_encode(&target, FRAGMENT), display_name).into())
                    }
                }
            }
        }
    });

    let mut html_output: String = String::with_capacity(input.len() * 3 / 2);
    html::push_html(&mut html_output, events);
    html_output
}