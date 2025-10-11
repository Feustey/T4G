-- Migration 002: Add services, categories, transactions tables
-- This migration moves MongoDB collections to PostgreSQL

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

-- Indexes for performance
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

-- Triggers for updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
