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

impl std::fmt::Display for RequestStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RequestStatus::Open => write!(f, "open"),
            RequestStatus::Assigned => write!(f, "assigned"),
            RequestStatus::Completed => write!(f, "completed"),
        }
    }
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

#[cfg(test)]
mod tests {
    use super::*;

    // ========== RequestStatus ==========

    #[test]
    fn test_request_status_serialize() {
        assert_eq!(serde_json::to_string(&RequestStatus::Open).unwrap(), "\"open\"");
        assert_eq!(serde_json::to_string(&RequestStatus::Assigned).unwrap(), "\"assigned\"");
        assert_eq!(serde_json::to_string(&RequestStatus::Completed).unwrap(), "\"completed\"");
    }

    #[test]
    fn test_request_status_deserialize_valide() {
        let s: RequestStatus = serde_json::from_str("\"open\"").unwrap();
        assert_eq!(s, RequestStatus::Open);

        let s: RequestStatus = serde_json::from_str("\"assigned\"").unwrap();
        assert_eq!(s, RequestStatus::Assigned);

        let s: RequestStatus = serde_json::from_str("\"completed\"").unwrap();
        assert_eq!(s, RequestStatus::Completed);
    }

    #[test]
    fn test_request_status_deserialize_invalide() {
        let result: Result<RequestStatus, _> = serde_json::from_str("\"cancelled\"");
        assert!(result.is_err(), "Devrait échouer pour un statut inconnu");
    }

    // ========== MentoringRequest::new() ==========

    #[test]
    fn test_mentoring_request_new_statut_initial_open() {
        let req = MentoringRequest::new(
            "Apprendre Rust".to_string(),
            "Besoin d'aide avec les lifetimes".to_string(),
            "mentee-123".to_string(),
            vec!["rust".to_string(), "async".to_string()],
        );

        assert_eq!(req.status, RequestStatus::Open);
        assert!(req.mentor_id.is_none());
        assert_eq!(req.mentee_id, "mentee-123");
        assert_eq!(req.tags.len(), 2);
        assert!(req.id.starts_with("req_"));
    }

    #[test]
    fn test_mentoring_request_new_id_unique() {
        let r1 = MentoringRequest::new("T1".to_string(), "D1".to_string(), "m1".to_string(), vec![]);
        let r2 = MentoringRequest::new("T2".to_string(), "D2".to_string(), "m2".to_string(), vec![]);
        assert_ne!(r1.id, r2.id);
    }

    #[test]
    fn test_mentoring_request_serialize_deserialize() {
        let req = MentoringRequest::new(
            "Test".to_string(),
            "Description".to_string(),
            "mentee-1".to_string(),
            vec!["tag1".to_string()],
        );
        let json = serde_json::to_string(&req).unwrap();
        let deserialized: MentoringRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(req.id, deserialized.id);
        assert_eq!(req.title, deserialized.title);
        assert_eq!(req.status, deserialized.status);
    }

    // ========== MentoringProof::new() ==========

    #[test]
    fn test_mentoring_proof_new_champs_correctement_assignes() {
        let proof = MentoringProof::new(
            "req-001".to_string(),
            "mentor-1".to_string(),
            "mentee-1".to_string(),
            "contract-abc".to_string(),
            "signature-xyz".to_string(),
            5,
            Some("Excellent !".to_string()),
        );

        assert!(proof.id.starts_with("proof_"));
        assert_eq!(proof.request_id, "req-001");
        assert_eq!(proof.mentor_id, "mentor-1");
        assert_eq!(proof.mentee_id, "mentee-1");
        assert_eq!(proof.rgb_contract_id, "contract-abc");
        assert_eq!(proof.signature, "signature-xyz");
        assert_eq!(proof.rating, 5);
        assert_eq!(proof.comment, Some("Excellent !".to_string()));
    }

    #[test]
    fn test_mentoring_proof_sans_commentaire() {
        let proof = MentoringProof::new(
            "req-002".to_string(),
            "mentor-2".to_string(),
            "mentee-2".to_string(),
            "contract-def".to_string(),
            "sig-abc".to_string(),
            3,
            None,
        );
        assert!(proof.comment.is_none());
    }

    #[test]
    fn test_mentoring_proof_serialize_deserialize() {
        let proof = MentoringProof::new(
            "req-x".to_string(),
            "m1".to_string(),
            "me1".to_string(),
            "c1".to_string(),
            "s1".to_string(),
            4,
            None,
        );
        let json = serde_json::to_string(&proof).unwrap();
        let deserialized: MentoringProof = serde_json::from_str(&json).unwrap();
        assert_eq!(proof.id, deserialized.id);
        assert_eq!(proof.rating, deserialized.rating);
    }
}
