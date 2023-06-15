use rusty_ulid::Ulid;
use std::collections::{BTreeMap, HashSet, HashMap};
use inlinable_string::InlinableString;
use unicode_segmentation::UnicodeSegmentation;
use crate::util::{query::*, CONFIG};

type Token = InlinableString;

struct Document {
    tokens: Vec<Token>,
    counts: HashMap<Token, u64>,
    breaks: Vec<(usize, usize)> // token index, byte offset
}

struct TokenInfo {
    documents: HashSet<Ulid>,
    frequency: u64
}

pub struct Index {
    inverted_index: BTreeMap<Token, TokenInfo>,
    documents: HashMap<Ulid, Document>,
    pub total_document_length: u64
}

/*
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

fn deletes2(t: Token) -> HashMap<Token, u8> {
    let mut out = HashMap::with_capacity(t.len() * t.len());
    for x in deletes(t) {
        out.insert(x.clone(), 1);
        out.extend(deletes(x).into_iter().map(|x| (x, 2)));
    }
    out
}
*/

fn best_highlight_location(tokens: &HashMap<InlinableString, f64>, document: &Document) -> usize {
    let mut scores: HashMap<usize, f64> = HashMap::new();
    for (index, (token_index, offset)) in document.breaks.iter().enumerate() {
        let end_token_index = document.breaks.get(index + 1).map(|(t, _)| *t).unwrap_or(document.tokens.len());
        for token in &document.tokens[*token_index..end_token_index] {
            if let Some(weight) = tokens.get(token) {
                *scores.entry(*offset).or_default() += *weight;
            }
        }
    }
    scores.into_iter().max_by(|(_, sa), (_, sb)| sa.partial_cmp(sb).unwrap()).map(|(o, _score)| o).unwrap_or(0)
}

impl Index {
    pub fn insert(&mut self, id: Ulid, doc: Vec<(usize, String)>) {
        let mut counts = HashMap::new();
        let tokens_with_offsets: Vec<(usize, InlinableString)> = doc.iter()
            .flat_map(|(offset, text)| text.unicode_words().map(|x| (*offset, x.to_lowercase().into())))
            .collect();
        let tokens: Vec<InlinableString> = tokens_with_offsets.iter().map(|(_, t)| t.clone()).collect();
        let mut breaks: Vec<(usize, usize)> = vec![];
        for (index, (offset, _token)) in tokens_with_offsets.into_iter().enumerate() {
            match breaks.last() {
                Some((_, last_offset)) if *last_offset != offset => breaks.push((index, offset)),
                None => breaks.push((index, offset)),
                _ => ()
            }
        }
        let document_len = tokens.len() as u64;
        // count frequencies of each token
        for token in tokens.iter() {
            *counts.entry(token.clone()).or_insert(0) += 1;
        }
        let new_document = Document {
            tokens,
            counts: counts.clone(),
            breaks
        };
        // swap out document entry for new one
        if let Some(old_doc) = self.documents.get_mut(&id) {
            let old_doc = std::mem::replace(old_doc, new_document);
            self.total_document_length -= old_doc.tokens.len() as u64;
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
            self.documents.insert(id, new_document);
        }
        // update inverted index
        for (token, count) in counts {
            let mut info = self.inverted_index.entry(token.clone()).or_insert_with(|| TokenInfo {
                documents: HashSet::new(),
                frequency: 0
            });
            // newly added
            info.documents.insert(id);
            info.frequency += count;
        }
        self.total_document_length += document_len;
    }

    pub fn search<F: FnOnce(&mut Vec<(Ulid, f64)>)>(&self, query: Query, max_results: usize, rank_callback: F) -> (Vec<(Ulid, f64, usize)>, usize) {
        let mut tokens = HashMap::new();
        for query_part in query.iter() {
            if query_part.tag || query_part.structured_data_query.is_some() { continue }
            let token = &query_part.term;
            let mut scale = if query_part.negate { -1.0 } else { 1.0 };
            if query_part.exact {
                scale *= CONFIG.search.exact_match_weighting;
            }
            if !query_part.exact {
                for other_token in self.inverted_index.keys() {
                    let distance = triple_accel::levenshtein(token.as_bytes(), other_token.as_bytes());
                    if distance > 0 && distance <= 3 {
                        // Exponentially decrease ranking weighting with increased edit distance
                        let new_weight = 1. / (distance as f64).exp() * scale;
                        let weight: &mut f64 = tokens.entry(other_token.clone()).or_default();
                        if new_weight.abs() > weight.abs() {
                            *weight = new_weight;
                        }
                    }
                }
            }
            if self.inverted_index.contains_key(token) {
                tokens.insert(token.clone(), scale);
            }
        }  

        let cap_n = self.documents.len() as f64;
        for (token, weight) in tokens.iter_mut() {
            let n = self.inverted_index[token].documents.len() as f64;
            // BM25 IDF component
            let idf = ((cap_n - n + 0.5) / (n + 0.5)).ln_1p();
            *weight *= idf;
        }
        let k_1 = CONFIG.search.k_1;
        let b = CONFIG.search.b;
        let mut documents = HashMap::new();
        let avgdl = self.total_document_length as f64 / self.documents.len() as f64;
        for (token, weight) in tokens.iter() {
            for document in self.inverted_index[token].documents.iter() {
                let doc = &self.documents[&document];
                let len = doc.tokens.len() as f64;
                let f = doc.counts[token] as f64;
                // BM25 DF component
                let df = (f * (k_1 + 1.0)) / (f + k_1 * (1.0 - b + b * (len / avgdl)));
                *documents.entry(*document).or_default() += weight * df;
            }
        }
        let mut result: Vec<(Ulid, f64)> = documents
            .into_iter()
            .filter(|(_, s)| *s > 0.0)
            .collect();
        rank_callback(&mut result);
        let original_len = result.len();
        result.truncate(max_results);
        (result
            .into_iter()
            .map(|(document_id, score)| (document_id, score, best_highlight_location(&tokens, &self.documents[&document_id])))
            .collect(), original_len)
    }

    pub fn new() -> Self {
        Index {
            inverted_index: BTreeMap::new(),
            documents: HashMap::new(),
            total_document_length: 0
        }
    }
}