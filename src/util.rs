use unicode_segmentation::UnicodeSegmentation;
use inlinable_string::InlinableString;
use serde::{Deserialize, Serialize, Deserializer, de::{self, Visitor}};
use std::collections::{HashSet, HashMap};
use fnv::FnvHasher;
use rusty_ulid::Ulid;
use std::hash::Hasher;
use triple_accel::levenshtein::*;
use anyhow::{Result, Context};
use itertools::Itertools;

#[derive(Deserialize)]
#[serde(default)]
pub struct TitleSearchConfig {
    pub max_results: usize,
    pub consecutive_char_bonus: i32,
    pub word_start_bonus: i32,
    pub distance_penalty: i32,
}
impl Default for TitleSearchConfig {
    fn default() -> Self {
        Self {
            max_results: 20,
            consecutive_char_bonus: 8,
            word_start_bonus: 72,
            distance_penalty: 4
        }
    }
}

#[derive(Deserialize)]
#[serde(default)]
pub struct PathsConfig {
    pub magic_db: String,
    pub primary_db: String,
    pub files: String
}
impl Default for PathsConfig {
    fn default() -> Self {
        Self {
            magic_db: "/usr/share/file/misc/magic.mgc".to_string(),
            primary_db: "./minoteaur.sqlite3".to_string(),
            files: "./files".to_string()
        }
    }
}

#[derive(Deserialize)]
#[serde(default)]
pub struct SnippetConfig {
    pub lines_target: usize,
    pub length_target: usize
}
impl Default for SnippetConfig {
    fn default() -> Self {
        Self {
            lines_target: 5,
            length_target: 256
        }
    }
}

#[derive(Deserialize)]
#[serde(default)]
pub struct Config {
    pub title_search: TitleSearchConfig,
    pub paths: PathsConfig,
    pub snippet: SnippetConfig,
    pub listen_address: String,
    pub log_level: String,
    pub allow_backdate: bool,
    pub max_edit_distance: u32,
    pub max_search_results: usize,
    pub katex_macros: HashMap<String, String>
}
impl Default for Config {
    fn default() -> Self {
        Self {
            title_search: Default::default(),
            paths: Default::default(),
            snippet: Default::default(),
            listen_address: "[::]:7600".to_string(),
            log_level: "info".to_string(),
            allow_backdate: false,
            max_edit_distance: 512,
            max_search_results: 64,
            katex_macros: HashMap::new()
        }
    }
}

lazy_static::lazy_static! {
    pub static ref CONFIG: Config = load_config().unwrap();
}

fn load_config() -> Result<Config> {
    use config::{Config, File};
    let s = Config::builder()
        .add_source(File::with_name("./config"))
        .build().context("loading config")?;
    Ok(s.try_deserialize().context("parsing config")?)
}

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
            tags.insert(preprocess_tag(&w[1..]));
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

pub fn edit_distance(a: &str, b: &str) -> Option<u32> {
    levenshtein_simd_k_str(a, b, CONFIG.max_edit_distance)
}

pub fn derive_path(page: Ulid, filename: &str) -> String {
    let mut hasher = FnvHasher::default();
    hasher.write(page.to_string().as_bytes());
    hasher.write(filename.as_bytes());
    let folder = hasher.finish() & 0xFF;
    format!("{:02X}/{}_{}", folder, page, to_slug(filename))
}

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
                        score += CONFIG.title_search.word_start_bonus;
                    }
                    consecutive += 1;
                    score += consecutive * CONFIG.title_search.consecutive_char_bonus;
                    break;
                },
                Some((_, _)) => {
                    consecutive = 0;
                    score -= CONFIG.title_search.distance_penalty;
                },
                None => return None
            }
        }
    }
    Some(score)
}

pub fn preprocess_tag(tag: &str) -> String {
    tag.split('/').map(to_slug).intersperse("/".to_string()).collect()
}