-- Token4Good RGB - Schema PostgreSQL optimisé pour Supabase
-- ============================================================
-- À exécuter dans Supabase SQL Editor
-- Date: 2024-01-XX
-- Version: 1.0

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES PRINCIPALES
-- ============================================================

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    -- Clé primaire UUID généré automatiquement
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informations personnelles
    email VARCHAR(255) UNIQUE NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    bio TEXT,
    avatar VARCHAR(512), -- URL de l'avatar
    
    -- Données métier Token4Good
    lightning_address VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('mentor', 'mentee', 'alumni', 'service_provider', 'admin')),
    score INTEGER DEFAULT 0 CHECK (score >= 0),
    wallet_address VARCHAR(255),
    preferences JSONB DEFAULT '{}'::jsonb,
    
    -- Statut et suivi
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Contraintes additionnelles
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_]{3,50}$')
);

-- Table des demandes de mentoring
CREATE TABLE IF NOT EXISTS mentoring_requests (
    -- Clé primaire UUID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    mentee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Contenu de la demande
    category VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    skills_requested TEXT[], -- Array de compétences demandées
    duration_estimated INTEGER, -- Durée estimée en heures
    
    -- Statut et suivi
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected')),
    priority VARCHAR(10) DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Métadonnées
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    
    -- Contraintes
    CONSTRAINT valid_duration CHECK (duration_estimated IS NULL OR duration_estimated > 0),
    CONSTRAINT mentor_different_from_mentee CHECK (mentor_id != mentee_id)
);

-- Table des preuves de mentoring (contrats RGB)
CREATE TABLE IF NOT EXISTS mentoring_proofs (
    -- Clé primaire UUID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES mentoring_requests(id) ON DELETE CASCADE,
    
    -- Évaluation
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    feedback_mentor TEXT, -- Feedback du mentor
    feedback_mentee TEXT, -- Feedback du mentee
    
    -- Données RGB et blockchain
    rgb_contract_id VARCHAR(255) UNIQUE NOT NULL,
    signature VARCHAR(1024) NOT NULL,
    transaction_hash VARCHAR(255),
    block_height INTEGER,
    
    -- Métadonnées
    proof_data JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    validated_at TIMESTAMPTZ,
    
    -- Contraintes
    CONSTRAINT mentor_different_from_mentee CHECK (mentor_id != mentee_id),
    CONSTRAINT valid_block_height CHECK (block_height IS NULL OR block_height > 0)
);

-- Table des preuves génériques (système de preuve étendu)
CREATE TABLE IF NOT EXISTS proofs (
    -- Clé primaire UUID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID NOT NULL, -- Peut référencer différents types de requêtes
    
    -- Identifiant de contrat unique
    contract_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Évaluation et contenu
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    proof_type VARCHAR(50) DEFAULT 'mentoring' 
        CHECK (proof_type IN ('mentoring', 'skill_validation', 'project_completion', 'certification')),
    
    -- Statut et validation
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'validated', 'rejected', 'disputed')),
    signature VARCHAR(1024) NOT NULL,
    validator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Données étendues
    proof_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    validated_at TIMESTAMPTZ,
    
    -- Contraintes
    CONSTRAINT mentor_different_from_mentee CHECK (mentor_id != mentee_id)
);

-- Table des sessions/tokens (pour l'auth)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'dazeno' 
        CHECK (provider IN ('dazeno', 'direct', 'admin')),
    expires_at TIMESTAMPTZ NOT NULL,
    last_used TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Index pour nettoyage des sessions expirées
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- ============================================================
-- INDEX DE PERFORMANCE
-- ============================================================

-- Index sur users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_lightning ON users(lightning_address);

-- Index sur mentoring_requests
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_mentee ON mentoring_requests(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_mentor ON mentoring_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_status ON mentoring_requests(status);
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_category ON mentoring_requests(category);
CREATE INDEX IF NOT EXISTS idx_mentoring_requests_created ON mentoring_requests(created_at DESC);

-- Index sur mentoring_proofs
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_mentor ON mentoring_proofs(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_mentee ON mentoring_proofs(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_request ON mentoring_proofs(request_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_contract ON mentoring_proofs(rgb_contract_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_proofs_rating ON mentoring_proofs(rating);

-- Index sur proofs
CREATE INDEX IF NOT EXISTS idx_proofs_contract_id ON proofs(contract_id);
CREATE INDEX IF NOT EXISTS idx_proofs_mentor ON proofs(mentor_id);
CREATE INDEX IF NOT EXISTS idx_proofs_mentee ON proofs(mentee_id);
CREATE INDEX IF NOT EXISTS idx_proofs_status ON proofs(status);
CREATE INDEX IF NOT EXISTS idx_proofs_type ON proofs(proof_type);
CREATE INDEX IF NOT EXISTS idx_proofs_created ON proofs(created_at DESC);

-- Index sur user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- ============================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================

-- Fonction pour mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application des triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_mentoring_requests_updated_at ON mentoring_requests;
DROP TRIGGER IF EXISTS update_mentoring_proofs_updated_at ON mentoring_proofs;
DROP TRIGGER IF EXISTS update_proofs_updated_at ON proofs;

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentoring_requests_updated_at 
    BEFORE UPDATE ON mentoring_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentoring_proofs_updated_at 
    BEFORE UPDATE ON mentoring_proofs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proofs_updated_at 
    BEFORE UPDATE ON proofs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction de nettoyage des sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies pour users
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Service role full access users" ON users;

CREATE POLICY "Users can view their own profile" 
    ON users FOR SELECT 
    USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" 
    ON users FOR UPDATE 
    USING (auth.uid()::text = id::text);

CREATE POLICY "Service role full access users" 
    ON users FOR ALL 
    USING (auth.role() = 'service_role');

-- Policies pour mentoring_requests
DROP POLICY IF EXISTS "Users can view related mentoring requests" ON mentoring_requests;
DROP POLICY IF EXISTS "Service role full access requests" ON mentoring_requests;

CREATE POLICY "Users can view related mentoring requests" 
    ON mentoring_requests FOR SELECT 
    USING (auth.uid()::text = mentee_id::text OR auth.uid()::text = mentor_id::text);

CREATE POLICY "Service role full access requests" 
    ON mentoring_requests FOR ALL 
    USING (auth.role() = 'service_role');

-- Policies pour mentoring_proofs
DROP POLICY IF EXISTS "Users can view related proofs" ON mentoring_proofs;
DROP POLICY IF EXISTS "Service role full access proofs" ON mentoring_proofs;

CREATE POLICY "Users can view related proofs" 
    ON mentoring_proofs FOR SELECT 
    USING (auth.uid()::text = mentor_id::text OR auth.uid()::text = mentee_id::text);

CREATE POLICY "Service role full access proofs" 
    ON mentoring_proofs FOR ALL 
    USING (auth.role() = 'service_role');

-- Policies similaires pour les autres tables
CREATE POLICY "Service role full access general proofs" 
    ON proofs FOR ALL 
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access sessions" 
    ON user_sessions FOR ALL 
    USING (auth.role() = 'service_role');

-- ============================================================
-- VUES POUR FACILITER LES REQUÊTES
-- ============================================================

-- Vue des utilisateurs actifs avec leurs statistiques
CREATE OR REPLACE VIEW active_users_stats AS
SELECT 
    u.id,
    u.email,
    u.firstname,
    u.lastname,
    u.username,
    u.role,
    u.score,
    u.lightning_address,
    u.created_at,
    u.last_login,
    COUNT(DISTINCT mr.id) as mentoring_requests_count,
    COUNT(DISTINCT mp.id) as proofs_count,
    AVG(mp.rating) as average_rating
FROM users u
LEFT JOIN mentoring_requests mr ON (u.id = mr.mentor_id OR u.id = mr.mentee_id)
LEFT JOIN mentoring_proofs mp ON (u.id = mp.mentor_id OR u.id = mp.mentee_id)
WHERE u.is_active = true
GROUP BY u.id, u.email, u.firstname, u.lastname, u.username, u.role, u.score, u.lightning_address, u.created_at, u.last_login;

-- Vue des demandes de mentoring avec détails des utilisateurs
CREATE OR REPLACE VIEW mentoring_requests_detailed AS
SELECT 
    mr.*,
    mentee.username as mentee_username,
    mentee.email as mentee_email,
    mentor.username as mentor_username,
    mentor.email as mentor_email
FROM mentoring_requests mr
JOIN users mentee ON mr.mentee_id = mentee.id
LEFT JOIN users mentor ON mr.mentor_id = mentor.id;

-- ============================================================
-- PERMISSIONS
-- ============================================================

-- Accorder les permissions au service role
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Permissions limitées pour les utilisateurs authentifiés
GRANT SELECT ON active_users_stats TO authenticated;
GRANT SELECT ON mentoring_requests_detailed TO authenticated;

-- ============================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ============================================================

-- Insertion d'un utilisateur admin pour les tests
-- INSERT INTO users (id, email, firstname, lastname, username, role, lightning_address, is_active, email_verified) 
-- VALUES (
--     uuid_generate_v4(),
--     'admin@token4good.com',
--     'Admin',
--     'Token4Good',
--     'admin',
--     'admin',
--     'admin@lightning.token4good.com',
--     true,
--     true
-- );

-- Commentaire final
-- ================
-- Ce schéma est optimisé pour Supabase avec :
-- - UUID comme clés primaires pour de meilleures performances
-- - Contraintes de validation robustes
-- - Index de performance ciblés
-- - Row Level Security configuré
-- - Vues pour faciliter les requêtes
-- - Fonctions utilitaires
-- 
-- Pour l'utiliser :
-- 1. Copier tout ce contenu
-- 2. Le coller dans Supabase SQL Editor
-- 3. Exécuter le script
-- 4. Vérifier que toutes les tables sont créées
-- 
-- URL de connexion à configurer dans les variables d'environnement :
-- DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.glikbylflheewbonytev.supabase.co:5432/postgres