use axum::{extract::{Json, Extension, Multipart, Path}, http::{StatusCode, Request}, response::{Html, IntoResponse}, body::Body, routing::{get, post, get_service}, Router};
use serde::{Deserialize, Serialize};
use tower_http::{services::ServeDir, add_extension::AddExtensionLayer, services::ServeFile};
use rusty_ulid::Ulid;
use std::collections::{HashSet, HashMap};
use std::sync::Arc;
use tokio::sync::RwLock;
use rand::seq::SliceRandom;
use anyhow::{anyhow, Context};
use tower::ServiceExt;
use tokio::{fs::{File, self}, io::AsyncWriteExt};
use std::path;
use magic::{Cookie, CookieFlags};
use std::str::FromStr;
use chrono::prelude::*;

mod storage;
mod markdown;
mod search;
mod error;
mod util;
use error::*;
use storage::*;
use util::CONFIG;
use util::structured_data;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", format!("minoteaur={}", CONFIG.log_level))
    }
    tracing_subscriber::fmt::init();

    let db = Arc::new(RwLock::new(DB::init().await?));

    let app = Router::new()
        .nest(
            "/static",
            get_service(ServeDir::new("static")).handle_error(|error: std::io::Error| async move {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Unhandled internal error: {}", error),
                )
            }),
        )
        .route("/file/:page/:filename", get(file_get))
        .route("/api/upload/:page", post(file_upload))
        .route("/api", post(api))
        .route("/", get(index))
        .layer(AddExtensionLayer::new(db));

    let addr = CONFIG.listen_address.parse().unwrap();
    tracing::info!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;
    Ok(())
}

async fn index() -> impl IntoResponse {
    Html(r#"<!DOCTYPE html><title>Loading - Minoteaur</title><meta charset="utf8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel=icon href="/static/icon.png"><link rel=stylesheet href="/static/app.css"><body><script src="/static/app.js"></script></body>"#)
}

#[derive(Debug, Serialize, Deserialize)]
struct RenderedLink {
    #[serde(flatten)]
    link: Link,
    context: String
}

#[derive(Debug, Serialize, Deserialize)]
pub enum SortOrder {
    Relevance,
    Updated,
    Created,
    Alphabetical,
    Data(String)
}
fn sort_search_results<'a>(db: &'a MemoryStore, order: SortOrder, reverse: bool) -> impl FnOnce(&mut Vec<(Ulid, f64)>) + 'a {
    move |results| {
        match order {
            SortOrder::Alphabetical => results.sort_unstable_by(|(id, _), (id2, _)| db.pages[id].title.cmp(&db.pages[id2].title)),
            SortOrder::Created => results.sort_unstable_by_key(|(id, _)| -db.pages[id].created.timestamp_millis()),
            SortOrder::Updated => results.sort_unstable_by_key(|(id, __)| -db.pages[id].updated.timestamp_millis()),
            SortOrder::Relevance => results.sort_unstable_by(|(_, s), (_, t)| t.partial_cmp(s).unwrap()),
            SortOrder::Data(key) => results.sort_unstable_by(|(id, _), (id2, _)| util::structured_data::cmp_by_key(&key, &db.pages[id].structured_data, &db.pages[id2].structured_data))
        }
        if reverse {
            results.reverse()
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
enum APIReq {
    GetPage(Ulid, Option<Ulid>),
    Search(String, SortOrder, bool),
    UpdatePage(Ulid, String),
    CreatePage { title: String, tags: Vec<String> },
    AddName(Ulid, String),
    AddTag(Ulid, String),
    GetRevisions(Ulid),
    RemoveName(Ulid, String),
    RemoveTag(Ulid, String),
    IndexPage,
    DeleteFile(Ulid, String),
    SetIcon(Ulid, Option<String>),
    UpdatePageRetroactive(Ulid, String, i64),
    SetStructuredData(Ulid, structured_data::PageData)
}

#[derive(Debug, Serialize, Deserialize)]
struct Stats {
    total_pages: usize,
    total_revisions: usize,
    total_links: usize,
    total_words: u64,
    tag_counts: HashMap<String, usize>,
    version: String
}

#[derive(Debug, Serialize, Deserialize)]
enum APIRes {
    Page { #[serde(flatten)] page: Page, rendered_content: String, backlinks: Vec<(RenderedLink, String)>, revision: Option<RevisionHeader> },
    SearchResult { content_matches: Vec<(Ulid, PageMeta, f64)>, title_matches: Vec<(Ulid, String)>, content_matches_count: usize },
    NewPage(Ulid),
    PageUpdated,
    AddedName(String),
    AddedTag(String),
    Revisions(Vec<RevisionHeader>),
    RemovedName(String),
    RemovedTag(String),
    IndexPage { recent_changes: Vec<(RevisionHeader, PageMeta)>, random_pages: Vec<PageMeta>, dead_links: Vec<(Ulid, String, util::Slug, String)>, stats: Stats },
    FileDeleted,
    IconSet,
    StructuredDataSet
}

async fn file_upload(mut multipart: Multipart, Path(page_id): Path<Ulid>, Extension(db): Extension<DBHandle>) -> Result<Json<Vec<storage::File>>> {
    let mut files = vec![];
    while let Some(mut field) = multipart.next_field().await.context("multipart error")? {
        let name = field.name().ok_or(Error::BadInput(anyhow!("filename required")))?.to_string();
        let content_type = field.content_type().ok_or(Error::BadInput(anyhow!("content type required")))?.to_string();
        let relative_path = util::derive_path(page_id, &name);
        let path = format!("{}/{}", CONFIG.paths.files, relative_path);
        fs::create_dir_all(path::Path::new(&path).parent().unwrap()).await.context("making dirs")?;
        
        let mut size = 0;
        let mut file = File::create(&path).await.context("opening output file")?;
        while let Some(value) = field.chunk().await.context("reading multipart")? {
            size += value.len();
            file.write_all(&value).await.context("writing output file")?;
        }
        file.flush().await.context("flushing file")?;

        files.push(storage::File {
            created: Utc::now(),
            filename: name,
            mime_type: content_type,
            page: page_id,
            size: size as u64,
            storage_path: relative_path,
            metadata: HashMap::new()
        })
    }
    let files = tokio::task::spawn_blocking(move || -> Result<Vec<storage::File>, anyhow::Error> {
        let cookie = Cookie::open(CookieFlags::default())?;
        cookie.load(&[&CONFIG.paths.magic_db])?;
        for file in files.iter_mut() {
            match cookie.file(&format!("{}/{}", CONFIG.paths.files, file.storage_path)) {
                Ok(filetype) => file.metadata.insert(String::from("filetype"), filetype),
                Err(e) => file.metadata.insert(String::from("filetype"), format!("Autodetection failed: {}", e))
            };
        }
        Ok(files)
    }).await.context("task spawning")?.context("autodetecting filetype")?;
    db.write().await.add_files_to_page(page_id, files.clone()).await?;
    Ok(Json(files))
}

async fn file_get(Path((page_id, filename)): Path<(Ulid, String)>, Extension(db): Extension<DBHandle>) -> Result<impl IntoResponse> {
    let req = Request::builder().body(Body::empty()).unwrap();
    let db_ = db.read().await;
    let db = db_.read();
    let page = db.pages.get(&page_id).ok_or(Error::NotFound)?;
    let file = page.files.get(&filename).ok_or(Error::NotFound)?;
    Ok(ServeFile::new_with_mime(format!("{}/{}", CONFIG.paths.files, file.storage_path), &mime::Mime::from_str(&file.mime_type).context("invalid MIME")?).oneshot(req).await.context("serving static file")?)
}

async fn api(Json(input): Json<APIReq>, Extension(db): Extension<DBHandle>) -> Result<Json<APIRes>> {
    tracing::debug!("{:?}", input);
    match input {
        APIReq::GetPage(ulid, rev_id) => {
            db.write().await.push_view(ulid).await?;
            let db_ =  db.read().await;
            let db = db_.read();
            let mut page = db.pages.get(&ulid).ok_or(Error::NotFound)?.clone();
            let mut revision = None;
            if let Some(rev_id) = rev_id {
                let (r, s) = db_.get_revision_data(rev_id).await?;
                page.content = s;
                revision = Some(r);
            }
            let backlinks = db.links.get(&ulid).map(|x| x.1.values().cloned().map(|link| {
                let source_page = &db.pages[&link.from];
                let title = source_page.title.clone();
                let link = RenderedLink {
                    context: markdown::snippet(&source_page.content[link.context_position..], &db_),
                    link
                };
                (link, title)
            }).collect()).unwrap_or_else(Vec::new);
            let rendered_content = tokio::task::block_in_place(|| markdown::render(&page.content, &db_, true));
            Ok(Json(APIRes::Page {
                page,
                rendered_content, 
                backlinks,
                revision
            }))
        },
        APIReq::Search(query, order, reverse) => {
            let db = db.read().await;
            let data = db.read();
            let query = util::query::parse(&query);
            let plain = util::query::plaintext(&query);
            let tags = util::query::tags(&query);
            let structured_data = util::query::structured_data(&query);
            let (results, content_matches_count) = if plain.len() > 0 {
                let (search_output, result_count) = data.search_index.search(query, CONFIG.max_search_results, sort_search_results(&db.mem, order, reverse));
                (search_output.into_iter()
                    .map(|(page, score, snippet_offset)| (page, PageMeta::from_page(&data.pages[&page], &db, snippet_offset), score))
                    .filter(|(id, _meta, _score)| db.has_all_tags(*id, &tags) && structured_data::matches(&data.pages[id].structured_data, &structured_data))
                    .collect(), result_count)
            } else {
                let mut results = data.pages.keys().copied()
                    .filter_map(|id| if db.has_all_tags(id, &tags) && structured_data::matches(&data.pages[&id].structured_data, &structured_data) { Some((id, 1.0)) } else { None })
                    .collect();
                sort_search_results(&db.mem, order, reverse)(&mut results);
                let result_count = results.len();
                results.truncate(CONFIG.max_search_results);
                (results.into_iter().map(|(page, _)| (page, PageMeta::from_page(&data.pages[&page], &db, 0), 1.0))
                    .collect(), result_count)
            };
            let mut title_matches: Vec<(Ulid, &str, i32)> = data.pages.iter()
                .filter(|(id, _page)| tags.iter().all(|t| t.1 == db.has_tag(**id, &t.0)))
                .filter_map(|(i, p)| util::fuzzy_match(&plain, &p.title).map(|s| (i.clone(), p.title.as_str(), s)))
                .collect();
            title_matches.sort_unstable_by_key(|(_, _, s)| -s);
            title_matches.truncate(CONFIG.title_search.max_results);
            Ok(Json(APIRes::SearchResult { 
                content_matches: results,
                title_matches: title_matches.into_iter().map(|(i, t, _s)| (i, t.to_string())).collect(),
                content_matches_count
            }))
        },
        APIReq::UpdatePage(id, content) => {
            let mut db = db.write().await;
            db.update_page(id, content).await?;
            Ok(Json(APIRes::PageUpdated))
        },
        APIReq::UpdatePageRetroactive(id, content, backdate_dt_ms) => {
            if !CONFIG.allow_backdate {
                return Err(Error::BadInput(anyhow!("backdating is disabled")));
            }
            let dt = Utc.timestamp_millis(backdate_dt_ms);
            let mut db = db.write().await;
            db.update_page_at(id, content, dt).await?;
            Ok(Json(APIRes::PageUpdated))
        },
        APIReq::CreatePage { title, tags } => {
            let mut db = db.write().await;
            Ok(Json(APIRes::NewPage(db.create_page(title, tags).await?)))
        },
        APIReq::AddName(id, name) => {
            let mut db = db.write().await;
            db.add_name(id, name.clone()).await?;
            Ok(Json(APIRes::AddedName(name)))
        },
        APIReq::AddTag(id, tag) => {
            let mut db = db.write().await;
            db.add_tag(id, tag.clone()).await?;
            Ok(Json(APIRes::AddedTag(util::preprocess_tag(&tag))))
        },
        APIReq::RemoveName(id, name) => {
            let mut db = db.write().await;
            db.remove_name(id, name.clone()).await?;
            Ok(Json(APIRes::RemovedName(name)))
        },
        APIReq::RemoveTag(id, tag) => {
            let mut db = db.write().await;
            db.remove_tag(id, tag.clone()).await?;
            Ok(Json(APIRes::RemovedTag(util::preprocess_tag(&tag))))
        },
        APIReq::GetRevisions(id) => {
            let db = db.read().await;
            Ok(Json(APIRes::Revisions(db.revisions(id)?)))
        },
        APIReq::IndexPage => {
            let db = db.read().await;
            let data = db.read();

            let mut rng = rand::thread_rng();
            // TODO: This is extremely O(n)
            let ixs: HashSet<usize> = rand::seq::index::sample(&mut rng, data.pages.len(), std::cmp::min(16, data.pages.len())).into_iter().collect();
            let mut random_samples: Vec<PageMeta> = data.pages.values().enumerate()
                .flat_map(|(i, p)| if ixs.contains(&i) { Some(PageMeta::from_page(p, &db, 0)) } else { None }).collect();
            random_samples.shuffle(&mut rng);

            let dead_links = data.unresolved_links.iter().flat_map(|(target_name, originators)| {
                originators.iter().map(|(oid, (display_name, _context_offset))| (oid.clone(), data.pages[&oid].title.clone(), target_name.clone(), display_name.clone()))
            }).collect();

            let stats = Stats {
                total_pages: data.pages.len(),
                total_links: data.links.values().map(|(out, _in)| out.len()).sum(),
                total_revisions: data.revisions.len(),
                total_words: data.search_index.total_document_length,
                tag_counts: data.tags_inv.iter().map(|(tag, pages)| (tag.clone(), pages.len())).collect(),
                version: util::VERSION.clone()
            };

            Ok(Json(APIRes::IndexPage { recent_changes: db.recent_changes(16), random_pages: random_samples, dead_links, stats }))
        },
        APIReq::DeleteFile(ulid, filename) => {
            let mut db = db.write().await;
            let file = db.remove_file(ulid, filename).await?;
            fs::remove_file(format!("{}/{}", CONFIG.paths.files, file.storage_path)).await.context("deleting file")?;
            Ok(Json(APIRes::FileDeleted))
        },
        APIReq::SetIcon(page, icon) => {
            let mut db = db.write().await;
            db.set_icon_filename(page, icon).await?;
            Ok(Json(APIRes::IconSet))
        },
        APIReq::SetStructuredData(page, data) => {
            let mut db = db.write().await;
            db.set_structured_data(page, data).await?;
            Ok(Json(APIRes::StructuredDataSet))
        }
    }
}