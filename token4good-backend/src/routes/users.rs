use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    models::user::{CreateUserRequest, UpdateUserRequest, User, UserRole},
    AppState,
};

#[derive(Debug, Deserialize)]
pub struct UserQuery {
    pub role: Option<UserRole>,
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

pub fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_users).post(create_user))
        .route("/:id", get(get_user).put(update_user).delete(delete_user))
        .route("/:id/profile", get(get_user_profile))
        .route("/:id/cv", get(get_user_cv))
        .route("/:id/wallet", get(get_user_wallet))
        .route("/:id/transactions", get(get_user_transactions))
        .route("/:id/services", get(get_user_services))
        .route("/me", get(get_current_user))
        .route("/me/notifications", get(get_user_notifications))
}

pub async fn list_users(
    State(state): State<AppState>,
    Query(query): Query<UserQuery>,
) -> Result<Json<Vec<User>>, StatusCode> {
    let users = state
        .db
        .get_users(
            query.role,
            query.limit.unwrap_or(50),
            query.offset.unwrap_or(0),
        )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(users))
}

pub async fn create_user(
    State(state): State<AppState>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<User>, StatusCode> {
    let user_id = Uuid::new_v4();

    let user = User {
        id: user_id,
        email: payload.email,
        firstname: payload.firstname,
        lastname: payload.lastname,
        lightning_address: payload
            .lightning_address
            .unwrap_or_else(|| format!("{}@lightning.token4good.com", user_id.to_string())),
        role: payload.role,
        username: payload
            .username
            .unwrap_or_else(|| format!("user_{}", &user_id.to_string()[..8])),
        bio: payload.bio,
        score: 0,
        avatar: payload.avatar,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
        is_active: true,
        wallet_address: None,
        preferences: serde_json::Value::Object(serde_json::Map::new()),
        email_verified: false,
        last_login: None,
        is_onboarded: false,
    };

    state
        .db
        .create_user(&user)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(user))
}

pub async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<User>, StatusCode> {
    let user = state
        .db
        .get_user_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(user))
}

pub async fn update_user(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateUserRequest>,
) -> Result<Json<User>, StatusCode> {
    let updated_user = state
        .db
        .update_user(&id, payload)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(updated_user))
}

pub async fn delete_user(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    let deleted = state
        .db
        .delete_user(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if deleted {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

pub async fn get_user_profile(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<UserProfile>, StatusCode> {
    let user = state
        .db
        .get_user_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let profile = UserProfile {
        id: user.id.to_string(),
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role,
        score: user.score,
        created_at: user.created_at,
        lightning_address: user.lightning_address,
    };

    Ok(Json(profile))
}

pub async fn get_user_wallet(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<WalletInfo>, StatusCode> {
    // Récupérer l'utilisateur pour obtenir son lightning_address
    let user = state
        .db
        .get_user_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let wallet_info = WalletInfo {
        balance_msat: 0, // TODO: implémenter le calcul du solde réel
        pending_balance_msat: 0,
        lightning_address: user.lightning_address,
        num_channels: 0,
        num_pending_channels: 0, // TODO: ajouter ce champ à NodeInfo si disponible via LND API
    };

    Ok(Json(wallet_info))
}

pub async fn get_user_transactions(
    State(_state): State<AppState>,
    Path(_id): Path<String>,
) -> Result<Json<Vec<TransactionRecord>>, StatusCode> {
    // TODO: Récupérer les transactions Lightning et RGB
    let transactions = vec![];
    Ok(Json(transactions))
}

pub async fn get_user_services(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<UserService>>, StatusCode> {
    let services = state
        .db
        .get_user_services(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(services))
}

pub async fn get_current_user(
    State(_state): State<AppState>,
    // TODO: Extraire l'utilisateur du JWT token
) -> Result<Json<User>, StatusCode> {
    // Pour l'instant, retourner un utilisateur de test
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn get_user_notifications(
    State(_state): State<AppState>,
    // TODO: Extraire l'utilisateur du JWT token
) -> Result<Json<Vec<Notification>>, StatusCode> {
    let notifications = vec![];
    Ok(Json(notifications))
}

#[derive(Debug, Serialize)]
pub struct UserProfile {
    pub id: String,
    pub username: String,
    pub firstname: String,
    pub lastname: String,
    pub bio: Option<String>,
    pub avatar: Option<String>,
    pub role: UserRole,
    pub score: u32,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub lightning_address: String,
}

#[derive(Debug, Serialize)]
pub struct WalletInfo {
    pub balance_msat: u64,
    pub pending_balance_msat: u64,
    pub lightning_address: String,
    pub num_channels: u32,
    pub num_pending_channels: u32,
}

#[derive(Debug, Serialize)]
pub struct TransactionRecord {
    pub id: String,
    pub transaction_type: String,
    pub amount_msat: u64,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub status: String,
    pub description: String,
}

#[derive(Debug, Serialize)]
pub struct UserService {
    pub id: String,
    pub title: String,
    pub description: String,
    pub category: String,
    pub price_msat: u64,
    pub is_active: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct Notification {
    pub id: String,
    pub title: String,
    pub message: String,
    pub notification_type: String,
    pub is_read: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

pub async fn get_user_cv(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<UserCV>, StatusCode> {
    let user = state
        .db
        .get_user_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    // TODO: Récupérer les expériences et formations depuis la base de données
    // Pour l'instant, retourner les infos de base du user
    let cv = UserCV {
        id: user.id.to_string(),
        firstname: user.firstname.clone(),
        lastname: user.lastname.clone(),
        email: user.email.clone(),
        program: extract_program_from_user(&user),
        graduated_year: extract_graduated_year_from_user(&user),
        bio: user.bio.clone().unwrap_or_default(),
        avatar: user.avatar.clone(),
        role: format!("{:?}", user.role),
        experiences: vec![], // TODO: fetch from experiences table
        education: vec![],   // TODO: fetch from education table
        skills: vec![],      // TODO: fetch from skills table
    };

    Ok(Json(cv))
}

// Helper functions
fn extract_program_from_user(user: &User) -> String {
    // Extraire le programme depuis les preferences si stocké
    // Sinon retourner une valeur par défaut
    user.preferences
        .get("program")
        .and_then(|v| v.as_str())
        .unwrap_or("Non renseigné")
        .to_string()
}

fn extract_graduated_year_from_user(user: &User) -> Option<i32> {
    user.preferences
        .get("graduated_year")
        .and_then(|v| v.as_i64())
        .map(|y| y as i32)
}

#[derive(Debug, Serialize)]
pub struct UserCV {
    pub id: String,
    pub firstname: String,
    pub lastname: String,
    pub email: String,
    pub program: String,
    pub graduated_year: Option<i32>,
    pub bio: String,
    pub avatar: Option<String>,
    pub role: String,
    pub experiences: Vec<Experience>,
    pub education: Vec<Education>,
    pub skills: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct Experience {
    pub id: String,
    pub title: String,
    pub company: String,
    pub location: String,
    pub start_date: chrono::DateTime<chrono::Utc>,
    pub end_date: Option<chrono::DateTime<chrono::Utc>>,
    pub description: String,
    pub is_current: bool,
}

#[derive(Debug, Serialize)]
pub struct Education {
    pub id: String,
    pub institution: String,
    pub degree: String,
    pub field_of_study: String,
    pub start_year: i32,
    pub end_year: Option<i32>,
    pub description: String,
}
