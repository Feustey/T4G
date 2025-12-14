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
        ChannelCloseInfo, ChannelInfo, DaznoError, DaznoLightningInvoice,
        DaznoLightningPayment, DaznoUserProfile, LightningBalance, LightningNetworkStats,
        LightningTransaction, NodeInfo, RoutingAnalysis, TokenBalance,
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
        // Lightning Network (api.dazno.de) - Legacy endpoints
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
        // MCP API v1 - Wallet Operations
        .route("/v1/wallet/balance/:user_id", get(get_wallet_balance))
        .route("/v1/wallet/payments/:user_id", get(get_wallet_payments))
        // MCP API v1 - Channel Management
        .route("/v1/channels/:user_id", get(list_user_channels))
        .route("/v1/channels/detail/:channel_id", get(get_channel_detail))
        .route("/v1/channels/open", post(open_channel))
        .route("/v1/channels/:channel_id/close", post(close_channel))
        // MCP API v1 - Node Information
        .route("/v1/nodes", get(list_nodes))
        .route("/v1/nodes/:pubkey", get(get_node_info))
        // MCP API v1 - Lightning Network Analysis
        .route("/v1/lightning/stats", get(get_lightning_stats))
        .route("/v1/lightning/routing", post(analyze_routing))
        // Webhooks
        .route("/v1/webhook", post(configure_webhook))
        .route("/v1/webhook/user/:user_id", get(get_user_webhooks))
        .route("/v1/webhook/id/:webhook_id", axum::routing::delete(delete_webhook))
        // LNURL
        .route("/v1/lnurl/pay", post(create_lnurl_pay))
        .route("/v1/lnurl/withdraw", post(create_lnurl_withdraw))
        .route("/v1/lnurl/auth", post(lnurl_auth))
        // Multi-Wallets
        .route("/v1/wallet", post(create_new_wallet))
        .route("/v1/wallet/list/:user_id", get(list_user_wallets))
        .route("/v1/wallet/:wallet_id", get(get_wallet_info))
        .route("/v1/wallet/:wallet_id", axum::routing::delete(delete_user_wallet))
        .route("/v1/wallet/:wallet_id/invoices", get(get_wallet_invoices_list))
        .route("/v1/wallet/:wallet_id/payments", get(get_wallet_payments_list))
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

// ============= MCP API v1 HANDLERS =============

#[derive(Debug, Deserialize)]
pub struct WalletPaymentsQuery {
    pub limit: Option<u32>,
}

pub async fn get_wallet_balance(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(user_id): Path<String>,
) -> Result<Json<LightningBalance>, StatusCode> {
    ensure_user_access(&auth_user, &user_id)?;
    let dazno_token = extract_dazno_token(&headers)?;

    let balance = state
        .dazno
        .get_wallet_balance(&dazno_token, &user_id)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(balance))
}

pub async fn get_wallet_payments(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(user_id): Path<String>,
    Query(params): Query<WalletPaymentsQuery>,
) -> Result<Json<Vec<LightningTransaction>>, StatusCode> {
    ensure_user_access(&auth_user, &user_id)?;
    let dazno_token = extract_dazno_token(&headers)?;

    let payments = state
        .dazno
        .get_wallet_payments(&dazno_token, &user_id, params.limit)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(payments))
}

#[derive(Debug, Deserialize)]
pub struct OpenChannelPayload {
    pub node_pubkey: String,
    pub amount_msat: u64,
}

pub async fn list_user_channels(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(user_id): Path<String>,
) -> Result<Json<Vec<ChannelInfo>>, StatusCode> {
    ensure_user_access(&auth_user, &user_id)?;
    let dazno_token = extract_dazno_token(&headers)?;

    let channels = state
        .dazno
        .list_channels(&dazno_token, &user_id)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(channels))
}

pub async fn get_channel_detail(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(channel_id): Path<String>,
) -> Result<Json<ChannelInfo>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let channel = state
        .dazno
        .get_channel(&dazno_token, &channel_id)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(channel))
}

pub async fn open_channel(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Json(payload): Json<OpenChannelPayload>,
) -> Result<Json<ChannelInfo>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let channel = state
        .dazno
        .open_channel(&dazno_token, &auth_user.id, &payload.node_pubkey, payload.amount_msat)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(channel))
}

#[derive(Debug, Deserialize)]
pub struct CloseChannelQuery {
    pub force: Option<bool>,
}

pub async fn close_channel(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(channel_id): Path<String>,
    Query(params): Query<CloseChannelQuery>,
) -> Result<Json<ChannelCloseInfo>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let close_info = state
        .dazno
        .close_channel(&dazno_token, &channel_id, params.force)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(close_info))
}

#[derive(Debug, Deserialize)]
pub struct NodesQuery {
    pub q: Option<String>,
}

pub async fn list_nodes(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Query(params): Query<NodesQuery>,
) -> Result<Json<Vec<NodeInfo>>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let nodes = state
        .dazno
        .list_nodes(&dazno_token, params.q.as_deref())
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(nodes))
}

pub async fn get_node_info(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(pubkey): Path<String>,
) -> Result<Json<NodeInfo>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let node = state
        .dazno
        .get_node_info(&dazno_token, &pubkey)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(node))
}

pub async fn get_lightning_stats(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    headers: HeaderMap,
) -> Result<Json<LightningNetworkStats>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let stats = state
        .dazno
        .get_lightning_stats(&dazno_token)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(stats))
}

#[derive(Debug, Deserialize)]
pub struct AnalyzeRoutingPayload {
    pub from_node: String,
    pub to_node: String,
    pub amount_msat: u64,
}

pub async fn analyze_routing(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Json(payload): Json<AnalyzeRoutingPayload>,
) -> Result<Json<RoutingAnalysis>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let analysis = state
        .dazno
        .analyze_lightning_routing(&dazno_token, &payload.from_node, &payload.to_node, payload.amount_msat)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(analysis))
}

// ============= WEBHOOKS HANDLERS =============

use crate::services::dazno::{WebhookConfig, LnurlPayResponse, LnurlWithdrawResponse, 
    LnurlAuthResponse, WalletInfo, WalletDetails};

#[derive(Debug, Deserialize)]
pub struct ConfigureWebhookPayload {
    pub webhook_url: String,
    pub events: Vec<String>,
}

pub async fn configure_webhook(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Json(payload): Json<ConfigureWebhookPayload>,
) -> Result<Json<WebhookConfig>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let webhook = state
        .dazno
        .configure_webhook(&dazno_token, &auth_user.id, &payload.webhook_url, payload.events)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(webhook))
}

pub async fn get_user_webhooks(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(user_id): Path<String>,
) -> Result<Json<Vec<WebhookConfig>>, StatusCode> {
    ensure_user_access(&auth_user, &user_id)?;
    let dazno_token = extract_dazno_token(&headers)?;

    let webhooks = state
        .dazno
        .get_webhooks(&dazno_token, &user_id)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(webhooks))
}

pub async fn delete_webhook(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(webhook_id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    state
        .dazno
        .delete_webhook(&dazno_token, &webhook_id)
        .await
        .map_err(map_dazno_error)?;

    Ok(StatusCode::OK)
}

// ============= LNURL HANDLERS =============

#[derive(Debug, Deserialize)]
pub struct CreateLnurlPayPayload {
    pub min_sendable: u64,
    pub max_sendable: u64,
    pub metadata: String,
    pub comment_allowed: Option<u32>,
}

pub async fn create_lnurl_pay(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Json(payload): Json<CreateLnurlPayPayload>,
) -> Result<Json<LnurlPayResponse>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let lnurl = state
        .dazno
        .create_lnurl_pay(
            &dazno_token,
            &auth_user.id,
            payload.min_sendable,
            payload.max_sendable,
            &payload.metadata,
            payload.comment_allowed,
        )
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(lnurl))
}

#[derive(Debug, Deserialize)]
pub struct CreateLnurlWithdrawPayload {
    pub min_withdrawable: u64,
    pub max_withdrawable: u64,
    pub default_description: String,
}

pub async fn create_lnurl_withdraw(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Json(payload): Json<CreateLnurlWithdrawPayload>,
) -> Result<Json<LnurlWithdrawResponse>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let lnurl = state
        .dazno
        .create_lnurl_withdraw(
            &dazno_token,
            &auth_user.id,
            payload.min_withdrawable,
            payload.max_withdrawable,
            &payload.default_description,
        )
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(lnurl))
}

#[derive(Debug, Deserialize)]
pub struct LnurlAuthPayload {
    pub k1: String,
    pub sig: String,
    pub key: String,
}

pub async fn lnurl_auth(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Json(payload): Json<LnurlAuthPayload>,
) -> Result<Json<LnurlAuthResponse>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let auth_response = state
        .dazno
        .lnurl_auth_verify(&dazno_token, &payload.k1, &payload.sig, &payload.key)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(auth_response))
}

// ============= MULTI-WALLETS HANDLERS =============

#[derive(Debug, Deserialize)]
pub struct CreateWalletPayload {
    pub name: String,
}

pub async fn create_new_wallet(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Json(payload): Json<CreateWalletPayload>,
) -> Result<Json<WalletInfo>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let wallet = state
        .dazno
        .create_wallet(&dazno_token, &auth_user.id, &payload.name)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(wallet))
}

pub async fn list_user_wallets(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(user_id): Path<String>,
) -> Result<Json<Vec<WalletInfo>>, StatusCode> {
    ensure_user_access(&auth_user, &user_id)?;
    let dazno_token = extract_dazno_token(&headers)?;

    let wallets = state
        .dazno
        .list_wallets(&dazno_token, &user_id)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(wallets))
}

pub async fn get_wallet_info(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(wallet_id): Path<String>,
) -> Result<Json<WalletDetails>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let wallet = state
        .dazno
        .get_wallet_details(&dazno_token, &wallet_id)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(wallet))
}

pub async fn delete_user_wallet(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(wallet_id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    state
        .dazno
        .delete_wallet(&dazno_token, &wallet_id)
        .await
        .map_err(map_dazno_error)?;

    Ok(StatusCode::OK)
}

#[derive(Debug, Deserialize)]
pub struct WalletHistoryQuery {
    pub limit: Option<u32>,
}

pub async fn get_wallet_invoices_list(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(wallet_id): Path<String>,
    Query(params): Query<WalletHistoryQuery>,
) -> Result<Json<Vec<crate::services::dazno::DaznoLightningInvoice>>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let invoices = state
        .dazno
        .get_wallet_invoices(&dazno_token, &wallet_id, params.limit)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(invoices))
}

pub async fn get_wallet_payments_list(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    headers: HeaderMap,
    Path(wallet_id): Path<String>,
    Query(params): Query<WalletHistoryQuery>,
) -> Result<Json<Vec<crate::services::dazno::DaznoLightningPayment>>, StatusCode> {
    let dazno_token = extract_dazno_token(&headers)?;

    let payments = state
        .dazno
        .get_wallet_payments_history(&dazno_token, &wallet_id, params.limit)
        .await
        .map_err(map_dazno_error)?;

    Ok(Json(payments))
}

fn map_dazno_error(err: DaznoError) -> StatusCode {
    match err {
        DaznoError::InvalidToken => StatusCode::UNAUTHORIZED,
        DaznoError::LightningApiError(_) | DaznoError::UsersApiError(_) => StatusCode::BAD_GATEWAY,
        DaznoError::ConnectionError(_) => StatusCode::BAD_GATEWAY,
    }
}
