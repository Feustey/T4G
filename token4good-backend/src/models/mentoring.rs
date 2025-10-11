use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum RequestStatus {
    #[serde(rename = "open")]
    Open,
    #[serde(rename = "assigned")]
    Assigned,
    #[serde(rename = "completed")]
    Completed,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MentoringRequest {
    pub id: String,
    pub title: String,
    pub description: String,
    pub created_at: DateTime<Utc>,
    pub status: RequestStatus,
    pub mentee_id: String,
    pub mentor_id: Option<String>,
    pub tags: Vec<String>,
}

impl MentoringRequest {
    pub fn new(title: String, description: String, mentee_id: String, tags: Vec<String>) -> Self {
        Self {
            id: format!("req_{}", Uuid::new_v4()),
            title,
            description,
            created_at: Utc::now(),
            status: RequestStatus::Open,
            mentee_id,
            mentor_id: None,
            tags,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateRequestPayload {
    pub title: String,
    pub description: String,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MentoringProof {
    pub id: String,
    pub request_id: String,
    pub mentor_id: String,
    pub mentee_id: String,
    pub timestamp: DateTime<Utc>,
    pub rgb_contract_id: String,
    pub signature: String,
    pub rating: u8,
    pub comment: Option<String>,
}

impl MentoringProof {
    pub fn new(
        request_id: String,
        mentor_id: String,
        mentee_id: String,
        rgb_contract_id: String,
        signature: String,
        rating: u8,
        comment: Option<String>,
    ) -> Self {
        Self {
            id: format!("proof_{}", Uuid::new_v4()),
            request_id,
            mentor_id,
            mentee_id,
            timestamp: Utc::now(),
            rgb_contract_id,
            signature,
            rating,
            comment,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProofPayload {
    pub request_id: String,
    pub rating: u8,
    pub comment: Option<String>,
}
