use serde::{Deserialize, Serialize};
use rusty_ulid::Ulid;
use std::collections::{HashMap, hash_map::Entry};
use std::sync::Arc;
use chrono::prelude::*;
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions, SqliteConnectOptions};
use sqlx::Row;
use tokio::sync::RwLock;
use anyhow::Context;
use futures_util::TryStreamExt;
use std::str::FromStr;
use std::borrow::Cow;

use crate::error::{Error, Result};
use crate::search::Index;
use crate::util;
use crate::markdown;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Link {
    pub from: Ulid,
    pub to: Ulid,
    pub text: String,
    pub context: String
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum Content {
    Markdown(String),
    List(Vec<(usize, String)>)
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Page {
    #[serde(with="chrono::serde::ts_milliseconds")]
    pub updated: chrono::DateTime<Utc>,
    #[serde(with="chrono::serde::ts_milliseconds")]
    pub created: chrono::DateTime<Utc>,
    pub title: String,
    pub names: Vec<String>,
    pub content: Content
}

type Links = HashMap<Ulid, (
    HashMap<Ulid, Link>, // maps destination page ID to outbound link
    HashMap<Ulid, Link> // maps source page ID to inbound link
)>;

pub struct MemoryStore {
    pub pages: HashMap<Ulid, Page>,
    pub page_lookup: HashMap<String, Ulid>,
    pub search_index: Index,
    pub links: Links
}
pub struct DB {
    pub mem: MemoryStore,
    backing: SqlitePool
}

#[derive(Debug, Serialize, Deserialize, Clone)]
enum Object {
    Page(Page)
}

impl DB {
    pub async fn init() -> Result<Self> {
        let pool = SqlitePoolOptions::new()
            .max_connections(4)
            .connect_with(SqliteConnectOptions::from_str("sqlite://minoteaur.sqlite3")?.create_if_missing(true)).await?;
        sqlx::query("CREATE TABLE IF NOT EXISTS objects (id BLOB NOT NULL PRIMARY KEY, data BLOB NOT NULL, long_data BLOB)").persistent(false).execute(&mut pool.acquire().await?).await?;
        let mut db = Self {
            backing: pool,
            mem: MemoryStore {
                pages: HashMap::new(),
                page_lookup: HashMap::new(),
                search_index: Index::new(),
                links: HashMap::new()
            }
        };
        db.preload().await.context("database integrity error")?;
        Ok(db)
    }

    async fn preload(&mut self) -> Result<()> {
        let mut db = self.backing.acquire().await?;
        let mut s = sqlx::query("SELECT id, data FROM objects").persistent(false).fetch(&mut db);
        while let Some(row) = s.try_next().await? {
            let id: Ulid = row.get::<Vec<u8>, usize>(0).as_slice().try_into().context("invalid ULID")?;
            let value: Object = rmp_serde::from_read_ref(row.get::<Vec<u8>, usize>(1).as_slice()).context("invalid object")?;
            match value {
                Object::Page(page) => {
                    for name in page.names.iter() {
                        self.mem.page_lookup.insert(util::to_slug(name), id);
                    }
                    self.mem.pages.insert(id, page);
                }
            }
        }
        // this has to be done after all pages have been loaded into memory, or links won't work right
        for id in self.mem.pages.keys().copied().collect::<Vec<Ulid>>() {
            self.parse_and_index_page(id)?;
        }
        Ok(())
    }

    async fn write_object(&mut self, id: Ulid, object: Object, long_data: Option<Vec<u8>>) -> Result<()> {
        let id: [u8; 16] = id.into();
        let id: Vec<u8> = id.to_vec();
        sqlx::query("INSERT OR REPLACE INTO objects VALUES (?, ?, ?)")
            .bind(id)
            .bind(rmp_serde::to_vec_named(&object).context("serialization failed")?)
            .bind(long_data)
            .execute(&mut self.backing.acquire().await?).await?;
        Ok(())
    }

    pub fn read(&self) -> &MemoryStore {
        &self.mem
    }

    fn add_name_internal(&mut self, id: Ulid, name: &str) -> Result<()> {
        let slug = util::to_slug(name);
        let entry = self.mem.page_lookup.entry(slug);
        match entry {
            Entry::Occupied(e) => return Err(Error::Conflict(*e.get())),
            Entry::Vacant(e) => e.insert(id)
        };
        Ok(())
    }

    fn parse_and_index_page(&mut self, id: Ulid) -> Result<()> {
        let page = &self.mem.pages[&id];
        let raw_text = match &page.content {
            Content::Markdown(s) => Cow::Borrowed(s),
            Content::List(bullets) => {
                let mut s = String::new();
                for (_depth, text) in bullets {
                    s.push_str(&text);
                    s.push('\n');
                }
                Cow::Owned(s)
            }
        };
        let (text, links) = markdown::extract_info(&raw_text, &self);
        // if this page had links out before, clear them from inbound link map on targets
        if let Some(to_clear) = self.mem.links.get(&id).map(|x| x.0.keys().copied().collect::<Vec<Ulid>>()) {
            for clear_from in to_clear {
                self.mem.links.get_mut(&clear_from).unwrap().1.remove(&id);
            }
        }
        let mut outbound = HashMap::new();
        // this throws away all but the last link in a page, but this is probably maybe fine
        for link in links {
            if let markdown::Wikilink::ToPage(to, text, context) = link {
                let link = Link { to, text, from: id, context };
                self.mem.links.entry(to).or_default().1.insert(id, link.clone());
                outbound.insert(to, link);
            }
        }
        self.mem.links.entry(id).or_default().0 = outbound;
        self.mem.search_index.insert(id, &text);
        Ok(())
    }

    pub async fn create_page(&mut self, title: String, content: Content) -> Result<Ulid> {
        let id = Ulid::generate();
        self.add_name_internal(id, &title)?;
        let page = Page {
            content,
            updated: Utc::now(),
            created: Utc::now(),
            title: title.clone(),
            names: vec![title]
        };
        self.mem.pages.insert(id, page.clone());
        self.write_object(id, Object::Page(page), None).await?;
        self.parse_and_index_page(id)?;
        Ok(id)
    }

    pub async fn update_page(&mut self, id: Ulid, content: Content) -> Result<()> {
        let page = {
            let mut page = self.mem.pages.get_mut(&id).ok_or(Error::NotFound)?;
            page.content = content;
            page.updated = Utc::now();
            page.clone()
        };
        self.write_object(id, Object::Page(page), None).await?;
        self.parse_and_index_page(id)?;
        Ok(())
    }

    pub async fn add_name(&mut self, id: Ulid, name: String) -> Result<()> {
        if !self.mem.pages.contains_key(&id) { return Err(Error::NotFound) }
        self.add_name_internal(id, &name)?;
        let page = {
            let page = self.mem.pages.get_mut(&id).unwrap();
            page.names.push(name);
            page.clone()
        };
        self.write_object(id, Object::Page(page), None).await?;
        Ok(())
    }
}

pub type DBHandle = Arc<RwLock<DB>>;