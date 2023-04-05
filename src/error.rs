use axum::{
    http::StatusCode,
    response::{IntoResponse, Response, Json},
};

#[derive(thiserror::Error, Debug, serde::Serialize)]
pub enum Error {
    #[error("internal server error")]
    InternalError(#[from] #[serde(with = "serde_with::rust::display_fromstr")] anyhow::Error),
    #[error("internal database error")]
    DBError(#[from] #[serde(with = "serde_with::rust::display_fromstr")] sqlx::Error),
    #[error("not found")]
    NotFound,
    #[error("already exists")]
    Conflict(rusty_ulid::Ulid),
    #[error("input is wrong")]
    BadInput(#[serde(with = "serde_with::rust::display_fromstr")] anyhow::Error)
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        println!("Error: {}", self);
        let status = match self {
            Error::InternalError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Error::DBError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Error::NotFound => StatusCode::NOT_FOUND,
            Error::Conflict(_) => StatusCode::CONFLICT,
            Error::BadInput(_) => StatusCode::BAD_REQUEST
        };

        (status, Json(self)).into_response()
    }
}

pub type Result<T, E = Error> = std::result::Result<T, E>;