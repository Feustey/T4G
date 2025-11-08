//! Routes pour l'API Token4Good (T4G)
//! Documentation complète: _SPECS/api-pour-t4g-daznode.md

use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::{
    middleware::auth::AuthUser,
    AppState,
};

pub fn token4good_routes() -> Router<AppState> {
    Router::new()
        // Public endpoints
        .route("/marketplace/stats", get(get_marketplace_stats))
        // User Management
        .route("/users", post(create_user))
        .route("/users/:user_id", get(get_user))
        .route("/users/:user_id/statistics", get(get_user_statistics))
        .route("/users/:user_id/opportunities", get(get_user_opportunities))
        .route("/leaderboard", get(get_leaderboard))
        // Token Management
        .route("/tokens/award", post(award_tokens))
        .route("/tokens/:user_id/balance", get(get_token_balance))
        .route("/tokens/:user_id/transactions", get(get_token_transactions))
        // Mentoring Sessions
        .route("/mentoring/sessions", post(create_mentoring_session))
        .route("/mentoring/sessions/complete", post(complete_mentoring_session))
        .route("/mentoring/sessions/:user_id", get(get_user_sessions))
        // Marketplace
        .route("/marketplace/services", post(create_service))
        .route("/marketplace/search", post(search_services))
        .route("/marketplace/book", post(book_service))
        .route("/marketplace/bookings/complete", post(complete_booking))
        .route("/marketplace/recommendations/:user_id", get(get_recommendations))
        // Admin
        .route("/admin/rewards/weekly-bonuses", post(process_weekly_bonuses))
        .route("/admin/system/status", get(get_system_status))
        // Lightning Integration
        .route("/lightning/invoice/create", post(create_lightning_invoice))
        .route("/lightning/balance", get(get_lightning_balance))
        .route("/lightning/invoice/pay", post(pay_lightning_invoice))
        .route("/lightning/invoice/check/:payment_hash", get(check_lightning_payment))
        .route("/lightning/node/info", get(get_lightning_node_info))
        .route("/lightning/channels", get(get_lightning_channels))
        .route("/lightning/status", get(get_lightning_status))
}

// ============= PUBLIC ENDPOINTS =============

pub async fn get_marketplace_stats(
    State(_state): State<AppState>,
) -> Result<Json<MarketplaceStats>, StatusCode> {
    // Public endpoint - no authentication required
    let stats = MarketplaceStats {
        total_services: 0,
        active_providers: 0,
        total_bookings: 0,
        avg_rating: 0.0,
        categories: HashMap::new(),
    };
    Ok(Json(stats))
}

// ============= USER MANAGEMENT =============

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    pub user_id: String,
    pub username: String,
    pub email: String,
    pub skills: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct T4GUser {
    pub user_id: String,
    pub username: String,
    pub email: String,
    pub total_tokens_earned: i64,
    pub total_tokens_spent: i64,
    pub available_balance: i64,
    pub user_level: String,
    pub skills: Vec<String>,
    pub reputation_score: f64,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

pub async fn create_user(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<T4GUser>, StatusCode> {
    // TODO: Implement user creation in database
    let user = T4GUser {
        user_id: payload.user_id,
        username: payload.username,
        email: payload.email,
        total_tokens_earned: 0,
        total_tokens_spent: 0,
        available_balance: 0,
        user_level: "contributeur".to_string(),
        skills: payload.skills,
        reputation_score: 0.0,
        created_at: chrono::Utc::now(),
    };

    Ok(Json(user))
}

pub async fn get_user(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(_user_id): Path<String>,
) -> Result<Json<T4GUser>, StatusCode> {
    // TODO: Fetch from database
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn get_user_statistics(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(user_id): Path<String>,
) -> Result<Json<UserStatistics>, StatusCode> {
    // TODO: Calculate statistics from database
    let stats = UserStatistics {
        user_id,
        total_transactions: 0,
        sessions_given: 0,
        sessions_received: 0,
        avg_rating: 0.0,
        community_rank: 0,
        level_progress: 0.0,
    };
    Ok(Json(stats))
}

pub async fn get_user_opportunities(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(_user_id): Path<String>,
) -> Result<Json<Vec<Opportunity>>, StatusCode> {
    // TODO: Fetch opportunities based on user skills
    Ok(Json(vec![]))
}

pub async fn get_leaderboard(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Query(_params): Query<LeaderboardQuery>,
) -> Result<Json<Vec<LeaderboardEntry>>, StatusCode> {
    // TODO: Fetch leaderboard from database
    Ok(Json(vec![]))
}

// ============= TOKEN MANAGEMENT =============

#[derive(Debug, Deserialize)]
pub struct AwardTokensRequest {
    pub user_id: String,
    pub action_type: String,
    pub tokens: i64,
    pub description: String,
    pub metadata: Option<serde_json::Value>,
    pub impact_score: Option<f64>,
}

#[derive(Debug, Serialize)]
pub struct TokenAwardResponse {
    pub id: String,
    pub user_id: String,
    pub action_type: String,
    pub tokens_earned: i64,
    pub description: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub impact_score: Option<f64>,
}

pub async fn award_tokens(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<AwardTokensRequest>,
) -> Result<Json<TokenAwardResponse>, StatusCode> {
    // TODO: Implement token awarding logic with impact score
    let tokens_earned = payload.tokens; // * payload.impact_score.unwrap_or(1.0) as i64;
    
    let response = TokenAwardResponse {
        id: uuid::Uuid::new_v4().to_string(),
        user_id: payload.user_id,
        action_type: payload.action_type,
        tokens_earned,
        description: payload.description,
        timestamp: chrono::Utc::now(),
        impact_score: payload.impact_score,
    };

    Ok(Json(response))
}

pub async fn get_token_balance(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(user_id): Path<String>,
) -> Result<Json<T4GBalanceResponse>, StatusCode> {
    // TODO: Calculate balance from database
    let balance = T4GBalanceResponse {
        user_id,
        total_earned: 0,
        total_spent: 0,
        available_balance: 0,
        user_level: "contributeur".to_string(),
    };
    Ok(Json(balance))
}

pub async fn get_token_transactions(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(_user_id): Path<String>,
    Query(_params): Query<TransactionsQuery>,
) -> Result<Json<Vec<Transaction>>, StatusCode> {
    // TODO: Fetch transactions from database
    Ok(Json(vec![]))
}

// ============= MENTORING SESSIONS =============

#[derive(Debug, Deserialize)]
pub struct CreateMentoringSessionRequest {
    pub mentor_id: String,
    pub mentee_id: String,
    pub topic: String,
    pub category: String,
    pub duration_minutes: i32,
}

#[derive(Debug, Deserialize)]
pub struct CompleteMentoringSessionRequest {
    pub session_id: String,
    pub feedback: SessionFeedback,
}

#[derive(Debug, Deserialize)]
pub struct SessionFeedback {
    pub rating: i32,
    pub comments: String,
    pub learned_skills: Vec<String>,
}

pub async fn create_mentoring_session(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateMentoringSessionRequest>,
) -> Result<Json<MentoringSession>, StatusCode> {
    // TODO: Create session in database
    let session = MentoringSession {
        id: uuid::Uuid::new_v4().to_string(),
        mentor_id: payload.mentor_id,
        mentee_id: payload.mentee_id,
        topic: payload.topic,
        category: payload.category,
        duration_minutes: payload.duration_minutes,
        status: "scheduled".to_string(),
        created_at: chrono::Utc::now(),
    };
    Ok(Json(session))
}

pub async fn complete_mentoring_session(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(_payload): Json<CompleteMentoringSessionRequest>,
) -> Result<Json<MentoringSession>, StatusCode> {
    // TODO: Update session status and award tokens
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn get_user_sessions(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(_user_id): Path<String>,
    Query(_params): Query<SessionsQuery>,
) -> Result<Json<Vec<MentoringSession>>, StatusCode> {
    // TODO: Fetch sessions from database
    Ok(Json(vec![]))
}

// ============= MARKETPLACE =============

#[derive(Debug, Deserialize)]
pub struct CreateServiceRequest {
    pub provider_id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub token_cost: i64,
    pub estimated_duration: String,
    pub requirements: Vec<String>,
    pub tags: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct SearchServicesRequest {
    pub category: Option<String>,
    pub max_cost: Option<i64>,
    pub tags: Option<Vec<String>>,
    pub provider_level: Option<String>,
}

pub async fn create_service(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateServiceRequest>,
) -> Result<Json<Service>, StatusCode> {
    // TODO: Create service in database
    let service = Service {
        id: uuid::Uuid::new_v4().to_string(),
        provider_id: payload.provider_id,
        name: payload.name,
        description: payload.description,
        category: payload.category,
        token_cost: payload.token_cost,
        estimated_duration: payload.estimated_duration,
        requirements: payload.requirements,
        tags: payload.tags,
        rating: 0.0,
        reviews_count: 0,
        created_at: chrono::Utc::now(),
    };
    Ok(Json(service))
}

pub async fn search_services(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(_payload): Json<SearchServicesRequest>,
) -> Result<Json<Vec<Service>>, StatusCode> {
    // TODO: Search services in database
    Ok(Json(vec![]))
}

pub async fn book_service(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(_payload): Json<BookServiceRequest>,
) -> Result<Json<Booking>, StatusCode> {
    // TODO: Create booking in database and deduct tokens
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn complete_booking(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(_payload): Json<CompleteBookingRequest>,
) -> Result<Json<Booking>, StatusCode> {
    // TODO: Update booking and transfer tokens
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn get_recommendations(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(_user_id): Path<String>,
    Query(_params): Query<RecommendationsQuery>,
) -> Result<Json<Vec<Service>>, StatusCode> {
    // TODO: Calculate recommendations based on user skills
    Ok(Json(vec![]))
}

// ============= ADMIN =============

pub async fn process_weekly_bonuses(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
) -> Result<Json<WeeklyBonusesResponse>, StatusCode> {
    // TODO: Verify admin permissions and process bonuses
    let response = WeeklyBonusesResponse {
        bonuses_awarded: vec![],
        total_tokens_awarded: 0,
        processed_at: chrono::Utc::now(),
    };
    Ok(Json(response))
}

pub async fn get_system_status(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
) -> Result<Json<SystemStatus>, StatusCode> {
    // TODO: Calculate system statistics
    let status = SystemStatus {
        health: "healthy".to_string(),
        total_users: 0,
        total_transactions: 0,
        active_services: 0,
        level_distribution: HashMap::new(),
        token_economy: TokenEconomy {
            in_circulation: 0,
            total_earned: 0,
            total_spent: 0,
        },
    };
    Ok(Json(status))
}

// ============= LIGHTNING INTEGRATION =============

#[derive(Debug, Deserialize)]
pub struct CreateLightningInvoiceRequest {
    pub amount: i64,
    pub memo: String,
    pub expiry: i64,
}

#[derive(Debug, Serialize)]
pub struct LightningInvoiceResponse {
    pub status: String,
    pub payment_request: String,
    pub payment_hash: String,
    pub checking_id: String,
    pub amount: i64,
    pub expiry: i64,
}

pub async fn create_lightning_invoice(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateLightningInvoiceRequest>,
) -> Result<Json<LightningInvoiceResponse>, StatusCode> {
    // Use Dazno Lightning API
    let invoice = LightningInvoiceResponse {
        status: "success".to_string(),
        payment_request: "lnbc...".to_string(),
        payment_hash: uuid::Uuid::new_v4().to_string(),
        checking_id: uuid::Uuid::new_v4().to_string(),
        amount: payload.amount,
        expiry: payload.expiry,
    };
    Ok(Json(invoice))
}

pub async fn get_lightning_balance(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
) -> Result<Json<LightningBalanceResponse>, StatusCode> {
    let balance = LightningBalanceResponse {
        status: "success".to_string(),
        balance_sats: 0,
        balance_msats: 0,
        wallet_id: "wallet_t4g_001".to_string(),
    };
    Ok(Json(balance))
}

pub async fn pay_lightning_invoice(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(_payload): Json<PayLightningInvoiceRequest>,
) -> Result<Json<PaymentResponse>, StatusCode> {
    // TODO: Process payment via Dazno API
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn check_lightning_payment(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(payment_hash): Path<String>,
) -> Result<Json<PaymentCheckResponse>, StatusCode> {
    // TODO: Check payment status
    let response = PaymentCheckResponse {
        status: "success".to_string(),
        payment_hash,
        paid: false,
        details: None,
    };
    Ok(Json(response))
}

pub async fn get_lightning_node_info(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
) -> Result<Json<NodeInfo>, StatusCode> {
    // TODO: Get Lightning node info
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn get_lightning_channels(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<LightningChannel>>, StatusCode> {
    // TODO: Get Lightning channels
    Ok(Json(vec![]))
}

pub async fn get_lightning_status(
    State(_state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
) -> Result<Json<LightningStatus>, StatusCode> {
    // TODO: Get Lightning status
    Err(StatusCode::NOT_IMPLEMENTED)
}

// ============= RESPONSE TYPES =============

#[derive(Debug, Serialize)]
pub struct MarketplaceStats {
    pub total_services: i64,
    pub active_providers: i64,
    pub total_bookings: i64,
    pub avg_rating: f64,
    pub categories: HashMap<String, i64>,
}

#[derive(Debug, Serialize)]
pub struct UserStatistics {
    pub user_id: String,
    pub total_transactions: i64,
    pub sessions_given: i64,
    pub sessions_received: i64,
    pub avg_rating: f64,
    pub community_rank: i64,
    pub level_progress: f64,
}

#[derive(Debug, Serialize)]
pub struct Opportunity {
    pub id: String,
    pub title: String,
    pub description: String,
    pub tokens_estimate: i64,
    pub category: String,
}

#[derive(Debug, Deserialize)]
pub struct LeaderboardQuery {
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct LeaderboardEntry {
    pub user_id: String,
    pub username: String,
    pub total_tokens: i64,
    pub rank: i64,
}

#[derive(Debug, Serialize)]
pub struct T4GBalanceResponse {
    pub user_id: String,
    pub total_earned: i64,
    pub total_spent: i64,
    pub available_balance: i64,
    pub user_level: String,
}

#[derive(Debug, Deserialize)]
pub struct TransactionsQuery {
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct Transaction {
    pub id: String,
    pub user_id: String,
    pub action_type: String,
    pub tokens: i64,
    pub description: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct MentoringSession {
    pub id: String,
    pub mentor_id: String,
    pub mentee_id: String,
    pub topic: String,
    pub category: String,
    pub duration_minutes: i32,
    pub status: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
pub struct SessionsQuery {
    pub as_mentor: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct Service {
    pub id: String,
    pub provider_id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub token_cost: i64,
    pub estimated_duration: String,
    pub requirements: Vec<String>,
    pub tags: Vec<String>,
    pub rating: f64,
    pub reviews_count: i64,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
pub struct BookServiceRequest {
    pub client_id: String,
    pub service_id: String,
    pub scheduled_at: String,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CompleteBookingRequest {
    pub booking_id: String,
    pub feedback: BookingFeedback,
}

#[derive(Debug, Deserialize)]
pub struct BookingFeedback {
    pub rating: i32,
    pub comments: String,
    pub would_recommend: bool,
}

#[derive(Debug, Serialize)]
pub struct Booking {
    pub id: String,
    pub client_id: String,
    pub service_id: String,
    pub status: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
pub struct RecommendationsQuery {
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct WeeklyBonusesResponse {
    pub bonuses_awarded: Vec<String>,
    pub total_tokens_awarded: i64,
    pub processed_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct SystemStatus {
    pub health: String,
    pub total_users: i64,
    pub total_transactions: i64,
    pub active_services: i64,
    pub level_distribution: HashMap<String, i64>,
    pub token_economy: TokenEconomy,
}

#[derive(Debug, Serialize)]
pub struct TokenEconomy {
    pub in_circulation: i64,
    pub total_earned: i64,
    pub total_spent: i64,
}

#[derive(Debug, Serialize)]
pub struct LightningBalanceResponse {
    pub status: String,
    pub balance_sats: i64,
    pub balance_msats: i64,
    pub wallet_id: String,
}

#[derive(Debug, Deserialize)]
pub struct PayLightningInvoiceRequest {
    pub bolt11: String,
}

#[derive(Debug, Serialize)]
pub struct PaymentResponse {
    pub status: String,
    pub payment_hash: String,
}

#[derive(Debug, Serialize)]
pub struct PaymentCheckResponse {
    pub status: String,
    pub payment_hash: String,
    pub paid: bool,
    pub details: Option<PaymentDetails>,
}

#[derive(Debug, Serialize)]
pub struct PaymentDetails {
    pub amount: i64,
    pub status: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct NodeInfo {
    pub pubkey: String,
    pub alias: String,
    pub num_channels: i64,
}

#[derive(Debug, Serialize)]
pub struct LightningChannel {
    pub id: String,
    pub capacity: i64,
    pub local_balance: i64,
    pub status: String,
}

#[derive(Debug, Serialize)]
pub struct LightningStatus {
    pub connected: bool,
    pub synced_to_chain: bool,
    pub num_channels: i64,
}

