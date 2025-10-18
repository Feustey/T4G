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
