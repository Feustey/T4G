use axum::{extract::Request, http::StatusCode, middleware::Next, response::Response};

use crate::middleware::auth::AuthUser;

/// Middleware to ensure users can only access their own resources
pub async fn user_resource_authorization(
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Get the authenticated user from request extensions
    let auth_user = request
        .extensions()
        .get::<AuthUser>()
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Extract user ID from path
    let uri_path = request.uri().path();
    let path_segments: Vec<&str> = uri_path.split('/').collect();

    // Find the user ID in the path (typically after /users/)
    if let Some(users_index) = path_segments.iter().position(|&x| x == "users") {
        if let Some(user_id) = path_segments.get(users_index + 1) {
            // Allow access if the user is accessing their own resource or is an admin
            if auth_user.id != *user_id
                && auth_user.role != "ADMIN"
                && auth_user.role != "SERVICE_PROVIDER"
            {
                return Err(StatusCode::FORBIDDEN);
            }
        }
    }

    Ok(next.run(request).await)
}

/// Middleware to ensure only mentors can create proofs
pub async fn mentor_authorization(request: Request, next: Next) -> Result<Response, StatusCode> {
    let auth_user = request
        .extensions()
        .get::<AuthUser>()
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Check if user has mentor role
    if auth_user.role != "mentor" && auth_user.role != "ADMIN" {
        return Err(StatusCode::FORBIDDEN);
    }

    Ok(next.run(request).await)
}

/// Middleware for financial operations requiring elevated permissions
pub async fn financial_authorization(request: Request, next: Next) -> Result<Response, StatusCode> {
    let auth_user = request
        .extensions()
        .get::<AuthUser>()
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // For now, allow all authenticated users to perform financial operations
    // In production, you might want to add additional checks like:
    // - KYC verification status
    // - Account balance verification
    // - Daily/monthly transaction limits
    // - Multi-factor authentication for large amounts

    tracing::info!(
        "Financial operation authorized for user: {} with role: {}",
        auth_user.id,
        auth_user.role
    );

    Ok(next.run(request).await)
}

/// Middleware for admin-only operations
pub async fn admin_authorization(request: Request, next: Next) -> Result<Response, StatusCode> {
    let auth_user = request
        .extensions()
        .get::<AuthUser>()
        .ok_or(StatusCode::UNAUTHORIZED)?;

    if auth_user.role != "ADMIN" {
        return Err(StatusCode::FORBIDDEN);
    }

    Ok(next.run(request).await)
}

/// Rate limiting middleware (basic implementation)
pub async fn rate_limit_middleware(request: Request, next: Next) -> Result<Response, StatusCode> {
    // TODO: Implement proper rate limiting with Redis or in-memory store
    // For now, just log the request for monitoring

    let client_ip = request
        .headers()
        .get("x-forwarded-for")
        .or_else(|| request.headers().get("x-real-ip"))
        .and_then(|h| h.to_str().ok())
        .unwrap_or("unknown");

    tracing::info!("API request from IP: {}", client_ip);

    Ok(next.run(request).await)
}
