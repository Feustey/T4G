use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

// ============================================================
// Enums
// ============================================================

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "snake_case")]
pub enum OfferStatus {
    #[serde(rename = "open")]
    Open,
    #[serde(rename = "booked")]
    Booked,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "cancelled")]
    Cancelled,
}

impl std::fmt::Display for OfferStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            OfferStatus::Open      => write!(f, "open"),
            OfferStatus::Booked    => write!(f, "booked"),
            OfferStatus::Completed => write!(f, "completed"),
            OfferStatus::Cancelled => write!(f, "cancelled"),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "snake_case")]
pub enum BookingStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "confirmed")]
    Confirmed,
    #[serde(rename = "pending_completion")]
    PendingCompletion,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "auto_completed")]
    AutoCompleted,
    #[serde(rename = "disputed")]
    Disputed,
    #[serde(rename = "cancelled")]
    Cancelled,
}

impl std::fmt::Display for BookingStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BookingStatus::Pending           => write!(f, "pending"),
            BookingStatus::Confirmed         => write!(f, "confirmed"),
            BookingStatus::PendingCompletion => write!(f, "pending_completion"),
            BookingStatus::Completed         => write!(f, "completed"),
            BookingStatus::AutoCompleted     => write!(f, "auto_completed"),
            BookingStatus::Disputed          => write!(f, "disputed"),
            BookingStatus::Cancelled         => write!(f, "cancelled"),
        }
    }
}

// ============================================================
// MentoringOffer — offre publiée par un mentor
// ============================================================

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct MentoringOffer {
    pub id: String,
    pub mentor_id: String,
    pub topic_slug: String,
    pub target_level: String,
    pub description: Option<String>,
    pub duration_minutes: i32,
    pub format: String,
    pub token_cost: i32,
    /// Créneaux disponibles : Vec<TimeSlot> sérialisé en JSONB
    pub availability: serde_json::Value,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Payload de création d'une offre
#[derive(Debug, Deserialize)]
pub struct CreateOfferPayload {
    pub topic_slug: String,
    pub target_level: String,
    pub description: Option<String>,
    pub duration_minutes: i32,
    pub format: String,
    pub token_cost: i32,
    pub availability: serde_json::Value,
}

/// Payload de mise à jour partielle d'une offre
#[derive(Debug, Deserialize)]
pub struct UpdateOfferPayload {
    pub description: Option<String>,
    pub duration_minutes: Option<i32>,
    pub format: Option<String>,
    pub token_cost: Option<i32>,
    pub availability: Option<serde_json::Value>,
    pub status: Option<String>,
}

// ============================================================
// MentoringBooking — réservation créée par un mentee
// ============================================================

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct MentoringBooking {
    pub id: String,
    pub offer_id: String,
    pub mentee_id: String,
    pub scheduled_at: DateTime<Utc>,
    pub status: String,
    pub mentee_confirmed: bool,
    pub mentor_confirmed: bool,
    pub tokens_escrowed: i32,
    pub mentee_rating: Option<i32>,
    pub mentor_rating: Option<i32>,
    pub mentee_comment: Option<String>,
    pub mentor_comment: Option<String>,
    pub learned_skills: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Payload de réservation
#[derive(Debug, Deserialize)]
pub struct CreateBookingPayload {
    pub offer_id: String,
    pub scheduled_at: DateTime<Utc>,
    pub notes: Option<String>,
}

/// Payload de confirmation de complétion
#[derive(Debug, Deserialize)]
pub struct ConfirmBookingPayload {
    pub rating: Option<i32>,
    pub comment: Option<String>,
    pub learned_skills: Option<Vec<String>>,
}

// ============================================================
// Tests
// ============================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_offer_status_serialize() {
        assert_eq!(serde_json::to_string(&OfferStatus::Open).unwrap(), "\"open\"");
        assert_eq!(serde_json::to_string(&OfferStatus::Booked).unwrap(), "\"booked\"");
        assert_eq!(serde_json::to_string(&OfferStatus::Completed).unwrap(), "\"completed\"");
        assert_eq!(serde_json::to_string(&OfferStatus::Cancelled).unwrap(), "\"cancelled\"");
    }

    #[test]
    fn test_booking_status_serialize() {
        assert_eq!(serde_json::to_string(&BookingStatus::Pending).unwrap(), "\"pending\"");
        assert_eq!(serde_json::to_string(&BookingStatus::PendingCompletion).unwrap(), "\"pending_completion\"");
        assert_eq!(serde_json::to_string(&BookingStatus::AutoCompleted).unwrap(), "\"auto_completed\"");
    }

    #[test]
    fn test_offer_status_display() {
        assert_eq!(OfferStatus::Open.to_string(), "open");
        assert_eq!(OfferStatus::Cancelled.to_string(), "cancelled");
    }

    #[test]
    fn test_booking_status_display() {
        assert_eq!(BookingStatus::PendingCompletion.to_string(), "pending_completion");
        assert_eq!(BookingStatus::AutoCompleted.to_string(), "auto_completed");
    }
}
