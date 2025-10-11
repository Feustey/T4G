use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    models::proof::{CreateProofRequest, Proof, ProofStatus},
    services::rgb::ProofDetails,
    AppState,
};

#[derive(Debug, Deserialize)]
pub struct ProofQuery {
    pub status: Option<ProofStatus>,
    pub mentor_id: Option<String>,
    pub mentee_id: Option<String>,
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransferProofRequest {
    pub proof_id: String,
    pub to_lightning_address: String,
    pub amount_msat: u64,
}

#[derive(Debug, Serialize)]
pub struct ProofResponse {
    pub proof: Proof,
    pub rgb_details: Option<ProofDetails>,
    pub verification_status: bool,
}

pub fn proof_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_proofs).post(create_proof))
        .route("/:id", get(get_proof))
        .route("/:id/verify", get(verify_proof))
        .route("/:id/transfer", post(transfer_proof))
        .route("/:id/history", get(get_proof_history))
        .route("/rgb/:contract_id", get(get_proof_by_contract))
}

pub async fn list_proofs(
    State(state): State<AppState>,
    Query(query): Query<ProofQuery>,
) -> Result<Json<Vec<Proof>>, StatusCode> {
    let proofs = state
        .db
        .get_proofs(
            query.status,
            query.mentor_id,
            query.mentee_id,
            query.limit.unwrap_or(50),
            query.offset.unwrap_or(0),
        )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(proofs))
}

pub async fn create_proof(
    State(state): State<AppState>,
    Json(payload): Json<CreateProofRequest>,
) -> Result<Json<ProofResponse>, StatusCode> {
    // 1. Créer le contrat RGB
    let (contract_id, signature) = state
        .rgb
        .create_proof_contract(
            &payload.mentor_id,
            &payload.mentee_id,
            &payload.request_id,
            payload.rating,
            Some(payload.comment.clone()),
        )
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 2. Sauvegarder en base
    let proof_id = Uuid::new_v4().to_string();
    let proof = Proof {
        id: proof_id,
        request_id: payload.request_id,
        mentor_id: payload.mentor_id.clone(),
        mentee_id: payload.mentee_id.clone(),
        contract_id: contract_id.clone(),
        signature: signature.clone(),
        rating: payload.rating,
        comment: payload.comment,
        status: ProofStatus::Created,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    let created_proof = state
        .db
        .create_proof_regular(proof)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 3. Récupérer les détails RGB
    let rgb_details = state.rgb.get_proof_details(&contract_id).await.ok();

    let response = ProofResponse {
        proof: created_proof,
        rgb_details,
        verification_status: true,
    };

    Ok(Json(response))
}

pub async fn get_proof(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ProofResponse>, StatusCode> {
    let proof = state
        .db
        .get_proof_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    // Récupérer les détails RGB
    let rgb_details = state.rgb.get_proof_details(&proof.contract_id).await.ok();

    // Vérifier la preuve
    let verification_status = state
        .rgb
        .verify_proof(&proof.contract_id, &proof.signature)
        .await
        .unwrap_or(false);

    let response = ProofResponse {
        proof,
        rgb_details,
        verification_status,
    };

    Ok(Json(response))
}

pub async fn verify_proof(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<VerificationResponse>, StatusCode> {
    let proof = state
        .db
        .get_proof_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let is_valid = state
        .rgb
        .verify_proof(&proof.contract_id, &proof.signature)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let rgb_details = state.rgb.get_proof_details(&proof.contract_id).await.ok();

    let response = VerificationResponse {
        proof_id: proof.id,
        contract_id: proof.contract_id,
        is_valid,
        rgb_details,
        verified_at: chrono::Utc::now(),
    };

    Ok(Json(response))
}

pub async fn transfer_proof(
    State(state): State<AppState>,
    Json(payload): Json<TransferProofRequest>,
) -> Result<Json<TransferResponse>, StatusCode> {
    // 1. Récupérer la preuve
    let proof = state
        .db
        .get_proof_by_id(&payload.proof_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    // 2. Créer une invoice Lightning
    let invoice = state
        .lightning
        .create_proof_payment(&proof.id, payload.amount_msat)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 3. Pour l'instant, simuler le transfert RGB (en attente du paiement)
    let transfer_id = Uuid::new_v4().to_string();

    // TODO: Implémenter la logique complète de transfert
    // 4. Après confirmation du paiement, effectuer le transfert RGB
    // 5. Mettre à jour l'historique de transfert

    let response = TransferResponse {
        transfer_id,
        proof_id: proof.id,
        payment_invoice: invoice.payment_request,
        amount_msat: payload.amount_msat,
        to_address: payload.to_lightning_address,
        status: "pending_payment".to_string(),
        created_at: chrono::Utc::now(),
    };

    Ok(Json(response))
}

pub async fn get_proof_history(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<ProofHistoryEntry>>, StatusCode> {
    let proof = state
        .db
        .get_proof_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    // Récupérer l'historique RGB
    let rgb_history = state
        .rgb
        .get_contract_history(&proof.contract_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let history: Vec<ProofHistoryEntry> = rgb_history
        .into_iter()
        .map(|record| ProofHistoryEntry {
            event_type: "transfer".to_string(),
            from_address: record.from,
            to_address: record.to,
            timestamp: chrono::DateTime::from_timestamp(record.timestamp as i64, 0)
                .unwrap_or_default(),
            transaction_id: record.txid,
            details: serde_json::Value::Null,
        })
        .collect();

    Ok(Json(history))
}

pub async fn get_proof_by_contract(
    State(state): State<AppState>,
    Path(contract_id): Path<String>,
) -> Result<Json<ProofResponse>, StatusCode> {
    let proof = state
        .db
        .get_proof_by_contract_id(&contract_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let rgb_details = state.rgb.get_proof_details(&contract_id).await.ok();

    let verification_status = state
        .rgb
        .verify_proof(&contract_id, &proof.signature)
        .await
        .unwrap_or(false);

    let response = ProofResponse {
        proof,
        rgb_details,
        verification_status,
    };

    Ok(Json(response))
}

#[derive(Debug, Serialize)]
pub struct VerificationResponse {
    pub proof_id: String,
    pub contract_id: String,
    pub is_valid: bool,
    pub rgb_details: Option<ProofDetails>,
    pub verified_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct TransferResponse {
    pub transfer_id: String,
    pub proof_id: String,
    pub payment_invoice: String,
    pub amount_msat: u64,
    pub to_address: String,
    pub status: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct ProofHistoryEntry {
    pub event_type: String,
    pub from_address: String,
    pub to_address: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub transaction_id: String,
    pub details: serde_json::Value,
}
