-- Migration 010: Améliorations structurelles
-- ============================================================
-- 1. Suppression des tables obsolètes
--    - mentoring_requests  → remplacée par mentoring_offers + mentoring_bookings (008)
--    - t4g_mentoring_sessions → remplacée par mentoring_offers + mentoring_bookings (008)
-- ============================================================

DROP TABLE IF EXISTS t4g_mentoring_sessions CASCADE;
DROP TABLE IF EXISTS mentoring_requests CASCADE;

-- ============================================================
-- 2. Résolution du conflit mentoring_proofs
--    La version 001 avait des colonnes supplémentaires absentes de 009.
--    On les ajoute à la table existante pour avoir une structure complète.
-- ============================================================

ALTER TABLE mentoring_proofs
    ADD COLUMN IF NOT EXISTS feedback_mentor   TEXT,
    ADD COLUMN IF NOT EXISTS feedback_mentee   TEXT,
    ADD COLUMN IF NOT EXISTS transaction_hash  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS block_height      INTEGER,
    ADD COLUMN IF NOT EXISTS updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_tx_hash
    ON mentoring_proofs(transaction_hash)
    WHERE transaction_hash IS NOT NULL;

DROP TRIGGER IF EXISTS update_mentoring_proofs_updated_at ON mentoring_proofs;
CREATE TRIGGER update_mentoring_proofs_updated_at
    BEFORE UPDATE ON mentoring_proofs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. Contrainte FK sur mentoring_offers.topic_slug
--    Garantit que tout slug référencé existe dans learning_topics.
--    DEFERRABLE pour permettre des insertions en batch (seed data).
-- ============================================================

ALTER TABLE mentoring_offers
    DROP CONSTRAINT IF EXISTS fk_offers_topic_slug;

ALTER TABLE mentoring_offers
    ADD CONSTRAINT fk_offers_topic_slug
    FOREIGN KEY (topic_slug) REFERENCES learning_topics(slug)
    ON DELETE RESTRICT
    DEFERRABLE INITIALLY DEFERRED;

-- ============================================================
-- 4. mentor_id dénormalisé sur mentoring_bookings
--    Évite une jointure offers→bookings pour chaque lecture.
-- ============================================================

ALTER TABLE mentoring_bookings
    ADD COLUMN IF NOT EXISTS mentor_id VARCHAR REFERENCES users(id) ON DELETE SET NULL;

-- Backfill des bookings existants
UPDATE mentoring_bookings mb
    SET mentor_id = mo.mentor_id
    FROM mentoring_offers mo
    WHERE mb.offer_id = mo.id
      AND mb.mentor_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_mentoring_bookings_mentor_id
    ON mentoring_bookings(mentor_id);

-- Trigger pour synchroniser mentor_id automatiquement à la création d'un booking
CREATE OR REPLACE FUNCTION sync_booking_mentor_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mentor_id IS NULL THEN
        SELECT mentor_id INTO NEW.mentor_id
        FROM mentoring_offers
        WHERE id = NEW.offer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_booking_mentor_id ON mentoring_bookings;
CREATE TRIGGER trg_sync_booking_mentor_id
    BEFORE INSERT ON mentoring_bookings
    FOR EACH ROW EXECUTE FUNCTION sync_booking_mentor_id();

-- ============================================================
-- 5. Champs manquants sur users
--    Le frontend utilise is_graduated, is_speaker, is_staff
--    qui n'existaient pas en base.
-- ============================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_graduated BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_speaker   BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_staff     BOOLEAN NOT NULL DEFAULT false;

-- Backfill cohérent avec les rôles existants
UPDATE users SET is_graduated = true WHERE role = 'alumni'           AND is_graduated = false;
UPDATE users SET is_staff     = true WHERE role = 'admin'            AND is_staff = false;

-- ============================================================
-- 6. Indexes partiels manquants pour les requêtes fréquentes
-- ============================================================

-- Offres ouvertes par mentor (page find a mentor)
CREATE INDEX IF NOT EXISTS idx_mentoring_offers_open
    ON mentoring_offers(mentor_id, created_at DESC)
    WHERE status = 'open';

-- Bookings actifs (dashboard mentee/mentor)
CREATE INDEX IF NOT EXISTS idx_mentoring_bookings_active
    ON mentoring_bookings(mentee_id, scheduled_at)
    WHERE status IN ('pending', 'confirmed', 'pending_completion');

-- Utilisateurs mentors actifs (annuaire mentors)
CREATE INDEX IF NOT EXISTS idx_users_mentor_active
    ON users(id)
    WHERE is_mentor_active = true AND is_active = true;

-- ============================================================
-- 7. Trigger updated_at manquant sur notifications
-- ============================================================

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 8. Vue mise à jour : v_mentoring_sessions_full
--    Inclut maintenant mentor_id directement depuis bookings
-- ============================================================

CREATE OR REPLACE VIEW v_mentoring_sessions_full AS
SELECT
    b.id                        AS booking_id,
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
    b.dispute_reason,
    b.notes,
    b.created_at,
    b.updated_at,
    -- Offer info
    o.id                        AS offer_id,
    b.mentor_id,
    o.topic_slug,
    o.target_level,
    o.duration_minutes,
    o.format,
    o.token_cost,
    b.mentee_id,
    -- Mentor profile
    mu.firstname                AS mentor_firstname,
    mu.lastname                 AS mentor_lastname,
    mu.avatar                   AS mentor_avatar,
    mu.mentor_bio,
    -- Mentee profile
    me.firstname                AS mentee_firstname,
    me.lastname                 AS mentee_lastname,
    me.avatar                   AS mentee_avatar,
    -- Proof info
    mp.id                       AS proof_id,
    mp.rgb_contract_id          AS proof_contract_id,
    mp.signature                AS proof_signature
FROM mentoring_bookings b
JOIN mentoring_offers   o  ON o.id = b.offer_id
JOIN users              mu ON mu.id = b.mentor_id
JOIN users              me ON me.id = b.mentee_id
LEFT JOIN mentoring_proofs mp ON mp.request_id = b.id;
