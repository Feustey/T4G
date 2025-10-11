//! Structures pour les preuves RGB

use chrono;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug)]
pub struct Identity(pub String);

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum ProofStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "validated")]
    Validated,
    #[serde(rename = "rejected")]
    Rejected,
    #[serde(rename = "created")]
    Created,
}

impl std::fmt::Display for ProofStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ProofStatus::Pending => write!(f, "pending"),
            ProofStatus::Validated => write!(f, "validated"),
            ProofStatus::Rejected => write!(f, "rejected"),
            ProofStatus::Created => write!(f, "created"),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Proof {
    pub id: String,
    pub contract_id: String,
    pub mentor_id: String,
    pub mentee_id: String,
    pub request_id: String,
    pub rating: u8,
    pub comment: String,
    pub status: ProofStatus,
    pub signature: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProofRequest {
    pub mentor_id: String,
    pub mentee_id: String,
    pub request_id: String,
    pub rating: u8,
    pub comment: String,
}

impl std::str::FromStr for ProofStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "pending" => Ok(ProofStatus::Pending),
            "validated" => Ok(ProofStatus::Validated),
            "rejected" => Ok(ProofStatus::Rejected),
            "created" => Ok(ProofStatus::Created),
            _ => Err(format!("Invalid proof status: {}", s)),
        }
    }
}
