//! Route pour le transfert de preuve RGB

use axum::{response::IntoResponse, Json};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct TransferRequest {
    pub proof_id: String,
    pub to_address: String,
    pub amount: u64,
}

#[derive(Debug, Serialize)]
pub struct TransferResponse {
    pub success: bool,
    pub transfer_id: String,
}

pub async fn transfer_proof(Json(_payload): Json<TransferRequest>) -> impl IntoResponse {
    // TODO: Valider l'utilisateur
    // TODO: Payer via LN
    // TODO: Déclencher le transfert RGB
    let response = TransferResponse {
        success: true,
        transfer_id: uuid::Uuid::new_v4().to_string(),
    };

    Json(response)
}
