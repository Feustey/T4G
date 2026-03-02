use axum::{extract::State, http::StatusCode, response::Json, routing::post, Router};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use std::env;

use crate::{
    middleware::JWTService,
    models::user::{User, UserRole},
    services::dazno::{DaznoError, DaznoUser},
    AppState,
};

type HmacSha256 = Hmac<Sha256>;

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

// ── Nouveaux types pour les endpoints d'échange OAuth et magic link ──────────

#[derive(Debug, Deserialize)]
pub struct ExchangeOAuthRequest {
    pub code: String,
    pub redirect_uri: String,
}

#[derive(Debug, Deserialize)]
pub struct MagicLinkSendRequest {
    pub email: String,
    pub locale: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct MagicLinkSendResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dev_link: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct MagicLinkVerifyRequest {
    pub token: String,
}

// ── Routes ───────────────────────────────────────────────────────────────────

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/login", post(login))
        .route("/dazeno/verify", post(verify_dazeno_session))
        .route("/refresh", post(refresh_token))
        // Nouveaux endpoints : échange OAuth en 1 étape
        .route("/exchange/github", post(exchange_github))
        .route("/exchange/linkedin", post(exchange_linkedin))
        .route("/exchange/t4g", post(exchange_t4g))
        // Nouveaux endpoints : magic link
        .route("/magic-link/send", post(magic_link_send))
        .route("/magic-link/verify", post(magic_link_verify))
}

// ── Handlers existants (inchangés) ───────────────────────────────────────────

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    match payload.provider.as_str() {
        "dazeno" => handle_dazeno_login(state, payload).await,
        "t4g" => handle_t4g_login(state, payload).await,
        "linkedin" => handle_linkedin_login(state, payload).await,
        "magic_link" | "github" | "lnurl" => handle_oauth_login(state, payload).await,
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

async fn handle_oauth_login(
    state: AppState,
    payload: LoginRequest,
) -> Result<Json<AuthResponse>, StatusCode> {
    let provider_data = payload.provider_user_data.ok_or(StatusCode::BAD_REQUEST)?;

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

    let name = if given_name.is_empty() {
        provider_data
            .get("name")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string()
    } else {
        format!("{} {}", given_name, family_name).trim().to_string()
    };

    let sub = provider_data
        .get("sub")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let provider_prefix = &payload.provider;

    let user = get_or_create_user_from_oauth(
        &state,
        email,
        name,
        UserRole::Mentee,
        format!("{}_{}", provider_prefix, sub),
    )
    .await?;

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

#[derive(Debug, Deserialize)]
pub struct RefreshTokenRequest {
    pub token: String,
}

pub async fn refresh_token(
    State(state): State<AppState>,
    Json(payload): Json<RefreshTokenRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    // Vérifier le token actuel
    let jwt_service = JWTService::new().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let claims = jwt_service
        .verify_token(&payload.token)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Vérifier que le token n'est pas trop vieux (max 7 jours pour refresh)
    let now = chrono::Utc::now().timestamp() as usize;
    if now.saturating_sub(claims.iat) > 7 * 24 * 60 * 60 {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // Récupérer l'utilisateur depuis la DB
    let user = state
        .db
        .find_user_by_id(&claims.sub)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Créer un nouveau token
    let new_token = jwt_service
        .create_token(&user.id.to_string(), &user.email, &user.role.to_string())
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response = AuthResponse {
        token: new_token,
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

// ── Nouveaux handlers : échange OAuth en 1 étape ─────────────────────────────

async fn exchange_github(
    State(state): State<AppState>,
    Json(payload): Json<ExchangeOAuthRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    let client_id = env::var("GITHUB_CLIENT_ID").map_err(|_| {
        tracing::error!("GITHUB_CLIENT_ID non configuré");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    let client_secret = env::var("GITHUB_CLIENT_SECRET").map_err(|_| {
        tracing::error!("GITHUB_CLIENT_SECRET non configuré");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let client = reqwest::Client::new();

    // Étape 1 : Échanger le code contre un access token
    let token_resp = client
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .json(&serde_json::json!({
            "client_id": client_id,
            "client_secret": client_secret,
            "code": payload.code,
            "redirect_uri": payload.redirect_uri,
        }))
        .send()
        .await
        .map_err(|e| {
            tracing::error!("GitHub token exchange réseau: {}", e);
            StatusCode::BAD_GATEWAY
        })?;

    let token_data: serde_json::Value = token_resp.json().await.map_err(|_| StatusCode::BAD_GATEWAY)?;

    if let Some(err_code) = token_data["error"].as_str() {
        let description = token_data["error_description"]
            .as_str()
            .unwrap_or(err_code);
        tracing::error!("GitHub token error: {} – {}", err_code, description);
        // Retourner le détail de l'erreur GitHub au client pour faciliter le diagnostic
        return Err(StatusCode::UNAUTHORIZED);
    }

    let access_token = token_data["access_token"]
        .as_str()
        .ok_or_else(|| {
            tracing::error!("GitHub token exchange: access_token absent dans la réponse: {:?}", token_data);
            StatusCode::UNAUTHORIZED
        })?;

    // Étape 2 : Récupérer le profil GitHub
    let user_resp = client
        .get("https://api.github.com/user")
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Accept", "application/vnd.github.v3+json")
        .header("User-Agent", "token4good-backend")
        .send()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    if !user_resp.status().is_success() {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let github_user: serde_json::Value = user_resp.json().await.map_err(|_| StatusCode::BAD_GATEWAY)?;

    // Étape 3 : Récupérer l'email (peut être privé)
    let mut email = github_user["email"].as_str().unwrap_or("").to_string();
    if email.is_empty() {
        let emails_resp = client
            .get("https://api.github.com/user/emails")
            .header("Authorization", format!("Bearer {}", access_token))
            .header("Accept", "application/vnd.github.v3+json")
            .header("User-Agent", "token4good-backend")
            .send()
            .await
            .map_err(|_| StatusCode::BAD_GATEWAY)?;

        if emails_resp.status().is_success() {
            let emails: Vec<serde_json::Value> =
                emails_resp.json().await.unwrap_or_default();
            for e in &emails {
                if e["primary"].as_bool().unwrap_or(false)
                    && e["verified"].as_bool().unwrap_or(false)
                {
                    email = e["email"].as_str().unwrap_or("").to_string();
                    break;
                }
            }
            if email.is_empty() {
                if let Some(first) = emails.first() {
                    email = first["email"].as_str().unwrap_or("").to_string();
                }
            }
        }
    }

    if email.is_empty() {
        tracing::error!("GitHub: aucun email disponible");
        return Err(StatusCode::BAD_REQUEST);
    }

    let name = github_user["name"]
        .as_str()
        .or_else(|| github_user["login"].as_str())
        .unwrap_or("")
        .to_string();
    let github_id = github_user["id"].to_string();

    let user = get_or_create_user_from_oauth(
        &state,
        email,
        name,
        UserRole::Mentee,
        format!("github_{}", github_id),
    )
    .await?;

    generate_auth_response(user)
}

async fn exchange_linkedin(
    State(state): State<AppState>,
    Json(payload): Json<ExchangeOAuthRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    let client_id = env::var("LINKEDIN_CLIENT_ID").map_err(|_| {
        tracing::error!("LINKEDIN_CLIENT_ID non configuré");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    let client_secret = env::var("LINKEDIN_CLIENT_SECRET").map_err(|_| {
        tracing::error!("LINKEDIN_CLIENT_SECRET non configuré");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let client = reqwest::Client::new();

    // Étape 1 : Échanger le code contre un access token
    let token_resp = client
        .post("https://www.linkedin.com/oauth/v2/accessToken")
        .form(&[
            ("grant_type", "authorization_code"),
            ("code", payload.code.as_str()),
            ("client_id", client_id.as_str()),
            ("client_secret", client_secret.as_str()),
            ("redirect_uri", payload.redirect_uri.as_str()),
        ])
        .send()
        .await
        .map_err(|e| {
            tracing::error!("LinkedIn token exchange réseau: {}", e);
            StatusCode::BAD_GATEWAY
        })?;

    if !token_resp.status().is_success() {
        tracing::error!("LinkedIn token exchange failed: {}", token_resp.status());
        return Err(StatusCode::UNAUTHORIZED);
    }

    let token_data: serde_json::Value =
        token_resp.json().await.map_err(|_| StatusCode::BAD_GATEWAY)?;
    let access_token = token_data["access_token"]
        .as_str()
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Étape 2 : Récupérer le profil via OpenID Connect
    let userinfo_resp = client
        .get("https://api.linkedin.com/v2/userinfo")
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    if !userinfo_resp.status().is_success() {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let user_info: serde_json::Value =
        userinfo_resp.json().await.map_err(|_| StatusCode::BAD_GATEWAY)?;

    let email = user_info["email"]
        .as_str()
        .ok_or(StatusCode::BAD_REQUEST)?
        .to_string();
    let given_name = user_info["given_name"].as_str().unwrap_or("").to_string();
    let family_name = user_info["family_name"].as_str().unwrap_or("").to_string();
    let name = format!("{} {}", given_name, family_name).trim().to_string();
    let sub = user_info["sub"].as_str().unwrap_or("").to_string();

    let user = get_or_create_user_from_oauth(
        &state,
        email,
        name,
        UserRole::Alumni,
        format!("linkedin_{}", sub),
    )
    .await?;

    generate_auth_response(user)
}

async fn exchange_t4g(
    State(state): State<AppState>,
    Json(payload): Json<ExchangeOAuthRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    let client_id = env::var("CLIENT_ID").map_err(|_| {
        tracing::error!("CLIENT_ID non configuré");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    let client_secret = env::var("CLIENT_SECRET").map_err(|_| {
        tracing::error!("CLIENT_SECRET non configuré");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    let auth_url = env::var("AUTH_URL").map_err(|_| {
        tracing::error!("AUTH_URL non configuré");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    let auth_url = auth_url.trim_end_matches('/');

    let client = reqwest::Client::new();

    // Étape 1 : Échanger le code contre un access token
    let token_endpoint = format!("{}/token", auth_url);
    let token_resp = client
        .post(&token_endpoint)
        .form(&[
            ("grant_type", "authorization_code"),
            ("code", payload.code.as_str()),
            ("client_id", client_id.as_str()),
            ("client_secret", client_secret.as_str()),
            ("redirect_uri", payload.redirect_uri.as_str()),
        ])
        .send()
        .await
        .map_err(|e| {
            tracing::error!("t4g token exchange réseau: {}", e);
            StatusCode::BAD_GATEWAY
        })?;

    if !token_resp.status().is_success() {
        tracing::error!("t4g token exchange failed: {}", token_resp.status());
        return Err(StatusCode::UNAUTHORIZED);
    }

    let token_data: serde_json::Value =
        token_resp.json().await.map_err(|_| StatusCode::BAD_GATEWAY)?;
    let access_token = token_data["access_token"]
        .as_str()
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Étape 2 : Récupérer le profil utilisateur
    let userinfo_endpoint = format!("{}/userinfo", auth_url);
    let userinfo_resp = client
        .get(&userinfo_endpoint)
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    if !userinfo_resp.status().is_success() {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let user_info: serde_json::Value =
        userinfo_resp.json().await.map_err(|_| StatusCode::BAD_GATEWAY)?;

    let email = user_info["email"]
        .as_str()
        .ok_or(StatusCode::BAD_REQUEST)?
        .to_string();
    let given_name = user_info["given_name"]
        .as_str()
        .or_else(|| user_info["firstName"].as_str())
        .unwrap_or("")
        .to_string();
    let family_name = user_info["family_name"]
        .as_str()
        .or_else(|| user_info["lastName"].as_str())
        .unwrap_or("")
        .to_string();
    let name = user_info["name"]
        .as_str()
        .map(|s| s.to_string())
        .unwrap_or_else(|| format!("{} {}", given_name, family_name).trim().to_string());
    let sub = user_info["sub"]
        .as_str()
        .or_else(|| user_info["id"].as_str())
        .unwrap_or("")
        .to_string();

    let user = get_or_create_user_from_oauth(
        &state,
        email,
        name,
        UserRole::Mentee,
        format!("t4g_{}", sub),
    )
    .await?;

    generate_auth_response(user)
}

// ── Nouveaux handlers : magic link ────────────────────────────────────────────

async fn magic_link_send(
    Json(payload): Json<MagicLinkSendRequest>,
) -> Result<Json<MagicLinkSendResponse>, StatusCode> {
    let email = payload.email.to_lowercase();
    let email = email.trim();
    if email.is_empty() || !email.contains('@') {
        return Err(StatusCode::BAD_REQUEST);
    }

    let token = create_magic_token(email);

    let app_url = env::var("APP_URL").unwrap_or_else(|_| "http://localhost:4200".to_string());
    let app_url = app_url.trim_end_matches('/');
    let locale = match payload.locale.as_deref() {
        Some("en") => "en",
        _ => "fr",
    };
    let magic_link = format!(
        "{}/{}/auth/callback/magic-link/?token={}",
        app_url, locale, token
    );

    let resend_api_key = env::var("RESEND_API_KEY").ok();

    match resend_api_key {
        None => {
            tracing::info!("Magic link (dev): {}", magic_link);
            Ok(Json(MagicLinkSendResponse {
                success: true,
                message: Some("Email envoyé (dev mode)".to_string()),
                dev_link: Some(magic_link),
            }))
        }
        Some(api_key) => {
            let email_from = env::var("EMAIL_FROM")
                .unwrap_or_else(|_| "Token For Good <t4g@darno.de>".to_string());

            let html = format!(
                r#"<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
    <h2 style="margin-bottom: 8px;">Connexion à Token4Good</h2>
    <p style="color: #666; margin-bottom: 24px;">Cliquez sur le bouton ci-dessous pour vous connecter. Ce lien est valable <strong>15 minutes</strong>.</p>
    <a href="{link}" style="display: inline-block; background: #f7931a; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Se connecter →
    </a>
    <p style="color: #999; font-size: 12px; margin-top: 32px;">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
      <a href="{link}" style="color: #f7931a; word-break: break-all;">{link}</a>
    </p>
    <p style="color: #999; font-size: 12px;">Si vous n'avez pas demandé cette connexion, ignorez cet email.</p>
  </body>
</html>"#,
                link = magic_link
            );

            let client = reqwest::Client::new();
            let send_resp = client
                .post("https://api.resend.com/emails")
                .header("Authorization", format!("Bearer {}", api_key))
                .json(&serde_json::json!({
                    "from": email_from,
                    "to": [email],
                    "subject": "Votre lien de connexion Token4Good",
                    "text": format!(
                        "Cliquez sur ce lien pour vous connecter (valable 15 minutes) :\n\n{}\n\nSi vous n'avez pas demandé ce lien, ignorez cet email.",
                        magic_link
                    ),
                    "html": html,
                }))
                .send()
                .await
                .map_err(|e| {
                    tracing::error!("Resend API réseau: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            if !send_resp.status().is_success() {
                tracing::error!("Resend API failed: {}", send_resp.status());
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }

            Ok(Json(MagicLinkSendResponse {
                success: true,
                message: Some("Email envoyé avec succès".to_string()),
                dev_link: None,
            }))
        }
    }
}

async fn magic_link_verify(
    State(state): State<AppState>,
    Json(payload): Json<MagicLinkVerifyRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    let email = verify_magic_token(&payload.token).ok_or_else(|| {
        tracing::warn!("Magic link token invalide ou expiré");
        StatusCode::UNAUTHORIZED
    })?;

    let name = email.split('@').next().unwrap_or("").to_string();

    let user = get_or_create_user_from_oauth(
        &state,
        email,
        name,
        UserRole::Mentee,
        "magic_link".to_string(),
    )
    .await?;

    generate_auth_response(user)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/// Génère un JWT et construit l'AuthResponse à partir d'un User.
fn generate_auth_response(user: User) -> Result<Json<AuthResponse>, StatusCode> {
    let jwt_service = JWTService::new().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let token = jwt_service
        .create_token(&user.id.to_string(), &user.email, &user.role.to_string())
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(AuthResponse {
        token,
        user: UserSummary {
            id: user.id.to_string(),
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            lightning_address: user.lightning_address,
        },
        expires_at: chrono::Utc::now() + chrono::Duration::hours(24),
    }))
}

/// Encode des octets en base64url sans padding.
fn base64url_encode(data: &[u8]) -> String {
    const CHARS: &[u8] =
        b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let mut result = Vec::with_capacity((data.len() * 4 + 2) / 3);
    let mut chunks = data.chunks_exact(3);

    for chunk in &mut chunks {
        let b = ((chunk[0] as u32) << 16) | ((chunk[1] as u32) << 8) | (chunk[2] as u32);
        result.push(CHARS[((b >> 18) & 0x3f) as usize]);
        result.push(CHARS[((b >> 12) & 0x3f) as usize]);
        result.push(CHARS[((b >> 6) & 0x3f) as usize]);
        result.push(CHARS[(b & 0x3f) as usize]);
    }

    let rem = chunks.remainder();
    match rem.len() {
        1 => {
            let b = (rem[0] as u32) << 16;
            result.push(CHARS[((b >> 18) & 0x3f) as usize]);
            result.push(CHARS[((b >> 12) & 0x3f) as usize]);
        }
        2 => {
            let b = ((rem[0] as u32) << 16) | ((rem[1] as u32) << 8);
            result.push(CHARS[((b >> 18) & 0x3f) as usize]);
            result.push(CHARS[((b >> 12) & 0x3f) as usize]);
            result.push(CHARS[((b >> 6) & 0x3f) as usize]);
        }
        _ => {}
    }

    String::from_utf8(result).unwrap()
}

/// Décode une chaîne base64url (sans padding) en octets.
fn base64url_decode(s: &str) -> Option<Vec<u8>> {
    fn char_to_val(c: u8) -> Option<u8> {
        match c {
            b'A'..=b'Z' => Some(c - b'A'),
            b'a'..=b'z' => Some(c - b'a' + 26),
            b'0'..=b'9' => Some(c - b'0' + 52),
            b'-' => Some(62),
            b'_' => Some(63),
            _ => None,
        }
    }

    let bytes = s.as_bytes();
    let mut result = Vec::with_capacity(bytes.len() * 3 / 4 + 1);
    let mut i = 0;

    while i < bytes.len() {
        let remaining = bytes.len() - i;
        if remaining >= 4 {
            let a = char_to_val(bytes[i])?;
            let b = char_to_val(bytes[i + 1])?;
            let c = char_to_val(bytes[i + 2])?;
            let d = char_to_val(bytes[i + 3])?;
            let val = ((a as u32) << 18) | ((b as u32) << 12) | ((c as u32) << 6) | (d as u32);
            result.push(((val >> 16) & 0xff) as u8);
            result.push(((val >> 8) & 0xff) as u8);
            result.push((val & 0xff) as u8);
            i += 4;
        } else if remaining == 3 {
            let a = char_to_val(bytes[i])?;
            let b = char_to_val(bytes[i + 1])?;
            let c = char_to_val(bytes[i + 2])?;
            let val = ((a as u32) << 18) | ((b as u32) << 12) | ((c as u32) << 6);
            result.push(((val >> 16) & 0xff) as u8);
            result.push(((val >> 8) & 0xff) as u8);
            i += 3;
        } else if remaining == 2 {
            let a = char_to_val(bytes[i])?;
            let b = char_to_val(bytes[i + 1])?;
            let val = ((a as u32) << 18) | ((b as u32) << 12);
            result.push(((val >> 16) & 0xff) as u8);
            i += 2;
        } else {
            return None; // 1 caractère isolé : invalide
        }
    }

    Some(result)
}

/// Génère un token HMAC-SHA256 signé, compatible avec la logique TypeScript.
/// Format : base64url(JSON({email, exp})).base64url(HMAC-SHA256(payload))
/// exp est en secondes (u64) pour éviter tout problème de sérialisation u128.
fn create_magic_token(email: &str) -> String {
    let secret = env::var("MAGIC_LINK_SECRET")
        .or_else(|_| env::var("NEXTAUTH_SECRET"))
        .unwrap_or_else(|_| "fallback-dev-secret".to_string());

    let exp: u64 = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
        + 15 * 60; // 15 minutes en secondes

    let payload_json = serde_json::json!({"email": email, "exp": exp}).to_string();
    let payload = base64url_encode(payload_json.as_bytes());

    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
    mac.update(payload.as_bytes());
    let sig = base64url_encode(&mac.finalize().into_bytes());

    format!("{}.{}", payload, sig)
}

/// Vérifie un token magic link (HMAC + expiration) et retourne l'email si valide.
fn verify_magic_token(token: &str) -> Option<String> {
    let secret = env::var("MAGIC_LINK_SECRET")
        .or_else(|_| env::var("NEXTAUTH_SECRET"))
        .unwrap_or_else(|_| "fallback-dev-secret".to_string());

    let dot_pos = token.find('.').or_else(|| {
        tracing::warn!("Magic link: pas de séparateur '.' dans le token (len={})", token.len());
        None
    })?;
    let (payload, sig) = (&token[..dot_pos], &token[dot_pos + 1..]);

    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
    mac.update(payload.as_bytes());
    let expected_sig = base64url_encode(&mac.finalize().into_bytes());

    // Comparaison timing-safe
    if expected_sig.len() != sig.len() {
        tracing::warn!("Magic link: longueur signature incorrecte (attendu={}, reçu={})", expected_sig.len(), sig.len());
        return None;
    }
    let ok = expected_sig
        .bytes()
        .zip(sig.bytes())
        .fold(0u8, |acc, (a, b)| acc | (a ^ b))
        == 0;
    if !ok {
        tracing::warn!("Magic link: signature HMAC invalide");
        return None;
    }

    // Décoder et valider le payload
    let payload_bytes = base64url_decode(payload).or_else(|| {
        tracing::warn!("Magic link: décodage base64url échoué pour le payload");
        None
    })?;
    let payload_str = std::str::from_utf8(&payload_bytes).ok().or_else(|| {
        tracing::warn!("Magic link: payload n'est pas du UTF-8 valide");
        None
    })?;
    let payload_json: serde_json::Value = serde_json::from_str(payload_str).ok().or_else(|| {
        tracing::warn!("Magic link: payload JSON invalide: {}", payload_str);
        None
    })?;

    let email = payload_json["email"].as_str().or_else(|| {
        tracing::warn!("Magic link: champ 'email' manquant ou non-string dans le payload");
        None
    })?.to_string();

    let exp: u64 = payload_json["exp"].as_u64().or_else(|| {
        tracing::warn!("Magic link: champ 'exp' manquant ou non-u64 (valeur: {:?})", payload_json["exp"]);
        None
    })?;

    let now: u64 = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    if now > exp {
        tracing::warn!("Magic link: token expiré (now={}, exp={})", now, exp);
        return None;
    }

    Some(email)
}

async fn get_or_create_user_from_dazno(
    state: &AppState,
    dazno_user: DaznoUser,
) -> Result<User, StatusCode> {
    // Essayer de récupérer l'utilisateur existant
    match state.db.get_user_by_email(&dazno_user.email).await {
        Ok(Some(existing_user)) => return Ok(existing_user),
        Ok(None) => {} // Nouvel utilisateur, on continue
        Err(e) => {
            tracing::error!("DB error looking up user by email (dazno): {}", e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
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
        is_mentor_active: false,
        mentor_topics: vec![],
        learning_topics: vec![],
        mentor_bio: None,
        mentor_tokens_per_hour: None,
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
    // Normaliser l'email en minuscules (GitHub/LinkedIn peuvent renvoyer des emails avec casse mixte)
    let email = email.to_lowercase();
    let email = email.trim().to_string();

    // Essayer de récupérer l'utilisateur existant
    match state.db.get_user_by_email(&email).await {
        Ok(Some(existing_user)) => return Ok(existing_user),
        Ok(None) => {} // Nouvel utilisateur, on continue
        Err(e) => {
            tracing::error!("DB error looking up user by email (oauth): {}", e);
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
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
        is_mentor_active: false,
        mentor_topics: vec![],
        learning_topics: vec![],
        mentor_bio: None,
        mentor_tokens_per_hour: None,
    };

    // Créer l'utilisateur dans la base de données
    let create_err_str = match state.db.create_user(&new_user).await {
        Ok(()) => None,
        Err(e) => Some(e.to_string()), // e (Box<dyn Error>, non-Send) droppé ici
    };
    if let Some(err_str) = create_err_str {
        if err_str.contains("duplicate key") || err_str.contains("unique constraint") {
            // Race condition ou utilisateur existant non trouvé par get_user_by_email :
            // on le recharge directement
            tracing::warn!("Conflit email à l'insert, on recharge l'utilisateur existant");
            match state.db.get_user_by_email(&email).await {
                Ok(Some(user)) => return Ok(user),
                Ok(None) => {
                    tracing::error!("Utilisateur introuvable après conflit duplicate key");
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                }
                Err(e2) => {
                    tracing::error!("DB error re-fetching user after conflict: {}", e2);
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                }
            }
        }
        tracing::error!("Error creating user from OAuth: {}", err_str);
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

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
