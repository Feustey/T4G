pub mod middleware;
pub mod models;
pub mod routes;
pub mod services;

use axum::Router;
use std::{env, error::Error};
use tower_http::cors::{Any, CorsLayer};

use services::{database::DatabaseService, dazno::DaznoService, rgb::RGBService};

#[derive(Clone)]
pub struct AppState {
    pub db: DatabaseService,
    pub rgb: RGBService,
    pub dazno: DaznoService,
}

impl AppState {
    pub async fn database_health(&self) -> Result<(), String> {
        self.db.ping().await.map_err(|e| e.to_string())
    }

    pub async fn rgb_health(&self) -> Result<(), String> {
        self.rgb.health_check().await.map_err(|e| e.to_string())
    }

    pub async fn dazno_health(&self) -> Result<(), String> {
        self.dazno.health_check().await.map_err(|e| e.to_string())
    }
}

pub async fn build_state() -> Result<AppState, Box<dyn Error>> {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://postgres:password@localhost:5432/token4good".to_string());

    // Skip database if URL is "disabled" or connection fails
    let db = if database_url.contains("disabled") || database_url.is_empty() {
        tracing::warn!("⚠️  Database disabled by configuration - using fallback");
        // Create a fallback connection that won't be used
        DatabaseService::new("postgresql://postgres:password@localhost:5432/fallback").await?
    } else {
        match DatabaseService::new(&database_url).await {
            Ok(db) => {
                tracing::info!("✅ Database service initialized successfully");
                db
            }
            Err(e) => {
                tracing::error!("❌ Database connection failed: {}. Using fallback", e);
                // Use a fallback that won't crash
                DatabaseService::new("postgresql://postgres:password@localhost:5432/fallback")
                    .await?
            }
        }
    };

    let rgb = RGBService::new()?;
    let dazno = DaznoService::new()?;

    Ok(AppState { db, rgb, dazno })
}

pub fn build_router(state: AppState) -> Router {
    Router::new()
        .nest("/health", routes::health::health_routes())
        // Webhooks - Authentification par API Key + signature HMAC (pas de JWT)
        .nest(
            "/api/webhooks",
            routes::webhooks::webhook_routes().layer(axum::middleware::from_fn(
                crate::middleware::webhook_auth::webhook_api_key_middleware,
            )),
        )
        .nest("/api/auth", routes::auth::auth_routes())
        .nest(
            "/api/mentoring",
            routes::mentoring::mentoring_routes().layer(axum::middleware::from_fn_with_state(
                state.clone(),
                crate::middleware::auth::auth_middleware,
            )),
        )
        .nest(
            "/api/users",
            routes::users::user_routes()
                .layer(axum::middleware::from_fn(
                    crate::middleware::authorization::user_resource_authorization,
                ))
                .layer(axum::middleware::from_fn_with_state(
                    state.clone(),
                    crate::middleware::auth::auth_middleware,
                )),
        )
        .nest(
            "/api/proofs",
            routes::proofs::proof_routes().layer(axum::middleware::from_fn_with_state(
                state.clone(),
                crate::middleware::auth::auth_middleware,
            )),
        )
        .nest(
            "/api/services",
            routes::services::service_routes().layer(axum::middleware::from_fn_with_state(
                state.clone(),
                crate::middleware::auth::auth_middleware,
            )),
        )
        .nest(
            "/api/transactions",
            routes::transactions::transaction_routes().layer(axum::middleware::from_fn_with_state(
                state.clone(),
                crate::middleware::auth::auth_middleware,
            )),
        )
        .nest(
            "/api/dazno",
            routes::dazno::dazno_routes().layer(axum::middleware::from_fn_with_state(
                state.clone(),
                crate::middleware::auth::auth_middleware,
            )),
        )
        .nest(
            "/api/v1/token4good",
            routes::token4good::token4good_routes().layer(axum::middleware::from_fn_with_state(
                state.clone(),
                crate::middleware::auth::auth_middleware,
            )),
        )
        .nest(
            "/api/metrics",
            routes::metrics::metrics_routes().layer(axum::middleware::from_fn_with_state(
                state.clone(),
                crate::middleware::auth::auth_middleware,
            )),
        )
        .nest(
            "/api/admin",
            routes::admin::admin_routes()
                .layer(axum::middleware::from_fn(
                    crate::middleware::authorization::admin_authorization,
                ))
                .layer(axum::middleware::from_fn_with_state(
                    state.clone(),
                    crate::middleware::auth::auth_middleware,
                )),
        )
        .layer(axum::middleware::from_fn(
            crate::middleware::authorization::rate_limit_middleware,
        ))
        .layer(axum::middleware::from_fn(
            crate::middleware::validation::security_headers_middleware,
        ))
        .layer(axum::middleware::from_fn(
            crate::middleware::validation::request_size_limit_middleware,
        ))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(state)
}
