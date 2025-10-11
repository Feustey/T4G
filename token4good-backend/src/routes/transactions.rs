use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};

use crate::{
    models::transaction::{BlockchainTransaction, CreateTransactionRequest},
    AppState,
};

pub fn transaction_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_transaction))
        .route("/:hash", get(get_transaction))
        .route("/address/:address", get(get_transactions_by_address))
        .route("/stats/total-supply", get(get_total_supply))
        .route("/stats/last-block", get(get_last_block))
}

async fn create_transaction(
    State(state): State<AppState>,
    Json(req): Json<CreateTransactionRequest>,
) -> Result<Json<BlockchainTransaction>, StatusCode> {
    let ops = state.db.service_ops();
    ops.create_or_update_transaction(req)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn get_transaction(
    State(state): State<AppState>,
    Path(hash): Path<String>,
) -> Result<Json<BlockchainTransaction>, StatusCode> {
    let ops = state.db.service_ops();
    ops.get_transaction_by_hash(&hash)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn get_transactions_by_address(
    State(state): State<AppState>,
    Path(address): Path<String>,
) -> Result<Json<Vec<BlockchainTransaction>>, StatusCode> {
    let ops = state.db.service_ops();
    ops.get_transactions_by_address(&address)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn get_total_supply(State(state): State<AppState>) -> Result<Json<i64>, StatusCode> {
    let ops = state.db.service_ops();
    ops.get_total_supply()
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn get_last_block(State(state): State<AppState>) -> Result<Json<Option<i32>>, StatusCode> {
    let ops = state.db.service_ops();
    ops.get_last_block()
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}
