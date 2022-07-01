use axum::{
    extract::{Json, Extension},
    http::StatusCode,
    response::{Html, IntoResponse},
    routing::{get, post, get_service},
    Router
};
use serde::{Deserialize, Serialize};
use tower_http::{services::ServeDir, add_extension::AddExtensionLayer};
use rusty_ulid::Ulid;
use std::sync::Arc;
use tokio::sync::RwLock;
//use std::collections::HashMap;

mod storage;
mod markdown;
mod search;
mod error;
mod util;
use error::*;
use storage::*;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "minoteaur=debug")
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
        .route("/api", post(api))
        .route("/", get(index))
        .layer(AddExtensionLayer::new(db));

    let addr = "[::]:7600".parse().unwrap();
    tracing::debug!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;
    Ok(())
}

async fn index() -> impl IntoResponse {
    Html(r#"<!DOCTYPE html><meta charset="utf8"><link rel=stylesheet href="/static/app.css"><body><script src="/static/app.js"></script></body>"#)
}

#[derive(Debug, Serialize, Deserialize)]
enum APIReq {
    GetPage(Ulid),
    Search(String),
    UpdatePage(Ulid, Content),
    CreatePage { title: String, content: String },
    AddName(Ulid, String)
}

#[derive(Debug, Serialize, Deserialize)]
enum RenderedContent {
    Markdown(String), // HTML
    List(Vec<String>) // List of rendered HTML things
}

#[derive(Debug, Serialize, Deserialize)]
enum APIRes {
    Page { #[serde(flatten)] page: Page, rendered_content: RenderedContent, backlinks: Vec<(Link, String)> },
    SearchResults(Vec<(Ulid, String)>),
    NewPage(Ulid),
    PageUpdated,
    AddedName(String)
}

async fn api(Json(input): Json<APIReq>, Extension(db): Extension<DBHandle>) -> Result<Json<APIRes>> {
    println!("{:?}", input);
    match input {
        APIReq::GetPage(ulid) => {
            let db_ =  db.read().await;
            let db = db_.read();
            let page = db.pages.get(&ulid).ok_or(Error::NotFound)?;
            let backlinks = db.links.get(&ulid).map(|x| x.1.values().cloned().map(|link| {
                let title = db.pages[&link.from].title.clone();
                (link, title)
            }).collect()).unwrap_or_else(Vec::new);
            let rendered_content = match &page.content {
                Content::Markdown(md) => RenderedContent::Markdown(markdown::render(&md, &db_)),
                Content::List(items) => RenderedContent::List(items.iter().map(|(_, md)| markdown::render(md, &db_)).collect())
            };
            Ok(Json(APIRes::Page {
                page: page.clone(),
                rendered_content, 
                backlinks
            }))
        },
        APIReq::Search(query) => {
            let db = db.read().await;
            let db = db.read();
            let results = db.search_index.search(&query).into_iter().map(|page| (page, db.pages[&page].title.clone())).collect();
            Ok(Json(APIRes::SearchResults(results)))
        },
        APIReq::UpdatePage(id, content) => {
            let mut db = db.write().await;
            //let html = markdown::render(&content, &db);
            db.update_page(id, content).await?;
            Ok(Json(APIRes::PageUpdated))
        },
        APIReq::CreatePage { title, content } => {
            let mut db = db.write().await;
            Ok(Json(APIRes::NewPage(db.create_page(title, Content::Markdown(content)).await?)))
        },
        APIReq::AddName(id, name) => {
            let mut db = db.write().await;
            db.add_name(id, name.clone()).await?;
            Ok(Json(APIRes::AddedName(name)))
        }
    }
}