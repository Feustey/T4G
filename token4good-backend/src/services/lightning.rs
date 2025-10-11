use serde::{Deserialize, Serialize};
use std::error::Error;
use thiserror::Error;
use reqwest::Client;

#[derive(Error, Debug)]
pub enum LightningError {
    #[error("Erreur de connexion LND: {0}")]
    ConnectionError(String),
    #[error("Erreur de paiement: {0}")]
    PaymentError(String),
    #[error("Erreur d'invoice: {0}")]
    InvoiceError(String),
    #[error("Erreur CLI Lightning: {0}")]
    CliError(String),
    #[error("Erreur inconnue")]
    Unknown,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PaymentHash {
    pub hash: String,
    pub preimage: Option<String>,
    pub amount_msat: u64,
    pub status: PaymentStatus,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum PaymentStatus {
    Pending,
    Succeeded,
    Failed,
    Unknown,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Invoice {
    pub payment_request: String,
    pub payment_hash: String,
    pub amount_msat: u64,
    pub description: String,
    pub expiry: u64,
}

#[derive(Clone)]
pub struct LightningService {
    lnd_host: String,
    lnd_port: u16,
    macaroon_path: String,
    tls_cert_path: String,
    http_client: Client,
}

impl LightningService {
    pub fn new() -> Result<Self, Box<dyn Error>> {
        let lnd_host = std::env::var("LND_HOST").unwrap_or_else(|_| "localhost".to_string());
        let lnd_port = std::env::var("LND_PORT")
            .unwrap_or_else(|_| "10009".to_string())
            .parse()
            .unwrap_or(10009);
        let macaroon_path = std::env::var("LND_MACAROON_PATH")
            .unwrap_or_else(|_| "/tmp/lnd/admin.macaroon".to_string());
        let tls_cert_path =
            std::env::var("LND_TLS_CERT_PATH").unwrap_or_else(|_| "/tmp/lnd/tls.cert".to_string());

        let http_client = Client::builder()
            .danger_accept_invalid_certs(true)
            .build()?;

        Ok(Self {
            lnd_host,
            lnd_port,
            macaroon_path,
            tls_cert_path,
            http_client,
        })
    }

    fn get_rest_url(&self) -> String {
        format!("https://{}:{}", self.lnd_host, self.lnd_port + 1)
    }

    async fn read_macaroon(&self) -> Result<String, LightningError> {
        let macaroon_bytes = tokio::fs::read(&self.macaroon_path)
            .await
            .map_err(|e| LightningError::ConnectionError(format!("Cannot read macaroon: {}", e)))?;
        Ok(hex::encode(macaroon_bytes))
    }

    pub async fn health_check(&self) -> Result<(), LightningError> {
        let macaroon = self.read_macaroon().await?;
        let url = format!("{}/v1/getinfo", self.get_rest_url());

        let response = self.http_client
            .get(&url)
            .header("Grpc-Metadata-macaroon", macaroon)
            .send()
            .await
            .map_err(|e| LightningError::ConnectionError(format!("HTTP request failed: {}", e)))?;

        if response.status().is_success() {
            Ok(())
        } else {
            Err(LightningError::ConnectionError(format!(
                "LND health check failed: {}",
                response.status()
            )))
        }
    }

    pub async fn create_invoice(
        &self,
        amount_msat: u64,
        description: &str,
        expiry_seconds: u64,
    ) -> Result<Invoice, LightningError> {
        let macaroon = self.read_macaroon().await?;
        let url = format!("{}/v1/invoices", self.get_rest_url());

        let body = serde_json::json!({
            "value_msat": amount_msat.to_string(),
            "memo": description,
            "expiry": expiry_seconds.to_string(),
        });

        let response = self.http_client
            .post(&url)
            .header("Grpc-Metadata-macaroon", macaroon)
            .json(&body)
            .send()
            .await
            .map_err(|e| LightningError::InvoiceError(format!("HTTP request failed: {}", e)))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(LightningError::InvoiceError(format!(
                "Failed to create invoice: {}",
                error_text
            )));
        }

        let invoice_data: serde_json::Value = response
            .json()
            .await
            .map_err(|e| LightningError::InvoiceError(format!("Failed to parse response: {}", e)))?;

        Ok(Invoice {
            payment_request: invoice_data["payment_request"]
                .as_str()
                .unwrap_or_default()
                .to_string(),
            payment_hash: invoice_data["r_hash"]
                .as_str()
                .unwrap_or_default()
                .to_string(),
            amount_msat,
            description: description.to_string(),
            expiry: expiry_seconds,
        })
    }

    pub async fn pay_invoice(&self, payment_request: &str) -> Result<PaymentHash, LightningError> {
        let macaroon = self.read_macaroon().await?;
        let url = format!("{}/v1/channels/transactions", self.get_rest_url());

        let body = serde_json::json!({
            "payment_request": payment_request,
        });

        let response = self.http_client
            .post(&url)
            .header("Grpc-Metadata-macaroon", macaroon)
            .json(&body)
            .send()
            .await
            .map_err(|e| LightningError::PaymentError(format!("HTTP request failed: {}", e)))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(LightningError::PaymentError(format!(
                "Failed to pay invoice: {}",
                error_text
            )));
        }

        let payment_data: serde_json::Value = response
            .json()
            .await
            .map_err(|e| LightningError::PaymentError(format!("Failed to parse response: {}", e)))?;

        Ok(PaymentHash {
            hash: payment_data["payment_hash"]
                .as_str()
                .unwrap_or_default()
                .to_string(),
            preimage: payment_data["payment_preimage"]
                .as_str()
                .map(|s| s.to_string()),
            amount_msat: payment_data["value_msat"].as_u64().unwrap_or(0),
            status: if payment_data["payment_error"].as_str().is_none() {
                PaymentStatus::Succeeded
            } else {
                PaymentStatus::Failed
            },
        })
    }

    pub async fn get_payment_status(
        &self,
        payment_hash: &str,
    ) -> Result<PaymentStatus, LightningError> {
        let macaroon = self.read_macaroon().await?;
        let url = format!("{}/v1/payreq/{}", self.get_rest_url(), payment_hash);

        let response = self.http_client
            .get(&url)
            .header("Grpc-Metadata-macaroon", macaroon)
            .send()
            .await
            .map_err(|e| LightningError::ConnectionError(format!("HTTP request failed: {}", e)))?;

        if !response.status().is_success() {
            return Ok(PaymentStatus::Unknown);
        }

        let payment_data: serde_json::Value = response
            .json()
            .await
            .map_err(|_| LightningError::Unknown)?;

        let status = match payment_data["status"].as_str() {
            Some("IN_FLIGHT") => PaymentStatus::Pending,
            Some("SUCCEEDED") => PaymentStatus::Succeeded,
            Some("FAILED") => PaymentStatus::Failed,
            _ => PaymentStatus::Unknown,
        };

        Ok(status)
    }

    pub async fn get_node_info(&self) -> Result<NodeInfo, LightningError> {
        let macaroon = self.read_macaroon().await?;
        let url = format!("{}/v1/getinfo", self.get_rest_url());

        let response = self.http_client
            .get(&url)
            .header("Grpc-Metadata-macaroon", macaroon)
            .send()
            .await
            .map_err(|e| LightningError::ConnectionError(format!("HTTP request failed: {}", e)))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(LightningError::ConnectionError(format!(
                "Failed to get node info: {}",
                error_text
            )));
        }

        let node_data: serde_json::Value = response
            .json()
            .await
            .map_err(|e| LightningError::ConnectionError(format!("Failed to parse response: {}", e)))?;

        Ok(NodeInfo {
            identity_pubkey: node_data["identity_pubkey"]
                .as_str()
                .unwrap_or_default()
                .to_string(),
            alias: node_data["alias"].as_str().unwrap_or_default().to_string(),
            num_channels: node_data["num_active_channels"].as_u64().unwrap_or(0),
            synced_to_chain: node_data["synced_to_chain"].as_bool().unwrap_or(false),
        })
    }

    pub async fn create_proof_payment(
        &self,
        proof_id: &str,
        amount_msat: u64,
    ) -> Result<Invoice, LightningError> {
        let description = format!("Payment for proof transfer: {}", proof_id);
        self.create_invoice(amount_msat, &description, 3600).await
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NodeInfo {
    pub identity_pubkey: String,
    pub alias: String,
    pub num_channels: u64,
    pub synced_to_chain: bool,
}
