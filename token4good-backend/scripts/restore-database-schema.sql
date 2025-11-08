-- Script complet pour restaurer toute la structure de la base de données Token4Good
-- À exécuter directement dans psql ou Supabase SQL Editor si les migrations SQLx ne fonctionnent pas
-- 
-- Usage:
--   psql $DATABASE_URL -f scripts/restore-database-schema.sql
--   ou copier/coller dans Supabase SQL Editor

-- ============================================================
-- MIGRATION 001: Tables de base
-- ============================================================

-- Users table
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

-- Mentoring requests table
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

-- Mentoring proofs table (RGB contracts)
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

-- Proofs table (general proof system)
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_mentee ON mentoring_requests(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_mentor ON mentoring_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_status ON mentoring_requests(status);
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_mentor ON mentoring_proofs(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_mentee ON mentoring_proofs(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_request ON mentoring_proofs(request_id);
CREATE INDEX IF NOT EXISTS idx_proofs_contract_id ON proofs(contract_id);
CREATE INDEX IF NOT EXISTS idx_proofs_mentor ON proofs(mentor_id);
CREATE INDEX IF NOT EXISTS idx_proofs_mentee ON proofs(mentee_id);

-- ============================================================
-- MIGRATION 002: Services, categories, transactions
-- ============================================================

-- Service categories table
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

-- Services table
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

-- Blockchain transactions table
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

-- Experiences table (for user profiles)
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

-- Notifications table
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

-- Update users table with missing fields from MongoDB Identity model
ALTER TABLE users ADD COLUMN IF NOT EXISTS program VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduated_year VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS topic VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS school VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS airdrop INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS encrypted_wallet TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_dashboard_access BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dashboard_access_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_bonus_amount INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_bonus_date TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_bonus_tx VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS proposed_services TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_categories TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS recommended_services TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Indexes for performance (migration 002)
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_services_blockchain_id ON services(blockchain_id);
CREATE INDEX IF NOT EXISTS idx_services_audience ON services(audience);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_hash ON blockchain_transactions(hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_block ON blockchain_transactions(block);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_from ON blockchain_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_to ON blockchain_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_service_buyer ON blockchain_transactions(service_buyer);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_service_provider ON blockchain_transactions(service_provider);
CREATE INDEX IF NOT EXISTS idx_experiences_user ON experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_service_categories_name ON service_categories(name);
CREATE INDEX IF NOT EXISTS idx_service_categories_audience ON service_categories(audience);

-- ============================================================
-- MIGRATION 003: Champs d'authentification
-- ============================================================

-- Add email verification field
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Add last login tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Add index for email_verified (useful for filtering verified users)
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified) WHERE email_verified = true;

-- Add index for username (useful for lookups) - si pas déjà créé
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add index for lightning_address (useful for lookups)
CREATE INDEX IF NOT EXISTS idx_users_lightning_address ON users(lightning_address);

-- ============================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================

-- Update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_mentoring_requests_updated_at ON mentoring_requests;
DROP TRIGGER IF EXISTS update_mentoring_proofs_updated_at ON mentoring_proofs;
DROP TRIGGER IF EXISTS update_proofs_updated_at ON proofs;
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
DROP TRIGGER IF EXISTS update_service_categories_updated_at ON service_categories;
DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentoring_requests_updated_at BEFORE UPDATE ON mentoring_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentoring_proofs_updated_at BEFORE UPDATE ON mentoring_proofs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proofs_updated_at BEFORE UPDATE ON proofs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VÉRIFICATION
-- ============================================================

-- Afficher toutes les tables créées
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public';
    
    RAISE NOTICE '✅ Nombre de tables créées: %', table_count;
    RAISE NOTICE '✅ Structure de la base de données restaurée avec succès!';
END $$;

