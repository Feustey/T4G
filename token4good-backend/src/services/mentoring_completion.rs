//! Service de complétion des sessions de mentoring
//!
//! Expose des fonctions libres (pas de struct avec références) pour être
//! utilisées sans problème de lifetime dans les handlers Axum async (Send).
//!
//! - Vérification solde T4G avant réservation
//! - Débit séquestre à la réservation
//! - Attribution tokens à la complétion (séquestre → mentor + bonus mentee)
//! - Calcul du multiplicateur de niveau (Contributeur / Mentor / Expert)
//! - Génération automatique de la preuve RGB
//! - Auto-complétion 48h

use sqlx::PgPool;
use tracing::{error, info, warn};

use crate::services::rgb::RGBService;

// ── Constantes métier ──────────────────────────────────────────────────────

/// Bonus T4G attribué au mentee pour avoir complété une session
const MENTEE_LEARNING_BONUS: i64 = 5;
/// Seuil de niveau Mentor (T4G gagnés cumulés)
const LEVEL_MENTOR_THRESHOLD: i64 = 500;
/// Seuil de niveau Expert
const LEVEL_EXPERT_THRESHOLD: i64 = 1500;
/// Multiplicateur Expert
const MULTIPLIER_EXPERT: f64 = 1.2;
/// Multiplicateur Mentor
const MULTIPLIER_MENTOR: f64 = 1.1;

// ── Types de retour ────────────────────────────────────────────────────────

pub struct CompletionResult {
    pub tokens_to_mentor: i64,
    pub tokens_to_mentee: i64,
    pub rgb_contract_id: Option<String>,
    pub rgb_signature: Option<String>,
}

// ── Vérification du solde ──────────────────────────────────────────────────

/// Retourne le solde disponible du `user_id` ou une erreur si `< required`.
pub async fn check_balance(
    pool: &PgPool,
    user_id: &str,
    required: i64,
) -> Result<i64, String> {
    let earned: i64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(tokens), 0) FROM t4g_token_transactions WHERE user_id = $1 AND tokens > 0"
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);

    let spent: i64 = sqlx::query_scalar(
        "SELECT COALESCE(ABS(SUM(tokens)), 0) FROM t4g_token_transactions WHERE user_id = $1 AND tokens < 0"
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);

    let balance = earned - spent;

    if balance < required {
        return Err(format!(
            "Solde insuffisant : {} T4G disponibles, {} requis",
            balance, required
        ));
    }

    Ok(balance)
}

// ── Débit séquestre à la réservation ──────────────────────────────────────

/// Débite `amount` T4G du mentee (transaction négative = mise en séquestre).
pub async fn debit_escrow(
    pool: &PgPool,
    mentee_id: &str,
    amount: i64,
    booking_id: &str,
    offer_topic: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        INSERT INTO t4g_token_transactions
            (id, user_id, action_type, tokens, description, metadata, impact_score)
        VALUES (gen_random_uuid()::text, $1, 'service_payment', $2, $3, $4, 1.0)
        "#,
    )
    .bind(mentee_id)
    .bind(-(amount))
    .bind(format!("Séquestre session mentoring : {}", offer_topic))
    .bind(serde_json::json!({ "booking_id": booking_id, "type": "escrow_debit" }))
    .execute(pool)
    .await?;

    info!("Escrow debit: {} T4G from {} for booking {}", amount, mentee_id, booking_id);
    Ok(())
}

// ── Attribution des tokens à la complétion ────────────────────────────────

/// Calcule les tokens, libère le séquestre vers le mentor, attribue le bonus
/// au mentee, génère la proof RGB.
///
/// Retourne toujours `Ok(_)` pour ne pas bloquer la réponse HTTP ;
/// les erreurs partielles (RGB, DB) sont loguées.
pub async fn complete_and_award(
    pool: &PgPool,
    rgb: &RGBService,
    booking_id: &str,
    mentor_id: &str,
    mentee_id: &str,
    offer_topic: &str,
    escrow: i64,
    duration_minutes: i32,
    rating: Option<i32>,
    comment: Option<String>,
) -> CompletionResult {
    let rating_value = rating.unwrap_or(5).clamp(1, 5);

    // 1. Niveau du mentor (total gagné historique)
    let mentor_total: i64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(tokens), 0) FROM t4g_token_transactions WHERE user_id = $1 AND tokens > 0"
    )
    .bind(mentor_id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);

    let level_multiplier = if mentor_total >= LEVEL_EXPERT_THRESHOLD {
        MULTIPLIER_EXPERT
    } else if mentor_total >= LEVEL_MENTOR_THRESHOLD {
        MULTIPLIER_MENTOR
    } else {
        1.0_f64
    };

    // 2. Impact score = (rating / 5) × level_multiplier
    let impact_score = (rating_value as f64 / 5.0) * level_multiplier;
    let tokens_to_mentor = (escrow as f64 * impact_score).round() as i64;

    // 3. Crédit mentor
    let award_result = sqlx::query(
        r#"
        INSERT INTO t4g_token_transactions
            (id, user_id, action_type, tokens, description, metadata, impact_score)
        VALUES (gen_random_uuid()::text, $1, 'mentoring', $2, $3, $4, $5)
        "#,
    )
    .bind(mentor_id)
    .bind(tokens_to_mentor)
    .bind(format!("Session mentoring complétée : {}", offer_topic))
    .bind(serde_json::json!({
        "booking_id": booking_id,
        "type": "escrow_release",
        "rating": rating_value,
        "duration_minutes": duration_minutes,
        "level_multiplier": level_multiplier,
    }))
    .bind(impact_score)
    .execute(pool)
    .await;

    if let Err(e) = award_result {
        error!("Failed to award tokens to mentor {}: {}", mentor_id, e);
    } else {
        info!("{} T4G awarded to mentor {} (impact={:.2})", tokens_to_mentor, mentor_id, impact_score);
    }

    // 4. Bonus apprentissage → mentee
    let bonus_result = sqlx::query(
        r#"
        INSERT INTO t4g_token_transactions
            (id, user_id, action_type, tokens, description, metadata, impact_score)
        VALUES (gen_random_uuid()::text, $1, 'mentoring', $2, $3, $4, 1.0)
        "#,
    )
    .bind(mentee_id)
    .bind(MENTEE_LEARNING_BONUS)
    .bind("Bonus apprentissage — session de mentoring complétée")
    .bind(serde_json::json!({ "booking_id": booking_id, "type": "learning_bonus" }))
    .execute(pool)
    .await;

    if let Err(e) = bonus_result {
        error!("Failed to award learning bonus to mentee {}: {}", mentee_id, e);
    } else {
        info!("{} T4G learning bonus to mentee {}", MENTEE_LEARNING_BONUS, mentee_id);
    }

    // 5. Proof RGB (non-bloquant)
    let (rgb_contract_id, rgb_signature) = match rgb
        .create_proof_contract(mentor_id, mentee_id, booking_id, rating_value as u8, comment)
        .await
    {
        Ok((contract_id, signature)) => {
            info!("RGB proof generated: {}", contract_id);
            let _ = sqlx::query(
                r#"
                INSERT INTO mentoring_proofs
                    (id, request_id, mentor_id, mentee_id, rgb_contract_id, signature, rating)
                VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6)
                ON CONFLICT DO NOTHING
                "#,
            )
            .bind(booking_id)
            .bind(mentor_id)
            .bind(mentee_id)
            .bind(&contract_id)
            .bind(&signature)
            .bind(rating_value)
            .execute(pool)
            .await;
            (Some(contract_id), Some(signature))
        }
        Err(e) => {
            warn!("RGB proof generation failed (non-critical): {}", e);
            (None, None)
        }
    };

    CompletionResult {
        tokens_to_mentor,
        tokens_to_mentee: MENTEE_LEARNING_BONUS,
        rgb_contract_id,
        rgb_signature,
    }
}

// ── Auto-complétion 48h ────────────────────────────────────────────────────

/// Cherche les réservations `pending_completion` depuis > 48h et les
/// auto-complète (libère le séquestre sans nouvelle preuve RGB).
pub async fn run_auto_completion(pool: &PgPool, rgb: &RGBService) -> u64 {
    let rows = sqlx::query(
        r#"
        SELECT b.id, b.mentee_id, b.tokens_escrowed, b.mentee_rating, b.mentee_comment,
               o.mentor_id, o.topic_slug, o.duration_minutes
        FROM mentoring_bookings b
        JOIN mentoring_offers o ON o.id = b.offer_id
        WHERE b.status = 'pending_completion'
          AND b.updated_at < NOW() - INTERVAL '48 hours'
        "#,
    )
    .fetch_all(pool)
    .await;

    let rows = match rows {
        Ok(r) => r,
        Err(e) => {
            error!("Auto-completion query failed: {}", e);
            return 0;
        }
    };

    let count = rows.len() as u64;

    for row in rows {
        use sqlx::Row;
        let booking_id: String    = row.try_get("id").unwrap_or_default();
        let mentor_id: String     = row.try_get("mentor_id").unwrap_or_default();
        let mentee_id: String     = row.try_get("mentee_id").unwrap_or_default();
        let escrow: i32           = row.try_get("tokens_escrowed").unwrap_or(0);
        let topic_slug: String    = row.try_get("topic_slug").unwrap_or_default();
        let duration: i32         = row.try_get("duration_minutes").unwrap_or(60);
        let rating: Option<i32>   = row.try_get("mentee_rating").ok();
        let comment: Option<String> = row.try_get("mentee_comment").ok();

        let update = sqlx::query(
            "UPDATE mentoring_bookings SET status = 'auto_completed', mentor_confirmed = true WHERE id = $1"
        )
        .bind(&booking_id)
        .execute(pool)
        .await;

        if let Err(e) = update {
            error!("Auto-completion DB update failed for {}: {}", booking_id, e);
            continue;
        }

        let result = complete_and_award(
            pool, rgb,
            &booking_id, &mentor_id, &mentee_id, &topic_slug,
            escrow as i64, duration, rating, comment,
        ).await;

        warn!(
            "Auto-completed booking {}: {} T4G → mentor, {} T4G → mentee",
            booking_id, result.tokens_to_mentor, result.tokens_to_mentee
        );
    }

    count
}

// ── Tests ──────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_level_thresholds() {
        assert!(LEVEL_MENTOR_THRESHOLD < LEVEL_EXPERT_THRESHOLD);
        assert!(MULTIPLIER_MENTOR > 1.0);
        assert!(MULTIPLIER_EXPERT > MULTIPLIER_MENTOR);
    }

    #[test]
    fn test_learning_bonus() {
        assert!(MENTEE_LEARNING_BONUS > 0);
    }

    #[test]
    fn test_impact_score_expert_max() {
        // rating=5, niveau Expert → impact_score=1.2 → tokens = escrow * 1.2
        let impact = (5_f64 / 5.0) * MULTIPLIER_EXPERT;
        assert!((impact - 1.2).abs() < 0.001);
    }

    #[test]
    fn test_impact_score_contributeur_min() {
        // rating=1, niveau Contributeur → impact_score=0.2
        let impact = (1_f64 / 5.0) * 1.0;
        assert!((impact - 0.2).abs() < 0.001);
    }
}
