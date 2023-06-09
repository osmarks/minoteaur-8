use unicode_segmentation::UnicodeSegmentation;
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
pub struct SearchConfig {
    pub k_1: f64,
    pub b: f64,
    pub exact_match_weighting: f64
}
impl Default for SearchConfig {
    fn default() -> Self {
        Self {
            k_1: 1.2,
            b: 0.75,
            exact_match_weighting: 2.0
        }
    }
}

#[derive(Deserialize)]
#[serde(default)]
pub struct Config {
    pub title_search: TitleSearchConfig,
    pub paths: PathsConfig,
    pub snippet: SnippetConfig,
    pub search: SearchConfig,
    pub listen_address: String,
    pub log_level: String,
    pub allow_backdate: bool,
    pub max_edit_distance: u32,
    pub max_search_results: usize,
    pub katex_macros: HashMap<String, String>,
}
impl Default for Config {
    fn default() -> Self {
        Self {
            title_search: Default::default(),
            paths: Default::default(),
            snippet: Default::default(),
            search: Default::default(),
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
    pub static ref VERSION: String = format!("Minoteaur 8 {}, built {}", &env!("VERGEN_GIT_SHA")[..8], env!("VERGEN_BUILD_DATE"));
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

pub mod query {
    use inlinable_string::InlinableString;
    use std::str::FromStr;

    use super::structured_data::{Value, Operator, self};

    pub type Query = Vec<Term>;
    #[derive(Debug)]
    pub struct Term {
        pub term: InlinableString,
        pub tag: bool,
        pub exact: bool,
        pub negate: bool,
        pub structured_data_query: Option<(Operator, Value)>
    }


    pub fn parse(s: &str) -> Query {
        let use_term = |mut t: &str| {
            let mut tag = false;
            let mut exact = false;
            let mut negate = false;
            if let Some(rest) = t.strip_prefix("-") { negate = true; t = rest; }
            if let Some(rest) = t.strip_prefix("#") { tag = true; t = rest; }
            if let Some(rest) = t.strip_prefix("!") { exact = true; t = rest; }
            if let Some(rest) = t.strip_prefix("=") {
                if let Some((start, mut end)) = rest.split_once(":") {
                    let mut operator = Operator::Equal;
                    if let Some(rest) = end.strip_prefix("*") { end = rest; operator = Operator::PrefixEqual }
                    if let Some(rest) = end.strip_prefix(">=") { end = rest; operator = Operator::Gte }
                    if let Some(rest) = end.strip_prefix("<=") { end = rest; operator = Operator::Lte }
                    if let Some(rest) = end.strip_prefix(">") { end = rest; operator = Operator::Gt }
                    if let Some(rest) = end.strip_prefix("<") { end = rest; operator = Operator::Lt }
                    let value = match f64::from_str(end) {
                        Ok(value) => Value::Number(value),
                        Err(_) => Value::Text(end.to_string())
                    };
                    return Term {
                        tag: false, exact: false, negate,
                        term: InlinableString::from(start),
                        // TODO
                        structured_data_query: Some((operator, value))
                    }
                }
                t = rest;
            }
            Term {
                term: InlinableString::from(t),
                tag, exact, negate, structured_data_query: None
            }
        };
        let mut out = Vec::new();
        let mut buf = String::new();
        let mut quoted = false;
        for char in s.chars() {
            match char {
                '"' => quoted = !quoted,
                x if x.is_whitespace() && !quoted => {
                    out.push(use_term(&buf));
                    buf.clear();
                },
                x => buf.push(x)
            }
        }
        if !buf.is_empty() {
            out.push(use_term(&buf));
        }
        out
    }

    pub fn plaintext(q: &Query) -> String {
        let mut g = String::new();
        for term in q.iter() {
            if !term.tag && !term.negate && term.structured_data_query.is_none() {
                g.push_str(&term.term);
            }
        }
        g
    }

    pub fn tags(q: &Query) -> Vec<(String, bool)> {
        q.iter().filter_map(|x| if x.tag { Some((x.term.to_string(), !x.negate)) } else { None }).collect()
    }

    pub fn structured_data(q: &Query) -> structured_data::Query {
        q.iter().filter_map(|x| x.structured_data_query.as_ref().map(|d| {
            let (operator, value) = d.clone();
            (x.term.to_string(), operator, value, x.negate)
        })).collect()
    }
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
    // punish extra text on the end
    while let Some(_) =  target_gs.next() {
        score -= CONFIG.title_search.distance_penalty;
    }
    Some(score)
}

fn split_tag<'a>(tag: &'a str) -> impl Iterator<Item=String> + 'a {
    tag.split('/').map(to_slug)
}

pub fn preprocess_tag(tag: &str) -> String {
    split_tag(tag).intersperse("/".to_string()).collect()
}

pub fn hierarchical_tags(tag: &str) -> Vec<String> {
    split_tag(tag).fold(Vec::new(), |mut acc, x| {
        let mut next = acc.last().map(Clone::clone).unwrap_or_else(String::new);
        if !next.is_empty() {
            next.push('/');
        }
        next.push_str(&x);
        acc.push(next);
        acc
    })
}

pub mod structured_data {
    use serde::{Serialize, Deserialize};
    use std::cmp::Ordering;

    #[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
    pub enum Value {
        Text(String),
        Number(f64)
    }

    #[derive(Debug, Clone, PartialEq, Eq)]
    pub enum Operator {
        Equal,
        PrefixEqual,
        Gt,
        Gte,
        Lt,
        Lte
    }

    pub type PageData = Vec<(String, Value)>;

    pub type Query = Vec<(String, Operator, Value, bool)>;

    fn define_operator<A: Fn(f64, f64) -> bool, B: Fn(&str, &str) -> bool>(numerical_fn: A, str_fn: B, pv: &Value, qv: &Value) -> bool {
        match (pv, qv) {
            (Value::Number(m), Value::Number(n)) => numerical_fn(*m, *n),
            (Value::Text(t), Value::Number(n)) => str_fn(t, &n.to_string()),
            (Value::Number(m), Value::Text(u)) => str_fn(&m.to_string(), u),
            (Value::Text(t), Value::Text(u)) => str_fn(t, u),
        }
    }

    pub fn matches(data: &PageData, query: &Query) -> bool {
        let query_matches = |(key, operator, value, negated): &(String, Operator, Value, bool)| {
            data.iter().any(|(page_key, page_value)| {
                if page_key != key { return false }
                match operator {
                    Operator::Equal => value == page_value,
                    Operator::PrefixEqual => define_operator(|_, _| false, |m, n| m.starts_with(n), page_value, value),
                    Operator::Gt => define_operator(|m, n| m > n, |m, n| m > n, page_value, value),
                    Operator::Gte => define_operator(|m, n| m >= n, |m, n| m >= n, page_value, value),
                    Operator::Lt => define_operator(|m, n| m < n, |m, n| m < n, page_value, value),
                    Operator::Lte => define_operator(|m, n| m <= n, |m, n| m <= n, page_value, value),
                }
            }) != *negated
        };
        query.iter().all(query_matches)
    }

    pub fn cmp_by_key(key: &String, d1: &PageData, d2: &PageData) -> Ordering {
        let d1 = d1.iter().filter_map(|(k, v)| if k == key { Some(v) } else { None });
        let d2 = d2.iter().filter_map(|(k, v)| if k == key { Some(v) } else { None });
        for (x, y) in d1.zip(d2) {
            let ord = match (x, y) {
                (Value::Number(m), Value::Number(n)) => m.total_cmp(&n),
                (Value::Text(t), Value::Number(n)) => t.cmp(&n.to_string()),
                (Value::Number(m), Value::Text(u)) => m.to_string().cmp(&u),
                (Value::Text(t), Value::Text(u)) => t.cmp(&u)
            };
            match ord {
                Ordering::Equal => (),
                x => return x
            }
        }
        Ordering::Equal
    }
}