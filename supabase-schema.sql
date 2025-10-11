-- Token4Good RGB Database Schema for Supabase
-- Execute this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentoring_requests_updated_at BEFORE UPDATE ON mentoring_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentoring_proofs_updated_at BEFORE UPDATE ON mentoring_proofs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proofs_updated_at BEFORE UPDATE ON proofs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on requirements)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Allow service role (backend) to access all data
CREATE POLICY "Service role can access all users" ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all mentoring_requests" ON mentoring_requests FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all mentoring_proofs" ON mentoring_proofs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all proofs" ON proofs FOR ALL USING (auth.role() = 'service_role');

-- Insert some sample data (optional)
-- INSERT INTO users (id, email, firstname, lastname, lightning_address, role, username, bio) VALUES
-- ('user_123', 'test@example.com', 'Test', 'User', 'test@lightning.token4good.com', 'alumni', 'testuser', 'Sample user for testing');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;