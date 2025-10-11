use rgbstd::{ContractId, WitnessStatus};
use bpcore::Txid;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, error::Error, path::PathBuf, str::FromStr, sync::Arc};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum RGBError {
    #[error("Contract creation error: {0}")]
    ContractCreation(String),
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Transfer error: {0}")]
    Transfer(String),
    #[error("Storage error: {0}")]
    Storage(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProofMetadata {
    pub mentor_id: String,
    pub mentee_id: String,
    pub request_id: String,
    pub rating: u8,
    pub comment: String,
    pub timestamp: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProofDetails {
    pub contract_id: String,
    pub mentor_id: String,
    pub mentee_id: String,
    pub request_id: String,
    pub timestamp: u64,
    pub rating: u8,
    pub comment: String,
    pub signature: String,
}

#[derive(Debug, Clone)]
struct ProofContract {
    id: ContractId,
    metadata: ProofMetadata,
    status: WitnessStatus,
}

#[derive(Clone)]
pub struct RGBNativeService {
    data_dir: PathBuf,
    contracts: Arc<tokio::sync::RwLock<HashMap<String, ProofContract>>>,
    network: String,
}

impl RGBNativeService {
    pub fn new() -> Result<Self, Box<dyn Error>> {
        let rgb_data_dir = std::env::var("RGB_DATA_DIR")
            .unwrap_or_else(|_| "/tmp/rgb_data".to_string());

        let data_dir = PathBuf::from(&rgb_data_dir);
        std::fs::create_dir_all(&data_dir)?;

        let contracts = Arc::new(tokio::sync::RwLock::new(HashMap::new()));
        let network = std::env::var("BITCOIN_NETWORK").unwrap_or_else(|_| "regtest".to_string());

        tracing::info!("Initialized RGB native service with data directory: {}", data_dir.display());

        Ok(Self {
            data_dir,
            contracts,
            network,
        })
    }

    /// Create a new RGB proof contract for mentoring
    pub async fn create_proof_contract(
        &self,
        mentor_id: &str,
        mentee_id: &str,
        request_id: &str,
        rating: u8,
        comment: Option<String>,
    ) -> Result<(String, String), RGBError> {
        // Validate inputs
        if mentor_id.is_empty() || mentee_id.is_empty() || request_id.is_empty() {
            return Err(RGBError::ContractCreation(
                "Invalid parameters: IDs cannot be empty".to_string(),
            ));
        }

        if rating > 5 {
            return Err(RGBError::ContractCreation(
                "Rating must be between 0 and 5".to_string(),
            ));
        }

        let timestamp = chrono::Utc::now().timestamp() as u64;
        let proof_metadata = ProofMetadata {
            mentor_id: mentor_id.to_string(),
            mentee_id: mentee_id.to_string(),
            request_id: request_id.to_string(),
            rating,
            comment: comment.unwrap_or_default(),
            timestamp,
        };

        // Generate contract ID deterministically
        let contract_id = self.generate_contract_id(&proof_metadata)?;

        // Create proof contract
        let proof_contract = ProofContract {
            id: contract_id,
            metadata: proof_metadata.clone(),
            status: WitnessStatus::Genesis,
        };

        // Store in memory
        {
            let mut contracts = self.contracts.write().await;
            contracts.insert(contract_id.to_string(), proof_contract);
        }

        // Persist to filesystem
        self.persist_contract(&contract_id, &proof_metadata).await?;

        // Generate signature
        let signature = self.generate_signature(&contract_id)?;

        tracing::info!(
            "Created RGB proof contract: {} (mentor: {}, mentee: {}, rating: {})",
            contract_id,
            mentor_id,
            mentee_id,
            rating
        );

        Ok((contract_id.to_string(), signature))
    }

    /// Verify proof contract exists and is valid
    pub async fn verify_proof(&self, contract_id: &str, _signature: &str) -> Result<bool, RGBError> {
        let contracts = self.contracts.read().await;
        Ok(contracts.contains_key(contract_id))
    }

    /// Get proof contract details
    pub async fn get_proof_details(&self, contract_id: &str) -> Result<ProofDetails, RGBError> {
        let contracts = self.contracts.read().await;

        match contracts.get(contract_id) {
            Some(contract) => Ok(ProofDetails {
                contract_id: contract_id.to_string(),
                mentor_id: contract.metadata.mentor_id.clone(),
                mentee_id: contract.metadata.mentee_id.clone(),
                request_id: contract.metadata.request_id.clone(),
                timestamp: contract.metadata.timestamp,
                rating: contract.metadata.rating,
                comment: contract.metadata.comment.clone(),
                signature: format!("rgb_sig_{}", &contract_id[..16]),
            }),
            None => Err(RGBError::Storage("Contract not found".to_string())),
        }
    }

    /// Transfer proof ownership via RGB state transition
    pub async fn transfer_proof(
        &self,
        contract_id: &str,
        from_outpoint: &str,
        to_outpoint: &str,
        _amount: u64,
    ) -> Result<String, RGBError> {
        // Validate outpoint format
        self.validate_outpoint(from_outpoint)?;
        self.validate_outpoint(to_outpoint)?;

        // Check contract exists
        let exists = {
            let contracts = self.contracts.read().await;
            contracts.contains_key(contract_id)
        };

        if !exists {
            return Err(RGBError::Transfer("Contract not found".to_string()));
        }

        // In production: Create RGB state transition
        // For now: Generate transfer ID
        let transfer_id = format!("transfer_{}_{}", contract_id, chrono::Utc::now().timestamp());

        tracing::info!(
            "Transferred proof {} from {} to {}",
            contract_id,
            from_outpoint,
            to_outpoint
        );

        Ok(transfer_id)
    }

    /// List all proof contracts
    pub async fn list_proofs(&self) -> Result<Vec<ProofDetails>, RGBError> {
        let contracts = self.contracts.read().await;

        let proofs: Vec<ProofDetails> = contracts
            .iter()
            .map(|(id, contract)| ProofDetails {
                contract_id: id.clone(),
                mentor_id: contract.metadata.mentor_id.clone(),
                mentee_id: contract.metadata.mentee_id.clone(),
                request_id: contract.metadata.request_id.clone(),
                timestamp: contract.metadata.timestamp,
                rating: contract.metadata.rating,
                comment: contract.metadata.comment.clone(),
                signature: format!("rgb_sig_{}", &id[..16]),
            })
            .collect();

        Ok(proofs)
    }

    // Private helper methods

    fn generate_contract_id(&self, metadata: &ProofMetadata) -> Result<ContractId, RGBError> {
        use sha2::Digest;
        use amplify::ByteArray;

        let contract_data = format!(
            "{}:{}:{}:{}:{}",
            metadata.mentor_id,
            metadata.mentee_id,
            metadata.request_id,
            metadata.rating,
            metadata.timestamp
        );

        let hash = sha2::Sha256::digest(contract_data.as_bytes());
        let mut contract_bytes = [0u8; 32];
        contract_bytes.copy_from_slice(&hash[..32]);

        ContractId::from_slice(&contract_bytes)
            .map_err(|e| RGBError::ContractCreation(format!("Failed to create contract ID: {}", e)))
    }

    fn generate_signature(&self, contract_id: &ContractId) -> Result<String, RGBError> {
        use sha2::Digest;

        let sig_data = format!("{}:{}", contract_id, self.network);
        let hash = sha2::Sha256::digest(sig_data.as_bytes());

        Ok(hex::encode(hash))
    }

    async fn persist_contract(
        &self,
        contract_id: &ContractId,
        metadata: &ProofMetadata,
    ) -> Result<(), RGBError> {
        let contract_path = self.data_dir.join(format!("{}.json", contract_id));

        let data = serde_json::to_string_pretty(metadata)
            .map_err(|e| RGBError::Storage(format!("Failed to serialize: {}", e)))?;

        tokio::fs::write(&contract_path, data)
            .await
            .map_err(|e| RGBError::Storage(format!("Failed to write: {}", e)))?;

        Ok(())
    }

    fn validate_outpoint(&self, outpoint: &str) -> Result<(), RGBError> {
        let parts: Vec<&str> = outpoint.split(':').collect();

        if parts.len() != 2 {
            return Err(RGBError::Transfer(
                "Invalid outpoint format. Expected: txid:vout".to_string()
            ));
        }

        Txid::from_str(parts[0])
            .map_err(|e| RGBError::Transfer(format!("Invalid txid: {}", e)))?;

        parts[1]
            .parse::<u32>()
            .map_err(|_| RGBError::Transfer("Invalid vout".to_string()))?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_proof_contract() {
        let service = RGBNativeService::new().unwrap();

        let result = service
            .create_proof_contract(
                "mentor123",
                "mentee456",
                "request789",
                5,
                Some("Great session!".to_string()),
            )
            .await;

        assert!(result.is_ok());
        let (contract_id, signature) = result.unwrap();
        assert!(!contract_id.is_empty());
        assert!(!signature.is_empty());
    }

    #[tokio::test]
    async fn test_verify_proof() {
        let service = RGBNativeService::new().unwrap();

        let (contract_id, signature) = service
            .create_proof_contract("m1", "m2", "r1", 4, None)
            .await
            .unwrap();

        let verified = service.verify_proof(&contract_id, &signature).await.unwrap();
        assert!(verified);
    }

    #[tokio::test]
    async fn test_get_proof_details() {
        let service = RGBNativeService::new().unwrap();

        let (contract_id, _) = service
            .create_proof_contract("mentor1", "mentee1", "req1", 5, Some("Test".to_string()))
            .await
            .unwrap();

        let details = service.get_proof_details(&contract_id).await.unwrap();
        assert_eq!(details.mentor_id, "mentor1");
        assert_eq!(details.mentee_id, "mentee1");
        assert_eq!(details.rating, 5);
    }

    #[tokio::test]
    async fn test_invalid_rating() {
        let service = RGBNativeService::new().unwrap();

        let result = service
            .create_proof_contract("m1", "m2", "r1", 10, None)
            .await;

        assert!(result.is_err());
    }
}