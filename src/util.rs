use unicode_segmentation::UnicodeSegmentation;
use inlinable_string::InlinableString;
use serde::{Deserialize, Serialize, Deserializer, de::{self, Visitor}};
use std::collections::HashSet;
use fnv::FnvHasher;
use rusty_ulid::Ulid;
use std::hash::Hasher;
use triple_accel::levenshtein::*;

pub fn to_slug(s: &str) -> String {
    s.unicode_words().map(str::to_lowercase).collect::<Vec<String>>().join("_")
}

#[derive(Serialize, Clone, PartialEq, PartialOrd, Eq, Ord, Hash, Debug)]
#[serde(transparent)] 
pub struct Slug(String);

struct V;

impl<'de> Visitor<'de> for V {
    type Value = Slug;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("string or map")
    }

    fn visit_str<E>(self, value: &str) -> Result<Slug, E> where E: de::Error,
    {
        Ok(Slug::new(value))
    }
}

impl<'de> Deserialize<'de> for Slug {
    fn deserialize<D>(d: D) -> Result<Slug, D::Error> where D: Deserializer<'de> {
        d.deserialize_str(V)
    }
}

impl Slug {
    pub fn new(s: &str) -> Self { Self(to_slug(s)) }
}

type Query = (Vec<InlinableString>, HashSet<String>);

pub fn parse_query(s: &str) -> Query {
    let mut standard_toks = Vec::new();
    let mut tags = HashSet::new();
    for w in s.split_ascii_whitespace() {
        if w.starts_with('#') {
            tags.insert(to_slug(&w[1..]));
        } else {
            standard_toks.extend(w.unicode_words().map(InlinableString::from));
        }
    }
    (standard_toks, tags)
}

pub fn query_plain_parts(q: &Query) -> String {
    q.0.concat()
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub struct ContentSize {
    words: usize,
    bytes: usize,
    lines: usize
}

impl ContentSize {
    pub fn compute(s: &str) -> Self {
        Self {
            words: s.unicode_words().count(),
            bytes: s.len(),
            lines: s.lines().count()
        }
    }
}

pub fn edit_distance(a: &str, b: &str) -> u32 {
    rdamerau(a.as_bytes(), b.as_bytes())
}

pub fn derive_path(page: Ulid, filename: &str) -> String {
    let mut hasher = FnvHasher::default();
    hasher.write(page.to_string().as_bytes());
    hasher.write(filename.as_bytes());
    let folder = hasher.finish() & 0xFF;
    format!("{:02X}/{}", folder, to_slug(filename))
}

const BONUS_CONSECUTIVE: i32 = 8;
const BONUS_WORD_START: i32 = 72;
const PENALTY_DISTANCE: i32 = 4;
pub fn fuzzy_match(query: &str, target: &str) -> Option<i32> {
    let lower = target.to_lowercase();
    let word_starts: HashSet<usize> = lower.unicode_word_indices().map(|(i, _)| i).collect();
    let mut target_gs = lower.grapheme_indices(true);
    let mut score = 0;
    let mut consecutive = 0;
    let query = query.to_lowercase();
    for query_g in query.graphemes(true) {
        loop {
            match target_gs.next() {
                Some((index, g)) if g == query_g => {
                    if word_starts.contains(&index) {
                        score += BONUS_WORD_START;
                    }
                    consecutive += 1;
                    score += consecutive * BONUS_CONSECUTIVE;
                    break;
                },
                Some((_, _)) => {
                    consecutive = 0;
                    score -= PENALTY_DISTANCE;
                },
                None => return None
            }
        }
    }
    Some(score)
}