use reqwest::Url;
use serde::{Deserialize, Serialize};
use std::error::Error;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DaznoError {
    #[error("Erreur API Lightning Dazno: {0}")]
    LightningApiError(String),
    #[error("Erreur API Users Dazno: {0}")]
    UsersApiError(String),
    #[error("Erreur de connexion: {0}")]
    ConnectionError(String),
    #[error("Token invalide")]
    InvalidToken,
}

#[derive(Clone)]
pub struct DaznoService {
    lightning_api_base: String, // api.dazno.de
    users_api_base: String,     // dazno.de/api
    api_key: Option<String>,
    client: reqwest::Client,
}

impl DaznoService {
    pub fn new() -> Result<Self, Box<dyn Error>> {
        let lightning_api_base = std::env::var("DAZNO_LIGHTNING_API_URL")
            .unwrap_or_else(|_| "https://api.dazno.de".to_string());
        let users_api_base = std::env::var("DAZNO_USERS_API_URL")
            .unwrap_or_else(|_| "https://dazno.de/api".to_string());
        let api_key = std::env::var("DAZNO_API_KEY").ok();

        let client = reqwest::Client::builder()
            .user_agent("token4good-backend/1.0")
            .build()?;

        Ok(Self {
            lightning_api_base,
            users_api_base,
            api_key,
            client,
        })
    }

    pub async fn health_check(&self) -> Result<(), DaznoError> {
        Url::parse(&self.users_api_base).map_err(|e| DaznoError::ConnectionError(e.to_string()))?;
        Url::parse(&self.lightning_api_base)
            .map_err(|e| DaznoError::ConnectionError(e.to_string()))?;
        Ok(())
    }

    fn authorized(
        &self,
        builder: reqwest::RequestBuilder,
        token: Option<&str>,
    ) -> reqwest::RequestBuilder {
        let builder = if let Some(token) = token {
            builder.bearer_auth(token)
        } else {
            builder
        };

        if let Some(api_key) = &self.api_key {
            builder.header("x-api-key", api_key)
        } else {
            builder
        }
    }

    // ============= USER MANAGEMENT (dazno.de/api) =============

    pub async fn verify_user_session(&self, token: &str) -> Result<DaznoUser, DaznoError> {
        let url = format!("{}/auth/verify-session", self.users_api_base);

        let response = self
            .authorized(self.client.post(&url), Some(token))
            .header("Content-Type", "application/json")
            .send()
            .await
            .map_err(|e| DaznoError::ConnectionError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(DaznoError::InvalidToken);
        }

        let dazno_response: DaznoAuthResponse = response
            .json()
            .await
            .map_err(|e| DaznoError::UsersApiError(e.to_string()))?;

        if !dazno_response.authenticated {
            return Err(DaznoError::InvalidToken);
        }

        Ok(dazno_response.user)
    }

    pub async fn get_user_profile(
        &self,
        token: &str,
        user_id: &str,
    ) -> Result<DaznoUserProfile, DaznoError> {
        let url = format!("{}/users/{}", self.users_api_base, user_id);

        let response = self
            .authorized(self.client.get(&url), Some(token))
            .send()
            .await
            .map_err(|e| DaznoError::ConnectionError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(DaznoError::UsersApiError(
                "Failed to get user profile".to_string(),
            ));
        }

        response
            .json()
            .await
            .map_err(|e| DaznoError::UsersApiError(e.to_string()))
    }

    pub async fn get_user_t4g_balance(
        &self,
        token: &str,
        user_id: &str,
    ) -> Result<TokenBalance, DaznoError> {
        let url = format!("{}/users/{}/tokens/t4g", self.users_api_base, user_id);

        let response = self
            .authorized(self.client.get(&url), Some(token))
            .send()
            .await
            .map_err(|e| DaznoError::ConnectionError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(DaznoError::UsersApiError(
                "Failed to get T4G balance".to_string(),
            ));
        }

        response
            .json()
            .await
            .map_err(|e| DaznoError::UsersApiError(e.to_string()))
    }

    pub async fn update_user_gamification(
        &self,
        token: &str,
        user_id: &str,
        points: u64,
        action: &str,
    ) -> Result<(), DaznoError> {
        let url = format!("{}/users/{}/gamification", self.users_api_base, user_id);

        let payload = GamificationUpdate {
            points,
            action: action.to_string(),
            timestamp: chrono::Utc::now(),
        };

        let response = self
            .authorized(self.client.post(&url), Some(token))
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| DaznoError::ConnectionError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(DaznoError::UsersApiError(
                "Failed to update gamification".to_string(),
            ));
        }

        Ok(())
    }

    // ============= LIGHTNING NETWORK (api.dazno.de) =============

    pub async fn create_lightning_invoice(
        &self,
        token: &str,
        amount_msat: u64,
        description: &str,
        user_id: &str,
    ) -> Result<DaznoLightningInvoice, DaznoError> {
        let url = format!("{}/lightning/invoice", self.lightning_api_base);

        let payload = CreateInvoiceRequest {
            amount_msat,
            description: description.to_string(),
            user_id: user_id.to_string(),
            expires_in: 3600, // 1 heure
        };

        let response = self
            .authorized(self.client.post(&url), Some(token))
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| DaznoError::ConnectionError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(DaznoError::LightningApiError(
                "Failed to create invoice".to_string(),
            ));
        }

        response
            .json()
            .await
            .map_err(|e| DaznoError::LightningApiError(e.to_string()))
    }

    pub async fn pay_lightning_invoice(
        &self,
        token: &str,
        payment_request: &str,
        user_id: &str,
    ) -> Result<DaznoLightningPayment, DaznoError> {
        let url = format!("{}/lightning/pay", self.lightning_api_base);

        let payload = PayInvoiceRequest {
            payment_request: payment_request.to_string(),
            user_id: user_id.to_string(),
        };

        let response = self
            .authorized(self.client.post(&url), Some(token))
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| DaznoError::ConnectionError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(DaznoError::LightningApiError(
                "Failed to pay invoice".to_string(),
            ));
        }

        response
            .json()
            .await
            .map_err(|e| DaznoError::LightningApiError(e.to_string()))
    }

    pub async fn get_lightning_balance(
        &self,
        token: &str,
        user_id: &str,
    ) -> Result<LightningBalance, DaznoError> {
        let url = format!("{}/lightning/balance/{}", self.lightning_api_base, user_id);

        let response = self
            .authorized(self.client.get(&url), Some(token))
            .send()
            .await
            .map_err(|e| DaznoError::ConnectionError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(DaznoError::LightningApiError(
                "Failed to get lightning balance".to_string(),
            ));
        }

        response
            .json()
            .await
            .map_err(|e| DaznoError::LightningApiError(e.to_string()))
    }

    pub async fn get_lightning_transactions(
        &self,
        token: &str,
        user_id: &str,
        limit: Option<u32>,
    ) -> Result<Vec<LightningTransaction>, DaznoError> {
        let mut url = format!(
            "{}/lightning/transactions/{}",
            self.lightning_api_base, user_id
        );
        if let Some(limit) = limit {
            url.push_str(&format!("?limit={}", limit));
        }

        let response = self
            .authorized(self.client.get(&url), Some(token))
            .send()
            .await
            .map_err(|e| DaznoError::ConnectionError(e.to_string()))?;

        if !response.status().is_success() {
            return Err(DaznoError::LightningApiError(
                "Failed to get transactions".to_string(),
            ));
        }

        response
            .json()
            .await
            .map_err(|e| DaznoError::LightningApiError(e.to_string()))
    }
}

// ============= TYPES =============

// Auth & Users (dazno.de/api)
#[derive(Debug, Serialize, Deserialize)]
pub struct DaznoAuthResponse {
    pub authenticated: bool,
    pub user: DaznoUser,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DaznoUser {
    pub id: String,
    pub email: String,
    pub name: String,
    pub role: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DaznoUserProfile {
    pub id: String,
    pub email: String,
    pub name: String,
    pub avatar: Option<String>,
    pub bio: Option<String>,
    pub reputation_score: u64,
    pub total_t4g_earned: u64,
    pub total_t4g_spent: u64,
    pub gamification_level: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenBalance {
    pub t4g_balance: u64,
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GamificationUpdate {
    pub points: u64,
    pub action: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

// Lightning (api.dazno.de)
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateInvoiceRequest {
    pub amount_msat: u64,
    pub description: String,
    pub user_id: String,
    pub expires_in: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PayInvoiceRequest {
    pub payment_request: String,
    pub user_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DaznoLightningInvoice {
    pub payment_request: String,
    pub payment_hash: String,
    pub amount_msat: u64,
    pub description: String,
    pub expires_at: chrono::DateTime<chrono::Utc>,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DaznoLightningPayment {
    pub payment_hash: String,
    pub payment_preimage: Option<String>,
    pub amount_msat: u64,
    pub fee_msat: u64,
    pub status: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LightningBalance {
    pub balance_msat: u64,
    pub pending_msat: u64,
    pub reserved_msat: u64,
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LightningTransaction {
    pub id: String,
    pub transaction_type: String, // "invoice" | "payment"
    pub amount_msat: u64,
    pub fee_msat: u64,
    pub status: String,
    pub payment_hash: String,
    pub description: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub settled_at: Option<chrono::DateTime<chrono::Utc>>,
}
