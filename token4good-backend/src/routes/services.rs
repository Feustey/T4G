use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
    routing::get,
    Router,
};
use serde::Deserialize;

use crate::{
    models::service::{
        CategoryIdName, CreateCategoryRequest, CreateServiceRequest, ServiceResponse,
        UpdateCategoryRequest, UpdateServiceRequest, UserWallet,
    },
    AppState,
};

pub fn service_routes() -> Router<AppState> {
    Router::new()
        // Categories
        .route("/categories", get(get_categories).post(create_category))
        .route("/categories/:id", get(get_category).put(update_category).delete(delete_category))
        .route("/categories/audience/:audience", get(get_categories_by_audience))
        // Services
        .route("/", get(get_services).post(create_service))
        .route("/:id", get(get_service).put(update_service).delete(delete_service))
        .route("/category/:category_id", get(get_services_by_category))
        .route("/provider/:provider_id", get(get_services_by_provider))
        .route("/audience/:audience", get(get_services_by_audience))
}

#[derive(Debug, Deserialize)]
struct ServiceQuery {
    audience: Option<String>,
    provider: Option<String>,
    category: Option<String>,
}

// ========== CATEGORIES ==========

async fn get_categories(State(state): State<AppState>) -> Result<Json<Vec<crate::models::service::ServiceCategory>>, StatusCode> {
    let ops = state.db.service_ops();
    ops.get_all_categories()
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn get_category(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<crate::models::service::ServiceCategory>, StatusCode> {
    let ops = state.db.service_ops();
    ops.get_category_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn get_categories_by_audience(
    State(state): State<AppState>,
    Path(audience): Path<String>,
) -> Result<Json<Vec<crate::models::service::ServiceCategory>>, StatusCode> {
    let ops = state.db.service_ops();
    ops.get_categories_by_audience(&audience)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn create_category(
    State(state): State<AppState>,
    Json(req): Json<CreateCategoryRequest>,
) -> Result<Json<crate::models::service::ServiceCategory>, StatusCode> {
    let ops = state.db.service_ops();
    ops.create_category(req)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn update_category(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<UpdateCategoryRequest>,
) -> Result<Json<crate::models::service::ServiceCategory>, StatusCode> {
    let ops = state.db.service_ops();
    ops.update_category(&id, req)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn delete_category(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    let ops = state.db.service_ops();
    ops.delete_category(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .then_some(StatusCode::NO_CONTENT)
        .ok_or(StatusCode::NOT_FOUND)
}

// ========== SERVICES ==========

async fn get_services(
    State(state): State<AppState>,
    Query(params): Query<ServiceQuery>,
) -> Result<Json<Vec<ServiceResponse>>, StatusCode> {
    let ops = state.db.service_ops();

    let services = if let Some(audience) = params.audience {
        ops.get_services_by_audience(&audience).await
    } else if let Some(provider) = params.provider {
        ops.get_services_by_provider(&provider).await
    } else if let Some(category) = params.category {
        ops.get_services_by_category(&category).await
    } else {
        ops.get_all_services().await
    }
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Enrich services with category and provider info
    let enriched = enrich_services(&state, services).await?;
    Ok(Json(enriched))
}

async fn get_service(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ServiceResponse>, StatusCode> {
    let ops = state.db.service_ops();
    let service = ops
        .get_service_by_id(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let enriched = enrich_services(&state, vec![service]).await?;
    enriched.into_iter().next().map(Json).ok_or(StatusCode::NOT_FOUND)
}

async fn get_services_by_category(
    State(state): State<AppState>,
    Path(category_id): Path<String>,
) -> Result<Json<Vec<ServiceResponse>>, StatusCode> {
    let ops = state.db.service_ops();
    let services = ops
        .get_services_by_category(&category_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let enriched = enrich_services(&state, services).await?;
    Ok(Json(enriched))
}

async fn get_services_by_provider(
    State(state): State<AppState>,
    Path(provider_id): Path<String>,
) -> Result<Json<Vec<ServiceResponse>>, StatusCode> {
    let ops = state.db.service_ops();
    let services = ops
        .get_services_by_provider(&provider_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let enriched = enrich_services(&state, services).await?;
    Ok(Json(enriched))
}

async fn get_services_by_audience(
    State(state): State<AppState>,
    Path(audience): Path<String>,
) -> Result<Json<Vec<ServiceResponse>>, StatusCode> {
    let ops = state.db.service_ops();
    let services = ops
        .get_services_by_audience(&audience)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let enriched = enrich_services(&state, services).await?;
    Ok(Json(enriched))
}

async fn create_service(
    State(state): State<AppState>,
    Json(req): Json<CreateServiceRequest>,
) -> Result<Json<ServiceResponse>, StatusCode> {
    let ops = state.db.service_ops();
    let service = ops
        .create_service(req)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let enriched = enrich_services(&state, vec![service]).await?;
    enriched.into_iter().next().map(Json).ok_or(StatusCode::INTERNAL_SERVER_ERROR)
}

async fn update_service(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<UpdateServiceRequest>,
) -> Result<Json<ServiceResponse>, StatusCode> {
    let ops = state.db.service_ops();
    let service = ops
        .update_service(&id, req)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let enriched = enrich_services(&state, vec![service]).await?;
    enriched.into_iter().next().map(Json).ok_or(StatusCode::INTERNAL_SERVER_ERROR)
}

async fn delete_service(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    let ops = state.db.service_ops();
    ops.delete_service(&id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .then_some(StatusCode::NO_CONTENT)
        .ok_or(StatusCode::NOT_FOUND)
}

// ========== HELPERS ==========

async fn enrich_services(
    state: &AppState,
    services: Vec<crate::models::service::Service>,
) -> Result<Vec<ServiceResponse>, StatusCode> {
    let ops = state.db.service_ops();

    // Get all unique category and provider IDs
    let category_ids: Vec<String> = services
        .iter()
        .filter_map(|s| s.category_id.clone())
        .collect();
    let provider_ids: Vec<String> = services
        .iter()
        .filter_map(|s| s.service_provider_id.clone())
        .collect();

    // Fetch categories and providers
    let mut categories = Vec::new();
    for id in category_ids {
        if let Ok(Some(cat)) = ops.get_category_by_id(&id).await {
            categories.push((id.clone(), cat));
        }
    }

    let mut providers = Vec::new();
    for id in provider_ids {
        if let Ok(Some(user)) = state.db.find_user_by_id(&id).await {
            providers.push((id.clone(), user));
        }
    }

    // Build enriched responses
    let mut enriched = Vec::new();
    for service in services {
        let category = service.category_id.as_ref().and_then(|id| {
            categories
                .iter()
                .find(|(cid, _)| cid == id)
                .map(|(_, cat)| CategoryIdName {
                    id: cat.id.clone(),
                    name: cat.name.clone(),
                })
        });

        let provider = service.service_provider_id.as_ref().and_then(|id| {
            providers
                .iter()
                .find(|(pid, _)| pid == id)
                .map(|(_, user)| UserWallet {
                    id: user.id.to_string(),
                    first_name: user.firstname.clone(),
                    last_name: user.lastname.clone(),
                    wallet: user.wallet_address.clone(),
                    avatar: user.avatar.clone(),
                    program: None,
                    graduated_year: None,
                    about: user.bio.clone(),
                })
        });

        enriched.push(ServiceResponse {
            id: service.id,
            name: service.name,
            unit: service.unit,
            description: service.description,
            summary: service.summary,
            avatar: service.avatar,
            price: service.price,
            rating: service.rating,
            blockchain_id: service.blockchain_id,
            category,
            provider,
            supply: service.total_supply,
        });
    }

    Ok(enriched)
}
