use crate::AppState;
use axum::{
    extract::{Request, State},
    http::{header::AUTHORIZATION, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // User ID
    pub email: String,
    pub role: String,
    pub exp: usize, // Expiration timestamp
    pub iat: usize, // Issued at timestamp
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuthUser {
    pub id: String,
    pub email: String,
    pub role: String,
}

pub struct JWTService {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
}

impl JWTService {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let secret = std::env::var("JWT_SECRET")
            .map_err(|_| "JWT_SECRET environment variable is required for security")?;

        if secret.len() < 32 {
            return Err("JWT_SECRET must be at least 32 characters long for security".into());
        }

        if secret == "your-secret-key" || secret == "default" || secret == "secret" {
            return Err("JWT_SECRET cannot use a default/common value. Use a cryptographically secure random string".into());
        }

        Ok(Self {
            encoding_key: EncodingKey::from_secret(secret.as_ref()),
            decoding_key: DecodingKey::from_secret(secret.as_ref()),
        })
    }

    pub fn create_token(
        &self,
        user_id: &str,
        email: &str,
        role: &str,
    ) -> Result<String, jsonwebtoken::errors::Error> {
        let now = chrono::Utc::now().timestamp() as usize;
        let exp = now + 24 * 60 * 60; // 24 heures

        let claims = Claims {
            sub: user_id.to_string(),
            email: email.to_string(),
            role: role.to_string(),
            exp,
            iat: now,
        };

        encode(&Header::default(), &claims, &self.encoding_key)
    }

    pub fn verify_token(&self, token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
        let validation = Validation::default();
        let token_data = decode::<Claims>(token, &self.decoding_key, &validation)?;
        Ok(token_data.claims)
    }
}

pub async fn auth_middleware(
    State(_state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = request
        .headers()
        .get(AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    let token = match auth_header {
        Some(header) if header.starts_with("Bearer ") => header.strip_prefix("Bearer ").unwrap(),
        _ => return Err(StatusCode::UNAUTHORIZED),
    };

    let jwt_service = JWTService::new().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let claims = jwt_service
        .verify_token(token)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Vérifier si le token n'est pas expiré
    let now = chrono::Utc::now().timestamp() as usize;
    if claims.exp < now {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // Ajouter l'utilisateur aux extensions de la requête
    let auth_user = AuthUser {
        id: claims.sub,
        email: claims.email,
        role: claims.role,
    };

    request.extensions_mut().insert(auth_user);

    Ok(next.run(request).await)
}

pub async fn admin_only_middleware(request: Request, next: Next) -> Result<Response, StatusCode> {
    let auth_user = request
        .extensions()
        .get::<AuthUser>()
        .ok_or(StatusCode::UNAUTHORIZED)?;

    if auth_user.role != "SERVICE_PROVIDER" && auth_user.role != "ADMIN" {
        return Err(StatusCode::FORBIDDEN);
    }

    Ok(next.run(request).await)
}

// Fonction utilitaire pour extraire l'utilisateur authentifié
pub fn get_auth_user(request: &Request) -> Option<&AuthUser> {
    request.extensions().get::<AuthUser>()
}
