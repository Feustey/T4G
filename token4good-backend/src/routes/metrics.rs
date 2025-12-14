use axum::{extract::State, http::StatusCode, response::Json, routing::get, Router};
use serde::Serialize;

use crate::AppState;

pub fn metrics_routes() -> Router<AppState> {
    Router::new().route("/", get(get_metrics))
}

pub async fn get_metrics(
    State(state): State<AppState>,
) -> Result<Json<MetricsResponse>, StatusCode> {
    // Fetch metrics from database and services
    let total_users = state.db.count_users().await.unwrap_or(0);

    let total_mentoring_requests = state.db.count_mentoring_requests().await.unwrap_or(0);

    // RGB proofs count
    let total_rgb_proofs = state
        .rgb
        .list_proofs()
        .await
        .map(|proofs| proofs.len() as u64)
        .unwrap_or(0);

    // T4G statistics
    let active_mentoring_requests = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COUNT(*) FROM t4g_mentoring_sessions WHERE status IN ('scheduled', 'in_progress')"
    )
    .fetch_one(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .unwrap_or(0) as u64;

    let completed_mentoring_requests = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COUNT(*) FROM t4g_mentoring_sessions WHERE status = 'completed'"
    )
    .fetch_one(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .unwrap_or(0) as u64;

    let metrics = MetricsResponse {
        total_users,
        total_mentoring_requests,
        total_rgb_proofs,
        active_mentoring_requests,
        completed_mentoring_requests,
        lightning: None,
        timestamp: chrono::Utc::now(),
    };

    Ok(Json(metrics))
}

#[derive(Debug, Serialize)]
pub struct MetricsResponse {
    pub total_users: u64,
    pub total_mentoring_requests: u64,
    pub total_rgb_proofs: u64,
    pub active_mentoring_requests: u64,
    pub completed_mentoring_requests: u64,
    pub lightning: Option<LightningStats>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct LightningStats {
    pub num_channels: u64,
    pub synced_to_chain: bool,
    pub total_capacity_msat: u64,
}
