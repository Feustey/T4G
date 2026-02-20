//! Structures pour les utilisateurs

use chrono;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum UserRole {
    #[serde(rename = "mentor")]
    Mentor,
    #[serde(rename = "mentee")]
    Mentee,
    #[serde(rename = "alumni")]
    Alumni,
    #[serde(rename = "service_provider")]
    ServiceProvider,
    #[serde(rename = "admin")]
    Admin,
}

impl std::fmt::Display for UserRole {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UserRole::Mentor => write!(f, "mentor"),
            UserRole::Mentee => write!(f, "mentee"),
            UserRole::Alumni => write!(f, "alumni"),
            UserRole::ServiceProvider => write!(f, "service_provider"),
            UserRole::Admin => write!(f, "admin"),
        }
    }
}

impl std::str::FromStr for UserRole {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "mentor" => Ok(UserRole::Mentor),
            "mentee" => Ok(UserRole::Mentee),
            "alumni" => Ok(UserRole::Alumni),
            "service_provider" => Ok(UserRole::ServiceProvider),
            "admin" => Ok(UserRole::Admin),
            _ => Err(format!("Invalid user role: {}", s)),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: uuid::Uuid,
    pub email: String,
    pub firstname: String,
    pub lastname: String,
    pub lightning_address: String,
    pub role: UserRole,
    pub username: String,
    pub bio: Option<String>,
    pub score: u32,
    pub avatar: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub is_active: bool,
    pub wallet_address: Option<String>,
    pub preferences: serde_json::Value,
    pub email_verified: bool,
    pub last_login: Option<chrono::DateTime<chrono::Utc>>,
    pub is_onboarded: bool,
}

impl User {
    pub fn new(
        email: String,
        firstname: String,
        lastname: String,
        lightning_address: String,
        role: UserRole,
        username: String,
    ) -> Self {
        let now = chrono::Utc::now();
        Self {
            id: Uuid::new_v4(),
            email,
            firstname,
            lastname,
            lightning_address,
            role,
            username,
            bio: None,
            score: 0,
            avatar: None,
            created_at: now,
            updated_at: now,
            is_active: true,
            wallet_address: None,
            preferences: serde_json::Value::Object(serde_json::Map::new()),
            email_verified: false,
            last_login: None,
            is_onboarded: false,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub email: String,
    pub firstname: String,
    pub lastname: String,
    pub lightning_address: Option<String>,
    pub role: UserRole,
    pub username: Option<String>,
    pub bio: Option<String>,
    pub avatar: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserRequest {
    pub username: Option<String>,
    pub bio: Option<String>,
    pub avatar: Option<String>,
    pub preferences: Option<serde_json::Value>,
    pub is_onboarded: Option<bool>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    // ========== UserRole Display / FromStr ==========

    #[test]
    fn test_user_role_display() {
        assert_eq!(UserRole::Mentor.to_string(), "mentor");
        assert_eq!(UserRole::Mentee.to_string(), "mentee");
        assert_eq!(UserRole::Alumni.to_string(), "alumni");
        assert_eq!(UserRole::ServiceProvider.to_string(), "service_provider");
        assert_eq!(UserRole::Admin.to_string(), "admin");
    }

    #[test]
    fn test_user_role_from_str_valide() {
        assert_eq!(UserRole::from_str("mentor").unwrap(), UserRole::Mentor);
        assert_eq!(UserRole::from_str("mentee").unwrap(), UserRole::Mentee);
        assert_eq!(UserRole::from_str("alumni").unwrap(), UserRole::Alumni);
        assert_eq!(UserRole::from_str("service_provider").unwrap(), UserRole::ServiceProvider);
        assert_eq!(UserRole::from_str("admin").unwrap(), UserRole::Admin);
    }

    #[test]
    fn test_user_role_from_str_invalide() {
        assert!(UserRole::from_str("unknown").is_err());
        assert!(UserRole::from_str("MENTOR").is_err()); // case sensitive
        assert!(UserRole::from_str("").is_err());
    }

    // ========== UserRole Serde ==========

    #[test]
    fn test_user_role_serialize() {
        let role = UserRole::Alumni;
        let json = serde_json::to_string(&role).unwrap();
        assert_eq!(json, "\"alumni\"");
    }

    #[test]
    fn test_user_role_deserialize() {
        let role: UserRole = serde_json::from_str("\"mentor\"").unwrap();
        assert_eq!(role, UserRole::Mentor);
    }

    #[test]
    fn test_user_role_deserialize_invalide() {
        let result: Result<UserRole, _> = serde_json::from_str("\"superadmin\"");
        assert!(result.is_err());
    }

    // ========== User::new() ==========

    #[test]
    fn test_user_new_valeurs_par_defaut() {
        let user = User::new(
            "alice@t4g.com".to_string(),
            "Alice".to_string(),
            "Martin".to_string(),
            "alice@ln.t4g.com".to_string(),
            UserRole::Alumni,
            "alice_m".to_string(),
        );

        assert_eq!(user.email, "alice@t4g.com");
        assert_eq!(user.firstname, "Alice");
        assert_eq!(user.lastname, "Martin");
        assert_eq!(user.role, UserRole::Alumni);
        assert_eq!(user.score, 0);
        assert!(user.is_active);
        assert!(!user.email_verified);
        assert!(!user.is_onboarded);
        assert!(user.bio.is_none());
        assert!(user.avatar.is_none());
        assert!(user.wallet_address.is_none());
        assert!(user.last_login.is_none());
    }

    #[test]
    fn test_user_new_id_unique() {
        let u1 = User::new("a@t.com".to_string(), "A".to_string(), "B".to_string(),
            "".to_string(), UserRole::Mentee, "ab".to_string());
        let u2 = User::new("b@t.com".to_string(), "C".to_string(), "D".to_string(),
            "".to_string(), UserRole::Mentor, "cd".to_string());
        assert_ne!(u1.id, u2.id);
    }

    // ========== User Serde ==========

    #[test]
    fn test_user_serialize_deserialize() {
        let user = User::new(
            "test@t4g.com".to_string(),
            "Test".to_string(),
            "User".to_string(),
            "test@ln.com".to_string(),
            UserRole::Mentor,
            "test_user".to_string(),
        );

        let json = serde_json::to_string(&user).unwrap();
        let deserialized: User = serde_json::from_str(&json).unwrap();

        assert_eq!(user.id, deserialized.id);
        assert_eq!(user.email, deserialized.email);
        assert_eq!(user.role, deserialized.role);
    }

    // ========== CreateUserRequest ==========

    #[test]
    fn test_create_user_request_serialize() {
        let req = CreateUserRequest {
            email: "new@t4g.com".to_string(),
            firstname: "New".to_string(),
            lastname: "User".to_string(),
            lightning_address: Some("new@ln.com".to_string()),
            role: UserRole::Mentee,
            username: Some("new_user".to_string()),
            bio: None,
            avatar: None,
        };
        let json = serde_json::to_string(&req).unwrap();
        assert!(json.contains("new@t4g.com"));
        assert!(json.contains("\"mentee\""));
    }

    #[test]
    fn test_update_user_request_all_none() {
        let req = UpdateUserRequest {
            username: None,
            bio: None,
            avatar: None,
            preferences: None,
            is_onboarded: None,
        };
        let json = serde_json::to_string(&req).unwrap();
        // Tous les champs sont Option<>, le JSON doit être valide
        assert!(json.contains("null") || json.contains("{}"));
    }
}
