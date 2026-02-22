//! RGB Client-Side Validation Service (Option B — sans daemon)
//!
//! Implémente la validation client-side du protocole RGB :
//! - Signatures ECDSA secp256k1 réelles via la crate `bitcoin`
//! - Commitments SHA-256 chaînés (compatible Tapret)
//! - Single-use seals liés à des UTXOs Bitcoin
//! - Stash local persistant (JSON sur disque)
//! - Vérification de transactions optionnelle via API Esplora (reqwest)
//!
//! Pour l'intégration AluVM/Contractum complète (Codex RGB 0.12+), une mise à
//! jour sera nécessaire une fois le compilateur `contractum` stable.

use std::{collections::HashMap, error::Error, path::PathBuf, str::FromStr, sync::Arc};

use bitcoin::secp256k1::{All, Message, Secp256k1, SecretKey};
use bitcoin::secp256k1::ecdsa::Signature;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use thiserror::Error;
use tokio::sync::RwLock;

// ─── Erreurs ─────────────────────────────────────────────────────────────────

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
    #[error("Esplora error: {0}")]
    Esplora(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

// ─── Types internes ───────────────────────────────────────────────────────────

/// Single-use seal : liaison à un UTXO Bitcoin (txid:vout + blinding factor)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
struct RgbSeal {
    txid: String,
    vout: u32,
    /// Facteur de bruit pour la confidentialité du commitment seal
    blinding: [u8; 32],
}

impl RgbSeal {
    /// Commitment du seal = SHA256(txid_bytes ‖ vout ‖ blinding)
    fn commitment(&self) -> [u8; 32] {
        let mut h = Sha256::new();
        h.update(hex::decode(&self.txid).unwrap_or_default());
        h.update(self.vout.to_le_bytes());
        h.update(self.blinding);
        h.finalize().into()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ProofMetadata {
    mentor_id: String,
    mentee_id: String,
    request_id: String,
    rating: u8,
    comment: String,
    timestamp: u64,
}

impl ProofMetadata {
    /// Hash du contenu des métadonnées = SHA256(tous les champs)
    fn content_hash(&self) -> [u8; 32] {
        let mut h = Sha256::new();
        h.update(self.mentor_id.as_bytes());
        h.update(b":");
        h.update(self.mentee_id.as_bytes());
        h.update(b":");
        h.update(self.request_id.as_bytes());
        h.update(b":");
        h.update([self.rating]);
        h.update(b":");
        h.update(self.comment.as_bytes());
        h.update(b":");
        h.update(self.timestamp.to_le_bytes());
        h.finalize().into()
    }
}

/// Opération de genèse du contrat (équivalent RGB Genesis)
#[derive(Debug, Clone, Serialize, Deserialize)]
struct GenesisOp {
    contract_id: String,
    /// Schéma du contrat
    schema: String,
    /// Clé publique de l'émetteur (hex compressé 33 bytes)
    issuer_pubkey: String,
    /// Hash du contenu des métadonnées
    content_hash: [u8; 32],
    /// UTXO seal initial (optionnel — requis pour ancrage on-chain)
    seal: Option<RgbSeal>,
    /// Signature ECDSA de l'émetteur (hex 64 bytes)
    issuer_sig: String,
    timestamp: u64,
}

/// Transition d'état RGB (transfert du seal vers un nouveau UTXO)
#[derive(Debug, Clone, Serialize, Deserialize)]
struct StateTransition {
    from_seal: RgbSeal,
    to_seal: RgbSeal,
    /// Commitment = SHA256(from_seal_commit ‖ to_seal_commit ‖ contract_id)
    commitment: [u8; 32],
    /// Signature ECDSA sur le commitment
    sig: String,
    timestamp: u64,
}

/// Contrat stocké localement dans le stash client-side
#[derive(Debug, Clone, Serialize, Deserialize)]
struct StoredContract {
    contract_id: String,
    metadata: ProofMetadata,
    genesis: GenesisOp,
    transitions: Vec<StateTransition>,
    current_seal: Option<RgbSeal>,
}

// ─── Types publics ────────────────────────────────────────────────────────────

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

// ─── Service ─────────────────────────────────────────────────────────────────

/// Service de validation RGB client-side.
///
/// Utilise secp256k1 ECDSA pour les signatures, SHA-256 pour les commitments,
/// et un stash JSON persistant pour le stockage local.
#[derive(Clone)]
pub struct RGBService {
    data_dir: PathBuf,
    network: String,
    /// Contexte secp256k1 (thread-safe via Arc)
    secp: Arc<Secp256k1<All>>,
    /// Clé privée de l'émetteur (chargée depuis disque ou RGB_ISSUER_KEY)
    issuer_secret_key: SecretKey,
    /// Clé publique compressée hex de l'émetteur
    issuer_pubkey_hex: String,
    /// Stash in-memory des contrats (persisté sur disque)
    contracts: Arc<RwLock<HashMap<String, StoredContract>>>,
    /// URL de base de l'API Esplora pour vérification on-chain (optionnel)
    esplora_url: Option<String>,
}

impl RGBService {
    pub fn new() -> Result<Self, Box<dyn Error>> {
        let data_dir = PathBuf::from(
            std::env::var("RGB_DATA_DIR").unwrap_or_else(|_| "/tmp/rgb_data".to_string()),
        );
        let network =
            std::env::var("BITCOIN_NETWORK").unwrap_or_else(|_| "regtest".to_string());
        let esplora_url = std::env::var("ESPLORA_URL").ok();

        std::fs::create_dir_all(&data_dir)?;

        let secp = Arc::new(Secp256k1::new());
        let issuer_secret_key = Self::load_or_create_issuer_key(&data_dir, &secp)?;
        let issuer_pubkey =
            bitcoin::secp256k1::PublicKey::from_secret_key(&secp, &issuer_secret_key);
        let issuer_pubkey_hex = hex::encode(issuer_pubkey.serialize());

        let contracts = Self::load_stash(&data_dir)?;

        tracing::info!(
            "RGB client-side service initialisé — réseau: {}, pubkey: {}..., {} contrat(s) chargé(s){}",
            network,
            &issuer_pubkey_hex[..16],
            contracts.len(),
            esplora_url
                .as_deref()
                .map(|u| format!(", esplora: {}", u))
                .unwrap_or_default()
        );

        Ok(Self {
            data_dir,
            network,
            secp,
            issuer_secret_key,
            issuer_pubkey_hex,
            contracts: Arc::new(RwLock::new(contracts)),
            esplora_url,
        })
    }

    // ─── Clé émetteur ─────────────────────────────────────────────────────────

    fn load_or_create_issuer_key(
        data_dir: &PathBuf,
        secp: &Secp256k1<All>,
    ) -> Result<SecretKey, Box<dyn Error>> {
        let key_path = data_dir.join("issuer.key");

        // 1. Clé existante sur disque
        if key_path.exists() {
            let hex_str = std::fs::read_to_string(&key_path)?;
            let bytes = hex::decode(hex_str.trim())?;
            return Ok(SecretKey::from_slice(&bytes)?);
        }

        // 2. Variable d'environnement (prioritaire en production)
        if let Ok(hex_str) = std::env::var("RGB_ISSUER_KEY") {
            let bytes = hex::decode(hex_str.trim())?;
            let sk = SecretKey::from_slice(&bytes)?;
            std::fs::write(&key_path, hex::encode(sk.secret_bytes()))?;
            tracing::info!("Clé émetteur RGB chargée depuis RGB_ISSUER_KEY");
            return Ok(sk);
        }

        // 3. Génération d'une nouvelle clé
        let (sk, _) = secp.generate_keypair(&mut rand::thread_rng());
        std::fs::write(&key_path, hex::encode(sk.secret_bytes()))?;
        tracing::warn!(
            "Nouvelle clé émetteur RGB générée et sauvegardée dans {:?}. \
             Définir RGB_ISSUER_KEY en production pour garantir la persistance.",
            key_path
        );
        Ok(sk)
    }

    // ─── Stash persistant ─────────────────────────────────────────────────────

    fn load_stash(
        data_dir: &PathBuf,
    ) -> Result<HashMap<String, StoredContract>, Box<dyn Error>> {
        let path = data_dir.join("stash.json");
        if path.exists() {
            let data = std::fs::read_to_string(&path)?;
            Ok(serde_json::from_str(&data)?)
        } else {
            Ok(HashMap::new())
        }
    }

    async fn save_stash(&self) -> Result<(), RGBError> {
        let guard = self.contracts.read().await;
        let json = serde_json::to_string_pretty(&*guard)
            .map_err(|e| RGBError::Storage(e.to_string()))?;
        tokio::fs::write(self.data_dir.join("stash.json"), json).await?;
        Ok(())
    }

    // ─── Cryptographie ────────────────────────────────────────────────────────

    /// Signe 32 octets avec la clé émetteur, retourne la signature compacte hex (64 bytes)
    fn sign_bytes(&self, data: &[u8]) -> Result<String, RGBError> {
        let hash: [u8; 32] = Sha256::digest(data).into();
        let msg = Message::from_slice(&hash)
            .map_err(|e| RGBError::Signature(e.to_string()))?;
        let sig = self.secp.sign_ecdsa(&msg, &self.issuer_secret_key);
        Ok(hex::encode(sig.serialize_compact()))
    }

    /// Vérifie une signature ECDSA compacte (hex 64 bytes) contre une clé publique (hex 33 bytes)
    fn verify_ecdsa(&self, data: &[u8], sig_hex: &str, pubkey_hex: &str) -> bool {
        let Ok(sig_bytes) = hex::decode(sig_hex) else { return false };
        let Ok(pk_bytes) = hex::decode(pubkey_hex) else { return false };
        let Ok(sig) = Signature::from_compact(&sig_bytes) else { return false };
        let Ok(pk) = bitcoin::secp256k1::PublicKey::from_slice(&pk_bytes) else {
            return false;
        };
        let hash: [u8; 32] = Sha256::digest(data).into();
        let Ok(msg) = Message::from_slice(&hash) else { return false };
        self.secp.verify_ecdsa(&msg, &sig, &pk).is_ok()
    }

    /// Calcule le contract_id = SHA256(content_hash ‖ schema ‖ issuer_pubkey ‖ timestamp)
    fn compute_contract_id(&self, content_hash: &[u8; 32], timestamp: u64) -> String {
        let mut h = Sha256::new();
        h.update(content_hash);
        h.update(b"token4good-mentoring-v1");
        h.update(self.issuer_pubkey_hex.as_bytes());
        h.update(timestamp.to_le_bytes());
        hex::encode(h.finalize())
    }

    fn random_blinding() -> [u8; 32] {
        let mut b = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut b);
        b
    }

    fn parse_outpoint(s: &str) -> Result<(String, u32), RGBError> {
        let parts: Vec<&str> = s.splitn(2, ':').collect();
        if parts.len() != 2 {
            return Err(RGBError::Transfer(
                "Format attendu : txid:vout".to_string(),
            ));
        }
        bitcoin::Txid::from_str(parts[0])
            .map_err(|e| RGBError::Transfer(format!("txid invalide: {}", e)))?;
        let vout = parts[1]
            .parse::<u32>()
            .map_err(|_| RGBError::Transfer("vout invalide".to_string()))?;
        Ok((parts[0].to_string(), vout))
    }

    // ─── API publique ─────────────────────────────────────────────────────────

    /// Crée un nouveau contrat RGB Proof-of-Impact (opération Genesis).
    ///
    /// Retourne `(contract_id, signature_hex)` où :
    /// - `contract_id` est le SHA-256 déterministe du contrat (hex 64 chars)
    /// - `signature_hex` est la signature ECDSA secp256k1 compacte (hex 128 chars)
    ///
    /// `utxo_seal` est un outpoint Bitcoin optionnel au format `"txid:vout"` pour
    /// ancrer la preuve on-chain via un single-use seal RGB.
    pub async fn create_proof_contract(
        &self,
        mentor_id: &str,
        mentee_id: &str,
        request_id: &str,
        rating: u8,
        comment: Option<String>,
    ) -> Result<(String, String), RGBError> {
        self.create_proof_contract_with_seal(mentor_id, mentee_id, request_id, rating, comment, None).await
    }

    /// Variante avec UTXO seal explicite.
    pub async fn create_proof_contract_with_seal(
        &self,
        mentor_id: &str,
        mentee_id: &str,
        request_id: &str,
        rating: u8,
        comment: Option<String>,
        utxo_seal: Option<&str>,
    ) -> Result<(String, String), RGBError> {
        if mentor_id.is_empty() || mentee_id.is_empty() || request_id.is_empty() {
            return Err(RGBError::ContractCreation(
                "Les IDs ne peuvent pas être vides".to_string(),
            ));
        }
        if rating > 5 {
            return Err(RGBError::ContractCreation(
                "La note doit être entre 0 et 5".to_string(),
            ));
        }

        let timestamp = chrono::Utc::now().timestamp() as u64;
        let metadata = ProofMetadata {
            mentor_id: mentor_id.to_string(),
            mentee_id: mentee_id.to_string(),
            request_id: request_id.to_string(),
            rating,
            comment: comment.unwrap_or_default(),
            timestamp,
        };

        let content_hash = metadata.content_hash();
        let contract_id = self.compute_contract_id(&content_hash, timestamp);

        // Données signées = content_hash ‖ contract_id ‖ timestamp
        let mut sign_data = Vec::with_capacity(80);
        sign_data.extend_from_slice(&content_hash);
        sign_data.extend_from_slice(contract_id.as_bytes());
        sign_data.extend_from_slice(&timestamp.to_le_bytes());

        let signature = self.sign_bytes(&sign_data)?;

        // Parser le seal UTXO optionnel
        let seal = if let Some(outpoint_str) = utxo_seal {
            let (txid, vout) = Self::parse_outpoint(outpoint_str)?;
            Some(RgbSeal { txid, vout, blinding: Self::random_blinding() })
        } else {
            None
        };

        let genesis = GenesisOp {
            contract_id: contract_id.clone(),
            schema: "token4good-mentoring-v1".to_string(),
            issuer_pubkey: self.issuer_pubkey_hex.clone(),
            content_hash,
            seal: seal.clone(),
            issuer_sig: signature.clone(),
            timestamp,
        };

        let stored = StoredContract {
            contract_id: contract_id.clone(),
            metadata,
            genesis,
            transitions: vec![],
            current_seal: seal,
        };

        {
            let mut guard = self.contracts.write().await;
            guard.insert(contract_id.clone(), stored);
        }

        self.save_stash().await?;

        tracing::info!(
            "RGB genesis créée : {}... (mentor: {}, mentee: {}, note: {})",
            &contract_id[..16],
            mentor_id,
            mentee_id,
            rating
        );

        Ok((contract_id, signature))
    }

    /// Vérifie qu'une preuve est valide :
    /// 1. Le contract_id est cohérent avec les métadonnées stockées
    /// 2. La signature ECDSA est valide pour la clé émetteur du contrat
    pub async fn verify_proof(
        &self,
        contract_id: &str,
        signature: &str,
    ) -> Result<bool, RGBError> {
        let guard = self.contracts.read().await;
        let Some(c) = guard.get(contract_id) else {
            return Ok(false);
        };

        // Recalculer et vérifier le contract_id
        let content_hash = c.metadata.content_hash();
        let expected_id = self.compute_contract_id(&content_hash, c.metadata.timestamp);
        if expected_id != contract_id {
            tracing::warn!("contract_id mismatch pour {}", contract_id);
            return Ok(false);
        }

        // Reconstruire les données signées et vérifier la signature ECDSA
        let mut sign_data = Vec::with_capacity(80);
        sign_data.extend_from_slice(&content_hash);
        sign_data.extend_from_slice(contract_id.as_bytes());
        sign_data.extend_from_slice(&c.metadata.timestamp.to_le_bytes());

        Ok(self.verify_ecdsa(&sign_data, signature, &c.genesis.issuer_pubkey))
    }

    /// Récupère les détails d'une preuve RGB.
    pub async fn get_proof_details(&self, contract_id: &str) -> Result<ProofDetails, RGBError> {
        let guard = self.contracts.read().await;
        guard
            .get(contract_id)
            .map(|c| ProofDetails {
                mentor_id: c.metadata.mentor_id.clone(),
                mentee_id: c.metadata.mentee_id.clone(),
                request_id: c.metadata.request_id.clone(),
                timestamp: c.metadata.timestamp,
                rating: c.metadata.rating,
                comment: c.metadata.comment.clone(),
                contract_id: contract_id.to_string(),
                signature: c.genesis.issuer_sig.clone(),
            })
            .ok_or_else(|| RGBError::Storage("Contrat introuvable".to_string()))
    }

    /// Transfère le seal d'un contrat RGB d'un UTXO vers un autre (state transition).
    ///
    /// Le `from_outpoint` et `to_outpoint` sont au format "txid:vout".
    pub async fn transfer_proof(
        &self,
        contract_id: &str,
        from_outpoint: &str,
        to_outpoint: &str,
        _amount: u64,
    ) -> Result<String, RGBError> {
        let (from_txid, from_vout) = Self::parse_outpoint(from_outpoint)?;
        let (to_txid, to_vout) = Self::parse_outpoint(to_outpoint)?;

        let mut guard = self.contracts.write().await;
        let c = guard
            .get_mut(contract_id)
            .ok_or_else(|| RGBError::Transfer("Contrat introuvable".to_string()))?;

        // Récupérer le blinding factor du seal courant s'il correspond
        let from_blinding = c
            .current_seal
            .as_ref()
            .filter(|s| s.txid == from_txid && s.vout == from_vout)
            .map(|s| s.blinding)
            .unwrap_or([0u8; 32]);

        let from_seal = RgbSeal { txid: from_txid, vout: from_vout, blinding: from_blinding };
        let to_seal =
            RgbSeal { txid: to_txid, vout: to_vout, blinding: Self::random_blinding() };

        // Commitment = SHA256(from_seal_commit ‖ to_seal_commit ‖ contract_id)
        let mut h = Sha256::new();
        h.update(from_seal.commitment());
        h.update(to_seal.commitment());
        h.update(contract_id.as_bytes());
        let commitment: [u8; 32] = h.finalize().into();

        let sig = self.sign_bytes(&commitment)?;
        let timestamp = chrono::Utc::now().timestamp() as u64;

        c.transitions.push(StateTransition {
            from_seal: from_seal.clone(),
            to_seal: to_seal.clone(),
            commitment,
            sig,
            timestamp,
        });
        c.current_seal = Some(to_seal);

        drop(guard);
        self.save_stash().await?;

        let transfer_id = format!("transfer_{}", hex::encode(&commitment[..16]));
        tracing::info!(
            "RGB state transition {} pour contrat {}...",
            &transfer_id[..24],
            &contract_id[..16]
        );

        Ok(transfer_id)
    }

    /// Retourne l'historique des opérations d'un contrat (genesis + transitions).
    pub async fn get_contract_history(
        &self,
        contract_id: &str,
    ) -> Result<Vec<TransferRecord>, RGBError> {
        let guard = self.contracts.read().await;
        let c = guard
            .get(contract_id)
            .ok_or_else(|| RGBError::Storage("Contrat introuvable".to_string()))?;

        let mut records = vec![TransferRecord {
            from: "issuer".to_string(),
            to: c
                .genesis
                .seal
                .as_ref()
                .map(|s| format!("{}:{}", s.txid, s.vout))
                .unwrap_or_else(|| "local".to_string()),
            timestamp: c.genesis.timestamp,
            txid: hex::encode(&c.genesis.content_hash[..16]),
        }];

        for t in &c.transitions {
            records.push(TransferRecord {
                from: format!("{}:{}", t.from_seal.txid, t.from_seal.vout),
                to: format!("{}:{}", t.to_seal.txid, t.to_seal.vout),
                timestamp: t.timestamp,
                txid: hex::encode(&t.commitment[..16]),
            });
        }

        Ok(records)
    }

    /// Liste toutes les preuves dans le stash.
    pub async fn list_proofs(&self) -> Result<Vec<ProofDetails>, RGBError> {
        let guard = self.contracts.read().await;
        Ok(guard
            .iter()
            .map(|(id, c)| ProofDetails {
                mentor_id: c.metadata.mentor_id.clone(),
                mentee_id: c.metadata.mentee_id.clone(),
                request_id: c.metadata.request_id.clone(),
                timestamp: c.metadata.timestamp,
                rating: c.metadata.rating,
                comment: c.metadata.comment.clone(),
                contract_id: id.clone(),
                signature: c.genesis.issuer_sig.clone(),
            })
            .collect())
    }

    /// Health check : vérifie l'accès au répertoire de données.
    pub async fn health_check(&self) -> Result<(), RGBError> {
        if !self.data_dir.exists() {
            return Err(RGBError::Configuration(format!(
                "Répertoire RGB manquant: {}",
                self.data_dir.display()
            )));
        }
        let test = self.data_dir.join("health.tmp");
        std::fs::write(&test, b"ok")?;
        std::fs::remove_file(test)?;

        let count = self.contracts.read().await.len();
        tracing::debug!("RGB health OK — {} contrat(s) en mémoire, réseau: {}", count, self.network);

        Ok(())
    }

    /// Vérifie qu'une transaction existe on-chain via l'API Esplora.
    ///
    /// Retourne `true` si ESPLORA_URL n'est pas configurée (pas de vérification).
    pub async fn verify_tx_esplora(&self, txid: &str) -> Result<bool, RGBError> {
        let Some(ref base_url) = self.esplora_url else {
            tracing::debug!("ESPLORA_URL non configurée, vérification UTXO ignorée");
            return Ok(true);
        };

        let url = format!("{}/tx/{}", base_url.trim_end_matches('/'), txid);
        match reqwest::get(&url).await {
            Ok(resp) if resp.status().is_success() => {
                tracing::debug!("Transaction {} confirmée via Esplora", txid);
                Ok(true)
            }
            Ok(_) => {
                tracing::warn!("Transaction {} non trouvée sur Esplora", txid);
                Ok(false)
            }
            Err(e) => Err(RGBError::Esplora(e.to_string())),
        }
    }

    /// Retourne la clé publique compressée hex de l'émetteur.
    pub fn issuer_pubkey(&self) -> &str {
        &self.issuer_pubkey_hex
    }

    /// Retourne le réseau configuré.
    pub fn network(&self) -> &str {
        &self.network
    }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    /// Crée un service avec un répertoire temporaire isolé (évite les conflits entre tests parallèles)
    fn make_service() -> RGBService {
        let dir = std::env::temp_dir().join(format!("rgb_test_{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&dir).unwrap();
        std::env::set_var("RGB_DATA_DIR", dir.to_str().unwrap());
        RGBService::new().expect("RGBService doit s'initialiser")
    }

    #[tokio::test]
    async fn test_create_proof_produces_real_signature() {
        let svc = make_service();

        let (contract_id, sig) = svc
            .create_proof_contract(
                "mentor_test",
                "mentee_test",
                "req_test",
                5,
                Some("Excellente session".to_string()),
            )
            .await
            .expect("Création doit réussir");

        // contract_id doit être un SHA-256 en hex (64 chars)
        assert_eq!(contract_id.len(), 64, "contract_id = SHA256 hex 64 chars");
        // signature compacte secp256k1 = 64 bytes = 128 chars hex
        assert_eq!(sig.len(), 128, "signature ECDSA compacte = 128 chars hex");
    }

    #[tokio::test]
    async fn test_verify_valid_signature() {
        let svc = make_service();
        let (contract_id, sig) = svc
            .create_proof_contract("m1", "m2", "r1", 4, None)
            .await
            .unwrap();

        let valid = svc.verify_proof(&contract_id, &sig).await.unwrap();
        assert!(valid, "La signature réelle doit être acceptée");
    }

    #[tokio::test]
    async fn test_reject_false_signature() {
        let svc = make_service();
        let (contract_id, _) = svc
            .create_proof_contract("m1", "m2", "r1", 4, None)
            .await
            .unwrap();

        // Signature bidon (64 zéros)
        let fake_sig = "00".repeat(64);
        let valid = svc.verify_proof(&contract_id, &fake_sig).await.unwrap();
        assert!(!valid, "Une fausse signature doit être rejetée");
    }

    #[tokio::test]
    async fn test_reject_tampered_contract_id() {
        let svc = make_service();
        let (contract_id, sig) = svc
            .create_proof_contract("m1", "m2", "r1", 4, None)
            .await
            .unwrap();

        // Altérer le contract_id
        let mut tampered = contract_id.clone();
        tampered.replace_range(0..2, "00");

        let valid = svc.verify_proof(&tampered, &sig).await.unwrap();
        assert!(!valid, "Un contract_id altéré doit être rejeté");
    }

    #[tokio::test]
    async fn test_invalid_rating_rejected() {
        let svc = make_service();
        let result = svc
            .create_proof_contract("m", "m2", "r", 10, None)
            .await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_get_proof_details() {
        let svc = make_service();
        let (contract_id, _) = svc
            .create_proof_contract("mentor_detail", "mentee_detail", "req_detail", 3, None)
            .await
            .unwrap();

        let details = svc.get_proof_details(&contract_id).await.unwrap();
        assert_eq!(details.mentor_id, "mentor_detail");
        assert_eq!(details.rating, 3);
        assert_eq!(details.signature.len(), 128, "signature ECDSA = 128 chars hex");
    }

    #[tokio::test]
    async fn test_transfer_creates_state_transition() {
        let svc = make_service();
        let (contract_id, _) = svc
            .create_proof_contract("m", "m2", "r", 3, None)
            .await
            .unwrap();

        let from = "0000000000000000000000000000000000000000000000000000000000000001";
        let to = "0000000000000000000000000000000000000000000000000000000000000002";

        let transfer_id = svc
            .transfer_proof(&contract_id, &format!("{}:0", from), &format!("{}:1", to), 0)
            .await
            .unwrap();

        assert!(transfer_id.starts_with("transfer_"), "L'ID de transfer doit commencer par 'transfer_'");

        // L'historique doit avoir 2 entrées : genesis + transition
        let history = svc.get_contract_history(&contract_id).await.unwrap();
        assert_eq!(history.len(), 2);
        assert_eq!(history[0].from, "issuer");
    }

    #[tokio::test]
    async fn test_history_starts_with_genesis() {
        let svc = make_service();
        let (contract_id, _) = svc
            .create_proof_contract("m", "m2", "r", 3, None)
            .await
            .unwrap();

        let history = svc.get_contract_history(&contract_id).await.unwrap();
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].from, "issuer");
        assert_eq!(history[0].txid.len(), 32, "commitment hex 16 bytes = 32 chars");
    }

    #[tokio::test]
    async fn test_health_check() {
        let svc = make_service();
        assert!(svc.health_check().await.is_ok());
    }

    #[tokio::test]
    async fn test_list_proofs() {
        let svc = make_service();
        svc.create_proof_contract("ma", "mb", "ra", 5, None).await.unwrap();
        svc.create_proof_contract("mc", "md", "rb", 3, None).await.unwrap();

        let list = svc.list_proofs().await.unwrap();
        assert!(list.len() >= 2);
    }

    #[tokio::test]
    async fn test_create_proof_with_utxo_seal() {
        let svc = make_service();
        // UTXO valide en regtest (format txid:vout)
        let seal = "0000000000000000000000000000000000000000000000000000000000000001:0";

        let (contract_id, sig) = svc
            .create_proof_contract_with_seal("m1", "m2", "r1", 5, None, Some(seal))
            .await
            .unwrap();

        assert_eq!(contract_id.len(), 64);
        assert_eq!(sig.len(), 128);

        // L'historique doit mentionner le seal UTXO dans la destination
        let history = svc.get_contract_history(&contract_id).await.unwrap();
        assert_eq!(history[0].to, "0000000000000000000000000000000000000000000000000000000000000001:0");
    }

    #[tokio::test]
    async fn test_create_proof_with_invalid_utxo_seal_rejected() {
        let svc = make_service();
        let result = svc
            .create_proof_contract_with_seal("m1", "m2", "r1", 5, None, Some("not_a_txid:0"))
            .await;
        assert!(result.is_err(), "Un txid invalide doit être rejeté");
    }

    #[tokio::test]
    async fn test_stash_persistence() {
        // Répertoire isolé pour ce test
        let data_dir = std::env::temp_dir()
            .join(format!("rgb_persist_{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&data_dir).unwrap();

        // Service 1 : créer la preuve
        std::env::set_var("RGB_DATA_DIR", data_dir.to_str().unwrap());
        let svc = RGBService::new().expect("Init should work");
        let (contract_id, sig) = svc
            .create_proof_contract("persist_mentor", "persist_mentee", "persist_req", 4, None)
            .await
            .unwrap();

        // Forcer la sauvegarde sur disque
        drop(svc);

        // Service 2 : recharger depuis le même répertoire (simule un redémarrage)
        std::env::set_var("RGB_DATA_DIR", data_dir.to_str().unwrap());
        let svc2 = RGBService::new().expect("Reload should work");
        let valid = svc2.verify_proof(&contract_id, &sig).await.unwrap();
        assert!(valid, "La preuve doit être retrouvée après rechargement du stash");
    }
}
