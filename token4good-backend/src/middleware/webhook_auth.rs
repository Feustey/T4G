use axum::{
    extract::Request,
    http::{HeaderMap, StatusCode},
    middleware::Next,
    response::Response,
};

/// Vérifie la clé API T4G pour les webhooks
pub async fn webhook_api_key_middleware(
    headers: HeaderMap,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let expected_api_key = std::env::var("T4G_API_KEY").map_err(|_| {
        tracing::error!("T4G_API_KEY non configuré");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let api_key = headers
        .get("x-api-key")
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| {
            tracing::warn!("Header x-api-key manquant pour webhook");
            StatusCode::UNAUTHORIZED
        })?;

    if api_key != expected_api_key {
        tracing::warn!("Clé API invalide pour webhook");
        return Err(StatusCode::UNAUTHORIZED);
    }

    tracing::debug!("Clé API webhook validée");
    Ok(next.run(request).await)
}
