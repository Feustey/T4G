use axum::{extract::State, http::StatusCode, response::Json, routing::get, Router};
use serde::Serialize;

use crate::{models::user::UserRole, AppState};

pub fn service_category_routes() -> Router<AppState> {
    Router::new()
        .route("/as_consumer", get(get_categories_as_consumer))
        .route("/as_provider", get(get_categories_as_provider))
}

pub async fn get_categories_as_consumer(
    State(state): State<AppState>,
) -> Result<Json<Vec<ServiceCategoryResponse>>, StatusCode> {
    // Récupérer toutes les catégories ou filtrer par audience "STUDENT"
    let categories = state
        .db
        .service_ops()
        .get_all_categories()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response: Vec<ServiceCategoryResponse> = categories
        .into_iter()
        .map(|cat| {
            let href = format!("/benefits/{}", cat.name);
            ServiceCategoryResponse {
                id: cat.id,
                name: cat.name,
                kind: cat.kind.unwrap_or_default(),
                description: cat.description.unwrap_or_default(),
                href,
                default_price: cat.default_price as i32,
                default_unit: cat.default_unit,
                icon: cat.icon.unwrap_or_else(|| "default".to_string()),
                disabled: if cat.disabled { 1 } else { 0 },
                service_provider_type: format!("{:?}", cat.service_provider_type),
                audience: "STUDENT".to_string(), // Default audience for consumer
            }
        })
        .collect();

    Ok(Json(response))
}

pub async fn get_categories_as_provider(
    State(state): State<AppState>,
) -> Result<Json<Vec<ServiceCategoryResponse>>, StatusCode> {
    // Récupérer toutes les catégories
    let categories = state
        .db
        .service_ops()
        .get_all_categories()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let response: Vec<ServiceCategoryResponse> = categories
        .into_iter()
        .map(|cat| {
            let href = format!("/services/{}", cat.name);
            ServiceCategoryResponse {
                id: cat.id,
                name: cat.name,
                kind: cat.kind.unwrap_or_default(),
                description: cat.description.unwrap_or_default(),
                href,
                default_price: cat.default_price as i32,
                default_unit: cat.default_unit,
                icon: cat.icon.unwrap_or_else(|| "default".to_string()),
                disabled: if cat.disabled { 1 } else { 0 },
                service_provider_type: format!("{:?}", cat.service_provider_type),
                audience: "ALUMNI".to_string(), // Default audience for provider
            }
        })
        .collect();

    Ok(Json(response))
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ServiceCategoryResponse {
    pub id: String,
    pub name: String,
    pub kind: String,
    pub description: String,
    pub href: String,
    pub default_price: i32,
    pub default_unit: String,
    pub icon: String,
    pub disabled: i32,
    pub service_provider_type: String,
    pub audience: String,
}
