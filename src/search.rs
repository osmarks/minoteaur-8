use rusty_ulid::Ulid;
use std::collections::{BTreeMap, HashSet, HashMap};
use inlinable_string::{InlinableString, StringExt};
use unicode_segmentation::UnicodeSegmentation;  

type Token = InlinableString;

struct Document {
    tokens: Vec<Token>
}

struct TokenInfo {
    documents: HashSet<Ulid>,
    frequency: u64
}

pub struct Index {
    inverted_index: BTreeMap<Token, TokenInfo>,
    documents: HashMap<Ulid, Document>,
    fuzzy_lookup: HashMap<Token, Vec<Token>>
}

fn deletes(t: Token) -> HashSet<Token> {
    let mut out = HashSet::new();
    for (index, str) in t.grapheme_indices(true) {
        let mut s = InlinableString::new();
        if index > 0 {
            s.push_str(&t[0..index]);
        }
        let end = index + str.len();
        s.push_str(&t[end..t.len()]);
        if s.len() > 1 {
            out.insert(s);
        }
    }
    out
}

fn deletes2(t: Token) -> HashSet<Token> {
    let mut out = HashSet::with_capacity(t.len() * t.len());
    for x in deletes(t) {
        out.insert(x.clone());
        out.extend(deletes(x));
    }
    out
}

impl Index {
    pub fn insert(&mut self, id: Ulid, doc: &str) {
        let mut counts = HashMap::new();
        let tokens: Vec<InlinableString> = doc.unicode_words().map(|x| x.to_lowercase().into()).collect();
        // count frequencies of each token
        for token in tokens.iter() {
            *counts.entry(token.clone()).or_insert(0) += 1;
        }
        // swap out document entry for new one
        if let Some(old_doc) = self.documents.get_mut(&id) {
            let old_doc = std::mem::replace(old_doc, Document {
                tokens
            });
            // undo changes made to inverted index
            let mut counts = HashMap::new();
            for token in old_doc.tokens.iter() {
                *counts.entry(token.clone()).or_insert(0) += 1;
            }
            for (token, count) in counts {
                let info = self.inverted_index.get_mut(&token).unwrap();
                info.documents.remove(&id);
                info.frequency -= count;
            }
        } else {
            self.documents.insert(id, Document { tokens });
        }
        // update inverted index
        for (token, count) in counts {
            let mut info = self.inverted_index.entry(token.clone()).or_insert_with(|| TokenInfo {
                documents: HashSet::new(),
                frequency: 0
            });
            // newly added
            if info.frequency == 0 {
                let del = deletes2(token.clone());
                for t in del {
                    self.fuzzy_lookup.entry(t).or_insert_with(Vec::new).push(token.clone());
                }
            }
            info.documents.insert(id);
            info.frequency += count;
        }
    }

    pub fn search(&self, query: &str) -> HashSet<Ulid> {
        let mut out = HashSet::new();
        let mut query_tokens = HashSet::new();
        query_tokens.extend(query.unicode_words().map(InlinableString::from));
        for del in query_tokens.iter().flat_map(|x| deletes2(x.clone())).collect::<Vec<Token>>() {
            if let Some(del) = self.fuzzy_lookup.get(&del) {
                query_tokens.extend(del.iter().cloned());
            }
        }
        for token in query_tokens {
            if let Some(info) = self.inverted_index.get(&token) {
                out.extend(info.documents.iter());
            }
        }
        out
    }

    pub fn new() -> Self {
        Index {
            inverted_index: BTreeMap::new(),
            documents: HashMap::new(),
            fuzzy_lookup: HashMap::new()
        }
    }
}