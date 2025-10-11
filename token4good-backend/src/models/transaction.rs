use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BlockchainTransaction {
    pub id: String,
    pub hash: String,
    pub block: Option<i32>,
    pub ts: chrono::DateTime<chrono::Utc>,
    pub from_address: String,
    pub to_address: String,
    pub method: Option<String>,
    pub event: Option<String>,
    pub target_id: Option<String>,
    pub transfer_from: Option<String>,
    pub transfer_to: Option<String>,
    pub transfer_amount: Option<i32>,
    pub deal_id: Option<i32>,
    pub service_id: Option<i32>,
    pub service_buyer: Option<String>,
    pub service_provider: Option<String>,
    #[serde(skip_deserializing)]
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTransactionRequest {
    pub hash: String,
    pub block: Option<i32>,
    pub ts: chrono::DateTime<chrono::Utc>,
    pub from_address: String,
    pub to_address: String,
    pub method: Option<String>,
    pub event: Option<String>,
    pub target_id: Option<String>,
    pub transfer_from: Option<String>,
    pub transfer_to: Option<String>,
    pub transfer_amount: Option<i32>,
    pub deal_id: Option<i32>,
    pub service_id: Option<i32>,
    pub service_buyer: Option<String>,
    pub service_provider: Option<String>,
}
