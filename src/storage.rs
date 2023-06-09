use serde::{Deserialize, Serialize};
use rusty_ulid::Ulid;
use std::collections::{HashMap, hash_map::Entry, HashSet, BTreeSet, BTreeMap};
use std::sync::Arc;
use chrono::prelude::*;
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions, SqliteConnectOptions};
use sqlx::Row;
use tokio::sync::RwLock;
use anyhow::Context;
use futures_util::TryStreamExt;
use std::str::FromStr;

use crate::error::{Error, Result};
use crate::search::Index;
use crate::util::{self, query};
use util::{Slug, CONFIG, structured_data::PageData as StructuredData};
use crate::markdown;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct File {
    pub page: Ulid,
    pub filename: String,
    #[serde(with="chrono::serde::ts_milliseconds")]
    pub created: chrono::DateTime<Utc>,
    pub storage_path: String,
    pub size: u64,
    pub mime_type: String,
    pub metadata: HashMap<String, String>
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Link {
    pub from: Ulid,
    pub to: Ulid,
    pub to_name: Slug,
    pub text: String,
    pub context_position: usize
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Page {
    pub id: Ulid,
    #[serde(with="chrono::serde::ts_milliseconds")]
    pub updated: chrono::DateTime<Utc>,
    #[serde(with="chrono::serde::ts_milliseconds")]
    pub created: chrono::DateTime<Utc>,
    pub title: String,
    pub names: BTreeSet<String>,
    pub content: String,
    pub tags: BTreeSet<String>,
    pub size: util::ContentSize,
    #[serde(default)]
    pub files: HashMap<String, File>,
    #[serde(default)]
    pub icon_filename: Option<String>,
    #[serde(default)]
    pub structured_data: StructuredData
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PageMeta {
    pub id: Ulid,
    #[serde(with="chrono::serde::ts_milliseconds")]
    pub updated: chrono::DateTime<Utc>,
    #[serde(with="chrono::serde::ts_milliseconds")]
    pub created: chrono::DateTime<Utc>,
    pub title: String,
    pub names: BTreeSet<String>,
    pub tags: BTreeSet<String>,
    pub size: util::ContentSize,
    pub snippet: String,
    pub icon_filename: Option<String>,
    pub structured_data: StructuredData
}
impl PageMeta {
    pub fn from_page(page: &Page, db: &DB, snippet_offset: usize) -> Self {
        let snippet = markdown::snippet(&page.content[snippet_offset..], db);
        let snippet = snippet.trim().to_string();
        PageMeta {
            id: page.id, updated: page.updated, created: page.created, title: page.title.clone(), names: page.names.clone(), tags: page.tags.clone(), size: page.size,
            icon_filename: page.icon_filename.clone(), structured_data: page.structured_data.clone(),
            snippet
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum RevisionType {
    AddName(String),
    AddTag(String),
    ContentUpdate { new_content_size: util::ContentSize, edit_distance: Option<u32> },
    PageCreated,
    RemoveName(String),
    RemoveTag(String),
    AddFile(String),
    RemoveFile(String),
    SetIconFilename(Option<String>),
    SetStructuredData(StructuredData)
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RevisionHeader {
    pub id: Ulid,
    pub page: Ulid,
    pub ty: RevisionType,
    #[serde(with="chrono::serde::ts_milliseconds")]
    pub time: chrono::DateTime<Utc>
}

type Links = HashMap<Ulid, (
    HashMap<Ulid, Link>, // outbound links: destination ID => link for links in page
    HashMap<Ulid, Link> // inbound links: source ID => link for links referring to page
)>;

pub struct MemoryStore {
    pub pages: HashMap<Ulid, Page>,
    pub page_lookup: HashMap<Slug, Ulid>,
    pub search_index: Index,
    pub links: Links,
    pub unresolved_links: HashMap<Slug, HashMap<Ulid, (String, usize)>>,
    pub tags_inv: HashMap<String, HashSet<Ulid>>,
    pub tags: HashMap<Ulid, HashSet<String>>,
    pub page_revisions: HashMap<Ulid, Vec<Ulid>>,
    pub revisions: BTreeMap<Ulid, RevisionHeader>
}
pub struct DB {
    pub mem: MemoryStore,
    backing: SqlitePool
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct PageView {
    page: Ulid,
    #[serde(with="chrono::serde::ts_milliseconds")]
    pub time: chrono::DateTime<Utc>
}

#[derive(Debug, Serialize, Deserialize, Clone)]
enum Object {
    Page(Page),
    Revision(RevisionHeader),
    PageView(PageView)
}

impl DB {
    pub async fn init() -> Result<Self> {
        let pool = SqlitePoolOptions::new()
            .max_connections(4)
            .connect_with(SqliteConnectOptions::from_str(&format!("sqlite://{}", CONFIG.paths.primary_db))?.create_if_missing(true)).await?;
        sqlx::query("CREATE TABLE IF NOT EXISTS objects (id BLOB NOT NULL PRIMARY KEY, data BLOB NOT NULL, long_data BLOB)").persistent(false).execute(&mut pool.acquire().await?).await?;
        let mut db = Self {
            backing: pool,
            mem: MemoryStore {
                pages: HashMap::new(),
                page_lookup: HashMap::new(),
                search_index: Index::new(),
                links: HashMap::new(),
                unresolved_links: HashMap::new(),
                tags_inv: HashMap::new(),
                tags: HashMap::new(),
                page_revisions: HashMap::new(),
                revisions: BTreeMap::new()
            }
        };
        db.preload().await.context("database integrity error")?;
        Ok(db)
    }

    async fn preload(&mut self) -> Result<()> {
        let mut db = self.backing.acquire().await?;
        sqlx::query("PRAGMA integrity_check").persistent(false).execute(&mut db).await?;
        let mut s = sqlx::query("SELECT id, data FROM objects ORDER BY id ASC").persistent(false).fetch(&mut db);
        while let Some(row) = s.try_next().await? {
            let id: Ulid = row.get::<Vec<u8>, usize>(0).as_slice().try_into().context("invalid ULID")?;
            let value: Object = rmp_serde::from_read_ref(row.get::<Vec<u8>, usize>(1).as_slice()).with_context(|| format!("invalid object {}", id))?;
            match value {
                Object::Page(page) => {
                    for name in page.names.iter() {
                        self.mem.page_lookup.insert(Slug::new(name), id);
                    }
                    self.index_tags(id, page.tags.iter());
                    self.mem.pages.insert(id, page);
                },
                Object::Revision(rh) => {
                    let page = rh.page;
                    self.mem.revisions.insert(id, rh);
                    self.mem.page_revisions.entry(page).or_default().push(id);
                },
                Object::PageView(_v) => ()
            }
        }
        // this has to be done after all pages have been loaded into memory, or links won't work right
        for id in self.mem.pages.keys().copied().collect::<Vec<Ulid>>() {
            self.parse_and_index_page(id)?;
        }
        Ok(())
    }

    fn index_tags<'a, I: Iterator<Item=&'a String>>(&mut self, id: Ulid, tags: I) {
        for tag in tags {
            for hier in util::hierarchical_tags(tag) {
                self.mem.tags.entry(id).or_default().insert(hier.clone());
                self.mem.tags_inv.entry(hier).or_default().insert(id);
            }
        }
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

    async fn read_full_data(&self, id: Ulid) -> Result<(Object, Vec<u8>)> {
        let id: [u8; 16] = id.into();
        let id: Vec<u8> = id.to_vec();
        let row = sqlx::query("SELECT data, long_data FROM objects WHERE id = ?")
            .bind(id)
            .fetch_one(&mut self.backing.acquire().await?).await.map_err(|e| match e {
                sqlx::Error::RowNotFound => Error::NotFound,
                e => Error::DBError(e)
            })?;
        let obj_data: Vec<u8> = row.get::<Vec<u8>, usize>(0);
        let full_data: Vec<u8> = row.get::<Vec<u8>, usize>(1);
        Ok((rmp_serde::from_read(obj_data.as_slice()).context("parsing object")?, full_data))
    }

    pub fn read(&self) -> &MemoryStore {
        &self.mem
    }

    fn add_name_internal(&mut self, id: Ulid, name: &str) -> Result<()> {
        let slug = Slug::new(name);
        // update unresolved links by making them into actual links
        if let Some(pages_containing_name) = self.mem.unresolved_links.remove(&slug) {
            for (page_with_link, (text, context_position)) in pages_containing_name {
                let new_link = Link {
                    from: page_with_link,
                    to: id,
                    text, context_position,
                    to_name: slug.clone()
                };
                self.mem.links.entry(id).or_default().1.insert(page_with_link, new_link.clone()); // create inbound link
                self.mem.links.entry(page_with_link).or_default().0.insert(id, new_link); // create outbound link from original page
            }
        }
        let entry = self.mem.page_lookup.entry(slug);
        match entry {
            Entry::Occupied(e) => return Err(Error::Conflict(*e.get())),
            Entry::Vacant(e) => e.insert(id)
        };
        Ok(())
    }

    fn parse_and_index_page(&mut self, id: Ulid) -> Result<()> {
        let page = &self.mem.pages[&id];
        let (text, links) = markdown::extract_info(&page.content, &self);
        // if this page had links out before, clear them from inbound link map on targets
        if let Some(to_clear) = self.mem.links.get(&id).map(|x| x.0.keys().copied().collect::<Vec<Ulid>>()) {
            for clear_from in to_clear {
                self.mem.links.get_mut(&clear_from).unwrap().1.remove(&id);
            }
        }
        // remove unresolved link; will be added back later if it's still there
        for links in self.mem.unresolved_links.values_mut() {
            links.remove(&id);
        }
        let mut outbound = HashMap::new();
        // this throws away all but the last link to a page in a page, but this is probably maybe fine
        for link in links {
            match link {
                markdown::Wikilink::ToPage(to, text, context_position, to_name) => {
                    let link = Link { to, text, from: id, context_position, to_name };
                    self.mem.links.entry(to).or_default().1.insert(id, link.clone());
                    outbound.insert(to, link);
                },
                markdown::Wikilink::TargetMissing(to, text, context) => {
                    self.mem.unresolved_links.entry(to).or_default().insert(id, (text, context));
                }
            }
        }
        self.mem.links.entry(id).or_default().0 = outbound;
        self.mem.search_index.insert(id, text);
        Ok(())
    }

    pub async fn create_page(&mut self, title: String, initial_tags: Vec<String>) -> Result<Ulid> {
        let id = Ulid::generate();
        self.add_name_internal(id, &title)?;
        self.push_revision(id, RevisionType::PageCreated, None).await?;
        self.index_tags(id, initial_tags.iter());
        let page = Page {
            content: String::new(),
            updated: Utc::now(),
            created: Utc::now(),
            title: title.clone(),
            names: vec![title].into_iter().collect(),
            tags: initial_tags.into_iter().map(|a| util::preprocess_tag(&a)).collect(),
            size: util::ContentSize::compute(""),
            id,
            files: HashMap::new(),
            icon_filename: None,
            structured_data: Vec::new()
        };
        self.mem.pages.insert(id, page.clone());
        self.write_object(id, Object::Page(page), None).await?;
        //self.parse_and_index_page(id)?;
        Ok(id)
    }

    pub async fn update_page_at(&mut self, id: Ulid, content: String, time: DateTime<Utc>) -> Result<()> {
        let edit_distance = {
            let old_content = &self.mem.pages.get(&id).ok_or(Error::NotFound)?.content;
            util::edit_distance(&content, &old_content)
        };
        let new_content_size = util::ContentSize::compute(&content);
        self.push_revision_at(id, RevisionType::ContentUpdate { 
            new_content_size,
            edit_distance
        }, Some(content.as_bytes().to_vec()), time).await?;
        let page = {
            let mut page = self.mem.pages.get_mut(&id).ok_or(Error::NotFound)?;
            page.content = content;
            page.size = new_content_size;
            page.updated = time;
            page.clone()
        };
        self.write_object(id, Object::Page(page), None).await?;
        self.parse_and_index_page(id)?;
        Ok(())
    }

    pub async fn update_page(&mut self, id: Ulid, content: String) -> Result<()> {
        self.update_page_at(id, content, Utc::now()).await
    }

    pub async fn add_name(&mut self, id: Ulid, name: String) -> Result<()> {
        if !self.mem.pages.contains_key(&id) { return Err(Error::NotFound) }
        self.add_name_internal(id, &name)?;
        self.push_revision(id, RevisionType::AddName(name.clone()), None).await?;
        let page = {
            let page = self.mem.pages.get_mut(&id).unwrap();
            page.names.insert(name);
            page.clone()
        };
        self.write_object(id, Object::Page(page), None).await?;
        Ok(())
    }

    pub async fn add_tag(&mut self, id: Ulid, tag: String) -> Result<()> {
        let tag = util::preprocess_tag(&tag);
        self.push_revision(id, RevisionType::AddTag(tag.clone()), None).await?;
        if !self.mem.pages.contains_key(&id) { return Err(Error::NotFound) }
        self.index_tags(id, std::iter::once(&tag));
        let page = {
            let page = self.mem.pages.get_mut(&id).unwrap();
            page.tags.insert(tag);
            page.clone()
        };
        self.write_object(id, Object::Page(page), None).await?;
        Ok(())
    }

    pub fn has_tag(&self, id: Ulid, tag: &str) -> bool {
        self.read().tags.get(&id).map(|x| x.contains(tag)).unwrap_or(false)
    }

    pub fn has_all_tags(&self, id: Ulid, tags: &Vec<(String, bool)>) -> bool {
        tags.iter().all(|t| t.1 == self.has_tag(id, &t.0))
    }

    pub async fn push_revision_at(&mut self, page: Ulid, rev: RevisionType, content: Option<Vec<u8>>, time: DateTime<Utc>) -> Result<()> {
        let id = Ulid::generate();
        let header = RevisionHeader {
            id, time, ty: rev, page
        };
        self.write_object(id, Object::Revision(header.clone()), content).await?;
        self.mem.revisions.insert(id, header);
        self.mem.page_revisions.entry(page).or_default().push(id);
        Ok(())
    }

    pub async fn push_revision(&mut self, page: Ulid, rev: RevisionType, content: Option<Vec<u8>>) -> Result<()> {
        self.push_revision_at(page, rev, content, Utc::now()).await
    }

    pub fn revisions(&self, page: Ulid) -> Result<Vec<RevisionHeader>> {
        Ok(self.mem.page_revisions.get(&page).map(|r| r.iter().map(|x| self.mem.revisions[x].clone()).collect()).unwrap_or_default())
    }

    pub async fn get_revision_data(&self, id: Ulid) -> Result<(RevisionHeader, String)> {
        let (hdr, blob) = self.read_full_data(id).await?;
        let hdr = match hdr {
            Object::Revision(hdr) => hdr,
            x => return Err(Error::InternalError(anyhow::anyhow!("expected revision, got {:?}", x)))
        };
        let str = String::from_utf8(blob).map_err(|_| Error::InternalError(anyhow::anyhow!("valid UTF-8 expected")))?;
        Ok((hdr, str))
    }

    pub async fn remove_tag(&mut self, id: Ulid, tag: String) -> Result<()> {
        let tag = util::preprocess_tag(&tag);
        self.push_revision(id, RevisionType::RemoveTag(tag.clone()), None).await?;
        if !self.mem.pages.contains_key(&id) { return Err(Error::NotFound) }
        // in case we e.g. remove #a/b/c but #a/b/x still exists, more complicated logic is required
        // the easiest way to make this work is just to remove all tags from the index then reinsert them
        for tag in self.mem.pages[&id].tags.iter() {
            for hier in util::hierarchical_tags(tag) {
                self.mem.tags.entry(id).or_default().remove(&hier);
                self.mem.tags_inv.entry(hier).or_default().remove(&id);
            }
        }
        let page = {
            let page = self.mem.pages.get_mut(&id).unwrap();
            page.tags.remove(&tag);
            page.clone()
        };
        self.index_tags(id, page.tags.iter());
        self.write_object(id, Object::Page(page), None).await?;
        Ok(())
    }

    pub async fn remove_name(&mut self, id: Ulid, name: String) -> Result<()> {
        if !self.mem.pages.contains_key(&id) { return Err(Error::NotFound) }
        self.push_revision(id, RevisionType::RemoveName(name.clone()), None).await?;

        let slug = Slug::new(&name);

        if let Some(links) = self.mem.links.get_mut(&id) {
            let mut to_remove = vec![];
            for (target_page_id, link) in links.1.iter() {
                if link.to_name == slug {
                    to_remove.push(*target_page_id)
                }
            }
            for id in to_remove {
                let link = links.1.remove(&id).unwrap();
                self.mem.unresolved_links.entry(slug.clone()).or_default().insert(id, (link.text, link.context_position));
            }
        }

        self.mem.page_lookup.remove(&slug);

        let page = {
            let page = self.mem.pages.get_mut(&id).unwrap();
            page.names.remove(&name);
            page.clone()
        };
        self.write_object(id, Object::Page(page), None).await?;
        Ok(())
    }

    pub fn recent_changes(&self, n: usize) -> Vec<(RevisionHeader, PageMeta)> {
        let mut used_pages = HashSet::new();
        self.mem.revisions.values().rev().flat_map(|h| {
            if used_pages.contains(&h.page) {
                return None
            }
            used_pages.insert(h.page);
            Some((h.clone(), PageMeta::from_page(&self.mem.pages[&h.page], self, 0)))
        }).take(n).collect()
    }

    pub async fn add_files_to_page(&mut self, page: Ulid, files: Vec<File>) -> Result<()> {
        for file in files.iter() {
            self.push_revision(page, RevisionType::AddFile(file.filename.clone()), None).await?;
        }
        let page = if let Some(page) = self.mem.pages.get_mut(&page) { page } else { return Err(Error::NotFound) };
        for file in files {
            page.files.insert(file.filename.clone(), file);
        }
        let page = page.clone();
        self.write_object(page.id, Object::Page(page), None).await?;
        Ok(())
    }

    pub async fn remove_file(&mut self, page_id: Ulid, file: String) -> Result<File> {
        self.push_revision(page_id, RevisionType::RemoveFile(file.clone()), None).await?;
        let file = self.mem.pages.get_mut(&page_id).ok_or(Error::NotFound)?.files.remove(&file).ok_or(Error::NotFound)?;
        self.write_object(page_id, Object::Page(self.mem.pages[&page_id].clone()), None).await?;
        Ok(file)
    }

    pub async fn set_icon_filename(&mut self, page_id: Ulid, filename: Option<String>) -> Result<()> {
        self.push_revision(page_id, RevisionType::SetIconFilename(filename.clone()), None).await?;
        let page = self.mem.pages.get_mut(&page_id).ok_or(Error::NotFound)?;
        if let Some(filename) = &filename {
            if !page.files.contains_key(filename) {
                return Err(Error::NotFound)
            }
        }
        page.icon_filename = filename;
        let page = page.clone();
        self.write_object(page_id, Object::Page(page), None).await?;
        Ok(())
    }

    pub async fn set_structured_data(&mut self, page_id: Ulid, data: StructuredData) -> Result<()> {
        self.push_revision(page_id, RevisionType::SetStructuredData(data.clone()), None).await?;
        let page = self.mem.pages.get_mut(&page_id).ok_or(Error::NotFound)?;
        page.structured_data = data;
        let page = page.clone();
        self.write_object(page_id, Object::Page(page), None).await?;
        Ok(())
    }

    pub async fn push_view(&mut self, page: Ulid) -> Result<()> {
        self.write_object(Ulid::generate(), Object::PageView(PageView { time: Utc::now(), page }), None).await?;
        Ok(())
    }
}

pub type DBHandle = Arc<RwLock<DB>>;