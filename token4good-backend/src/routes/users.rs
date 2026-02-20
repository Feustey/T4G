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
    middleware::auth_extractor::AuthUserExtractor,
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
        // Routes /me DOIVENT être avant /:id pour éviter les conflits
        .route("/me", get(get_current_user))
        .route("/me/notifications", get(get_user_notifications))
        .route("/me/wallet", get(get_current_user_wallet))
        .route("/me/services", get(get_current_user_services))
        .route("/me/transactions", get(get_current_user_transactions))
        .route("/me/profile", get(get_current_user_profile))
        .route("/me/cv", get(get_current_user_cv))
        .route("/me/about", get(get_current_user_about))
        .route("/me/metrics", get(get_current_user_metrics))
        .route("/me/pending", get(get_current_user_pending))
        // Routes /:id après /me
        .route("/:id", get(get_user).put(update_user).delete(delete_user))
        .route("/:id/profile", get(get_user_profile))
        .route("/:id/cv", get(get_user_cv))
        .route("/:id/wallet", get(get_user_wallet))
        .route("/:id/transactions", get(get_user_transactions))
        .route("/:id/services", get(get_user_services))
        .route("/:id/avatar", get(get_user_avatar))
        .route("/:id/disable-first-access", get(disable_first_access))
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

    // Récupérer le solde Lightning via l'API Dazno
    let (balance_msat, pending_balance_msat, num_channels) = {
        match state.dazno.get_wallet_balance("", &id).await {
            Ok(balance) => {
                let channels_count = match state.dazno.list_channels("", &id).await {
                    Ok(channels) => channels.len() as u32,
                    Err(e) => {
                        tracing::warn!("Failed to get channels for user {}: {}", id, e);
                        0
                    }
                };
                (balance.balance_msat, balance.pending_msat, channels_count)
            }
            Err(e) => {
                tracing::warn!("Failed to get Lightning balance for user {}: {}", id, e);
                (0, 0, 0)
            }
        }
    };

    let wallet_info = WalletInfo {
        balance_msat,
        pending_balance_msat,
        lightning_address: user.lightning_address,
        num_channels,
        num_pending_channels: 0, // Les canaux en attente sont inclus dans pending_balance_msat
    };

    Ok(Json(wallet_info))
}

pub async fn get_user_transactions(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<TransactionRecord>>, StatusCode> {
    let user = state
        .db
        .get_user_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let mut transactions = vec![];

    // Récupérer les transactions Lightning via l'API Dazno
    match state.dazno.get_wallet_payments("", &id, None).await {
        Ok(lightning_txs) => {
            for tx in lightning_txs {
                transactions.push(TransactionRecord {
                    id: tx.id,
                    transaction_type: tx.transaction_type,
                    amount_msat: tx.amount_msat,
                    timestamp: tx.created_at,
                    status: tx.status,
                    description: tx.description,
                });
            }
        }
        Err(e) => {
            tracing::warn!("Failed to get Lightning transactions for user {}: {}", id, e);
        }
    }

    // Récupérer les transactions RGB depuis la base de données
    match state.db.get_proofs(None, None, Some(id.clone()), 100, 0).await {
        Ok(proofs) => {
            for proof in proofs {
                transactions.push(TransactionRecord {
                    id: proof.id.clone(),
                    transaction_type: "rgb_proof".to_string(),
                    amount_msat: 0,
                    timestamp: proof.created_at,
                    status: proof.status.to_string(),
                    description: format!("RGB Contract: {}", proof.contract_id),
                });
            }
        }
        Err(e) => {
            tracing::warn!("Failed to get RGB proofs for user {}: {}", id, e);
        }
    }

    // Trier par date de création (plus récent en premier)
    transactions.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

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
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
) -> Result<Json<User>, StatusCode> {
    // Récupérer l'utilisateur complet depuis la base de données
    let user = state
        .db
        .get_user_by_id(&auth_user.id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(user))
}

pub async fn get_user_notifications(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
) -> Result<Json<Vec<Notification>>, StatusCode> {
    // Récupérer les notifications depuis la base de données
    match state.db.get_user_notifications(&auth_user.id).await {
        Ok(notifications) => Ok(Json(notifications)),
        Err(e) => {
            tracing::warn!("Failed to get notifications for user {}: {}", auth_user.id, e);
            // Retourner une liste vide en cas d'erreur plutôt que de faire échouer la requête
            Ok(Json(vec![]))
        }
    }
}

// Handlers pour les routes /me/*
pub async fn get_current_user_wallet(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
) -> Result<Json<WalletInfo>, StatusCode> {
    get_user_wallet(State(state), Path(auth_user.id)).await
}

pub async fn get_current_user_services(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
) -> Result<Json<Vec<UserService>>, StatusCode> {
    get_user_services(State(state), Path(auth_user.id)).await
}

pub async fn get_current_user_transactions(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
) -> Result<Json<Vec<TransactionRecord>>, StatusCode> {
    get_user_transactions(State(state), Path(auth_user.id)).await
}

pub async fn get_current_user_profile(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
) -> Result<Json<UserProfile>, StatusCode> {
    get_user_profile(State(state), Path(auth_user.id)).await
}

pub async fn get_current_user_cv(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
) -> Result<Json<UserCV>, StatusCode> {
    get_user_cv(State(state), Path(auth_user.id)).await
}

pub async fn get_current_user_about(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
) -> Result<Json<String>, StatusCode> {
    let user = state
        .db
        .get_user_by_id(&auth_user.id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    // Return bio as a string (empty string if None)
    let about = user.bio.unwrap_or_else(|| String::new());

    Ok(Json(about))
}

pub async fn get_current_user_metrics(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
) -> Result<Json<UserMetrics>, StatusCode> {
    // Récupérer les transactions pour calculer les métriques
    let transactions = match get_user_transactions(State(state.clone()), Path(auth_user.id.clone())).await {
        Ok(Json(txs)) => txs,
        Err(_) => vec![],
    };

    // Calculer les métriques à partir des transactions
    let mut total_earned_msat = 0u64;
    let mut total_spent_msat = 0u64;
    
    for tx in &transactions {
        if tx.transaction_type == "invoice" && tx.status == "settled" {
            total_earned_msat += tx.amount_msat;
        } else if tx.transaction_type == "payment" && tx.status == "settled" {
            total_spent_msat += tx.amount_msat;
        }
    }

    // Récupérer les services fournis et consommés
    let services_provided = match state.db.count_user_services_provided(&auth_user.id).await {
        Ok(count) => count,
        Err(e) => {
            tracing::warn!("Failed to count services provided: {}", e);
            0
        }
    };

    let services_consumed = match state.db.count_user_services_consumed(&auth_user.id).await {
        Ok(count) => count,
        Err(e) => {
            tracing::warn!("Failed to count services consumed: {}", e);
            0
        }
    };

    // Calculer le score de réputation basé sur l'activité
    let reputation_score = calculate_reputation_score(
        transactions.len() as u32,
        total_earned_msat,
        total_spent_msat,
        services_provided,
        services_consumed,
    );

    let metrics = UserMetrics {
        total_transactions: transactions.len() as u32,
        total_earned_msat,
        total_spent_msat,
        services_provided,
        services_consumed,
        reputation_score,
    };
    
    Ok(Json(metrics))
}

// Helper pour calculer le score de réputation
fn calculate_reputation_score(
    total_txs: u32,
    earned: u64,
    spent: u64,
    provided: u32,
    consumed: u32,
) -> f32 {
    let mut score = 0.0;
    
    // Score basé sur le nombre de transactions (max 25 points)
    score += (total_txs as f32 * 0.5).min(25.0);
    
    // Score basé sur le volume de transactions (max 25 points)
    let total_volume = (earned + spent) as f32 / 1_000_000.0; // Convertir en sats
    score += (total_volume * 0.01).min(25.0);
    
    // Score basé sur les services fournis (max 25 points)
    score += (provided as f32 * 2.0).min(25.0);
    
    // Score basé sur l'engagement (max 25 points)
    if provided > 0 && consumed > 0 {
        score += ((provided + consumed) as f32 * 1.0).min(25.0);
    }
    
    // Normaliser sur 5.0
    (score / 20.0).min(5.0)
}

pub async fn get_current_user_pending(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
) -> Result<Json<Vec<PendingTransaction>>, StatusCode> {
    let mut pending = vec![];

    // Récupérer les transactions Lightning en attente via Dazno
    match state.dazno.get_wallet_payments("", &auth_user.id, None).await {
        Ok(transactions) => {
            for tx in transactions {
                if tx.status == "pending" || tx.status == "processing" {
                    pending.push(PendingTransaction {
                        id: tx.id,
                        transaction_type: tx.transaction_type,
                        amount_msat: tx.amount_msat,
                        status: tx.status,
                        created_at: tx.created_at,
                        description: tx.description,
                    });
                }
            }
        }
        Err(e) => {
            tracing::warn!("Failed to get pending Lightning transactions: {}", e);
        }
    }

    // Récupérer les demandes de mentoring en attente
    match state.db.get_user_pending_mentoring(&auth_user.id).await {
        Ok(mentoring_requests) => {
            for request in mentoring_requests {
                pending.push(PendingTransaction {
                    id: request.id,
                    transaction_type: "mentoring_request".to_string(),
                    amount_msat: 0,
                    status: request.status.to_string(),
                    created_at: request.created_at,
                    description: request.title,
                });
            }
        }
        Err(e) => {
            tracing::warn!("Failed to get pending mentoring requests: {}", e);
        }
    }

    Ok(Json(pending))
}

pub async fn get_user_avatar(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<AvatarResponse>, StatusCode> {
    let user = state
        .db
        .get_user_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let avatar = AvatarResponse {
        avatar: user.avatar,
    };

    Ok(Json(avatar))
}

pub async fn disable_first_access(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<DashboardAccessResponse>, StatusCode> {
    let user = state
        .db
        .get_user_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    // Incrémenter le compteur d'accès au dashboard
    let access_count: u32 = match state.db.increment_dashboard_access(&id).await {
        Ok(count) => count,
        Err(e) => {
            tracing::warn!("Failed to increment dashboard access count for user {}: {}", id, e);
            user.preferences
                .get("dashboardAccessCount")
                .and_then(|v| v.as_u64())
                .unwrap_or(1) as u32 + 1
        }
    };

    let response = DashboardAccessResponse {
        dashboardAccessCount: access_count as i32,
    };

    Ok(Json(response))
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
pub struct UserAbout {
    pub id: String,
    pub bio: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_login: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Serialize)]
pub struct UserMetrics {
    pub total_transactions: u32,
    pub total_earned_msat: u64,
    pub total_spent_msat: u64,
    pub services_provided: u32,
    pub services_consumed: u32,
    pub reputation_score: f32,
}

#[derive(Debug, Serialize)]
pub struct PendingTransaction {
    pub id: String,
    pub transaction_type: String,
    pub amount_msat: u64,
    pub description: String,
    pub status: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct AvatarResponse {
    pub avatar: Option<String>,
}

#[derive(Debug, Serialize)]
#[allow(non_snake_case)]
pub struct DashboardAccessResponse {
    pub dashboardAccessCount: i32,
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
