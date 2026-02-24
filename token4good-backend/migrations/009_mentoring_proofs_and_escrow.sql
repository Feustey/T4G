-- Migration 009: Preuves RGB + colonnes complétion séquestre

-- ============================================================
-- 1. TABLE mentoring_proofs (preuves RGB auto-générées)
-- ============================================================

CREATE TABLE IF NOT EXISTS mentoring_proofs (
    id               VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    request_id       VARCHAR NOT NULL,      -- booking_id ou session_id source
    mentor_id        VARCHAR NOT NULL,
    mentee_id        VARCHAR NOT NULL,
    rgb_contract_id  VARCHAR NOT NULL,
    signature        TEXT NOT NULL,
    rating           INT CHECK (rating BETWEEN 1 AND 5),
    comment          TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_request   ON mentoring_proofs(request_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_mentor    ON mentoring_proofs(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_mentee    ON mentoring_proofs(mentee_id);

-- ============================================================
-- 2. Colonnes complétion / dispute sur mentoring_bookings
-- ============================================================

ALTER TABLE mentoring_bookings
    ADD COLUMN IF NOT EXISTS completion_deadline TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rgb_contract_id VARCHAR,
    ADD COLUMN IF NOT EXISTS rgb_signature TEXT,
    ADD COLUMN IF NOT EXISTS tokens_awarded_mentor INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tokens_awarded_mentee INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================================
-- 3. Index partiel pour la job d'auto-complétion
--    Cible uniquement les lignes candidates (évite un full-scan)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_bookings_pending_48h
    ON mentoring_bookings(updated_at)
    WHERE status = 'pending_completion';

-- ============================================================
-- 4. Vue pratique : sessions avec infos enrichies
-- ============================================================

CREATE OR REPLACE VIEW v_mentoring_sessions_full AS
SELECT
    b.id                    AS booking_id,
    b.status,
    b.scheduled_at,
    b.tokens_escrowed,
    b.tokens_awarded_mentor,
    b.tokens_awarded_mentee,
    b.mentee_confirmed,
    b.mentor_confirmed,
    b.mentee_rating,
    b.mentor_rating,
    b.mentee_comment,
    b.mentor_comment,
    b.learned_skills,
    b.rgb_contract_id,
    b.completion_deadline,
    b.notes,
    b.created_at,
    b.updated_at,
    o.id                    AS offer_id,
    o.mentor_id,
    o.topic_slug,
    o.target_level,
    o.duration_minutes,
    o.format,
    o.token_cost,
    b.mentee_id,
    mp.rgb_contract_id      AS proof_contract_id,
    mp.signature            AS proof_signature
FROM mentoring_bookings b
JOIN mentoring_offers   o  ON o.id = b.offer_id
LEFT JOIN mentoring_proofs mp ON mp.request_id = b.id;
