-- ============================================================
-- Script de Migration Complète pour Token4Good Production
-- ============================================================
-- Ce script vérifie et met à jour la base de données avec
-- toutes les structures nécessaires pour Token4Good
-- Date: 2025-01-XX
-- Version: 1.0
-- ============================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TABLE USERS (Migration 001 + 002 + 003)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    firstname VARCHAR NOT NULL,
    lastname VARCHAR NOT NULL,
    lightning_address VARCHAR NOT NULL,
    role VARCHAR NOT NULL CHECK (role IN ('mentor', 'mentee', 'alumni', 'service_provider', 'admin')),
    username VARCHAR UNIQUE NOT NULL,
    bio TEXT,
    score INTEGER DEFAULT 0,
    avatar VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    wallet_address VARCHAR,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- Ajouter les colonnes de migration 002 si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'program') THEN
        ALTER TABLE users ADD COLUMN program VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'graduated_year') THEN
        ALTER TABLE users ADD COLUMN graduated_year VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'topic') THEN
        ALTER TABLE users ADD COLUMN topic VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'school') THEN
        ALTER TABLE users ADD COLUMN school VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'airdrop') THEN
        ALTER TABLE users ADD COLUMN airdrop INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'encrypted_wallet') THEN
        ALTER TABLE users ADD COLUMN encrypted_wallet TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'about') THEN
        ALTER TABLE users ADD COLUMN about TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_onboarded') THEN
        ALTER TABLE users ADD COLUMN is_onboarded BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_dashboard_access') THEN
        ALTER TABLE users ADD COLUMN first_dashboard_access BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'dashboard_access_count') THEN
        ALTER TABLE users ADD COLUMN dashboard_access_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'welcome_bonus_amount') THEN
        ALTER TABLE users ADD COLUMN welcome_bonus_amount INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'welcome_bonus_date') THEN
        ALTER TABLE users ADD COLUMN welcome_bonus_date TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'welcome_bonus_tx') THEN
        ALTER TABLE users ADD COLUMN welcome_bonus_tx VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'proposed_services') THEN
        ALTER TABLE users ADD COLUMN proposed_services TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferred_categories') THEN
        ALTER TABLE users ADD COLUMN preferred_categories TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'recommended_services') THEN
        ALTER TABLE users ADD COLUMN recommended_services TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- Ajouter les colonnes de migration 003 si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================================
-- 2. TABLES MENTORING (Migration 001)
-- ============================================================

CREATE TABLE IF NOT EXISTS mentoring_requests (
    id VARCHAR PRIMARY KEY,
    mentee_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR NOT NULL,
    message TEXT,
    status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentoring_proofs (
    id VARCHAR PRIMARY KEY,
    mentor_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id VARCHAR NOT NULL REFERENCES mentoring_requests(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    rgb_contract_id VARCHAR UNIQUE NOT NULL,
    signature VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proofs (
    id VARCHAR PRIMARY KEY,
    contract_id VARCHAR UNIQUE NOT NULL,
    mentor_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id VARCHAR NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected')),
    signature VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. TABLES SERVICES (Migration 002)
-- ============================================================

CREATE TABLE IF NOT EXISTS service_categories (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL UNIQUE,
    kind VARCHAR,
    description TEXT,
    href VARCHAR,
    default_price INTEGER DEFAULT 0,
    default_unit VARCHAR DEFAULT 'hour',
    icon VARCHAR,
    disabled BOOLEAN DEFAULT false,
    service_provider_type VARCHAR NOT NULL DEFAULT 'SERVICE_PROVIDER',
    audience VARCHAR NOT NULL DEFAULT 'ALUMNI',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR NOT NULL,
    unit VARCHAR DEFAULT 'hour',
    description TEXT,
    summary TEXT,
    avatar VARCHAR,
    price INTEGER NOT NULL DEFAULT 0,
    total_supply INTEGER DEFAULT 0,
    rating INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    suggestion BOOLEAN DEFAULT false,
    blockchain_id INTEGER,
    tx_hash VARCHAR,
    audience VARCHAR NOT NULL DEFAULT 'SERVICE_PROVIDER',
    category_id VARCHAR REFERENCES service_categories(id) ON DELETE SET NULL,
    service_provider_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    annotations TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hash VARCHAR UNIQUE NOT NULL,
    block INTEGER,
    ts TIMESTAMPTZ NOT NULL,
    from_address VARCHAR NOT NULL,
    to_address VARCHAR NOT NULL,
    method VARCHAR,
    event VARCHAR CHECK (event IN ('DealCreated', 'DealValidated', 'DealCancelled')),
    target_id VARCHAR,
    transfer_from VARCHAR,
    transfer_to VARCHAR,
    transfer_amount INTEGER,
    deal_id INTEGER,
    service_id INTEGER,
    service_buyer VARCHAR,
    service_provider VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiences (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    company VARCHAR,
    description TEXT,
    start_date VARCHAR,
    end_date VARCHAR,
    current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR NOT NULL,
    read BOOLEAN DEFAULT false,
    link VARCHAR,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TABLES TOKEN4GOOD (Migration 004)
-- ============================================================

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

-- ============================================================
-- 5. INDEXES
-- ============================================================

-- Indexes pour users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_lightning_address ON users(lightning_address);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified) WHERE email_verified = true;

-- Indexes pour mentoring_requests
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_mentee ON mentoring_requests(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_mentor ON mentoring_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_status ON mentoring_requests(status);

-- Indexes pour mentoring_proofs
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_mentor ON mentoring_proofs(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_mentee ON mentoring_proofs(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_request ON mentoring_proofs(request_id);

-- Indexes pour proofs
CREATE INDEX IF NOT EXISTS idx_proofs_contract_id ON proofs(contract_id);
CREATE INDEX IF NOT EXISTS idx_proofs_mentor ON proofs(mentor_id);
CREATE INDEX IF NOT EXISTS idx_proofs_mentee ON proofs(mentee_id);

-- Indexes pour services
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_services_blockchain_id ON services(blockchain_id);
CREATE INDEX IF NOT EXISTS idx_services_audience ON services(audience);

-- Indexes pour blockchain_transactions
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_hash ON blockchain_transactions(hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_block ON blockchain_transactions(block);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_from ON blockchain_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_to ON blockchain_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_service_buyer ON blockchain_transactions(service_buyer);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_service_provider ON blockchain_transactions(service_provider);

-- Indexes pour experiences
CREATE INDEX IF NOT EXISTS idx_experiences_user ON experiences(user_id);

-- Indexes pour notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Indexes pour service_categories
CREATE INDEX IF NOT EXISTS idx_service_categories_name ON service_categories(name);
CREATE INDEX IF NOT EXISTS idx_service_categories_audience ON service_categories(audience);

-- Indexes pour t4g_token_transactions
CREATE INDEX IF NOT EXISTS idx_t4g_transactions_user_id ON t4g_token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_t4g_transactions_created_at ON t4g_token_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_t4g_transactions_action_type ON t4g_token_transactions(action_type);

-- Indexes pour t4g_mentoring_sessions
CREATE INDEX IF NOT EXISTS idx_t4g_sessions_mentor_id ON t4g_mentoring_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_t4g_sessions_mentee_id ON t4g_mentoring_sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_t4g_sessions_status ON t4g_mentoring_sessions(status);

-- Indexes pour t4g_services
CREATE INDEX IF NOT EXISTS idx_t4g_services_provider_id ON t4g_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_t4g_services_category ON t4g_services(category);
CREATE INDEX IF NOT EXISTS idx_t4g_services_status ON t4g_services(status);

-- Indexes pour t4g_bookings
CREATE INDEX IF NOT EXISTS idx_t4g_bookings_client_id ON t4g_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_t4g_bookings_service_id ON t4g_bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_t4g_bookings_status ON t4g_bookings(status);

-- ============================================================
-- 6. FONCTIONS ET TRIGGERS
-- ============================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mentoring_requests_updated_at ON mentoring_requests;
CREATE TRIGGER update_mentoring_requests_updated_at BEFORE UPDATE ON mentoring_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mentoring_proofs_updated_at ON mentoring_proofs;
CREATE TRIGGER update_mentoring_proofs_updated_at BEFORE UPDATE ON mentoring_proofs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proofs_updated_at ON proofs;
CREATE TRIGGER update_proofs_updated_at BEFORE UPDATE ON proofs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_categories_updated_at ON service_categories;
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_t4g_mentoring_sessions_updated_at ON t4g_mentoring_sessions;
CREATE TRIGGER update_t4g_mentoring_sessions_updated_at BEFORE UPDATE ON t4g_mentoring_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_t4g_services_updated_at ON t4g_services;
CREATE TRIGGER update_t4g_services_updated_at BEFORE UPDATE ON t4g_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_t4g_bookings_updated_at ON t4g_bookings;
CREATE TRIGGER update_t4g_bookings_updated_at BEFORE UPDATE ON t4g_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- ============================================================
-- 7. VÉRIFICATIONS FINALES
-- ============================================================

-- Vérifier que toutes les tables existent
DO $$
DECLARE
    missing_tables TEXT[];
    tbl_name TEXT;
    required_tables TEXT[] := ARRAY[
        'users', 'mentoring_requests', 'mentoring_proofs', 'proofs',
        'service_categories', 'services', 'blockchain_transactions',
        'experiences', 'notifications',
        't4g_token_transactions', 't4g_mentoring_sessions',
        't4g_services', 't4g_bookings'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name AND table_schema = 'public') THEN
            missing_tables := array_append(missing_tables, tbl_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Tables manquantes: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ Toutes les tables requises sont présentes';
    END IF;
END $$;

-- Afficher un résumé
SELECT 
    'Migration complète' as status,
    COUNT(*) FILTER (WHERE table_name IN ('users', 'mentoring_requests', 'mentoring_proofs', 'proofs')) as tables_mentoring,
    COUNT(*) FILTER (WHERE table_name IN ('service_categories', 'services', 'blockchain_transactions', 'experiences', 'notifications')) as tables_services,
    COUNT(*) FILTER (WHERE table_name LIKE 't4g_%') as tables_t4g
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'users', 'mentoring_requests', 'mentoring_proofs', 'proofs',
    'service_categories', 'services', 'blockchain_transactions',
    'experiences', 'notifications',
    't4g_token_transactions', 't4g_mentoring_sessions',
    't4g_services', 't4g_bookings'
);

