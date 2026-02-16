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

    // Count alumnis and students
    let alumnis_count = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COUNT(*) FROM users WHERE role IN ('ALUMNI', 'mentor')"
    )
    .fetch_one(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .unwrap_or(0) as u64;

    let students_count = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COUNT(*) FROM users WHERE role IN ('STUDENT', 'mentee')"
    )
    .fetch_one(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .unwrap_or(0) as u64;

    // Count total transactions
    let txs_count = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COUNT(*) FROM transactions"
    )
    .fetch_one(state.db.pool())
    .await
    .unwrap_or(Some(0))
    .unwrap_or(0) as u64;

    // Count mentoring sessions as interactions
    let interactions_count = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COUNT(*) FROM t4g_mentoring_sessions WHERE status = 'completed'"
    )
    .fetch_one(state.db.pool())
    .await
    .unwrap_or(Some(0))
    .unwrap_or(0) as u64;

    // Get token supply and exchanged from database
    let tokens_supply = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COALESCE(SUM(tokens_earned), 0) as total FROM token_transactions WHERE status = 'completed'"
    )
    .fetch_one(state.db.pool())
    .await
    .unwrap_or(Some(0))
    .unwrap_or(0) as u64;

    let tokens_exchanged = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT COUNT(*) FROM token_transactions WHERE status = 'completed' AND transaction_type IN ('transfer', 'exchange')"
    )
    .fetch_one(state.db.pool())
    .await
    .unwrap_or(Some(0))
    .unwrap_or(0) as u64;

    let metrics = MetricsResponse {
        usersCount: UsersCount {
            alumnis: alumnis_count,
            students: students_count,
            total: total_users,
        },
        interactionsCount: interactions_count,
        tokensSupply: tokens_supply,
        tokensExchanged: tokens_exchanged,
        txsCount: txs_count,
    };

    Ok(Json(metrics))
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct UsersCount {
    pub alumnis: u64,
    pub students: u64,
    pub total: u64,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct MetricsResponse {
    pub usersCount: UsersCount,
    pub interactionsCount: u64,
    pub tokensSupply: u64,
    pub tokensExchanged: u64,
    pub txsCount: u64,
}
