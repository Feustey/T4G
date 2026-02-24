-- Migration 008: Tables mentoring_offers et mentoring_bookings

-- ============================================================
-- 1. OFFRES DE MENTORING (publiées par les mentors)
-- ============================================================

CREATE TABLE IF NOT EXISTS mentoring_offers (
    id               VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    mentor_id        VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_slug       VARCHAR(100) NOT NULL,
    target_level     VARCHAR(20) NOT NULL DEFAULT 'beginner'
                         CHECK (target_level IN ('beginner', 'intermediate', 'advanced')),
    description      TEXT,
    duration_minutes INT NOT NULL,
    format           VARCHAR(20) NOT NULL DEFAULT 'video'
                         CHECK (format IN ('video', 'text', 'async')),
    token_cost       INT NOT NULL CHECK (token_cost >= 0),
    availability     JSONB NOT NULL DEFAULT '[]'::jsonb,
    status           VARCHAR(20) NOT NULL DEFAULT 'open'
                         CHECK (status IN ('open', 'booked', 'completed', 'cancelled')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentoring_offers_mentor_id   ON mentoring_offers(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_offers_topic_slug  ON mentoring_offers(topic_slug);
CREATE INDEX IF NOT EXISTS idx_mentoring_offers_status      ON mentoring_offers(status);
CREATE INDEX IF NOT EXISTS idx_mentoring_offers_target_level ON mentoring_offers(target_level);

-- ============================================================
-- 2. RÉSERVATIONS (créées par les mentees)
-- ============================================================

CREATE TABLE IF NOT EXISTS mentoring_bookings (
    id               VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    offer_id         VARCHAR NOT NULL REFERENCES mentoring_offers(id) ON DELETE CASCADE,
    mentee_id        VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at     TIMESTAMPTZ NOT NULL,
    status           VARCHAR(30) NOT NULL DEFAULT 'pending'
                         CHECK (status IN (
                             'pending', 'confirmed', 'pending_completion',
                             'completed', 'auto_completed', 'disputed', 'cancelled'
                         )),
    mentee_confirmed BOOLEAN NOT NULL DEFAULT false,
    mentor_confirmed BOOLEAN NOT NULL DEFAULT false,
    tokens_escrowed  INT NOT NULL DEFAULT 0 CHECK (tokens_escrowed >= 0),
    mentee_rating    INT CHECK (mentee_rating BETWEEN 1 AND 5),
    mentor_rating    INT CHECK (mentor_rating BETWEEN 1 AND 5),
    mentee_comment   TEXT,
    mentor_comment   TEXT,
    learned_skills   TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentoring_bookings_offer_id  ON mentoring_bookings(offer_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_bookings_mentee_id ON mentoring_bookings(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_bookings_status    ON mentoring_bookings(status);

-- ============================================================
-- 3. TRIGGER updated_at automatique
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_mentoring_offers_updated_at'
    ) THEN
        CREATE TRIGGER trg_mentoring_offers_updated_at
            BEFORE UPDATE ON mentoring_offers
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_mentoring_bookings_updated_at'
    ) THEN
        CREATE TRIGGER trg_mentoring_bookings_updated_at
            BEFORE UPDATE ON mentoring_bookings
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;
