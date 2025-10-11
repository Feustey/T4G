use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};

use crate::{
    services::lightning::{Invoice, NodeInfo, PaymentHash, PaymentStatus},
    AppState,
};

#[derive(Debug, Deserialize)]
pub struct CreateInvoiceRequest {
    pub amount_msat: u64,
    pub description: String,
    pub expiry_seconds: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct PayInvoiceRequest {
    pub payment_request: String,
}

pub fn lightning_routes() -> Router<AppState> {
    Router::new()
        .route("/node/info", get(get_node_info))
        .route("/invoice", post(create_invoice))
        .route("/payment", post(pay_invoice))
        .route("/payment/:hash/status", get(get_payment_status))
        .route("/invoices", get(list_invoices))
        .route("/payments", get(list_payments))
}

pub async fn get_node_info(State(state): State<AppState>) -> Result<Json<NodeInfo>, StatusCode> {
    let node_info = state
        .lightning
        .get_node_info()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(node_info))
}

pub async fn create_invoice(
    State(state): State<AppState>,
    Json(payload): Json<CreateInvoiceRequest>,
) -> Result<Json<Invoice>, StatusCode> {
    let expiry = payload.expiry_seconds.unwrap_or(3600); // 1 heure par défaut

    let invoice = state
        .lightning
        .create_invoice(payload.amount_msat, &payload.description, expiry)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(invoice))
}

pub async fn pay_invoice(
    State(state): State<AppState>,
    Json(payload): Json<PayInvoiceRequest>,
) -> Result<Json<PaymentHash>, StatusCode> {
    let payment = state
        .lightning
        .pay_invoice(&payload.payment_request)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(payment))
}

pub async fn get_payment_status(
    State(state): State<AppState>,
    Path(hash): Path<String>,
) -> Result<Json<PaymentStatusResponse>, StatusCode> {
    let status = state
        .lightning
        .get_payment_status(&hash)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = PaymentStatusResponse {
        payment_hash: hash,
        status,
        checked_at: chrono::Utc::now(),
    };

    Ok(Json(response))
}

pub async fn list_invoices(
    State(_state): State<AppState>,
) -> Result<Json<Vec<Invoice>>, StatusCode> {
    // TODO: Implémenter la liste des invoices via LND
    let invoices = vec![];
    Ok(Json(invoices))
}

pub async fn list_payments(
    State(_state): State<AppState>,
) -> Result<Json<Vec<PaymentRecord>>, StatusCode> {
    // TODO: Implémenter la liste des paiements via LND
    let payments = vec![];
    Ok(Json(payments))
}

#[derive(Debug, Serialize)]
pub struct PaymentStatusResponse {
    pub payment_hash: String,
    pub status: PaymentStatus,
    pub checked_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct PaymentRecord {
    pub payment_hash: String,
    pub amount_msat: u64,
    pub fee_msat: u64,
    pub status: PaymentStatus,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub settled_at: Option<chrono::DateTime<chrono::Utc>>,
    pub destination: String,
    pub description: String,
}
