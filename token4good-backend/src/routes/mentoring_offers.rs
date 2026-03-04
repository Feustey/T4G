use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use sqlx::Row;

use crate::{
    middleware::auth_extractor::AuthUserExtractor,
    models::mentoring_offer::{
        ConfirmBookingPayload, CreateBookingPayload, CreateOfferPayload, MentoringBooking,
        MentoringOffer, UpdateOfferPayload,
    },
    services::mentoring_completion,
    AppState,
};

pub fn mentoring_offer_routes() -> Router<AppState> {
    Router::new()
        // Offres
        .route("/offers", get(list_offers).post(create_offer))
        .route("/offers/:id", get(get_offer))
        .route("/offers/:id/update", post(update_offer))
        .route("/offers/:id/cancel", post(cancel_offer))
        // Réservations
        .route("/bookings", post(create_booking))
        .route("/bookings/:id", get(get_booking))
        .route("/bookings/:id/confirm", post(confirm_booking))
        .route("/bookings/:id/dispute", post(dispute_booking))
        // Vue enrichie (booking + offre)
        .route("/sessions/:id", get(get_session_full))
}

// Routes sur /api/users/me — à enregistrer dans users_routes
pub fn mentoring_user_routes() -> Router<AppState> {
    Router::new()
        .route("/me/mentoring-offers", get(get_my_offers))
        .route("/me/mentoring-bookings", get(get_my_bookings))
}

// ============================================================
// Filtres
// ============================================================

#[derive(Debug, Deserialize)]
pub struct OffersFilter {
    pub topic_slug: Option<String>,
    pub category: Option<String>,
    pub level: Option<String>,
    pub format: Option<String>,
    pub max_cost: Option<i32>,
    pub mentor_id: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

// ============================================================
// Handlers — Offres
// ============================================================

/// GET /api/mentoring/offers — liste publique des offres ouvertes (enrichie mentor + topic)
pub async fn list_offers(
    State(state): State<AppState>,
    Query(filters): Query<OffersFilter>,
) -> Result<Json<Vec<serde_json::Value>>, StatusCode> {
    let limit = filters.limit.unwrap_or(50).min(100);
    let offset = filters.offset.unwrap_or(0);

    let mut sql = String::from(
        r#"
        SELECT
            o.id, o.mentor_id, o.topic_slug, o.target_level, o.description,
            o.duration_minutes, o.format, o.token_cost, o.availability,
            o.status, o.created_at, o.updated_at,
            u.firstname AS mentor_firstname,
            u.lastname  AS mentor_lastname,
            u.avatar    AS mentor_avatar,
            u.score     AS mentor_score,
            u.mentor_bio AS mentor_bio,
            t.name      AS topic_name
        FROM mentoring_offers o
        LEFT JOIN users u ON u.id::text = o.mentor_id
        LEFT JOIN learning_topics t ON t.slug = o.topic_slug
        LEFT JOIN learning_categories c ON c.id = t.category_id
        WHERE o.status = 'open'
        "#,
    );

    let mut param_idx: usize = 1;
    let mut params: Vec<String> = vec![];

    if let Some(ref slug) = filters.topic_slug {
        sql.push_str(&format!(" AND o.topic_slug = ${}", param_idx));
        params.push(slug.clone());
        param_idx += 1;
    }
    if let Some(ref cat) = filters.category {
        sql.push_str(&format!(" AND c.slug = ${}", param_idx));
        params.push(cat.clone());
        param_idx += 1;
    }
    if let Some(ref lvl) = filters.level {
        sql.push_str(&format!(" AND o.target_level = ${}", param_idx));
        params.push(lvl.clone());
        param_idx += 1;
    }
    if let Some(ref fmt) = filters.format {
        sql.push_str(&format!(" AND o.format = ${}", param_idx));
        params.push(fmt.clone());
        param_idx += 1;
    }
    if let Some(max) = filters.max_cost {
        sql.push_str(&format!(" AND o.token_cost <= ${}", param_idx));
        params.push(max.to_string());
        param_idx += 1;
    }
    if let Some(ref mid) = filters.mentor_id {
        sql.push_str(&format!(" AND o.mentor_id = ${}", param_idx));
        params.push(mid.clone());
        param_idx += 1;
    }

    sql.push_str(&format!(
        " ORDER BY o.created_at DESC LIMIT ${} OFFSET ${}",
        param_idx,
        param_idx + 1
    ));

    let mut query = sqlx::query(&sql);
    for p in &params {
        query = query.bind(p);
    }
    query = query.bind(limit).bind(offset);

    let rows = query.fetch_all(state.db.pool()).await.map_err(|e| {
        tracing::error!("Error listing mentoring offers: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let offers: Vec<serde_json::Value> = rows
        .into_iter()
        .map(|row| {
            let mentor_id: String = row.try_get("mentor_id").unwrap_or_default();
            let topic_slug: String = row.try_get("topic_slug").unwrap_or_default();
            let mentor_firstname: Option<String> = row.try_get("mentor_firstname").ok();
            let mentor_lastname: Option<String> = row.try_get("mentor_lastname").ok();
            let mentor_avatar: Option<String> = row.try_get("mentor_avatar").ok();
            let mentor_score: Option<i32> = row.try_get("mentor_score").ok();
            let mentor_bio: Option<String> = row.try_get("mentor_bio").ok();
            let topic_name: Option<String> = row.try_get("topic_name").ok();

            serde_json::json!({
                "id":               row.try_get::<String, _>("id").unwrap_or_default(),
                "mentor_id":        mentor_id,
                "topic_slug":       topic_slug,
                "target_level":     row.try_get::<String, _>("target_level").unwrap_or_default(),
                "description":      row.try_get::<Option<String>, _>("description").unwrap_or(None),
                "duration_minutes": row.try_get::<i32, _>("duration_minutes").unwrap_or(60),
                "format":           row.try_get::<String, _>("format").unwrap_or_default(),
                "token_cost":       row.try_get::<i32, _>("token_cost").unwrap_or(0),
                "availability":     row.try_get::<serde_json::Value, _>("availability").unwrap_or(serde_json::Value::Array(vec![])),
                "status":           row.try_get::<String, _>("status").unwrap_or_else(|_| "open".to_string()),
                "created_at":       row.try_get::<chrono::DateTime<chrono::Utc>, _>("created_at").unwrap_or_else(|_| chrono::Utc::now()),
                "updated_at":       row.try_get::<chrono::DateTime<chrono::Utc>, _>("updated_at").unwrap_or_else(|_| chrono::Utc::now()),
                "mentor": {
                    "id":         mentor_id.clone(),
                    "firstname":  mentor_firstname,
                    "lastname":   mentor_lastname,
                    "avatar_url": mentor_avatar,
                    "score":      mentor_score,
                    "mentor_bio": mentor_bio,
                },
                "topic": {
                    "slug": topic_slug.clone(),
                    "name": topic_name,
                },
            })
        })
        .collect();

    Ok(Json(offers))
}

/// GET /api/mentoring/offers/:id
pub async fn get_offer(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<MentoringOffer>, StatusCode> {
    let row = sqlx::query("SELECT * FROM mentoring_offers WHERE id = $1")
        .bind(&id)
        .fetch_optional(state.db.pool())
        .await
        .map_err(|e| {
            tracing::error!("Error fetching offer {}: {}", id, e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(MentoringOffer {
        id: row.try_get("id").unwrap_or_default(),
        mentor_id: row.try_get("mentor_id").unwrap_or_default(),
        topic_slug: row.try_get("topic_slug").unwrap_or_default(),
        target_level: row.try_get("target_level").unwrap_or_default(),
        description: row.try_get("description").ok(),
        duration_minutes: row.try_get("duration_minutes").unwrap_or(60),
        format: row.try_get("format").unwrap_or_default(),
        token_cost: row.try_get("token_cost").unwrap_or(0),
        availability: row
            .try_get("availability")
            .unwrap_or(serde_json::Value::Array(vec![])),
        status: row.try_get("status").unwrap_or_else(|_| "open".to_string()),
        created_at: row
            .try_get("created_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
        updated_at: row
            .try_get("updated_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
    }))
}

/// POST /api/mentoring/offers — crée une offre (mentor authentifié)
pub async fn create_offer(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
    Json(payload): Json<CreateOfferPayload>,
) -> Result<Json<MentoringOffer>, StatusCode> {
    // Validation minimale
    if payload.token_cost < 0 || payload.duration_minutes <= 0 {
        return Err(StatusCode::BAD_REQUEST);
    }

    let row = sqlx::query(
        r#"
        INSERT INTO mentoring_offers
            (mentor_id, topic_slug, target_level, description, duration_minutes,
             format, token_cost, availability, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
        RETURNING *
        "#,
    )
    .bind(&auth_user.id)
    .bind(&payload.topic_slug)
    .bind(&payload.target_level)
    .bind(&payload.description)
    .bind(payload.duration_minutes)
    .bind(&payload.format)
    .bind(payload.token_cost)
    .bind(&payload.availability)
    .fetch_one(state.db.pool())
    .await
    .map_err(|e| {
        tracing::error!("Error creating offer: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    tracing::info!(
        "Mentor {} created offer {}",
        auth_user.id,
        row.try_get::<String, _>("id").unwrap_or_default()
    );

    Ok(Json(MentoringOffer {
        id: row.try_get("id").unwrap_or_default(),
        mentor_id: row.try_get("mentor_id").unwrap_or_default(),
        topic_slug: row.try_get("topic_slug").unwrap_or_default(),
        target_level: row.try_get("target_level").unwrap_or_default(),
        description: row.try_get("description").ok(),
        duration_minutes: row.try_get("duration_minutes").unwrap_or(60),
        format: row.try_get("format").unwrap_or_default(),
        token_cost: row.try_get("token_cost").unwrap_or(0),
        availability: row
            .try_get("availability")
            .unwrap_or(serde_json::Value::Array(vec![])),
        status: row.try_get("status").unwrap_or_else(|_| "open".to_string()),
        created_at: row
            .try_get("created_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
        updated_at: row
            .try_get("updated_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
    }))
}

/// PUT /api/mentoring/offers/:id — modifier son offre
pub async fn update_offer(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
    Path(id): Path<String>,
    Json(payload): Json<UpdateOfferPayload>,
) -> Result<Json<MentoringOffer>, StatusCode> {
    // Vérifier que l'offre appartient bien à ce mentor
    let existing = sqlx::query("SELECT mentor_id FROM mentoring_offers WHERE id = $1")
        .bind(&id)
        .fetch_optional(state.db.pool())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let owner_id: String = existing
        .try_get("mentor_id")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    if owner_id != auth_user.id {
        return Err(StatusCode::FORBIDDEN);
    }

    let row = sqlx::query(
        r#"
        UPDATE mentoring_offers SET
            description      = COALESCE($1, description),
            duration_minutes = COALESCE($2, duration_minutes),
            format           = COALESCE($3, format),
            token_cost       = COALESCE($4, token_cost),
            availability     = COALESCE($5, availability),
            status           = COALESCE($6, status)
        WHERE id = $7
        RETURNING *
        "#,
    )
    .bind(&payload.description)
    .bind(payload.duration_minutes)
    .bind(&payload.format)
    .bind(payload.token_cost)
    .bind(&payload.availability)
    .bind(&payload.status)
    .bind(&id)
    .fetch_one(state.db.pool())
    .await
    .map_err(|e| {
        tracing::error!("Error updating offer {}: {}", id, e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(MentoringOffer {
        id: row.try_get("id").unwrap_or_default(),
        mentor_id: row.try_get("mentor_id").unwrap_or_default(),
        topic_slug: row.try_get("topic_slug").unwrap_or_default(),
        target_level: row.try_get("target_level").unwrap_or_default(),
        description: row.try_get("description").ok(),
        duration_minutes: row.try_get("duration_minutes").unwrap_or(60),
        format: row.try_get("format").unwrap_or_default(),
        token_cost: row.try_get("token_cost").unwrap_or(0),
        availability: row
            .try_get("availability")
            .unwrap_or(serde_json::Value::Array(vec![])),
        status: row.try_get("status").unwrap_or_else(|_| "open".to_string()),
        created_at: row
            .try_get("created_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
        updated_at: row
            .try_get("updated_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
    }))
}

/// DELETE /api/mentoring/offers/:id — annuler son offre
pub async fn cancel_offer(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
    Path(id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    let existing = sqlx::query("SELECT mentor_id, status FROM mentoring_offers WHERE id = $1")
        .bind(&id)
        .fetch_optional(state.db.pool())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let owner_id: String = existing
        .try_get("mentor_id")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    if owner_id != auth_user.id {
        return Err(StatusCode::FORBIDDEN);
    }

    sqlx::query("UPDATE mentoring_offers SET status = 'cancelled' WHERE id = $1")
        .bind(&id)
        .execute(state.db.pool())
        .await
        .map_err(|e| {
            tracing::error!("Error cancelling offer {}: {}", id, e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(StatusCode::NO_CONTENT)
}

// ============================================================
// Handlers — Sessions /me
// ============================================================

/// GET /api/users/me/mentoring-offers — offres du mentor connecté
pub async fn get_my_offers(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
) -> Result<Json<Vec<MentoringOffer>>, StatusCode> {
    let rows =
        sqlx::query("SELECT * FROM mentoring_offers WHERE mentor_id = $1 ORDER BY created_at DESC")
            .bind(&auth_user.id)
            .fetch_all(state.db.pool())
            .await
            .map_err(|e| {
                tracing::error!("Error fetching my offers: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

    let offers: Vec<MentoringOffer> = rows
        .into_iter()
        .map(|row| MentoringOffer {
            id: row.try_get("id").unwrap_or_default(),
            mentor_id: row.try_get("mentor_id").unwrap_or_default(),
            topic_slug: row.try_get("topic_slug").unwrap_or_default(),
            target_level: row.try_get("target_level").unwrap_or_default(),
            description: row.try_get("description").ok(),
            duration_minutes: row.try_get("duration_minutes").unwrap_or(60),
            format: row.try_get("format").unwrap_or_default(),
            token_cost: row.try_get("token_cost").unwrap_or(0),
            availability: row
                .try_get("availability")
                .unwrap_or(serde_json::Value::Array(vec![])),
            status: row.try_get("status").unwrap_or_else(|_| "open".to_string()),
            created_at: row
                .try_get("created_at")
                .unwrap_or_else(|_| chrono::Utc::now()),
            updated_at: row
                .try_get("updated_at")
                .unwrap_or_else(|_| chrono::Utc::now()),
        })
        .collect();

    Ok(Json(offers))
}

/// GET /api/users/me/mentoring-bookings — réservations du mentee connecté
pub async fn get_my_bookings(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
) -> Result<Json<Vec<MentoringBooking>>, StatusCode> {
    let rows = sqlx::query(
        "SELECT * FROM mentoring_bookings WHERE mentee_id = $1 ORDER BY scheduled_at ASC",
    )
    .bind(&auth_user.id)
    .fetch_all(state.db.pool())
    .await
    .map_err(|e| {
        tracing::error!("Error fetching my bookings: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let bookings: Vec<MentoringBooking> = rows
        .into_iter()
        .map(|row| MentoringBooking {
            id: row.try_get("id").unwrap_or_default(),
            offer_id: row.try_get("offer_id").unwrap_or_default(),
            mentee_id: row.try_get("mentee_id").unwrap_or_default(),
            scheduled_at: row
                .try_get("scheduled_at")
                .unwrap_or_else(|_| chrono::Utc::now()),
            status: row
                .try_get("status")
                .unwrap_or_else(|_| "pending".to_string()),
            mentee_confirmed: row.try_get("mentee_confirmed").unwrap_or(false),
            mentor_confirmed: row.try_get("mentor_confirmed").unwrap_or(false),
            tokens_escrowed: row.try_get("tokens_escrowed").unwrap_or(0),
            mentee_rating: row.try_get("mentee_rating").ok(),
            mentor_rating: row.try_get("mentor_rating").ok(),
            mentee_comment: row.try_get("mentee_comment").ok(),
            mentor_comment: row.try_get("mentor_comment").ok(),
            learned_skills: row.try_get("learned_skills").unwrap_or_default(),
            created_at: row
                .try_get("created_at")
                .unwrap_or_else(|_| chrono::Utc::now()),
            updated_at: row
                .try_get("updated_at")
                .unwrap_or_else(|_| chrono::Utc::now()),
        })
        .collect();

    Ok(Json(bookings))
}

// ============================================================
// Handlers — Réservations
// ============================================================

/// POST /api/mentoring/bookings — réserver une session (avec séquestre T4G)
pub async fn create_booking(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
    Json(payload): Json<CreateBookingPayload>,
) -> Result<Json<MentoringBooking>, StatusCode> {
    // Récupérer l'offre
    let offer_row = sqlx::query(
        "SELECT token_cost, status, mentor_id, topic_slug FROM mentoring_offers WHERE id = $1",
    )
    .bind(&payload.offer_id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    let offer_status: String = offer_row
        .try_get("status")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    if offer_status != "open" {
        return Err(StatusCode::CONFLICT);
    }

    let mentor_id: String = offer_row
        .try_get("mentor_id")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    if mentor_id == auth_user.id {
        return Err(StatusCode::BAD_REQUEST);
    }

    let token_cost: i32 = offer_row
        .try_get("token_cost")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let topic_slug: String = offer_row
        .try_get("topic_slug")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // ── Vérification du solde T4G du mentee ──
    mentoring_completion::check_balance(state.db.pool(), &auth_user.id, token_cost as i64)
        .await
        .map_err(|e| {
            tracing::warn!("Insufficient balance for mentee {}: {}", auth_user.id, e);
            StatusCode::PAYMENT_REQUIRED
        })?;

    let mut tx = state
        .db
        .pool()
        .begin()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Créer la réservation
    let booking_row = sqlx::query(
        r#"
        INSERT INTO mentoring_bookings
            (offer_id, mentee_id, scheduled_at, status, tokens_escrowed,
             completion_deadline, notes)
        VALUES ($1, $2, $3, 'pending', $4, NOW() + INTERVAL '48 hours', $5)
        RETURNING *
        "#,
    )
    .bind(&payload.offer_id)
    .bind(&auth_user.id)
    .bind(payload.scheduled_at)
    .bind(token_cost)
    .bind(&payload.notes)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| {
        tracing::error!("Error creating booking: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let booking_id: String = booking_row.try_get("id").unwrap_or_default();

    // Passer l'offre en "booked"
    sqlx::query("UPDATE mentoring_offers SET status = 'booked' WHERE id = $1")
        .bind(&payload.offer_id)
        .execute(&mut *tx)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    tx.commit()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // ── Débit séquestre (hors transaction SQL pour éviter deadlock) ──
    if token_cost > 0 {
        if let Err(e) = mentoring_completion::debit_escrow(
            state.db.pool(),
            &auth_user.id,
            token_cost as i64,
            &booking_id,
            &topic_slug,
        )
        .await
        {
            tracing::error!("Escrow debit failed for booking {}: {}", booking_id, e);
        }
    }

    tracing::info!(
        "Booking {} created: mentee {} booked offer {} for {} T4G (escrowed)",
        booking_id,
        auth_user.id,
        payload.offer_id,
        token_cost
    );

    Ok(Json(MentoringBooking {
        id: booking_id,
        offer_id: booking_row.try_get("offer_id").unwrap_or_default(),
        mentee_id: booking_row.try_get("mentee_id").unwrap_or_default(),
        scheduled_at: booking_row
            .try_get("scheduled_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
        status: booking_row
            .try_get("status")
            .unwrap_or_else(|_| "pending".to_string()),
        mentee_confirmed: false,
        mentor_confirmed: false,
        tokens_escrowed: token_cost,
        mentee_rating: None,
        mentor_rating: None,
        mentee_comment: None,
        mentor_comment: None,
        learned_skills: vec![],
        created_at: booking_row
            .try_get("created_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
        updated_at: booking_row
            .try_get("updated_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
    }))
}

/// POST /api/mentoring/bookings/:id/confirm — confirmer la complétion
pub async fn confirm_booking(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
    Path(id): Path<String>,
    Json(payload): Json<ConfirmBookingPayload>,
) -> Result<Json<MentoringBooking>, StatusCode> {
    // Récupérer la réservation avec l'offer
    let booking_row = sqlx::query(
        r#"
        SELECT b.*, o.mentor_id
        FROM mentoring_bookings b
        JOIN mentoring_offers o ON o.id = b.offer_id
        WHERE b.id = $1
        "#,
    )
    .bind(&id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    let mentee_id: String = booking_row
        .try_get("mentee_id")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mentor_id: String = booking_row
        .try_get("mentor_id")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let is_mentee = auth_user.id == mentee_id;
    let is_mentor = auth_user.id == mentor_id;

    if !is_mentee && !is_mentor {
        return Err(StatusCode::FORBIDDEN);
    }

    let (mentee_col, mentor_col, rating_col, comment_col) = if is_mentee {
        (
            "mentee_confirmed",
            "mentor_confirmed",
            "mentee_rating",
            "mentee_comment",
        )
    } else {
        (
            "mentor_confirmed",
            "mentee_confirmed",
            "mentor_rating",
            "mentor_comment",
        )
    };

    let other_confirmed: bool = booking_row.try_get(mentor_col).unwrap_or(false);

    let new_status = if other_confirmed {
        "completed"
    } else {
        "pending_completion"
    };

    let updated = sqlx::query(&format!(
        r#"
            UPDATE mentoring_bookings SET
                {mentee_col}  = true,
                {rating_col}  = COALESCE($1, {rating_col}),
                {comment_col} = COALESCE($2, {comment_col}),
                learned_skills = COALESCE($3, learned_skills),
                status        = $4
            WHERE id = $5
            RETURNING *
            "#,
        mentee_col = mentee_col,
        rating_col = rating_col,
        comment_col = comment_col,
    ))
    .bind(payload.rating)
    .bind(&payload.comment)
    .bind(payload.learned_skills.as_deref())
    .bind(new_status)
    .bind(&id)
    .fetch_one(state.db.pool())
    .await
    .map_err(|e| {
        tracing::error!("Error confirming booking {}: {}", id, e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Si complétion totale → libérer le séquestre + proof RGB
    if new_status == "completed" {
        let offer_id: String = updated.try_get("offer_id").unwrap_or_default();
        let escrow: i32 = updated.try_get("tokens_escrowed").unwrap_or(0);
        let m_rating: Option<i32> = updated.try_get("mentee_rating").ok();
        let m_comment: Option<String> = updated.try_get("mentee_comment").ok();

        // Récupérer topic + durée depuis l'offre
        let offer_extra =
            sqlx::query("SELECT topic_slug, duration_minutes FROM mentoring_offers WHERE id = $1")
                .bind(&offer_id)
                .fetch_optional(state.db.pool())
                .await
                .ok()
                .flatten();

        let topic_slug = offer_extra
            .as_ref()
            .and_then(|r| r.try_get::<String, _>("topic_slug").ok())
            .unwrap_or_default();
        let duration = offer_extra
            .as_ref()
            .and_then(|r| r.try_get::<i32, _>("duration_minutes").ok())
            .unwrap_or(60);

        // Passer l'offre en completed
        let _ = sqlx::query("UPDATE mentoring_offers SET status = 'completed' WHERE id = $1")
            .bind(&offer_id)
            .execute(state.db.pool())
            .await;

        // Attribution tokens + proof RGB (errors are logged inside, always returns)
        let result = mentoring_completion::complete_and_award(
            state.db.pool(),
            &state.rgb,
            &id,
            &mentor_id,
            &mentee_id,
            &topic_slug,
            escrow as i64,
            duration,
            m_rating,
            m_comment,
        )
        .await;

        tracing::info!(
            "Booking {} completed: {} T4G → mentor {}, {} T4G → mentee {}, RGB={}",
            id,
            result.tokens_to_mentor,
            mentor_id,
            result.tokens_to_mentee,
            mentee_id,
            result.rgb_contract_id.as_deref().unwrap_or("none")
        );

        // Persister les montants et l'ID proof RGB dans le booking
        let _ = sqlx::query(
            r#"UPDATE mentoring_bookings SET
                tokens_awarded_mentor = $1,
                tokens_awarded_mentee = $2,
                rgb_contract_id       = $3,
                rgb_signature         = $4
               WHERE id = $5"#,
        )
        .bind(result.tokens_to_mentor as i32)
        .bind(result.tokens_to_mentee as i32)
        .bind(&result.rgb_contract_id)
        .bind(&result.rgb_signature)
        .bind(&id)
        .execute(state.db.pool())
        .await;
    }

    Ok(Json(MentoringBooking {
        id: updated.try_get("id").unwrap_or_default(),
        offer_id: updated.try_get("offer_id").unwrap_or_default(),
        mentee_id: updated.try_get("mentee_id").unwrap_or_default(),
        scheduled_at: updated
            .try_get("scheduled_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
        status: updated
            .try_get("status")
            .unwrap_or_else(|_| "pending_completion".to_string()),
        mentee_confirmed: updated.try_get("mentee_confirmed").unwrap_or(false),
        mentor_confirmed: updated.try_get("mentor_confirmed").unwrap_or(false),
        tokens_escrowed: updated.try_get("tokens_escrowed").unwrap_or(0),
        mentee_rating: updated.try_get("mentee_rating").ok(),
        mentor_rating: updated.try_get("mentor_rating").ok(),
        mentee_comment: updated.try_get("mentee_comment").ok(),
        mentor_comment: updated.try_get("mentor_comment").ok(),
        learned_skills: updated.try_get("learned_skills").unwrap_or_default(),
        created_at: updated
            .try_get("created_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
        updated_at: updated
            .try_get("updated_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
    }))
}

/// GET /api/mentoring/bookings/:id — détail d'une réservation
pub async fn get_booking(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
    Path(id): Path<String>,
) -> Result<Json<MentoringBooking>, StatusCode> {
    let booking_row = sqlx::query(
        r#"
        SELECT b.*, o.mentor_id
        FROM mentoring_bookings b
        JOIN mentoring_offers o ON o.id = b.offer_id
        WHERE b.id = $1
        "#,
    )
    .bind(&id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    let mentee_id: String = booking_row
        .try_get("mentee_id")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mentor_id: String = booking_row
        .try_get("mentor_id")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    if auth_user.id != mentee_id && auth_user.id != mentor_id {
        return Err(StatusCode::FORBIDDEN);
    }

    Ok(Json(MentoringBooking {
        id: booking_row.try_get("id").unwrap_or_default(),
        offer_id: booking_row.try_get("offer_id").unwrap_or_default(),
        mentee_id: booking_row.try_get("mentee_id").unwrap_or_default(),
        scheduled_at: booking_row
            .try_get("scheduled_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
        status: booking_row
            .try_get("status")
            .unwrap_or_else(|_| "pending".to_string()),
        mentee_confirmed: booking_row.try_get("mentee_confirmed").unwrap_or(false),
        mentor_confirmed: booking_row.try_get("mentor_confirmed").unwrap_or(false),
        tokens_escrowed: booking_row.try_get("tokens_escrowed").unwrap_or(0),
        mentee_rating: booking_row.try_get("mentee_rating").ok(),
        mentor_rating: booking_row.try_get("mentor_rating").ok(),
        mentee_comment: booking_row.try_get("mentee_comment").ok(),
        mentor_comment: booking_row.try_get("mentor_comment").ok(),
        learned_skills: booking_row.try_get("learned_skills").unwrap_or_default(),
        created_at: booking_row
            .try_get("created_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
        updated_at: booking_row
            .try_get("updated_at")
            .unwrap_or_else(|_| chrono::Utc::now()),
    }))
}

/// GET /api/mentoring/sessions/:id — vue enrichie booking + offre
pub async fn get_session_full(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let row = sqlx::query(
        r#"
        SELECT
            b.id AS booking_id, b.offer_id, b.mentee_id, b.scheduled_at,
            b.status, b.mentee_confirmed, b.mentor_confirmed,
            b.tokens_escrowed, b.tokens_awarded_mentor, b.tokens_awarded_mentee,
            b.mentee_rating, b.mentor_rating,
            b.mentee_comment, b.mentor_comment,
            b.learned_skills, b.rgb_contract_id, b.notes,
            b.created_at AS booking_created_at,
            b.updated_at AS booking_updated_at,
            o.id AS offer_id_2, o.mentor_id, o.topic_slug, o.target_level,
            o.description AS offer_description, o.duration_minutes,
            o.format, o.token_cost, o.availability, o.status AS offer_status,
            o.created_at AS offer_created_at
        FROM mentoring_bookings b
        JOIN mentoring_offers o ON o.id = b.offer_id
        WHERE b.id = $1
        "#,
    )
    .bind(&id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

    let mentee_id: String = row
        .try_get("mentee_id")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mentor_id: String = row
        .try_get("mentor_id")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    if auth_user.id != mentee_id && auth_user.id != mentor_id {
        return Err(StatusCode::FORBIDDEN);
    }

    let json = serde_json::json!({
        "id":                    row.try_get::<String, _>("booking_id").unwrap_or_default(),
        "offer_id":              row.try_get::<String, _>("offer_id").unwrap_or_default(),
        "mentee_id":             mentee_id,
        "scheduled_at":          row.try_get::<chrono::DateTime<chrono::Utc>, _>("scheduled_at").unwrap_or_else(|_| chrono::Utc::now()),
        "status":                row.try_get::<String, _>("status").unwrap_or_else(|_| "pending".to_string()),
        "mentee_confirmed":      row.try_get::<bool, _>("mentee_confirmed").unwrap_or(false),
        "mentor_confirmed":      row.try_get::<bool, _>("mentor_confirmed").unwrap_or(false),
        "tokens_escrowed":       row.try_get::<i32, _>("tokens_escrowed").unwrap_or(0),
        "tokens_awarded_mentor": row.try_get::<Option<i32>, _>("tokens_awarded_mentor").unwrap_or(None),
        "tokens_awarded_mentee": row.try_get::<Option<i32>, _>("tokens_awarded_mentee").unwrap_or(None),
        "mentee_rating":         row.try_get::<Option<i32>, _>("mentee_rating").unwrap_or(None),
        "mentor_rating":         row.try_get::<Option<i32>, _>("mentor_rating").unwrap_or(None),
        "mentee_comment":        row.try_get::<Option<String>, _>("mentee_comment").unwrap_or(None),
        "mentor_comment":        row.try_get::<Option<String>, _>("mentor_comment").unwrap_or(None),
        "learned_skills":        row.try_get::<Vec<String>, _>("learned_skills").unwrap_or_default(),
        "rgb_contract_id":       row.try_get::<Option<String>, _>("rgb_contract_id").unwrap_or(None),
        "notes":                 row.try_get::<Option<String>, _>("notes").unwrap_or(None),
        "created_at":            row.try_get::<chrono::DateTime<chrono::Utc>, _>("booking_created_at").unwrap_or_else(|_| chrono::Utc::now()),
        "updated_at":            row.try_get::<chrono::DateTime<chrono::Utc>, _>("booking_updated_at").unwrap_or_else(|_| chrono::Utc::now()),
        "offer": {
            "id":               row.try_get::<String, _>("offer_id_2").unwrap_or_default(),
            "mentor_id":        mentor_id,
            "topic_slug":       row.try_get::<String, _>("topic_slug").unwrap_or_default(),
            "target_level":     row.try_get::<String, _>("target_level").unwrap_or_default(),
            "description":      row.try_get::<Option<String>, _>("offer_description").unwrap_or(None),
            "duration_minutes": row.try_get::<i32, _>("duration_minutes").unwrap_or(60),
            "format":           row.try_get::<String, _>("format").unwrap_or_default(),
            "token_cost":       row.try_get::<i32, _>("token_cost").unwrap_or(0),
            "availability":     row.try_get::<serde_json::Value, _>("availability").unwrap_or(serde_json::Value::Array(vec![])),
            "status":           row.try_get::<String, _>("offer_status").unwrap_or_default(),
            "created_at":       row.try_get::<chrono::DateTime<chrono::Utc>, _>("offer_created_at").unwrap_or_else(|_| chrono::Utc::now()),
        }
    });

    Ok(Json(json))
}

/// POST /api/mentoring/bookings/:id/dispute — ouvrir un litige
pub async fn dispute_booking(
    State(state): State<AppState>,
    AuthUserExtractor(auth_user): AuthUserExtractor,
    Path(id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    let booking_row = sqlx::query("SELECT mentee_id FROM mentoring_bookings WHERE id = $1")
        .bind(&id)
        .fetch_optional(state.db.pool())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::NOT_FOUND)?;

    let mentee_id: String = booking_row
        .try_get("mentee_id")
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    if mentee_id != auth_user.id {
        return Err(StatusCode::FORBIDDEN);
    }

    sqlx::query("UPDATE mentoring_bookings SET status = 'disputed' WHERE id = $1")
        .bind(&id)
        .execute(state.db.pool())
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    tracing::warn!("Dispute opened on booking {}", id);
    Ok(StatusCode::NO_CONTENT)
}
