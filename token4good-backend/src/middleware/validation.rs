use axum::{extract::Request, http::StatusCode, middleware::Next, response::Response};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ValidationError {
    pub field: String,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct ValidationResponse {
    pub error: String,
    pub details: Vec<ValidationError>,
}

pub trait Validate {
    fn validate(&self) -> Result<(), Vec<ValidationError>>;
}

// Validation utilitaires
pub fn validate_email(email: &str) -> bool {
    let email_regex =
        regex::Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
    email_regex.is_match(email)
}

pub fn validate_uuid(uuid_str: &str) -> bool {
    uuid::Uuid::parse_str(uuid_str).is_ok()
}

pub fn validate_rating(rating: u8) -> bool {
    rating <= 5
}

pub fn validate_non_empty_string(value: &str) -> bool {
    !value.trim().is_empty()
}

pub fn validate_username(username: &str) -> bool {
    let username_regex = regex::Regex::new(r"^[a-zA-Z0-9_-]{3,50}$").unwrap();
    username_regex.is_match(username)
}

pub fn validate_lightning_address(address: &str) -> bool {
    // Validation basique pour les adresses Lightning
    // Format attendu: user@domain.com ou lnurl...
    if address.starts_with("lnurl") {
        return address.len() >= 10 && address.chars().all(|c| c.is_alphanumeric());
    }

    validate_email(address)
}

// Middleware de validation des tailles de requête
pub async fn request_size_limit_middleware(
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    const MAX_REQUEST_SIZE: usize = 1024 * 1024; // 1MB

    if let Some(content_length) = request.headers().get("content-length") {
        if let Ok(length_str) = content_length.to_str() {
            if let Ok(length) = length_str.parse::<usize>() {
                if length > MAX_REQUEST_SIZE {
                    return Err(StatusCode::PAYLOAD_TOO_LARGE);
                }
            }
        }
    }

    Ok(next.run(request).await)
}

// Middleware de validation des headers de sécurité
pub async fn security_headers_middleware(
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Vérifier les headers de sécurité obligatoires pour certaines opérations
    let user_agent = request.headers().get("user-agent");

    if user_agent.is_none() {
        tracing::warn!("Request without User-Agent header");
    }

    // Vérifier la présence d'headers suspects
    if request.headers().get("x-forwarded-for").is_some() {
        tracing::info!("Request with X-Forwarded-For header detected");
    }

    let mut response = next.run(request).await;

    // Ajouter des headers de sécurité à la réponse
    response
        .headers_mut()
        .insert("X-Content-Type-Options", "nosniff".parse().unwrap());
    response
        .headers_mut()
        .insert("X-Frame-Options", "DENY".parse().unwrap());
    response
        .headers_mut()
        .insert("X-XSS-Protection", "1; mode=block".parse().unwrap());

    Ok(response)
}

#[cfg(test)]
mod tests {
    use super::*;

    // ========== validate_email ==========

    #[test]
    fn test_validate_email_valides() {
        assert!(validate_email("test@example.com"));
        assert!(validate_email("user+tag@domain.co.uk"));
        assert!(validate_email("alice.martin@t4g.fr"));
        assert!(validate_email("user123@sub.domain.org"));
    }

    #[test]
    fn test_validate_email_invalides() {
        assert!(!validate_email("invalid-email"));
        assert!(!validate_email("@domain.com"));
        assert!(!validate_email("user@"));
        assert!(!validate_email(""));
        assert!(!validate_email("user@@domain.com")); // double @
        assert!(!validate_email("user@domain")); // pas de TLD
    }

    // ========== validate_username ==========

    #[test]
    fn test_validate_username_valides() {
        assert!(validate_username("valid_user123"));
        assert!(validate_username("user-name"));
        assert!(validate_username("abc")); // 3 chars (minimum)
        // 50 chars (maximum)
        assert!(validate_username("a".repeat(50).as_str()));
    }

    #[test]
    fn test_validate_username_invalides() {
        assert!(!validate_username("us")); // trop court (2 chars)
        assert!(!validate_username("user with spaces"));
        assert!(!validate_username("user@domain"));
        assert!(!validate_username("")); // vide
        // 51 chars (trop long)
        assert!(!validate_username("a".repeat(51).as_str()));
    }

    // ========== validate_rating ==========

    #[test]
    fn test_validate_rating_valides() {
        assert!(validate_rating(0));
        assert!(validate_rating(1));
        assert!(validate_rating(3));
        assert!(validate_rating(5));
    }

    #[test]
    fn test_validate_rating_invalides() {
        assert!(!validate_rating(6));
        assert!(!validate_rating(10));
        assert!(!validate_rating(255));
        assert!(!validate_rating(u8::MAX));
    }

    // ========== validate_non_empty_string ==========

    #[test]
    fn test_validate_non_empty_string_valide() {
        assert!(validate_non_empty_string("hello"));
        assert!(validate_non_empty_string("a"));
        assert!(validate_non_empty_string("  hello  ")); // avec espaces autour mais du texte
    }

    #[test]
    fn test_validate_non_empty_string_invalide() {
        assert!(!validate_non_empty_string(""));
        assert!(!validate_non_empty_string("   ")); // que des espaces
        assert!(!validate_non_empty_string("\t\n")); // tabulation/newline
    }

    // ========== validate_uuid ==========

    #[test]
    fn test_validate_uuid_valides() {
        assert!(validate_uuid("550e8400-e29b-41d4-a716-446655440000"));
        assert!(validate_uuid("6ba7b810-9dad-11d1-80b4-00c04fd430c8"));
        // UUID v4 typique
        assert!(validate_uuid("f47ac10b-58cc-4372-a567-0e02b2c3d479"));
    }

    #[test]
    fn test_validate_uuid_invalides() {
        assert!(!validate_uuid("not-a-uuid"));
        assert!(!validate_uuid(""));
        assert!(!validate_uuid("12345"));
        assert!(!validate_uuid("550e8400-e29b-41d4-a716")); // incomplet
        assert!(!validate_uuid("ZZZZZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZZZZZZZZZ")); // caractères invalides
    }

    // ========== validate_lightning_address ==========

    #[test]
    fn test_validate_lightning_address_email_format() {
        assert!(validate_lightning_address("user@stacker.news"));
        assert!(validate_lightning_address("alice@getalby.com"));
        assert!(validate_lightning_address("bob@ln.tips"));
    }

    #[test]
    fn test_validate_lightning_address_lnurl_valide() {
        // LNURL doit commencer par "lnurl" et être >= 10 chars alphanumérique
        assert!(validate_lightning_address(
            "lnurl1dp68gurn8ghj7um9wfmxjcm99e3k7mf0v9cxj0m385ekvcenxc6r2c35xvukxefcv5mkvv34x5ekzd3ev56nyd3hxqurzepexejxxepnxscrvwfnv9nxzcn9xq6xyefhvgcxxcmyxymnserxfq5fns"
        ));
    }

    #[test]
    fn test_validate_lightning_address_lnurl_trop_court() {
        assert!(!validate_lightning_address("lnurl123")); // < 10 chars
    }

    #[test]
    fn test_validate_lightning_address_lnurl_avec_caracteres_speciaux() {
        assert!(!validate_lightning_address("lnurl1abc!@#")); // caractères non alphanumérique
    }

    #[test]
    fn test_validate_lightning_address_invalides() {
        assert!(!validate_lightning_address("invalid"));
        assert!(!validate_lightning_address(""));
        assert!(!validate_lightning_address("not-an-email-or-lnurl"));
        assert!(!validate_lightning_address("@domain.com")); // email invalide
    }
}
