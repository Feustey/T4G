-- Migration 004: Tables pour Token4Good (T4G) Token System

-- Table pour les transactions de tokens T4G
CREATE TABLE IF NOT EXISTS t4g_token_transactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR NOT NULL CHECK (action_type IN ('mentoring', 'code_review', 'documentation', 'support_technique', 'parrainage', 'service_payment', 'weekly_bonus')),
    tokens INTEGER NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    impact_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_t4g_transactions_user_id ON t4g_token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_t4g_transactions_created_at ON t4g_token_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_t4g_transactions_action_type ON t4g_token_transactions(action_type);

-- Table pour les sessions de mentoring T4G
CREATE TABLE IF NOT EXISTS t4g_mentoring_sessions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    mentor_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_comments TEXT,
    learned_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    tokens_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_t4g_sessions_mentor_id ON t4g_mentoring_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_t4g_sessions_mentee_id ON t4g_mentoring_sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_t4g_sessions_status ON t4g_mentoring_sessions(status);

-- Table pour les services marketplace T4G
CREATE TABLE IF NOT EXISTS t4g_services (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    provider_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR NOT NULL,
    token_cost INTEGER NOT NULL,
    estimated_duration VARCHAR NOT NULL,
    requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    rating DECIMAL(3,2) DEFAULT 0.0,
    reviews_count INTEGER DEFAULT 0,
    status VARCHAR NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_t4g_services_provider_id ON t4g_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_t4g_services_category ON t4g_services(category);
CREATE INDEX IF NOT EXISTS idx_t4g_services_status ON t4g_services(status);

-- Table pour les réservations de services
CREATE TABLE IF NOT EXISTS t4g_bookings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    client_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id VARCHAR NOT NULL REFERENCES t4g_services(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    notes TEXT,
    status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_comments TEXT,
    would_recommend BOOLEAN,
    tokens_spent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_t4g_bookings_client_id ON t4g_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_t4g_bookings_service_id ON t4g_bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_t4g_bookings_status ON t4g_bookings(status);

-- Fonction pour calculer le niveau utilisateur basé sur les tokens
CREATE OR REPLACE FUNCTION calculate_user_level(total_tokens INTEGER) RETURNS VARCHAR AS $$
BEGIN
    IF total_tokens < 500 THEN
        RETURN 'contributeur';
    ELSIF total_tokens < 1500 THEN
        RETURN 'mentor';
    ELSE
        RETURN 'expert';
    END IF;
END;
$$ LANGUAGE plpgsql;

