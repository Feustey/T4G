use axum::{extract::State, http::StatusCode, response::Json, routing::post, Router};
use serde::{Deserialize, Serialize};

use crate::{
    middleware::JWTService,
    models::user::{User, UserRole},
    services::dazno::{DaznoError, DaznoUser},
    AppState,
};

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub provider: String,      // "t4g", "linkedin", "dazeno"
    pub token: Option<String>, // Pour dazeno
    pub provider_user_data: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct DazenoVerifyRequest {
    pub token: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserSummary,
    pub expires_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct UserSummary {
    pub id: String,
    pub email: String,
    pub firstname: String,
    pub lastname: String,
    pub role: UserRole,
    pub lightning_address: String,
}

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/login", post(login))
        .route("/dazeno/verify", post(verify_dazeno_session))
        .route("/refresh", post(refresh_token))
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    match payload.provider.as_str() {
        "dazeno" => handle_dazeno_login(state, payload).await,
        "t4g" => handle_t4g_login(state, payload).await,
        "linkedin" => handle_linkedin_login(state, payload).await,
        _ => Err(StatusCode::BAD_REQUEST),
    }
}

async fn handle_dazeno_login(
    state: AppState,
    payload: LoginRequest,
) -> Result<Json<AuthResponse>, StatusCode> {
    let token = payload.token.ok_or(StatusCode::BAD_REQUEST)?;

    // Vérifier le token avec dazeno.de
    let dazno_user = state
        .dazno
        .verify_user_session(&token)
        .await
        .map_err(dazno_error_to_status)?;

    // Créer ou récupérer l'utilisateur en base
    let user = get_or_create_user_from_dazno(&state, dazno_user).await?;

    // Générer un JWT
    let jwt_service = JWTService::new().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let jwt_token = jwt_service
        .create_token(&user.id.to_string(), &user.email, &user.role.to_string())
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = AuthResponse {
        token: jwt_token,
        user: UserSummary {
            id: user.id.to_string(),
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            lightning_address: user.lightning_address,
        },
        expires_at: chrono::Utc::now() + chrono::Duration::hours(24),
    };

    Ok(Json(response))
}

async fn handle_t4g_login(
    state: AppState,
    payload: LoginRequest,
) -> Result<Json<AuthResponse>, StatusCode> {
    // Récupérer les données utilisateur du provider OAuth
    let provider_data = payload.provider_user_data.ok_or(StatusCode::BAD_REQUEST)?;

    // Extraire les informations nécessaires
    let email = provider_data
        .get("email")
        .and_then(|v| v.as_str())
        .ok_or(StatusCode::BAD_REQUEST)?
        .to_string();

    let name = provider_data
        .get("name")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let t4g_id = provider_data
        .get("id")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    // Créer ou récupérer l'utilisateur
    let user = get_or_create_user_from_oauth(
        &state,
        email,
        name,
        UserRole::Mentee, // t4g = étudiants/mentees
        format!("t4g_{}", t4g_id),
    )
    .await?;

    // Générer JWT
    let jwt_service = JWTService::new().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let jwt_token = jwt_service
        .create_token(&user.id.to_string(), &user.email, &user.role.to_string())
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = AuthResponse {
        token: jwt_token,
        user: UserSummary {
            id: user.id.to_string(),
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            lightning_address: user.lightning_address,
        },
        expires_at: chrono::Utc::now() + chrono::Duration::hours(24),
    };

    Ok(Json(response))
}

async fn handle_linkedin_login(
    state: AppState,
    payload: LoginRequest,
) -> Result<Json<AuthResponse>, StatusCode> {
    // Récupérer les données utilisateur du provider OAuth
    let provider_data = payload.provider_user_data.ok_or(StatusCode::BAD_REQUEST)?;

    // Extraire les informations nécessaires
    let email = provider_data
        .get("email")
        .and_then(|v| v.as_str())
        .ok_or(StatusCode::BAD_REQUEST)?
        .to_string();

    let given_name = provider_data
        .get("given_name")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let family_name = provider_data
        .get("family_name")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let name = format!("{} {}", given_name, family_name).trim().to_string();

    let linkedin_id = provider_data
        .get("sub")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    // Créer ou récupérer l'utilisateur
    let user = get_or_create_user_from_oauth(
        &state,
        email,
        name,
        UserRole::Alumni, // LinkedIn = alumni/professionnels
        format!("linkedin_{}", linkedin_id),
    )
    .await?;

    // Générer JWT
    let jwt_service = JWTService::new().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let jwt_token = jwt_service
        .create_token(&user.id.to_string(), &user.email, &user.role.to_string())
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = AuthResponse {
        token: jwt_token,
        user: UserSummary {
            id: user.id.to_string(),
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            lightning_address: user.lightning_address,
        },
        expires_at: chrono::Utc::now() + chrono::Duration::hours(24),
    };

    Ok(Json(response))
}

pub async fn verify_dazeno_session(
    State(state): State<AppState>,
    Json(payload): Json<DazenoVerifyRequest>,
) -> Result<Json<DaznoUser>, StatusCode> {
    let dazno_user = state
        .dazno
        .verify_user_session(&payload.token)
        .await
        .map_err(dazno_error_to_status)?;
    Ok(Json(dazno_user))
}

pub async fn refresh_token(// TODO: Implémenter le refresh de token
) -> Result<Json<AuthResponse>, StatusCode> {
    Err(StatusCode::NOT_IMPLEMENTED)
}

async fn get_or_create_user_from_dazno(
    state: &AppState,
    dazno_user: DaznoUser,
) -> Result<User, StatusCode> {
    // Essayer de récupérer l'utilisateur existant
    if let Ok(Some(existing_user)) = state.db.get_user_by_email(&dazno_user.email).await {
        return Ok(existing_user);
    }

    // Créer un nouvel utilisateur
    let user_id = uuid::Uuid::new_v4();
    let new_user = User {
        id: user_id,
        email: dazno_user.email,
        firstname: dazno_user.name.split(' ').next().unwrap_or("").to_string(),
        lastname: dazno_user.name.split(' ').nth(1).unwrap_or("").to_string(),
        lightning_address: format!("{}@lightning.token4good.com", user_id),
        role: UserRole::Alumni, // Par défaut pour les utilisateurs Dazno
        username: format!("dazno_{}", &user_id.to_string()[..8]),
        bio: None,
        score: 0,
        avatar: None,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
        is_active: true,
        wallet_address: None,
        preferences: serde_json::Value::Object(serde_json::Map::new()),
        email_verified: true, // Utilisateurs Dazno sont pré-vérifiés
        last_login: Some(chrono::Utc::now()),
        is_onboarded: false,
    };

    state
        .db
        .create_user(&new_user)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(new_user)
}

async fn get_or_create_user_from_oauth(
    state: &AppState,
    email: String,
    full_name: String,
    role: UserRole,
    username_prefix: String,
) -> Result<User, StatusCode> {
    // Essayer de récupérer l'utilisateur existant
    if let Ok(Some(existing_user)) = state.db.get_user_by_email(&email).await {
        return Ok(existing_user);
    }

    // Extraire prénom et nom du nom complet
    let name_parts: Vec<&str> = full_name.split_whitespace().collect();
    let firstname = name_parts.first().unwrap_or(&"").to_string();
    let lastname = name_parts
        .get(1..)
        .map(|parts| parts.join(" "))
        .unwrap_or_default();

    // Créer un nouvel utilisateur
    let user_id = uuid::Uuid::new_v4();
    let new_user = User {
        id: user_id,
        email: email.clone(),
        firstname,
        lastname,
        lightning_address: format!("{}@lightning.token4good.com", user_id),
        role,
        username: format!("{}_{}", username_prefix, &user_id.to_string()[..8]),
        bio: None,
        score: 0,
        avatar: None,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
        is_active: true,
        wallet_address: None,
        preferences: serde_json::Value::Object(serde_json::Map::new()),
        email_verified: true, // Les utilisateurs OAuth sont pré-vérifiés
        last_login: Some(chrono::Utc::now()),
        is_onboarded: false,
    };

    state
        .db
        .create_user(&new_user)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    tracing::info!(
        "Created new user from OAuth: {} ({})",
        new_user.email,
        new_user.username
    );

    Ok(new_user)
}

fn dazno_error_to_status(error: DaznoError) -> StatusCode {
    match error {
        DaznoError::InvalidToken => StatusCode::UNAUTHORIZED,
        DaznoError::LightningApiError(_) | DaznoError::UsersApiError(_) => StatusCode::BAD_GATEWAY,
        DaznoError::ConnectionError(_) => StatusCode::BAD_GATEWAY,
    }
}
