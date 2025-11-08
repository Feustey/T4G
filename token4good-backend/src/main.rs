use axum::{routing::get, Json, Router};
use serde_json::json;
use std::net::SocketAddr;

use token4good_backend::{build_router, build_state};

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();

    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse::<u16>()
        .expect("PORT must be a valid number");

    let state = match build_state().await {
        Ok(s) => s,
        Err(e) => {
            tracing::warn!(
                "⚠️ Failed to initialize full state: {}. Starting in minimal mode",
                e
            );
            // Continue without full state - create minimal routes
            return start_minimal_server(port).await;
        }
    };
    let app = build_router(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("attempting to bind to {}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind tcp listener");
    tracing::info!("server listening on {}", addr);

    if let Err(e) = axum::serve(listener, app.into_make_service()).await {
        tracing::error!("Server error: {}", e);
        std::process::exit(1);
    }
}

async fn start_minimal_server(port: u16) {
    tracing::info!("🔧 Starting minimal server on port {}", port);

    let app = Router::new()
        .route(
            "/health",
            get(|| async {
                Json(json!({
                    "status": "ok",
                    "mode": "minimal",
                    "message": "Backend running in minimal mode without database"
                }))
            }),
        )
        .route(
            "/",
            get(|| async {
                Json(json!({
                    "name": "Token4Good Backend",
                    "version": "0.1.0",
                    "mode": "minimal"
                }))
            }),
        );

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("minimal server binding to {}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind tcp listener");
    tracing::info!("✅ Minimal server listening on {}", addr);

    if let Err(e) = axum::serve(listener, app.into_make_service()).await {
        tracing::error!("Minimal server error: {}", e);
        std::process::exit(1);
    }
}
