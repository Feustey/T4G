-- Migration 007: Workflow Mentoring — référentiel des apprentissages + champs mentor

-- ============================================================
-- 1. RÉFÉRENTIEL DES APPRENTISSAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS learning_categories (
    id         VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug       VARCHAR(100) UNIQUE NOT NULL,
    name       VARCHAR(200) NOT NULL,
    color      VARCHAR(7),
    icon_key   VARCHAR(50),
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS learning_topics (
    id          VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    category_id VARCHAR REFERENCES learning_categories(id) ON DELETE SET NULL,
    level       VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    tags        TEXT[] DEFAULT ARRAY[]::TEXT[],
    icon_key    VARCHAR(50),
    is_active   BOOLEAN DEFAULT true,
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_topics_category_id ON learning_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_learning_topics_level       ON learning_topics(level);
CREATE INDEX IF NOT EXISTS idx_learning_topics_slug        ON learning_topics(slug);
CREATE INDEX IF NOT EXISTS idx_learning_topics_is_active   ON learning_topics(is_active);

-- ============================================================
-- 2. CHAMPS MENTOR SUR LA TABLE USERS
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mentor_topics') THEN
        ALTER TABLE users ADD COLUMN mentor_topics TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'learning_topics') THEN
        ALTER TABLE users ADD COLUMN learning_topics TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_mentor_active') THEN
        ALTER TABLE users ADD COLUMN is_mentor_active BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mentor_bio') THEN
        ALTER TABLE users ADD COLUMN mentor_bio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mentor_tokens_per_hour') THEN
        ALTER TABLE users ADD COLUMN mentor_tokens_per_hour INT;
    END IF;
END $$;

-- ============================================================
-- 3. SEED — CATÉGORIES
-- ============================================================

INSERT INTO learning_categories (slug, name, color, icon_key, sort_order) VALUES
    ('lightning_network', 'Lightning Network',    '#f59e0b', 'lightning',    1),
    ('infrastructure',    'DazBox / Infrastructure', '#6366f1', 'server',   2),
    ('bitcoin_payments',  'Bitcoin & Paiements',  '#f97316', 'bitcoin',      3),
    ('development',       'Développement',        '#10b981', 'code',         4),
    ('business',          'Business & Communauté','#8b5cf6', 'briefcase',    5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 4. SEED — THÈMES
-- ============================================================

-- Lightning Network
INSERT INTO learning_topics (slug, name, description, category_id, level, tags, sort_order) VALUES
    ('lightning-basics',
     'Comprendre les canaux Lightning',
     'Découvrez le fonctionnement des canaux de paiement Lightning, les HTLC et la gestion des fonds.',
     (SELECT id FROM learning_categories WHERE slug = 'lightning_network'),
     'beginner', ARRAY['lightning', 'channels', 'basics'], 1),

    ('lightning-channel-management',
     'Ouvrir et gérer ses canaux',
     'Apprenez à ouvrir, équilibrer et fermer des canaux Lightning de façon optimale.',
     (SELECT id FROM learning_categories WHERE slug = 'lightning_network'),
     'intermediate', ARRAY['lightning', 'channels', 'management'], 2),

    ('lightning-routing-liquidity',
     'Routing et gestion de la liquidité',
     'Maîtrisez le routage des paiements et la gestion de la liquidité entrant/sortante.',
     (SELECT id FROM learning_categories WHERE slug = 'lightning_network'),
     'advanced', ARRAY['lightning', 'routing', 'liquidity'], 3),

    ('lightning-app-integration',
     'Intégrer un nœud Lightning dans une app',
     'Connectez LND ou CLN à votre application via REST ou gRPC.',
     (SELECT id FROM learning_categories WHERE slug = 'lightning_network'),
     'advanced', ARRAY['lightning', 'api', 'integration', 'dev'], 4)
ON CONFLICT (slug) DO NOTHING;

-- Infrastructure
INSERT INTO learning_topics (slug, name, description, category_id, level, tags, sort_order) VALUES
    ('dazbox-setup',
     'Installer et configurer sa DazBox',
     'Mise en route complète d''une DazBox : installation, première configuration, accès distant.',
     (SELECT id FROM learning_categories WHERE slug = 'infrastructure'),
     'beginner', ARRAY['dazbox', 'setup', 'node'], 1),

    ('node-monitoring',
     'Maintenance et monitoring de nœud',
     'Surveillez la santé de votre nœud, gérez les alertes et maintenez la disponibilité.',
     (SELECT id FROM learning_categories WHERE slug = 'infrastructure'),
     'intermediate', ARRAY['node', 'monitoring', 'maintenance'], 2),

    ('node-security',
     'Sauvegardes et sécurité de nœud',
     'Protégez vos fonds : stratégies de sauvegarde SCB, durcissement système et chiffrement.',
     (SELECT id FROM learning_categories WHERE slug = 'infrastructure'),
     'intermediate', ARRAY['node', 'security', 'backup'], 3),

    ('node-optimization',
     'Optimisation des performances',
     'Tuning avancé : fee policies, watchtowers, gestion de la bande passante.',
     (SELECT id FROM learning_categories WHERE slug = 'infrastructure'),
     'advanced', ARRAY['node', 'performance', 'optimization'], 4)
ON CONFLICT (slug) DO NOTHING;

-- Bitcoin & Paiements
INSERT INTO learning_topics (slug, name, description, category_id, level, tags, sort_order) VALUES
    ('bitcoin-basics',
     'Les bases de Bitcoin',
     'Comprendre le fonctionnement de Bitcoin : UTXO, transactions, clés privées, wallets.',
     (SELECT id FROM learning_categories WHERE slug = 'bitcoin_payments'),
     'beginner', ARRAY['bitcoin', 'basics', 'wallet'], 1),

    ('dazpay-integration',
     'Intégrer DazPay dans une boutique',
     'Acceptez des paiements Lightning dans votre site e-commerce ou point de vente.',
     (SELECT id FROM learning_categories WHERE slug = 'bitcoin_payments'),
     'intermediate', ARRAY['dazpay', 'payments', 'ecommerce'], 2),

    ('bitcoin-accounting',
     'Comptabilité Bitcoin pour entreprises',
     'Gérez la comptabilité de vos transactions Bitcoin : valorisation, reporting, exports.',
     (SELECT id FROM learning_categories WHERE slug = 'bitcoin_payments'),
     'intermediate', ARRAY['bitcoin', 'accounting', 'business'], 3),

    ('crypto-compliance',
     'Fiscalité et conformité crypto',
     'Obligations fiscales, déclarations et conformité réglementaire pour les actifs numériques.',
     (SELECT id FROM learning_categories WHERE slug = 'bitcoin_payments'),
     'advanced', ARRAY['bitcoin', 'tax', 'compliance', 'regulation'], 4)
ON CONFLICT (slug) DO NOTHING;

-- Développement
INSERT INTO learning_topics (slug, name, description, category_id, level, tags, sort_order) VALUES
    ('lnd-api-dev',
     'Développer avec l''API LND',
     'Utilisez l''API REST et gRPC de LND pour créer des factures, vérifier des paiements et automatiser.',
     (SELECT id FROM learning_categories WHERE slug = 'development'),
     'intermediate', ARRAY['lnd', 'api', 'rest', 'grpc', 'dev'], 1),

    ('rgb-basics',
     'RGB Protocol — bases',
     'Découvrez le protocole RGB : contrats client-side, émission d''assets, transferts.',
     (SELECT id FROM learning_categories WHERE slug = 'development'),
     'advanced', ARRAY['rgb', 'protocol', 'contracts', 'bitcoin'], 2),

    ('lightning-app-dev',
     'Construire une application Lightning',
     'Architecture, stack technique et bonnes pratiques pour une app Lightning complète.',
     (SELECT id FROM learning_categories WHERE slug = 'development'),
     'advanced', ARRAY['lightning', 'app', 'dev', 'architecture'], 3)
ON CONFLICT (slug) DO NOTHING;

-- Business & Communauté
INSERT INTO learning_topics (slug, name, description, category_id, level, tags, sort_order) VALUES
    ('bitcoin-pitch',
     'Pitcher un projet Bitcoin',
     'Structurez et présentez votre projet Bitcoin à des investisseurs ou partenaires.',
     (SELECT id FROM learning_categories WHERE slug = 'business'),
     'beginner', ARRAY['pitch', 'bitcoin', 'startup'], 1),

    ('bitcoin-community',
     'Construire une communauté autour de Bitcoin',
     'Stratégies d''animation, outils et méthodes pour fédérer une communauté Bitcoin.',
     (SELECT id FROM learning_categories WHERE slug = 'business'),
     'intermediate', ARRAY['community', 'bitcoin', 'growth'], 2),

    ('lightning-distribution',
     'Stratégie de distribution via Lightning',
     'Monétisation et distribution de produits/services via le réseau Lightning.',
     (SELECT id FROM learning_categories WHERE slug = 'business'),
     'advanced', ARRAY['lightning', 'distribution', 'business', 'monetization'], 3)
ON CONFLICT (slug) DO NOTHING;
