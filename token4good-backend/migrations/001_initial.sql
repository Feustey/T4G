-- Initial database schema for Token4Good RGB

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

-- Update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentoring_requests_updated_at BEFORE UPDATE ON mentoring_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentoring_proofs_updated_at BEFORE UPDATE ON mentoring_proofs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proofs_updated_at BEFORE UPDATE ON proofs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();