use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ServiceCategory {
    pub id: String,
    pub name: String,
    pub kind: Option<String>,
    pub description: Option<String>,
    pub href: Option<String>,
    pub default_price: i32,
    pub default_unit: String,
    pub icon: Option<String>,
    pub disabled: bool,
    pub service_provider_type: String,
    pub audience: String,
    #[serde(skip_deserializing)]
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    #[serde(skip_deserializing)]
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Service {
    pub id: String,
    pub name: String,
    pub unit: String,
    pub description: Option<String>,
    pub summary: Option<String>,
    pub avatar: Option<String>,
    pub price: i32,
    pub total_supply: i32,
    #[sqlx(try_from = "Vec<i32>")]
    pub rating: Vec<i32>,
    pub suggestion: bool,
    pub blockchain_id: Option<i32>,
    pub tx_hash: Option<String>,
    pub audience: String,
    pub category_id: Option<String>,
    pub service_provider_id: Option<String>,
    #[sqlx(try_from = "Vec<String>")]
    pub annotations: Vec<String>,
    #[serde(skip_deserializing)]
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    #[serde(skip_deserializing)]
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateServiceRequest {
    pub name: String,
    pub unit: Option<String>,
    pub description: Option<String>,
    pub summary: Option<String>,
    pub avatar: Option<String>,
    pub price: i32,
    pub audience: String,
    pub category_id: Option<String>,
    pub service_provider_id: String,
    pub annotations: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateServiceRequest {
    pub name: Option<String>,
    pub unit: Option<String>,
    pub description: Option<String>,
    pub summary: Option<String>,
    pub avatar: Option<String>,
    pub price: Option<i32>,
    pub total_supply: Option<i32>,
    pub audience: Option<String>,
    pub category_id: Option<String>,
    pub blockchain_id: Option<i32>,
    pub tx_hash: Option<String>,
    pub annotations: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub kind: Option<String>,
    pub description: Option<String>,
    pub href: Option<String>,
    pub default_price: Option<i32>,
    pub default_unit: Option<String>,
    pub icon: Option<String>,
    pub disabled: Option<bool>,
    pub service_provider_type: Option<String>,
    pub audience: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCategoryRequest {
    pub name: Option<String>,
    pub kind: Option<String>,
    pub description: Option<String>,
    pub href: Option<String>,
    pub default_price: Option<i32>,
    pub default_unit: Option<String>,
    pub icon: Option<String>,
    pub disabled: Option<bool>,
    pub service_provider_type: Option<String>,
    pub audience: Option<String>,
}

// API Response types for frontend compatibility
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceResponse {
    pub id: String,
    pub name: String,
    pub unit: String,
    pub description: Option<String>,
    pub summary: Option<String>,
    pub avatar: Option<String>,
    pub price: i32,
    pub rating: Vec<i32>,
    #[serde(rename = "blockchainId")]
    pub blockchain_id: Option<i32>,
    pub category: Option<CategoryIdName>,
    pub provider: Option<UserWallet>,
    pub supply: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryIdName {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserWallet {
    pub id: String,
    #[serde(rename = "firstName")]
    pub first_name: String,
    #[serde(rename = "lastName")]
    pub last_name: String,
    pub wallet: Option<String>,
    pub avatar: Option<String>,
    pub program: Option<String>,
    #[serde(rename = "graduatedYear")]
    pub graduated_year: Option<String>,
    pub about: Option<String>,
}
