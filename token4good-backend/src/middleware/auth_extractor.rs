use axum::{
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
};
use crate::{middleware::auth::AuthUser, AppState};

pub struct AuthUserExtractor(pub AuthUser);

#[axum::async_trait]
impl FromRequestParts<AppState> for AuthUserExtractor {
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, _state: &AppState) -> Result<Self, Self::Rejection> {
        let auth_user = parts
            .extensions
            .get::<AuthUser>()
            .ok_or(StatusCode::UNAUTHORIZED)?;
        Ok(AuthUserExtractor(auth_user.clone()))
    }
}

