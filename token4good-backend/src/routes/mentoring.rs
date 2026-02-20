use axum::{
    extract::{Path, State},
    routing::{get, post},
    Json, Router,
};

use crate::{
    models::mentoring::{
        CreateProofPayload, CreateRequestPayload, MentoringProof, MentoringRequest, RequestStatus,
    },
    AppState,
};

pub fn mentoring_routes() -> Router<AppState> {
    Router::new()
        .route("/requests", get(list_requests).post(create_request))
        .route("/requests/:id", get(get_request))
        .route("/requests/:id/assign", post(assign_request))
        .route("/proofs", get(list_proofs).post(create_proof))
        .route("/proofs/:id", get(get_proof))
        .route("/proofs/:id/verify", get(verify_proof))
}

// Liste des demandes de mentoring
async fn list_requests(
    State(state): State<AppState>,
) -> Result<Json<Vec<MentoringRequest>>, String> {
    state
        .db
        .find_requests_by_status("open")
        .await
        .map(Json)
        .map_err(|e| e.to_string())
}

// Création d'une nouvelle demande
async fn create_request(
    State(state): State<AppState>,
    Json(payload): Json<CreateRequestPayload>,
) -> Result<Json<MentoringRequest>, String> {
    let request = MentoringRequest::new(
        payload.title,
        payload.description,
        "user_123".to_string(), // TODO: Get from auth context
        payload.tags,
    );

    state
        .db
        .create_request(&request)
        .await
        .map_err(|e| e.to_string())?;

    Ok(Json(request))
}

// Récupération d'une demande spécifique
async fn get_request(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Option<MentoringRequest>>, String> {
    state
        .db
        .find_request_by_id(&id)
        .await
        .map(Json)
        .map_err(|e| e.to_string())
}

// Assignation d'un mentor à une demande
async fn assign_request(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<MentoringRequest>, String> {
    // 1. Vérifier que la demande existe
    let mut request = state
        .db
        .find_request_by_id(&id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Request not found".to_string())?;

    // 2. Mettre à jour le statut
    request.status = RequestStatus::Assigned;
    request.mentor_id = Some("mentor_123".to_string()); // TODO: Get from auth context

    // 3. Sauvegarder les modifications
    state
        .db
        .update_request_status(&id, "assigned")
        .await
        .map_err(|e| e.to_string())?;

    Ok(Json(request))
}

// Liste des preuves de mentoring
async fn list_proofs(State(state): State<AppState>) -> Result<Json<Vec<MentoringProof>>, String> {
    // TODO: Ajouter des filtres (mentor_id, mentee_id, etc.)
    state
        .db
        .find_proofs_by_mentor("mentor_123") // TODO: Get from auth context
        .await
        .map(Json)
        .map_err(|e| e.to_string())
}

// Création d'une nouvelle preuve
async fn create_proof(
    State(state): State<AppState>,
    Json(payload): Json<CreateProofPayload>,
) -> Result<Json<MentoringProof>, String> {
    // 1. Vérifier que la demande existe
    let request = state
        .db
        .find_request_by_id(&payload.request_id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Request not found".to_string())?;

    // 2. Créer le contrat RGB
    let (contract_id, signature) = state
        .rgb
        .create_proof_contract(
            &request.mentor_id.as_ref().unwrap_or(&String::new()),
            &request.mentee_id,
            &request.id,
            payload.rating,
            payload.comment.clone(),
        )
        .await
        .map_err(|e| e.to_string())?;

    // 3. Créer la preuve dans MongoDB
    let request_id = request.id.clone();
    let proof = MentoringProof::new(
        request.id,
        request.mentor_id.clone().unwrap_or_default(),
        request.mentee_id,
        contract_id.to_string(),
        signature,
        payload.rating,
        payload.comment,
    );

    state
        .db
        .create_proof(&proof)
        .await
        .map_err(|e| e.to_string())?;

    // 4. Mettre à jour le statut de la demande
    state
        .db
        .update_request_status(&request_id, "completed")
        .await
        .map_err(|e| e.to_string())?;

    Ok(Json(proof))
}

// Récupération d'une preuve spécifique
async fn get_proof(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Option<MentoringProof>>, String> {
    state
        .db
        .find_proof_by_id(&id)
        .await
        .map(Json)
        .map_err(|e| e.to_string())
}

// Vérification d'une preuve
async fn verify_proof(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<bool>, String> {
    // 1. Récupérer la preuve
    let proof = state
        .db
        .find_proof_by_id(&id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Proof not found".to_string())?;

    // 2. Vérifier la signature RGB
    let is_valid = state
        .rgb
        .verify_proof(&proof.rgb_contract_id, &proof.signature)
        .await
        .map_err(|e| e.to_string())?;

    Ok(Json(is_valid))
}
