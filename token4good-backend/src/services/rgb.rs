use rgbstd::{ContractId, WitnessStatus};
use bpcore::Txid;
use sha2::Digest;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, error::Error, str::FromStr, path::PathBuf, sync::Arc};
use thiserror::Error;
use amplify::ByteArray;

#[derive(Error, Debug)]
pub enum RGBError {
    #[error("Contract creation error: {0}")]
    ContractCreation(String),
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Signature error: {0}")]
    Signature(String),
    #[error("Storage error: {0}")]
    Storage(String),
    #[error("Invalid configuration: {0}")]
    Configuration(String),
    #[error("Transfer error: {0}")]
    Transfer(String),
    #[error("Interface error: {0}")]
    Interface(String),
    #[error("CLI error: {0}")]
    CliError(String),
    #[error("Runtime error: {0}")]
    Runtime(String),
    #[error("Schema error: {0}")]
    Schema(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

// Token4Good mentoring proof schema constants
const MENTORING_SCHEMA_NAME: &str = "MentoringProof";
const _MENTORING_TICKER: &str = "T4G-PROOF";

#[derive(Clone)]
pub struct RGBService {
    data_dir: PathBuf,
    contracts: Arc<std::sync::Mutex<HashMap<String, ProofContract>>>,
    network: String,
}

#[derive(Debug, Clone)]
#[allow(dead_code)]
struct ProofContract {
    id: ContractId,
    metadata: ProofMetadata,
    status: WitnessStatus,
}

impl RGBService {
    pub fn new() -> Result<Self, Box<dyn Error>> {
        // Initialize RGB data directory
        let rgb_data_dir = std::env::var("RGB_DATA_DIR")
            .unwrap_or_else(|_| "/tmp/rgb_data".to_string());
        
        let data_dir = PathBuf::from(&rgb_data_dir);
        std::fs::create_dir_all(&data_dir)?;
        
        // Initialize in-memory storage for development
        let contracts = Arc::new(std::sync::Mutex::new(HashMap::new()));
        
        // Set network (regtest for development)
        let network = "regtest".to_string();
        
        tracing::info!("Initialized RGB service with data directory: {}", data_dir.display());
        
        Ok(Self {
            data_dir,
            contracts,
            network,
        })
    }
    
    pub async fn create_proof_contract(
        &self,
        mentor_id: &str,
        mentee_id: &str,
        request_id: &str,
        rating: u8,
        comment: Option<String>,
    ) -> Result<(String, String), RGBError> {
        // Validate input parameters
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
        
        // Create proof metadata
        let timestamp = chrono::Utc::now().timestamp() as u64;
        let proof_metadata = ProofMetadata {
            mentor_id: mentor_id.to_string(),
            mentee_id: mentee_id.to_string(),
            request_id: request_id.to_string(),
            rating,
            comment: comment.unwrap_or_default(),
            timestamp,
        };
        
        // Generate deterministic contract ID from metadata
        let contract_data = format!(
            "{}:{}:{}:{}:{}",
            mentor_id, mentee_id, request_id, rating, timestamp
        );
        let hash = sha2::Sha256::digest(contract_data.as_bytes());
        let mut contract_bytes = [0u8; 32];
        contract_bytes.copy_from_slice(&hash[..32]);
        let contract_id = ContractId::from_slice(&contract_bytes)
            .map_err(|e| RGBError::ContractCreation(format!("Failed to create contract ID: {}", e)))?;
        
        // Create a mock genesis operation for the proof
        // In a real implementation, this would use proper RGB genesis construction
        let _genesis_data = format!(
            "{{\"schema\": \"{}\", \"proof\": {}}}",
            MENTORING_SCHEMA_NAME,
            serde_json::to_string(&proof_metadata).map_err(|e| RGBError::Storage(e.to_string()))?
        );
        
        // Create proof contract
        let proof_contract = ProofContract {
            id: contract_id,
            metadata: proof_metadata.clone(),
            status: WitnessStatus::Genesis,
        };
        
        // Store in contracts map
        {
            let mut contracts = self.contracts.lock().map_err(|e| {
                RGBError::Storage(format!("Failed to lock contracts: {}", e))
            })?;
            contracts.insert(contract_id.to_string(), proof_contract);
        }
        
        // Persist to filesystem (simplified)
        self.persist_contract(contract_id)?;
        
        // Generate signature
        let signature = self.generate_signature(&contract_id, &proof_metadata)?;
        
        tracing::info!(
            "Created RGB proof contract: {} for mentor: {}, mentee: {}, rating: {}",
            contract_id,
            mentor_id,
            mentee_id,
            rating
        );
        
        Ok((contract_id.to_string(), signature))
    }
    
    pub async fn verify_proof(
        &self,
        contract_id: &str,
        _signature: &str,
    ) -> Result<bool, RGBError> {
        // Parse contract ID
        let contract_id = ContractId::from_str(contract_id)
            .map_err(|e| RGBError::Validation(format!("Invalid contract ID: {}", e)))?;
        
        // Check if contract exists
        let exists = {
            let contracts = self.contracts.lock().map_err(|e| {
                RGBError::Storage(format!("Failed to lock contracts: {}", e))
            })?;
            contracts.contains_key(&contract_id.to_string())
        };
        
        if !exists {
            return Ok(false);
        }
        
        // In a real implementation, this would validate the contract state
        // using RGB consensus rules
        Ok(true)
    }
    
    pub async fn get_proof_details(&self, contract_id: &str) -> Result<ProofDetails, RGBError> {
        // Parse contract ID
        let _contract_id_parsed = ContractId::from_str(contract_id)
            .map_err(|e| RGBError::Validation(format!("Invalid contract ID: {}", e)))?;
        
        // Get contract from storage
        let proof_contract = {
            let contracts = self.contracts.lock().map_err(|e| {
                RGBError::Storage(format!("Failed to lock contracts: {}", e))
            })?;
            contracts.get(contract_id).cloned()
        };
        
        match proof_contract {
            Some(contract) => {
                Ok(ProofDetails {
                    mentor_id: contract.metadata.mentor_id,
                    mentee_id: contract.metadata.mentee_id,
                    request_id: contract.metadata.request_id,
                    timestamp: contract.metadata.timestamp,
                    rating: contract.metadata.rating,
                    comment: contract.metadata.comment,
                    contract_id: contract_id.to_string(),
                    signature: format!("rgb_sig_{}", &contract_id[..16]),
                })
            }
            None => Err(RGBError::Storage("Contract not found".to_string())),
        }
    }
    
    pub async fn transfer_proof(
        &self,
        contract_id: &str,
        from_outpoint: &str,
        to_outpoint: &str,
        amount: u64,
    ) -> Result<String, RGBError> {
        // Parse contract ID
        let _contract_id_parsed = ContractId::from_str(contract_id)
            .map_err(|e| RGBError::Transfer(format!("Invalid contract ID: {}", e)))?;
        
        // Validate outpoint format
        let from_parts: Vec<&str> = from_outpoint.split(':').collect();
        let to_parts: Vec<&str> = to_outpoint.split(':').collect();
        
        if from_parts.len() != 2 || to_parts.len() != 2 {
            return Err(RGBError::Transfer(
                "Invalid outpoint format. Expected: txid:vout".to_string()
            ));
        }
        
        // Validate transaction IDs
        let _from_txid = Txid::from_str(from_parts[0])
            .map_err(|e| RGBError::Transfer(format!("Invalid from txid: {}", e)))?;
        let _to_txid = Txid::from_str(to_parts[0])
            .map_err(|e| RGBError::Transfer(format!("Invalid to txid: {}", e)))?;
        
        // Create a mock transition for the transfer
        let transition_data = format!(
            "{{\"from\": \"{}\", \"to\": \"{}\", \"amount\": {}}}",
            from_outpoint, to_outpoint, amount
        );
        
        let _transition = self.create_mock_transition(&transition_data)?;
        let transfer_id = format!("transfer_{}", uuid::Uuid::new_v4());
        
        // Update contract status (simplified)
        {
            let mut contracts = self.contracts.lock().map_err(|e| {
                RGBError::Storage(format!("Failed to lock contracts: {}", e))
            })?;
            
            if let Some(contract) = contracts.get_mut(contract_id) {
                contract.status = WitnessStatus::from([1u8, 0, 0, 0, 0, 0, 0, 0]);
            } else {
                return Err(RGBError::Transfer("Contract not found".to_string()));
            }
        }
        
        tracing::info!(
            "Created RGB transfer {} for contract {} from {} to {} (amount: {})",
            transfer_id,
            contract_id,
            from_outpoint,
            to_outpoint,
            amount
        );
        
        Ok(transfer_id)
    }
    
    pub async fn get_contract_history(
        &self,
        contract_id: &str,
    ) -> Result<Vec<TransferRecord>, RGBError> {
        // Parse contract ID
        let _contract_id = ContractId::from_str(contract_id)
            .map_err(|e| RGBError::Validation(format!("Invalid contract ID: {}", e)))?;
        
        // Get contract from storage
        let proof_contract = {
            let contracts = self.contracts.lock().map_err(|e| {
                RGBError::Storage(format!("Failed to lock contracts: {}", e))
            })?;
            contracts.get(contract_id).cloned()
        };
        
        match proof_contract {
            Some(contract) => {
                // Convert transitions to transfer records
                let mut records = Vec::new();
                
                // Add genesis as initial record
                records.push(TransferRecord {
                    from: "genesis".to_string(),
                    to: "initial_owner".to_string(),
                    timestamp: contract.metadata.timestamp,
                    txid: "genesis_operation".to_string(),
                });
                
                // Add mock transition
                records.push(TransferRecord {
                    from: "owner_0".to_string(),
                    to: "owner_1".to_string(),
                    timestamp: chrono::Utc::now().timestamp() as u64,
                    txid: "transition_0".to_string(),
                });
                
                Ok(records)
            }
            None => Err(RGBError::Storage("Contract not found".to_string())),
        }
    }
    
    pub async fn list_proofs(&self) -> Result<Vec<ProofDetails>, RGBError> {
        let contracts = self.contracts.lock().map_err(|e| {
            RGBError::Storage(format!("Failed to lock contracts: {}", e))
        })?;

        let proofs = contracts.iter().map(|(contract_id, contract)| {
            ProofDetails {
                mentor_id: contract.metadata.mentor_id.clone(),
                mentee_id: contract.metadata.mentee_id.clone(),
                request_id: contract.metadata.request_id.clone(),
                timestamp: contract.metadata.timestamp,
                rating: contract.metadata.rating,
                comment: contract.metadata.comment.clone(),
                contract_id: contract_id.clone(),
                signature: format!("rgb_sig_{}", &contract_id[..16]),
            }
        }).collect();

        Ok(proofs)
    }

    pub async fn health_check(&self) -> Result<(), RGBError> {
        // Check if data directory exists and is writable
        if !self.data_dir.exists() {
            return Err(RGBError::Configuration(
                format!("RGB data directory does not exist: {}", self.data_dir.display())
            ));
        }

        // Test write access
        let test_file = self.data_dir.join("health_check.tmp");
        std::fs::write(&test_file, "test").map_err(|e| {
            RGBError::Configuration(format!("Cannot write to RGB data directory: {}", e))
        })?;
        std::fs::remove_file(test_file).map_err(|e| {
            RGBError::Configuration(format!("Cannot delete from RGB data directory: {}", e))
        })?;

        // Check contracts storage
        let _contracts = self.contracts.lock().map_err(|e| {
            RGBError::Configuration(format!("Cannot access contracts storage: {}", e))
        })?;

        Ok(())
    }
    
    fn create_mock_genesis(&self, _contract_id: ContractId, _data: &str) -> Result<String, RGBError> {
        // Return a mock genesis identifier
        Ok(format!("genesis_{}", uuid::Uuid::new_v4()))
    }
    
    fn create_mock_transition(&self, _data: &str) -> Result<String, RGBError> {
        // Return a mock transition identifier
        Ok(format!("transition_{}", uuid::Uuid::new_v4()))
    }
    
    fn persist_contract(&self, contract_id: ContractId) -> Result<(), RGBError> {
        // Persist contract to filesystem
        let contract_file = self.data_dir.join(format!("{}.rgb", contract_id));
        
        // Serialize genesis data (simplified for development)
        let data = format!(
            "{{\"contract_id\": \"{}\", \"timestamp\": {}}}",
            contract_id,
            chrono::Utc::now().timestamp()
        );
        
        std::fs::write(contract_file, data)?;
        
        Ok(())
    }
    
    fn generate_signature(&self, contract_id: &ContractId, metadata: &ProofMetadata) -> Result<String, RGBError> {
        // In production, this would use proper secp256k1 signing
        // For now, create a deterministic signature
        let sig_data = format!(
            "{}:{}:{}:{}:{}",
            contract_id,
            metadata.mentor_id,
            metadata.mentee_id,
            metadata.timestamp,
            self.network
        );
        let sig_hash = sha2::Sha256::digest(sig_data.as_bytes());
        Ok(format!("rgb_sig_{}", hex::encode(&sig_hash[..16])))
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProofDetails {
    pub mentor_id: String,
    pub mentee_id: String,
    pub request_id: String,
    pub timestamp: u64,
    pub rating: u8,
    pub comment: String,
    pub contract_id: String,
    pub signature: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransferRecord {
    pub from: String,
    pub to: String,
    pub timestamp: u64,
    pub txid: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ProofMetadata {
    mentor_id: String,
    mentee_id: String,
    request_id: String,
    rating: u8,
    comment: String,
    timestamp: u64,
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_rgb_service_initialization() {
        let service = RGBService::new();
        assert!(service.is_ok(), "RGB service should initialize successfully");
    }
    
    #[tokio::test]
    async fn test_create_proof_contract_with_rgb_types() {
        let service = RGBService::new().expect("Failed to create RGB service");
        
        let result = service
            .create_proof_contract(
                "mentor_rgb",
                "mentee_rgb", 
                "request_rgb",
                4,
                Some("RGB-native proof with real types".to_string()),
            )
            .await;
        
        assert!(result.is_ok(), "Should create RGB contract using real types");
        let (contract_id, signature) = result.unwrap();
        assert!(!contract_id.is_empty());
        assert!(signature.starts_with("rgb_sig_"));
    }
    
    #[tokio::test]
    async fn test_verify_proof_with_storage() {
        let service = RGBService::new().expect("Failed to create RGB service");
        
        // Create a proof first
        let (contract_id, signature) = service
            .create_proof_contract(
                "mentor_test",
                "mentee_test",
                "request_test",
                5,
                None,
            )
            .await
            .expect("Failed to create proof");
        
        // Verify the proof exists in storage
        let result = service.verify_proof(&contract_id, &signature).await;
        assert!(result.is_ok());
        assert!(result.unwrap(), "Proof should be valid");
    }
    
    #[tokio::test]
    async fn test_get_proof_details_from_storage() {
        let service = RGBService::new().expect("Failed to create RGB service");
        
        // Create a proof
        let (contract_id, _) = service
            .create_proof_contract(
                "mentor_detail",
                "mentee_detail",
                "request_detail",
                3,
                Some("Detailed proof".to_string()),
            )
            .await
            .expect("Failed to create proof");
        
        // Get proof details
        let details = service.get_proof_details(&contract_id).await;
        assert!(details.is_ok());
        
        let proof_details = details.unwrap();
        assert_eq!(proof_details.mentor_id, "mentor_detail");
        assert_eq!(proof_details.mentee_id, "mentee_detail");
        assert_eq!(proof_details.rating, 3);
    }
    
    #[tokio::test]
    async fn test_transfer_proof_with_transitions() {
        let service = RGBService::new().expect("Failed to create RGB service");
        
        // Create a proof
        let (contract_id, _) = service
            .create_proof_contract(
                "mentor_transfer",
                "mentee_transfer",
                "request_transfer",
                5,
                None,
            )
            .await
            .expect("Failed to create proof");
        
        // Test transfer
        let from_outpoint = "0000000000000000000000000000000000000000000000000000000000000001:0";
        let to_outpoint = "0000000000000000000000000000000000000000000000000000000000000002:1";
        
        let result = service.transfer_proof(&contract_id, from_outpoint, to_outpoint, 1).await;
        assert!(result.is_ok());
        
        let transfer_id = result.unwrap();
        assert!(transfer_id.starts_with("transfer_"));
    }
    
    #[tokio::test]
    async fn test_contract_history_with_transitions() {
        let service = RGBService::new().expect("Failed to create RGB service");
        
        // Create a proof
        let (contract_id, _) = service
            .create_proof_contract(
                "mentor_history",
                "mentee_history",
                "request_history",
                4,
                None,
            )
            .await
            .expect("Failed to create proof");
        
        // Add a transfer
        let _ = service.transfer_proof(
            &contract_id,
            "0000000000000000000000000000000000000000000000000000000000000001:0",
            "0000000000000000000000000000000000000000000000000000000000000002:1",
            1
        ).await.expect("Failed to create transfer");
        
        // Get history
        let history = service.get_contract_history(&contract_id).await;
        assert!(history.is_ok());
        
        let records = history.unwrap();
        assert!(records.len() >= 2); // Genesis + at least one transfer
    }
    
    #[tokio::test]
    async fn test_rgb_health_check() {
        let service = RGBService::new().expect("Failed to create RGB service");
        
        let health = service.health_check().await;
        assert!(health.is_ok(), "RGB service should be healthy");
    }
}