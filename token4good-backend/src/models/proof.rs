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
    /// UTXO Bitcoin pour ancrer la preuve on-chain (format "txid:vout"), optionnel.
    /// Si fourni, le seal RGB sera lié à cet UTXO.
    pub utxo_seal: Option<String>,
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    // ========== ProofStatus Display ==========

    #[test]
    fn test_proof_status_display() {
        assert_eq!(ProofStatus::Pending.to_string(), "pending");
        assert_eq!(ProofStatus::Validated.to_string(), "validated");
        assert_eq!(ProofStatus::Rejected.to_string(), "rejected");
        assert_eq!(ProofStatus::Created.to_string(), "created");
    }

    // ========== ProofStatus FromStr ==========

    #[test]
    fn test_proof_status_from_str_valides() {
        assert_eq!(ProofStatus::from_str("pending").unwrap(), ProofStatus::Pending);
        assert_eq!(ProofStatus::from_str("validated").unwrap(), ProofStatus::Validated);
        assert_eq!(ProofStatus::from_str("rejected").unwrap(), ProofStatus::Rejected);
        assert_eq!(ProofStatus::from_str("created").unwrap(), ProofStatus::Created);
    }

    #[test]
    fn test_proof_status_from_str_invalides() {
        assert!(ProofStatus::from_str("approved").is_err());
        assert!(ProofStatus::from_str("PENDING").is_err()); // case sensitive
        assert!(ProofStatus::from_str("").is_err());
        assert!(ProofStatus::from_str("unknown_status").is_err());
    }

    // ========== ProofStatus Serde ==========

    #[test]
    fn test_proof_status_serialize() {
        assert_eq!(serde_json::to_string(&ProofStatus::Pending).unwrap(), "\"pending\"");
        assert_eq!(serde_json::to_string(&ProofStatus::Validated).unwrap(), "\"validated\"");
        assert_eq!(serde_json::to_string(&ProofStatus::Rejected).unwrap(), "\"rejected\"");
        assert_eq!(serde_json::to_string(&ProofStatus::Created).unwrap(), "\"created\"");
    }

    #[test]
    fn test_proof_status_deserialize() {
        let s: ProofStatus = serde_json::from_str("\"pending\"").unwrap();
        assert_eq!(s, ProofStatus::Pending);

        let s: ProofStatus = serde_json::from_str("\"validated\"").unwrap();
        assert_eq!(s, ProofStatus::Validated);
    }

    // ========== Proof Serde ==========

    #[test]
    fn test_proof_serialize_deserialize() {
        let now = chrono::Utc::now();
        let proof = Proof {
            id: "proof-001".to_string(),
            contract_id: "contract-abc".to_string(),
            mentor_id: "mentor-1".to_string(),
            mentee_id: "mentee-1".to_string(),
            request_id: "req-1".to_string(),
            rating: 5,
            comment: "Excellent session".to_string(),
            status: ProofStatus::Created,
            signature: "sig-xyz".to_string(),
            created_at: now,
            updated_at: now,
        };

        let json = serde_json::to_string(&proof).unwrap();
        let deserialized: Proof = serde_json::from_str(&json).unwrap();

        assert_eq!(proof.id, deserialized.id);
        assert_eq!(proof.rating, deserialized.rating);
        assert_eq!(proof.status, deserialized.status);
        assert_eq!(proof.comment, deserialized.comment);
    }

    #[test]
    fn test_proof_rating_valide_0_a_5() {
        // Vérifier que les ratings de 0 à 5 sont correctement stockés
        for rating in 0u8..=5 {
            let now = chrono::Utc::now();
            let proof = Proof {
                id: format!("p-{}", rating),
                contract_id: "c1".to_string(),
                mentor_id: "m1".to_string(),
                mentee_id: "me1".to_string(),
                request_id: "r1".to_string(),
                rating,
                comment: "".to_string(),
                status: ProofStatus::Created,
                signature: "sig".to_string(),
                created_at: now,
                updated_at: now,
            };
            assert_eq!(proof.rating, rating);
        }
    }

    // ========== CreateProofRequest ==========

    #[test]
    fn test_create_proof_request_deserialize() {
        let json = r#"{
            "mentor_id": "mentor-1",
            "mentee_id": "mentee-1",
            "request_id": "req-1",
            "rating": 4,
            "comment": "Très bon travail"
        }"#;

        let req: CreateProofRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.mentor_id, "mentor-1");
        assert_eq!(req.rating, 4);
        assert_eq!(req.comment, "Très bon travail");
    }

    #[test]
    fn test_create_proof_request_deserialize_rating_max() {
        let json = r#"{
            "mentor_id": "m",
            "mentee_id": "me",
            "request_id": "r",
            "rating": 5,
            "comment": ""
        }"#;
        let req: CreateProofRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.rating, 5);
    }
}
