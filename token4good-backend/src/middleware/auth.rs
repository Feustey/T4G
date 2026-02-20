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

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::{Mutex, OnceLock};

    fn env_mutex() -> &'static Mutex<()> {
        static MUTEX: OnceLock<Mutex<()>> = OnceLock::new();
        MUTEX.get_or_init(|| Mutex::new(()))
    }

    /// Crée un secret de test valide (>= 32 caractères, non-trivial)
    fn test_secret() -> String {
        "super-secret-jwt-key-for-testing-only-32chars".to_string()
    }

    fn with_secret<F: FnOnce()>(secret: &str, f: F) {
        let _guard = env_mutex().lock().unwrap_or_else(|e| e.into_inner());
        std::env::set_var("JWT_SECRET", secret);
        f();
        std::env::remove_var("JWT_SECRET");
    }

    // ========== JWTService::new() ==========

    #[test]
    fn test_jwt_service_new_sans_env_retourne_erreur() {
        let _guard = env_mutex().lock().unwrap_or_else(|e| e.into_inner());
        std::env::remove_var("JWT_SECRET");
        let result = JWTService::new();
        assert!(result.is_err(), "Devrait échouer sans JWT_SECRET");
    }

    #[test]
    fn test_jwt_service_new_secret_trop_court_retourne_erreur() {
        with_secret("short", || {
            let result = JWTService::new();
            assert!(result.is_err(), "Devrait échouer si secret < 32 chars");
        });
    }

    #[test]
    fn test_jwt_service_new_secret_par_defaut_your_secret_key_retourne_erreur() {
        with_secret("your-secret-key", || {
            let result = JWTService::new();
            assert!(result.is_err(), "Devrait refuser 'your-secret-key'");
        });
    }

    #[test]
    fn test_jwt_service_new_secret_default_retourne_erreur() {
        with_secret("default", || {
            let result = JWTService::new();
            assert!(result.is_err(), "Devrait refuser 'default'");
        });
    }

    #[test]
    fn test_jwt_service_new_secret_secret_retourne_erreur() {
        with_secret("secret", || {
            let result = JWTService::new();
            assert!(result.is_err(), "Devrait refuser 'secret'");
        });
    }

    #[test]
    fn test_jwt_service_new_secret_valide_succes() {
        with_secret(&test_secret(), || {
            let result = JWTService::new();
            assert!(result.is_ok(), "Devrait réussir avec un secret valide");
        });
    }

    // ========== create_token() ==========

    #[test]
    fn test_create_token_retourne_une_chaine_non_vide() {
        with_secret(&test_secret(), || {
            let svc = JWTService::new().unwrap();
            let token = svc.create_token("user-1", "alice@t4g.com", "alumni");
            assert!(token.is_ok());
            let token_str = token.unwrap();
            assert!(!token_str.is_empty());
            // Un JWT a toujours 3 parties séparées par des points
            assert_eq!(token_str.split('.').count(), 3);
        });
    }

    #[test]
    fn test_create_token_contient_les_bons_claims() {
        with_secret(&test_secret(), || {
            let svc = JWTService::new().unwrap();
            let token = svc.create_token("user-123", "bob@t4g.com", "mentor").unwrap();
            let claims = svc.verify_token(&token).unwrap();
            assert_eq!(claims.sub, "user-123");
            assert_eq!(claims.email, "bob@t4g.com");
            assert_eq!(claims.role, "mentor");
        });
    }

    #[test]
    fn test_create_token_expiration_dans_24h() {
        with_secret(&test_secret(), || {
            let svc = JWTService::new().unwrap();
            let before = chrono::Utc::now().timestamp() as usize;
            let token = svc.create_token("u1", "u@t4g.com", "student").unwrap();
            let claims = svc.verify_token(&token).unwrap();
            let after = chrono::Utc::now().timestamp() as usize;

            // exp doit être environ now + 24h (± 2 secondes de marge)
            let expected_exp_min = before + 24 * 60 * 60 - 2;
            let expected_exp_max = after + 24 * 60 * 60 + 2;
            assert!(
                claims.exp >= expected_exp_min && claims.exp <= expected_exp_max,
                "exp={} hors de la plage [{}, {}]",
                claims.exp,
                expected_exp_min,
                expected_exp_max
            );
        });
    }

    #[test]
    fn test_create_token_iat_recent() {
        with_secret(&test_secret(), || {
            let svc = JWTService::new().unwrap();
            let before = chrono::Utc::now().timestamp() as usize;
            let token = svc.create_token("u1", "u@t4g.com", "student").unwrap();
            let claims = svc.verify_token(&token).unwrap();
            let after = chrono::Utc::now().timestamp() as usize;
            assert!(claims.iat >= before && claims.iat <= after);
        });
    }

    // ========== verify_token() ==========

    #[test]
    fn test_verify_token_valide_retourne_claims() {
        with_secret(&test_secret(), || {
            let svc = JWTService::new().unwrap();
            let token = svc.create_token("user-42", "test@t4g.com", "admin").unwrap();
            let claims = svc.verify_token(&token);
            assert!(claims.is_ok());
            assert_eq!(claims.unwrap().sub, "user-42");
        });
    }

    #[test]
    fn test_verify_token_invalide_retourne_erreur() {
        with_secret(&test_secret(), || {
            let svc = JWTService::new().unwrap();
            let result = svc.verify_token("not.a.valid.jwt");
            assert!(result.is_err(), "Devrait rejeter un token malformé");
        });
    }

    #[test]
    fn test_verify_token_vide_retourne_erreur() {
        with_secret(&test_secret(), || {
            let svc = JWTService::new().unwrap();
            let result = svc.verify_token("");
            assert!(result.is_err());
        });
    }

    #[test]
    fn test_verify_token_signature_incorrecte_retourne_erreur() {
        with_secret(&test_secret(), || {
            let svc = JWTService::new().unwrap();
            let token = svc.create_token("u1", "u@t4g.com", "alumni").unwrap();

            // Modifier le secret pour créer un service différent
            std::env::set_var("JWT_SECRET", "another-super-secret-key-for-testing-abcde");
            let svc_other = JWTService::new().unwrap();
            std::env::set_var("JWT_SECRET", &test_secret());

            let result = svc_other.verify_token(&token);
            assert!(result.is_err(), "Devrait rejeter un token signé avec un autre secret");
        });
    }

    #[test]
    fn test_verify_token_expire_retourne_erreur() {
        // Créer manuellement un token déjà expiré
        with_secret(&test_secret(), || {
            use jsonwebtoken::{encode, EncodingKey, Header};
            let secret = test_secret();
            let expired_claims = Claims {
                sub: "u1".to_string(),
                email: "u@t4g.com".to_string(),
                role: "alumni".to_string(),
                exp: 1000000, // timestamp passé (1970)
                iat: 999999,
            };
            let expired_token = encode(
                &Header::default(),
                &expired_claims,
                &EncodingKey::from_secret(secret.as_ref()),
            )
            .unwrap();

            let svc = JWTService::new().unwrap();
            let result = svc.verify_token(&expired_token);
            assert!(result.is_err(), "Devrait rejeter un token expiré");
        });
    }

    // ========== AuthUser ==========

    #[test]
    fn test_auth_user_clone() {
        let user = AuthUser {
            id: "u1".to_string(),
            email: "test@t4g.com".to_string(),
            role: "mentor".to_string(),
        };
        let cloned = user.clone();
        assert_eq!(cloned.id, "u1");
        assert_eq!(cloned.email, "test@t4g.com");
        assert_eq!(cloned.role, "mentor");
    }

    // ========== admin_only_middleware (logique) ==========

    #[test]
    fn test_admin_role_autorise() {
        // Test de la logique de vérification de rôle (sans HTTP)
        let auth_user = AuthUser {
            id: "admin-1".to_string(),
            email: "admin@t4g.com".to_string(),
            role: "ADMIN".to_string(),
        };
        let is_authorized = auth_user.role == "SERVICE_PROVIDER" || auth_user.role == "ADMIN";
        assert!(is_authorized);
    }

    #[test]
    fn test_service_provider_role_autorise() {
        let auth_user = AuthUser {
            id: "sp-1".to_string(),
            email: "sp@t4g.com".to_string(),
            role: "SERVICE_PROVIDER".to_string(),
        };
        let is_authorized = auth_user.role == "SERVICE_PROVIDER" || auth_user.role == "ADMIN";
        assert!(is_authorized);
    }

    #[test]
    fn test_student_role_refuse() {
        let auth_user = AuthUser {
            id: "student-1".to_string(),
            email: "student@t4g.com".to_string(),
            role: "student".to_string(),
        };
        let is_authorized = auth_user.role == "SERVICE_PROVIDER" || auth_user.role == "ADMIN";
        assert!(!is_authorized);
    }

    #[test]
    fn test_mentor_role_refuse_acces_admin() {
        let auth_user = AuthUser {
            id: "mentor-1".to_string(),
            email: "mentor@t4g.com".to_string(),
            role: "mentor".to_string(),
        };
        let is_authorized = auth_user.role == "SERVICE_PROVIDER" || auth_user.role == "ADMIN";
        assert!(!is_authorized);
    }
}
