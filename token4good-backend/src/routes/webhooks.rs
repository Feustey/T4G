use axum::{
    extract::{Json, State},
    http::{HeaderMap, StatusCode},
    routing::post,
    Router,
};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;

use crate::AppState;

type HmacSha256 = Hmac<Sha256>;

// Types d'événements webhook
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "event_type")]
pub enum WebhookEvent {
    #[serde(rename = "user.created")]
    UserCreated { user_id: String, email: String },
    
    #[serde(rename = "user.updated")]
    UserUpdated { user_id: String },
    
    #[serde(rename = "lightning.payment_received")]
    LightningPaymentReceived {
        user_id: String,
        amount_msat: u64,
        payment_hash: String,
    },
    
    #[serde(rename = "lightning.payment_sent")]
    LightningPaymentSent {
        user_id: String,
        amount_msat: u64,
        payment_hash: String,
    },
    
    #[serde(rename = "t4g.balance_updated")]
    T4GBalanceUpdated {
        user_id: String,
        new_balance: u64,
    },
    
    #[serde(rename = "gamification.level_up")]
    GamificationLevelUp {
        user_id: String,
        new_level: u32,
        points: u64,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WebhookPayload {
    pub id: String, // Webhook ID unique
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub source: String, // "dazno.de"
    #[serde(flatten)]
    pub event: WebhookEvent,
}

#[derive(Debug, Serialize)]
pub struct WebhookResponse {
    pub received: bool,
    pub webhook_id: String,
    pub processed_at: chrono::DateTime<chrono::Utc>,
}

pub fn webhook_routes() -> Router<AppState> {
    Router::new()
        .route("/dazno", post(handle_dazno_webhook))
}

/// Handler principal pour les webhooks Dazno
pub async fn handle_dazno_webhook(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<WebhookPayload>,
) -> Result<Json<WebhookResponse>, StatusCode> {
    // 1. Vérifier la signature
    verify_webhook_signature(&headers, &payload)?;
    
    // 2. Traiter l'événement
    process_webhook_event(&state, &payload).await?;
    
    // 3. Réponse de succès
    Ok(Json(WebhookResponse {
        received: true,
        webhook_id: payload.id.clone(),
        processed_at: chrono::Utc::now(),
    }))
}

/// Vérifie la signature HMAC du webhook
fn verify_webhook_signature(
    headers: &HeaderMap,
    payload: &WebhookPayload,
) -> Result<(), StatusCode> {
    // Récupérer le secret depuis l'env
    let webhook_secret = std::env::var("T4G_WEBHOOK_SECRET")
        .map_err(|_| {
            tracing::error!("T4G_WEBHOOK_SECRET non configuré");
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    
    // Récupérer la signature du header
    let signature_header = headers
        .get("x-t4g-signature")
        .ok_or_else(|| {
            tracing::warn!("Header x-t4g-signature manquant");
            StatusCode::UNAUTHORIZED
        })?
        .to_str()
        .map_err(|_| StatusCode::BAD_REQUEST)?;
    
    // Le format du header est "sha256=<hex_signature>"
    let signature_hex = signature_header
        .strip_prefix("sha256=")
        .ok_or_else(|| {
            tracing::warn!("Format signature invalide");
            StatusCode::UNAUTHORIZED
        })?;
    
    let expected_signature = hex::decode(signature_hex)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;
    
    // Calculer le HMAC attendu
    let payload_json = serde_json::to_string(payload)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let mut mac = HmacSha256::new_from_slice(webhook_secret.as_bytes())
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    mac.update(payload_json.as_bytes());
    
    // Vérifier
    mac.verify_slice(&expected_signature)
        .map_err(|_| {
            tracing::warn!("Signature webhook invalide");
            StatusCode::UNAUTHORIZED
        })?;
    
    tracing::info!("Webhook signature vérifiée avec succès");
    Ok(())
}

/// Traite l'événement webhook selon son type
async fn process_webhook_event(
    state: &AppState,
    payload: &WebhookPayload,
) -> Result<(), StatusCode> {
    tracing::info!(
        "Traitement webhook {} depuis {}",
        payload.id,
        payload.source
    );
    
    match &payload.event {
        WebhookEvent::UserCreated { user_id, email } => {
            handle_user_created(state, user_id, email).await
        }
        
        WebhookEvent::UserUpdated { user_id } => {
            handle_user_updated(state, user_id).await
        }
        
        WebhookEvent::LightningPaymentReceived {
            user_id,
            amount_msat,
            payment_hash,
        } => {
            handle_lightning_payment_received(
                state,
                user_id,
                *amount_msat,
                payment_hash,
            )
            .await
        }
        
        WebhookEvent::LightningPaymentSent {
            user_id,
            amount_msat,
            payment_hash,
        } => {
            handle_lightning_payment_sent(
                state,
                user_id,
                *amount_msat,
                payment_hash,
            )
            .await
        }
        
        WebhookEvent::T4GBalanceUpdated { user_id, new_balance } => {
            handle_t4g_balance_updated(state, user_id, *new_balance).await
        }
        
        WebhookEvent::GamificationLevelUp {
            user_id,
            new_level,
            points,
        } => {
            handle_gamification_level_up(state, user_id, *new_level, *points).await
        }
    }
}

// ============= HANDLERS PAR TYPE D'ÉVÉNEMENT =============

async fn handle_user_created(
    state: &AppState,
    user_id: &str,
    email: &str,
) -> Result<(), StatusCode> {
    tracing::info!("Utilisateur Dazno créé: {} ({})", user_id, email);
    
    // TODO: Créer ou synchroniser l'utilisateur dans la DB Token4Good
    // Exemple:
    // state.db.create_or_update_dazno_user(user_id, email).await
    
    Ok(())
}

async fn handle_user_updated(
    state: &AppState,
    user_id: &str,
) -> Result<(), StatusCode> {
    tracing::info!("Utilisateur Dazno mis à jour: {}", user_id);
    
    // TODO: Mettre à jour les infos utilisateur
    
    Ok(())
}

async fn handle_lightning_payment_received(
    state: &AppState,
    user_id: &str,
    amount_msat: u64,
    payment_hash: &str,
) -> Result<(), StatusCode> {
    tracing::info!(
        "Paiement Lightning reçu: {} msat pour user {} (hash: {})",
        amount_msat,
        user_id,
        payment_hash
    );
    
    // TODO: Enregistrer le paiement dans la DB
    // TODO: Mettre à jour le solde de l'utilisateur
    // TODO: Déclencher les actions associées (gamification, etc.)
    
    Ok(())
}

async fn handle_lightning_payment_sent(
    state: &AppState,
    user_id: &str,
    amount_msat: u64,
    payment_hash: &str,
) -> Result<(), StatusCode> {
    tracing::info!(
        "Paiement Lightning envoyé: {} msat par user {} (hash: {})",
        amount_msat,
        user_id,
        payment_hash
    );
    
    // TODO: Enregistrer le paiement sortant
    
    Ok(())
}

async fn handle_t4g_balance_updated(
    state: &AppState,
    user_id: &str,
    new_balance: u64,
) -> Result<(), StatusCode> {
    tracing::info!(
        "Solde T4G mis à jour pour {}: {} tokens",
        user_id,
        new_balance
    );
    
    // TODO: Synchroniser le solde T4G
    
    Ok(())
}

async fn handle_gamification_level_up(
    state: &AppState,
    user_id: &str,
    new_level: u32,
    points: u64,
) -> Result<(), StatusCode> {
    tracing::info!(
        "Level up gamification pour {}: niveau {} ({} points)",
        user_id,
        new_level,
        points
    );
    
    // TODO: Enregistrer l'événement
    // TODO: Déclencher des rewards éventuels
    
    Ok(())
}

