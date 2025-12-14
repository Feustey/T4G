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
use sqlx::Row;

use crate::{
    middleware::auth::AuthUser,
    AppState,
};

pub fn token4good_routes() -> Router<AppState> {
    Router::new()
        // Public endpoints
        .route("/marketplace/stats", get(get_marketplace_stats))
        // User Management
        // TEMPORAIRE: Route commentée pour déploiement - problème Send bound à corriger
        // .route("/users", post(create_user))
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
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<T4GUser>, StatusCode> {
    // Vérifier si l'utilisateur existe déjà
    let existing_user_result = state.db.find_user_by_id(&payload.user_id).await;
    
    if let Ok(Some(existing_user)) = existing_user_result {
        // Utilisateur existe déjà, retourner ses infos T4G
        let balance_result = state.db.get_user_token_balance(&payload.user_id).await;
        let (total_earned, total_spent, available_balance) = balance_result
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        let user_level = if available_balance < 500 {
            "contributeur"
        } else if available_balance < 1500 {
            "mentor"
        } else {
            "expert"
        };

        let skills_vec: Vec<String> = existing_user.preferences
            .get("skills")
            .and_then(|v| v.as_array())
            .map(|arr| {
                let mut result = Vec::new();
                for item in arr {
                    if let Some(s) = item.as_str() {
                        result.push(s.to_string());
                    }
                }
                result
            })
            .unwrap_or_default();

        return Ok(Json(T4GUser {
            user_id: existing_user.id.to_string(),
            username: existing_user.username,
            email: existing_user.email,
            total_tokens_earned: total_earned,
            total_tokens_spent: total_spent,
            available_balance,
            user_level: user_level.to_string(),
            skills: skills_vec,
            reputation_score: (existing_user.score as f64 / 100.0),
            created_at: existing_user.created_at,
        }));
    }

    // Créer un nouvel utilisateur
    let user_id_uuid = match uuid::Uuid::parse_str(&payload.user_id) {
        Ok(uuid) => uuid,
        Err(_) => uuid::Uuid::new_v4(),
    };

    let now = chrono::Utc::now();
    let mut preferences = serde_json::Map::new();
    if !payload.skills.is_empty() {
        let skills_json: Vec<serde_json::Value> = payload.skills.iter()
            .map(|s| serde_json::Value::String(s.clone()))
            .collect();
        preferences.insert("skills".to_string(), serde_json::Value::Array(skills_json));
    }

    let new_user = crate::models::user::User {
        id: user_id_uuid,
        email: payload.email.clone(),
        firstname: payload.username.clone(),
        lastname: String::new(),
        lightning_address: format!("{}@t4g.dazno.de", payload.user_id),
        role: crate::models::user::UserRole::Alumni,
        username: payload.username.clone(),
        bio: None,
        score: 0,
        avatar: None,
        created_at: now,
        updated_at: now,
        is_active: true,
        wallet_address: None,
        preferences: serde_json::Value::Object(preferences),
        email_verified: false,
        last_login: None,
        is_onboarded: false,
    };

    state.db.create_user(&new_user)
        .await
        .map_err(|e| {
            tracing::error!("Error creating user: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(T4GUser {
        user_id: payload.user_id,
        username: payload.username,
        email: payload.email,
        total_tokens_earned: 0,
        total_tokens_spent: 0,
        available_balance: 0,
        user_level: "contributeur".to_string(),
        skills: payload.skills,
        reputation_score: 0.0,
        created_at: now,
    }))
}

pub async fn get_user(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(user_id): Path<String>,
) -> Result<Json<T4GUser>, StatusCode> {
    let user = state.db.find_user_by_id(&user_id)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching user: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?
        .ok_or(StatusCode::NOT_FOUND)?;

    // Obtenir le solde de tokens
    let (total_earned, total_spent, available_balance) = state.db.get_user_token_balance(&user_id)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching token balance: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    // Calculer le niveau
    let user_level = if available_balance < 500 {
        "contributeur"
    } else if available_balance < 1500 {
        "mentor"
    } else {
        "expert"
    };

    // Extraire les compétences depuis preferences (si disponible)
    let skills = user.preferences
        .get("skills")
        .and_then(|v| v.as_array())
        .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
        .unwrap_or_default();

    let t4g_user = T4GUser {
        user_id: user.id.to_string(),
        username: user.username,
        email: user.email,
        total_tokens_earned: total_earned,
        total_tokens_spent: total_spent,
        available_balance,
        user_level: user_level.to_string(),
        skills,
        reputation_score: (user.score as f64 / 100.0),
        created_at: user.created_at,
    };

    Ok(Json(t4g_user))
}

pub async fn get_user_statistics(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(user_id): Path<String>,
) -> Result<Json<UserStatistics>, StatusCode> {
    let stats = state.db.get_user_statistics(&user_id)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching user statistics: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(stats))
}

pub async fn get_user_opportunities(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(user_id): Path<String>,
) -> Result<Json<Vec<Opportunity>>, StatusCode> {
    let opportunities = state.db.get_user_opportunities(&user_id)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching opportunities: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(opportunities))
}

pub async fn get_leaderboard(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Query(params): Query<LeaderboardQuery>,
) -> Result<Json<Vec<LeaderboardEntry>>, StatusCode> {
    let limit = params.limit.unwrap_or(10);
    let entries = state.db.get_leaderboard(limit)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching leaderboard: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(entries))
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
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<AwardTokensRequest>,
) -> Result<Json<TokenAwardResponse>, StatusCode> {
    // Calculer les tokens avec impact score
    let impact = payload.impact_score.unwrap_or(1.0);
    let tokens_earned = (payload.tokens as f64 * impact) as i64;

    // Créer la transaction
    let transaction_id = state.db.create_token_transaction(
        &payload.user_id,
        &payload.action_type,
        tokens_earned,
        &payload.description,
        payload.metadata,
        Some(impact),
    )
    .await
    .map_err(|e| {
        tracing::error!("Error awarding tokens: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(TokenAwardResponse {
        id: transaction_id,
        user_id: payload.user_id,
        action_type: payload.action_type,
        tokens_earned,
        description: payload.description,
        timestamp: chrono::Utc::now(),
        impact_score: Some(impact),
    }))
}

pub async fn get_token_balance(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(user_id): Path<String>,
) -> Result<Json<T4GBalanceResponse>, StatusCode> {
    let (total_earned, total_spent, available_balance) = state.db.get_user_token_balance(&user_id)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching token balance: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let user_level = if available_balance < 500 {
        "contributeur"
    } else if available_balance < 1500 {
        "mentor"
    } else {
        "expert"
    };

    Ok(Json(T4GBalanceResponse {
        user_id,
        total_earned,
        total_spent,
        available_balance,
        user_level: user_level.to_string(),
    }))
}

pub async fn get_token_transactions(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(user_id): Path<String>,
    Query(params): Query<TransactionsQuery>,
) -> Result<Json<Vec<Transaction>>, StatusCode> {
    let transactions = state.db.get_user_token_transactions(&user_id, params.limit)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching transactions: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(transactions))
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
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateMentoringSessionRequest>,
) -> Result<Json<MentoringSession>, StatusCode> {
    let session_id = state.db.create_t4g_session(
        &payload.mentor_id,
        &payload.mentee_id,
        &payload.topic,
        &payload.category,
        payload.duration_minutes,
    )
    .await
    .map_err(|e| {
        tracing::error!("Error creating session: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(MentoringSession {
        id: session_id,
        mentor_id: payload.mentor_id,
        mentee_id: payload.mentee_id,
        topic: payload.topic,
        category: payload.category,
        duration_minutes: payload.duration_minutes,
        status: "scheduled".to_string(),
        created_at: chrono::Utc::now(),
    }))
}

pub async fn complete_mentoring_session(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<CompleteMentoringSessionRequest>,
) -> Result<Json<MentoringSession>, StatusCode> {
    // Compléter la session et attribuer les tokens
    state.db.complete_t4g_session(
        &payload.session_id,
        payload.feedback.rating,
        &payload.feedback.comments,
        payload.feedback.learned_skills,
    )
    .await
    .map_err(|e| {
        tracing::error!("Error completing session: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Récupérer la session complétée
    let session_row = sqlx::query(
        r#"
        SELECT id, mentor_id, mentee_id, topic, category, duration_minutes, status, created_at
        FROM t4g_mentoring_sessions
        WHERE id = $1
        "#
    )
    .bind(&payload.session_id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|e| {
        tracing::error!("Error fetching completed session: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?
    .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(MentoringSession {
        id: session_row.try_get("id").map_err(|e| {
            tracing::error!("Error getting session id: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?,
        mentor_id: session_row.try_get("mentor_id").map_err(|e| {
            tracing::error!("Error getting mentor_id: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?,
        mentee_id: session_row.try_get("mentee_id").map_err(|e| {
            tracing::error!("Error getting mentee_id: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?,
        topic: session_row.try_get("topic").map_err(|e| {
            tracing::error!("Error getting topic: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?,
        category: session_row.try_get("category").map_err(|e| {
            tracing::error!("Error getting category: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?,
        duration_minutes: session_row.try_get("duration_minutes").map_err(|e| {
            tracing::error!("Error getting duration_minutes: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?,
        status: session_row.try_get("status").map_err(|e| {
            tracing::error!("Error getting status: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?,
        created_at: session_row.try_get("created_at").map_err(|e| {
            tracing::error!("Error getting created_at: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?,
    }))
}

pub async fn get_user_sessions(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(user_id): Path<String>,
    Query(params): Query<SessionsQuery>,
) -> Result<Json<Vec<MentoringSession>>, StatusCode> {
    let sessions = state.db.get_user_t4g_sessions(&user_id, params.as_mentor)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching sessions: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(sessions))
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
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateServiceRequest>,
) -> Result<Json<Service>, StatusCode> {
    let service_id = state.db.create_t4g_service(
        &payload.provider_id,
        &payload.name,
        &payload.description,
        &payload.category,
        payload.token_cost,
        &payload.estimated_duration,
        &payload.requirements,
        &payload.tags,
    )
    .await
    .map_err(|e| {
        tracing::error!("Error creating service: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let service = state.db.get_t4g_service_by_id(&service_id)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching created service: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(service))
}

pub async fn search_services(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<SearchServicesRequest>,
) -> Result<Json<Vec<Service>>, StatusCode> {
    let services = state.db.search_t4g_services(
        payload.category.as_deref(),
        payload.max_cost,
        payload.tags.as_deref(),
        payload.provider_level.as_deref(),
        50, // limit par défaut
    )
    .await
    .map_err(|e| {
        tracing::error!("Error searching services: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(services))
}

pub async fn book_service(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<BookServiceRequest>,
) -> Result<Json<Booking>, StatusCode> {
    // Parser la date
    let scheduled_at = chrono::DateTime::parse_from_rfc3339(&payload.scheduled_at)
        .map_err(|_| StatusCode::BAD_REQUEST)?
        .with_timezone(&chrono::Utc);

    let booking_id = state.db.create_t4g_booking(
        &payload.client_id,
        &payload.service_id,
        scheduled_at,
        payload.notes.as_deref(),
    )
    .await
    .map_err(|e| {
        tracing::error!("Error creating booking: {}", e);
        if e.to_string().contains("Insufficient") {
            StatusCode::PAYMENT_REQUIRED
        } else {
            StatusCode::INTERNAL_SERVER_ERROR
        }
    })?;

    // Récupérer la réservation créée
    let booking_row = sqlx::query(
        "SELECT id, client_id, service_id, status, created_at FROM t4g_bookings WHERE id = $1"
    )
    .bind(&booking_id)
    .fetch_one(state.db.pool())
    .await
    .map_err(|e| {
        tracing::error!("Error fetching booking: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(Booking {
        id: booking_row.try_get("id").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
        client_id: booking_row.try_get("client_id").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
        service_id: booking_row.try_get("service_id").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
        status: booking_row.try_get("status").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
        created_at: booking_row.try_get("created_at").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
    }))
}

pub async fn complete_booking(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Json(payload): Json<CompleteBookingRequest>,
) -> Result<Json<Booking>, StatusCode> {
    state.db.complete_t4g_booking(
        &payload.booking_id,
        payload.feedback.rating,
        &payload.feedback.comments,
        payload.feedback.would_recommend,
    )
    .await
    .map_err(|e| {
        tracing::error!("Error completing booking: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Récupérer la réservation complétée
    let booking_row = sqlx::query(
        "SELECT id, client_id, service_id, status, created_at FROM t4g_bookings WHERE id = $1"
    )
    .bind(&payload.booking_id)
    .fetch_one(state.db.pool())
    .await
    .map_err(|e| {
        tracing::error!("Error fetching completed booking: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(Booking {
        id: booking_row.try_get("id").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
        client_id: booking_row.try_get("client_id").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
        service_id: booking_row.try_get("service_id").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
        status: booking_row.try_get("status").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
        created_at: booking_row.try_get("created_at").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
    }))
}

pub async fn get_recommendations(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
    Path(user_id): Path<String>,
    Query(params): Query<RecommendationsQuery>,
) -> Result<Json<Vec<Service>>, StatusCode> {
    let limit = params.limit.unwrap_or(5);
    let services = state.db.get_service_recommendations(&user_id, limit)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching recommendations: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(services))
}

// ============= ADMIN =============

pub async fn process_weekly_bonuses(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
) -> Result<Json<WeeklyBonusesResponse>, StatusCode> {
    // Calculer les bonus hebdomadaires pour les utilisateurs actifs
    // Bonus: 10 tokens pour chaque session complétée cette semaine
    
    let week_ago = chrono::Utc::now() - chrono::Duration::days(7);
    
    // Obtenir les utilisateurs actifs avec sessions complétées
    let active_users = sqlx::query_scalar::<_, Option<String>>(
        r#"
        SELECT DISTINCT mentor_id
        FROM t4g_mentoring_sessions
        WHERE status = 'completed' AND completed_at >= $1
        UNION
        SELECT DISTINCT mentee_id
        FROM t4g_mentoring_sessions
        WHERE status = 'completed' AND completed_at >= $1
        "#
    )
    .bind(week_ago)
    .fetch_all(state.db.pool())
    .await
    .map_err(|e| {
        tracing::error!("Error fetching active users: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let mut bonuses_awarded = Vec::new();
    let mut total_tokens_awarded = 0;

    for user_id_opt in active_users {
        if let Some(user_id) = user_id_opt {
            // Compter les sessions complétées cette semaine
            let sessions_count: Option<i64> = sqlx::query_scalar::<_, Option<i64>>(
                r#"
                SELECT COUNT(*)
                FROM t4g_mentoring_sessions
                WHERE (mentor_id = $1 OR mentee_id = $1)
                AND status = 'completed'
                AND completed_at >= $2
                "#
            )
            .bind(&user_id)
            .bind(week_ago)
            .fetch_one(state.db.pool())
            .await
            .ok()
            .flatten();
            
            let sessions_count = sessions_count.unwrap_or(0);

            if sessions_count > 0 {
                let bonus_tokens = sessions_count * 10; // 10 tokens par session
                
                state.db.create_token_transaction(
                    &user_id,
                    "weekly_bonus",
                    bonus_tokens,
                    &format!("Bonus hebdomadaire: {} sessions complétées", sessions_count),
                    Some(serde_json::json!({
                        "sessions_count": sessions_count,
                        "week": week_ago.to_rfc3339()
                    })),
                    Some(1.0),
                )
                .await
                .ok();

                bonuses_awarded.push(user_id);
                total_tokens_awarded += bonus_tokens;
            }
        }
    }

    Ok(Json(WeeklyBonusesResponse {
        bonuses_awarded,
        total_tokens_awarded,
        processed_at: chrono::Utc::now(),
    }))
}

pub async fn get_system_status(
    State(state): State<AppState>,
    Extension(_auth_user): Extension<AuthUser>,
) -> Result<Json<SystemStatus>, StatusCode> {
    let (total_users, total_transactions, active_services, level_distribution) = 
        state.db.get_system_statistics()
            .await
            .map_err(|e| {
                tracing::error!("Error fetching system statistics: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

    // Calculer l'économie des tokens
    let row = sqlx::query(
        r#"
        SELECT 
            COALESCE(SUM(CASE WHEN tokens > 0 THEN tokens ELSE 0 END), 0) as total_earned,
            COALESCE(ABS(SUM(CASE WHEN tokens < 0 THEN tokens ELSE 0 END)), 0) as total_spent
        FROM t4g_token_transactions
        "#
    )
    .fetch_one(state.db.pool())
    .await
    .map_err(|e| {
        tracing::error!("Error fetching token economy: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let total_earned: Option<i64> = row.try_get("total_earned").ok();
    let total_spent: Option<i64> = row.try_get("total_spent").ok();

    Ok(Json(SystemStatus {
        health: "healthy".to_string(),
        total_users,
        total_transactions,
        active_services,
        level_distribution,
        token_economy: TokenEconomy {
            in_circulation: total_earned.unwrap_or(0) - total_spent.unwrap_or(0),
            total_earned: total_earned.unwrap_or(0),
            total_spent: total_spent.unwrap_or(0),
        },
    }))
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
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<CreateLightningInvoiceRequest>,
) -> Result<Json<LightningInvoiceResponse>, StatusCode> {
    // Convertir amount en msat
    let amount_msat = (payload.amount * 1000) as u64;
    
    // Créer l'invoice via Dazno API
    // Note: On aurait besoin d'un token Dazno ici, mais pour T4G on utilise l'utilisateur authentifié
    // On pourrait obtenir un token via l'API Dazno ou utiliser un token système
    // Pour l'instant, on retourne une réponse basique - à compléter avec vraie intégration
    
    // TODO: Intégrer avec Dazno API pour créer une vraie invoice
    // let dazno_token = get_dazno_token_for_user(&auth_user.id).await?;
    // let invoice = state.dazno.create_lightning_invoice(
    //     &dazno_token,
    //     amount_msat,
    //     &payload.memo,
    //     &auth_user.id,
    // ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let invoice = LightningInvoiceResponse {
        status: "success".to_string(),
        payment_request: format!("lnbc{}u1p...", payload.amount / 1000), // Format simplifié
        payment_hash: uuid::Uuid::new_v4().to_string(),
        checking_id: uuid::Uuid::new_v4().to_string(),
        amount: payload.amount,
        expiry: payload.expiry,
    };
    Ok(Json(invoice))
}

pub async fn get_lightning_balance(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<LightningBalanceResponse>, StatusCode> {
    // TODO: Intégrer avec Dazno API pour obtenir le vrai solde
    // let dazno_token = get_dazno_token_for_user(&auth_user.id).await?;
    // let balance = state.dazno.get_lightning_balance(
    //     &dazno_token,
    //     &auth_user.id,
    // ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Pour l'instant, retourner un solde par défaut
    let balance = LightningBalanceResponse {
        status: "success".to_string(),
        balance_sats: 0,
        balance_msats: 0,
        wallet_id: format!("wallet_t4g_{}", auth_user.id),
    };
    Ok(Json(balance))
}

pub async fn pay_lightning_invoice(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<PayLightningInvoiceRequest>,
) -> Result<Json<PaymentResponse>, StatusCode> {
    // TODO: Intégrer avec Dazno API pour payer une invoice
    // let dazno_token = get_dazno_token_for_user(&auth_user.id).await?;
    // let payment = state.dazno.pay_lightning_invoice(
    //     &dazno_token,
    //     &payload.bolt11,
    //     &auth_user.id,
    // ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Pour l'instant, retourner une réponse basique
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn check_lightning_payment(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(payment_hash): Path<String>,
) -> Result<Json<PaymentCheckResponse>, StatusCode> {
    // TODO: Intégrer avec Dazno API pour vérifier le statut du paiement
    // let dazno_token = get_dazno_token_for_user(&auth_user.id).await?;
    // let payment_status = state.dazno.check_payment_status(
    //     &dazno_token,
    //     &payment_hash,
    // ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Pour l'instant, retourner un statut par défaut
    let response = PaymentCheckResponse {
        status: "success".to_string(),
        payment_hash,
        paid: false,
        details: None,
    };
    Ok(Json(response))
}

pub async fn get_lightning_node_info(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<NodeInfo>, StatusCode> {
    // TODO: Intégrer avec Dazno API pour obtenir les infos du nœud
    // let dazno_token = get_dazno_token_for_user(&auth_user.id).await?;
    // let node_info = state.dazno.get_node_info(
    //     &dazno_token,
    //     &auth_user.id,
    // ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Pour l'instant, retourner une réponse basique
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn get_lightning_channels(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<LightningChannel>>, StatusCode> {
    // TODO: Intégrer avec Dazno API pour obtenir les canaux
    // let dazno_token = get_dazno_token_for_user(&auth_user.id).await?;
    // let channels = state.dazno.list_channels(
    //     &dazno_token,
    //     &auth_user.id,
    // ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Pour l'instant, retourner une liste vide
    Ok(Json(vec![]))
}

pub async fn get_lightning_status(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<LightningStatus>, StatusCode> {
    // TODO: Intégrer avec Dazno API pour obtenir le statut Lightning
    // let dazno_token = get_dazno_token_for_user(&auth_user.id).await?;
    // let status = state.dazno.get_lightning_status(
    //     &dazno_token,
    // ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Pour l'instant, retourner un statut par défaut
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
    pub preimage: Option<String>,
    pub amount_msat: u64,
    pub fee_msat: u64,
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
    pub alias: Option<String>,
    pub num_channels: u32,
    pub total_capacity_msat: u64,
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

