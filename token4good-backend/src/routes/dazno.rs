use axum::{
    extract::{Extension, Path, Query, State},
    http::{HeaderMap, StatusCode},
    response::Json,
    routing::{get, post},
    Router,
};
use serde::Deserialize;

use crate::{
    middleware::auth::AuthUser,
    services::dazno::{
        DaznoError, DaznoLightningInvoice, DaznoLightningPayment, DaznoUserProfile,
        LightningBalance, LightningTransaction, TokenBalance,
    },
    AppState,
};

#[derive(Debug, Deserialize)]
pub struct CreateLightningInvoicePayload {
    pub amount_msat: u64,
    pub description: String,
}

#[derive(Debug, Deserialize)]
pub struct PayLightningInvoicePayload {
    pub payment_request: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateGamificationRequest {
    pub points: u64,
    pub action: String,
}

pub fn dazno_routes() -> Router<AppState> {
    Router::new()
        // User Management (dazno.de/api)
        .route("/users/:id/profile", get(get_dazno_user_profile))
        .route("/users/:id/tokens/t4g", get(get_user_t4g_balance))
        .route("/users/:id/gamification", post(update_user_gamification))
        // Lightning Network (api.dazno.de)
        .route("/lightning/invoice", post(create_dazno_lightning_invoice))
        .route("/lightning/pay", post(pay_dazno_lightning_invoice))
        .route(
            "/lightning/balance/:user_id",
            get(get_dazno_lightning_balance),
        )
        .route(
            "/lightning/transactions/:user_id",
            get(get_dazno_lightning_transactions),
        )
}

// ============= USER MANAGEMENT (dazno.de/api) =============

pub async fn get_dazno_user_profile(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<DaznoUserProfile>, StatusCode> {
    ensure_user_access(&auth_user, &id)?;
    let dazno_token = extract_dazno_token(&headers)?;

    let profile = state
        .dazno
        .get_user_profile(&dazno_token, &id)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(profile))
}

pub async fn get_user_t4g_balance(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<TokenBalance>, StatusCode> {
    ensure_user_access(&auth_user, &id)?;
    let dazno_token = extract_dazno_token(&headers)?;

    let balance = state
        .dazno
        .get_user_t4g_balance(&dazno_token, &id)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(balance))
}

pub async fn update_user_gamification(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(payload): Json<UpdateGamificationRequest>,
) -> Result<StatusCode, StatusCode> {
    ensure_user_access(&auth_user, &id)?;
    let dazno_token = extract_dazno_token(&headers)?;

    state
        .dazno
        .update_user_gamification(&dazno_token, &id, payload.points, &payload.action)
        .await
        .map_err(map_dazno_error)?;

    Ok(StatusCode::OK)
}

// ============= LIGHTNING NETWORK (api.dazno.de) =============

pub async fn create_dazno_lightning_invoice(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Json(payload): Json<CreateLightningInvoicePayload>,
) -> Result<Json<DaznoLightningInvoice>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let invoice = state
        .dazno
        .create_lightning_invoice(
            &dazno_token,
            payload.amount_msat,
            &payload.description,
            &auth_user.id,
        )
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(invoice))
}

pub async fn pay_dazno_lightning_invoice(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Json(payload): Json<PayLightningInvoicePayload>,
) -> Result<Json<DaznoLightningPayment>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let payment = state
        .dazno
        .pay_lightning_invoice(&dazno_token, &payload.payment_request, &auth_user.id)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(payment))
}

pub async fn get_dazno_lightning_balance(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(user_id): Path<String>,
) -> Result<Json<LightningBalance>, StatusCode> {
    ensure_user_access(&auth_user, &user_id)?;
    let dazno_token = extract_dazno_token(&headers)?;

    let balance = state
        .dazno
        .get_lightning_balance(&dazno_token, &user_id)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(balance))
}

pub async fn get_dazno_lightning_transactions(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(user_id): Path<String>,
    Query(params): Query<TransactionQuery>,
) -> Result<Json<Vec<LightningTransaction>>, StatusCode> {
    ensure_user_access(&auth_user, &user_id)?;
    let dazno_token = extract_dazno_token(&headers)?;

    let transactions = state
        .dazno
        .get_lightning_transactions(&dazno_token, &user_id, params.limit)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(transactions))
}

#[derive(Debug, Deserialize)]
pub struct TransactionQuery {
    pub limit: Option<u32>,
}

const DAZNO_TOKEN_HEADER: &str = "x-dazno-token";

fn extract_dazno_token(headers: &HeaderMap) -> Result<String, StatusCode> {
    let raw = headers
        .get(DAZNO_TOKEN_HEADER)
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let token = raw
        .to_str()
        .map_err(|_| StatusCode::BAD_REQUEST)?
        .trim()
        .to_string();

    if token.is_empty() {
        return Err(StatusCode::UNAUTHORIZED);
    }

    Ok(token)
}

fn ensure_user_access(auth_user: &AuthUser, resource_owner: &str) -> Result<(), StatusCode> {
    let has_access = auth_user.id == resource_owner
        || matches!(auth_user.role.as_str(), "admin" | "service_provider");

    if has_access {
        Ok(())
    } else {
        Err(StatusCode::FORBIDDEN)
    }
}

fn map_dazno_error(err: DaznoError) -> StatusCode {
    match err {
        DaznoError::InvalidToken => StatusCode::UNAUTHORIZED,
        DaznoError::LightningApiError(_) | DaznoError::UsersApiError(_) => StatusCode::BAD_GATEWAY,
        DaznoError::ConnectionError(_) => StatusCode::BAD_GATEWAY,
    }
}
