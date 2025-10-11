use crate::AppState;
use axum::{extract::State, response::Json, routing::get, Router};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub version: String,
    pub services: ServiceStatus,
}

#[derive(Debug, Serialize)]
pub struct ServiceStatus {
    pub database: ComponentStatus,
    pub rgb: ComponentStatus,
    pub lightning: ComponentStatus,
    pub dazno: ComponentStatus,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ComponentStatus {
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub detail: Option<String>,
}

pub fn health_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(health_check))
        .route("/detailed", get(detailed_health))
}

pub async fn health_check(State(state): State<AppState>) -> Json<HealthResponse> {
    Json(build_health_response(state).await)
}

pub async fn detailed_health(State(state): State<AppState>) -> Json<HealthResponse> {
    Json(build_health_response(state).await)
}

async fn build_health_response(state: AppState) -> HealthResponse {
    let (db_status, rgb_status, lightning_status, dazno_status) = tokio::join!(
        state.database_health(),
        state.rgb_health(),
        state.lightning_health(),
        state.dazno_health(),
    );

    let database = to_component_status(db_status);
    let rgb = to_component_status(rgb_status);
    let lightning = to_component_status(lightning_status);
    let dazno = to_component_status(dazno_status);

    let degraded = database.status != "ok"
        || rgb.status != "ok"
        || lightning.status != "ok"
        || dazno.status != "ok";

    HealthResponse {
        status: if degraded {
            "degraded".to_string()
        } else {
            "ok".to_string()
        },
        timestamp: chrono::Utc::now(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        services: ServiceStatus {
            database,
            rgb,
            lightning,
            dazno,
        },
    }
}

fn to_component_status(status: Result<(), String>) -> ComponentStatus {
    match status {
        Ok(_) => ComponentStatus {
            status: "ok".to_string(),
            detail: None,
        },
        Err(err) => ComponentStatus {
            status: "error".to_string(),
            detail: Some(err),
        },
    }
}
