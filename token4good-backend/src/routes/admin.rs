use axum::{extract::{Query, State}, http::StatusCode, response::Json, routing::get, Router};
use serde::{Deserialize, Serialize};

use crate::AppState;

pub fn admin_routes() -> Router<AppState> {
    Router::new()
        .route("/wallets", get(get_all_wallets))
        .route("/stats", get(get_admin_stats))
}

#[derive(Debug, Deserialize)]
pub struct WalletQuery {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
    pub min_balance: Option<u64>,
}

pub async fn get_all_wallets(
    State(state): State<AppState>,
    Query(query): Query<WalletQuery>,
) -> Result<Json<Vec<AdminWalletInfo>>, StatusCode> {
    // TODO: Implement proper admin authentication middleware

    let users = state
        .db
        .get_users(None, query.limit.unwrap_or(100), query.offset.unwrap_or(0))
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut wallets = Vec::new();

    for user in users {
        // For now, return mock wallet data
        // TODO: Integrate with Lightning service to get real balances
        let wallet = AdminWalletInfo {
            user_id: user.id.to_string(),
            username: user.username.clone(),
            email: user.email.clone(),
            lightning_address: user.lightning_address.clone(),
            balance_msat: 0,
            pending_balance_msat: 0,
            total_received_msat: 0,
            total_sent_msat: 0,
            num_transactions: 0,
            last_transaction_at: None,
            created_at: user.created_at,
        };

        // Filter by min_balance if provided
        if let Some(min_balance) = query.min_balance {
            if wallet.balance_msat >= min_balance {
                wallets.push(wallet);
            }
        } else {
            wallets.push(wallet);
        }
    }

    Ok(Json(wallets))
}

pub async fn get_admin_stats(
    State(state): State<AppState>,
) -> Result<Json<AdminStats>, StatusCode> {
    let total_users = state.db.count_users().await.unwrap_or(0);
    let total_mentoring_requests = state.db.count_mentoring_requests().await.unwrap_or(0);

    let total_rgb_proofs = state
        .rgb
        .list_proofs()
        .await
        .map(|proofs| proofs.len() as u64)
        .unwrap_or(0);

    let stats = AdminStats {
        total_users,
        total_mentoring_requests,
        total_rgb_proofs,
        total_lightning_volume_msat: 0, // TODO: calculate from Lightning
        active_users_last_30_days: 0,   // TODO: calculate
        timestamp: chrono::Utc::now(),
    };

    Ok(Json(stats))
}

#[derive(Debug, Serialize)]
pub struct AdminWalletInfo {
    pub user_id: String,
    pub username: String,
    pub email: String,
    pub lightning_address: String,
    pub balance_msat: u64,
    pub pending_balance_msat: u64,
    pub total_received_msat: u64,
    pub total_sent_msat: u64,
    pub num_transactions: u32,
    pub last_transaction_at: Option<chrono::DateTime<chrono::Utc>>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct AdminStats {
    pub total_users: u64,
    pub total_mentoring_requests: u64,
    pub total_rgb_proofs: u64,
    pub total_lightning_volume_msat: u64,
    pub active_users_last_30_days: u64,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}
