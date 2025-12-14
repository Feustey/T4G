-- ============================================================
-- Migration 006: Insertion de données pour la Marketplace T4G
-- ============================================================
-- Ce script insère des catégories de services et des exemples
-- de services marketplace pour Token4Good
-- Date: 2025-01-XX
-- Version: 1.0
-- ============================================================

-- ============================================================
-- 1. CATÉGORIES DE SERVICES (service_categories)
-- ============================================================

-- Insérer les catégories principales si elles n'existent pas
INSERT INTO service_categories (id, name, kind, description, href, default_price, default_unit, icon, disabled, service_provider_type, audience, created_at, updated_at)
VALUES 
    (
        'cat_lightning_network',
        'Lightning Network',
        'technical',
        'Services liés à la configuration, optimisation et maintenance de nœuds Lightning Network',
        '/categories/lightning-network',
        200,
        'hour',
        '⚡',
        false,
        'SERVICE_PROVIDER',
        'ALUMNI',
        NOW(),
        NOW()
    ),
    (
        'cat_dazbox_setup',
        'DazBox Setup',
        'technical',
        'Services d''installation, configuration et optimisation de DazBox',
        '/categories/dazbox-setup',
        150,
        'hour',
        '📦',
        false,
        'SERVICE_PROVIDER',
        'ALUMNI',
        NOW(),
        NOW()
    ),
    (
        'cat_business_dev',
        'Business Development',
        'business',
        'Services de développement business, stratégie et croissance pour entreprises Bitcoin',
        '/categories/business-dev',
        300,
        'hour',
        '💼',
        false,
        'SERVICE_PROVIDER',
        'ALUMNI',
        NOW(),
        NOW()
    ),
    (
        'cat_dazpay_integration',
        'DazPay Integration',
        'technical',
        'Services d''intégration et configuration de DazPay pour les entreprises',
        '/categories/dazpay-integration',
        250,
        'hour',
        '💳',
        false,
        'SERVICE_PROVIDER',
        'ALUMNI',
        NOW(),
        NOW()
    ),
    (
        'cat_rgb_protocol',
        'RGB Protocol',
        'technical',
        'Services liés au protocole RGB, développement et intégration',
        '/categories/rgb-protocol',
        350,
        'hour',
        '🌈',
        false,
        'SERVICE_PROVIDER',
        'ALUMNI',
        NOW(),
        NOW()
    ),
    (
        'cat_mentoring',
        'Mentoring & Formation',
        'education',
        'Sessions de mentoring et formation personnalisées',
        '/categories/mentoring',
        100,
        'hour',
        '🎓',
        false,
        'SERVICE_PROVIDER',
        'ALUMNI',
        NOW(),
        NOW()
    )
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 2. SERVICES MARKETPLACE T4G (t4g_services)
-- ============================================================
-- Note: Ces services nécessitent un provider_id valide (user_id)
-- Nous allons créer des services avec un provider_id générique
-- qui devra être remplacé par un vrai user_id après insertion

-- Fonction pour obtenir ou créer un utilisateur admin par défaut
DO $$
DECLARE
    default_provider_id VARCHAR;
BEGIN
    -- Chercher un utilisateur admin existant
    SELECT id INTO default_provider_id 
    FROM users 
    WHERE role = 'admin' 
    LIMIT 1;
    
    -- Si aucun admin, chercher n'importe quel utilisateur
    IF default_provider_id IS NULL THEN
        SELECT id INTO default_provider_id 
        FROM users 
        LIMIT 1;
    END IF;
    
    -- Si toujours aucun utilisateur, créer un utilisateur par défaut pour les services
    IF default_provider_id IS NULL THEN
        default_provider_id := 't4g_system_provider';
        INSERT INTO users (
            id, email, firstname, lastname, lightning_address, role, username, 
            bio, score, is_active, email_verified, created_at, updated_at
        )
        VALUES (
            default_provider_id,
            'system@token4good.com',
            'Token4Good',
            'System',
            'system@token4good.com',
            'admin',
            't4g_system',
            'Compte système pour les services marketplace par défaut',
            1000,
            true,
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- Insérer les services marketplace T4G
    INSERT INTO t4g_services (
        id, provider_id, name, description, category, token_cost, 
        estimated_duration, requirements, tags, rating, reviews_count, 
        status, created_at, updated_at
    )
    VALUES 
        -- Services Lightning Network
        (
            'svc_lightning_setup',
            default_provider_id,
            'Configuration Complète Nœud Lightning',
            'Installation et configuration complète d''un nœud Lightning Network (LND ou CLN) avec sécurisation, optimisation des canaux et monitoring. Inclut la configuration de Tor, les sauvegardes automatiques et la documentation complète.',
            'technical_excellence',
            500,
            '6-8h',
            ARRAY['Serveur VPS ou machine dédiée', 'Accès root/administrateur', 'Connexion internet stable'],
            ARRAY['lightning', 'lnd', 'cln', 'node-setup', 'bitcoin'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        (
            'svc_lightning_optimization',
            default_provider_id,
            'Optimisation Nœud Lightning',
            'Analyse et optimisation d''un nœud Lightning existant : rééquilibrage des canaux, optimisation des frais, amélioration de la connectivité et des performances. Audit complet avec recommandations détaillées.',
            'technical_excellence',
            300,
            '3-4h',
            ARRAY['Nœud Lightning fonctionnel', 'Accès SSH', 'Logs récents'],
            ARRAY['lightning', 'optimization', 'channels', 'performance'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        (
            'svc_lightning_troubleshooting',
            default_provider_id,
            'Dépannage Nœud Lightning',
            'Diagnostic et résolution de problèmes sur un nœud Lightning : canaux bloqués, problèmes de connectivité, erreurs de synchronisation. Support technique expert avec solutions pratiques.',
            'technical_excellence',
            250,
            '2-3h',
            ARRAY['Nœud Lightning avec problème', 'Accès au système', 'Description du problème'],
            ARRAY['lightning', 'troubleshooting', 'support', 'debug'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        
        -- Services DazBox
        (
            'svc_dazbox_installation',
            default_provider_id,
            'Installation DazBox Complète',
            'Installation complète de DazBox avec configuration initiale, sécurisation, intégration avec votre infrastructure existante et formation de base. Inclut la documentation et les procédures de maintenance.',
            'technical_excellence',
            400,
            '4-5h',
            ARRAY['Serveur compatible', 'Accès administrateur', 'Configuration réseau'],
            ARRAY['dazbox', 'installation', 'setup', 'bitcoin'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        (
            'svc_dazbox_migration',
            default_provider_id,
            'Migration vers DazBox',
            'Migration complète depuis une autre solution vers DazBox : analyse de l''existant, plan de migration, exécution sécurisée et validation. Migration sans interruption de service.',
            'technical_excellence',
            600,
            '8-10h',
            ARRAY['Système existant à migrer', 'Accès aux deux systèmes', 'Fenêtre de maintenance'],
            ARRAY['dazbox', 'migration', 'upgrade', 'enterprise'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        
        -- Services Business Development
        (
            'svc_business_strategy',
            default_provider_id,
            'Stratégie Business Bitcoin',
            'Consultation stratégique pour développer votre business autour de Bitcoin : analyse de marché, modèles économiques, stratégie de croissance et roadmap. Session complète avec plan d''action détaillé.',
            'business_growth',
            800,
            '4-6h',
            ARRAY['Business existant ou projet', 'Contexte et objectifs clairs'],
            ARRAY['business', 'strategy', 'bitcoin', 'consulting'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        (
            'svc_market_analysis',
            default_provider_id,
            'Analyse de Marché Bitcoin',
            'Analyse approfondie du marché Bitcoin pour votre secteur : tendances, opportunités, risques et recommandations stratégiques. Rapport détaillé avec données et insights actionnables.',
            'business_growth',
            500,
            '3-4h',
            ARRAY['Secteur d''activité défini', 'Objectifs de l''analyse'],
            ARRAY['market-analysis', 'bitcoin', 'business', 'research'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        
        -- Services DazPay
        (
            'svc_dazpay_integration',
            default_provider_id,
            'Intégration DazPay Complète',
            'Intégration complète de DazPay dans votre application ou site web : configuration API, gestion des paiements, webhooks, interface utilisateur et tests. Documentation technique incluse.',
            'technical_excellence',
            700,
            '6-8h',
            ARRAY['Application ou site web', 'Accès au code source', 'Environnement de test'],
            ARRAY['dazpay', 'integration', 'api', 'payments'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        (
            'svc_dazpay_custom',
            default_provider_id,
            'Développement DazPay Sur-Mesure',
            'Développement de fonctionnalités personnalisées pour DazPay selon vos besoins spécifiques : workflows personnalisés, intégrations avancées, automatisations et optimisations.',
            'technical_excellence',
            1000,
            '10-15h',
            ARRAY['Besoins spécifiques définis', 'Accès technique', 'Budget et délais'],
            ARRAY['dazpay', 'custom-development', 'api', 'enterprise'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        
        -- Services RGB Protocol
        (
            'svc_rgb_consulting',
            default_provider_id,
            'Consulting RGB Protocol',
            'Consultation experte sur le protocole RGB : architecture, cas d''usage, intégration dans votre projet. Analyse technique et recommandations pour l''implémentation RGB.',
            'technical_excellence',
            900,
            '5-7h',
            ARRAY['Projet ou cas d''usage défini', 'Contexte technique'],
            ARRAY['rgb', 'protocol', 'bitcoin', 'consulting'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        (
            'svc_rgb_development',
            default_provider_id,
            'Développement RGB',
            'Développement d''applications utilisant le protocole RGB : smart contracts, wallets, intégrations. Développement complet avec tests et documentation.',
            'technical_excellence',
            1500,
            '20-30h',
            ARRAY['Spécifications du projet', 'Environnement de développement'],
            ARRAY['rgb', 'development', 'smart-contracts', 'bitcoin'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        
        -- Services Mentoring
        (
            'svc_mentoring_lightning',
            default_provider_id,
            'Mentoring Lightning Network',
            'Session de mentoring personnalisée sur Lightning Network : concepts avancés, meilleures pratiques, résolution de problèmes complexes. Adapté à votre niveau et besoins.',
            'knowledge_transfer',
            200,
            '2h',
            ARRAY['Niveau de base en Bitcoin', 'Objectifs d''apprentissage'],
            ARRAY['mentoring', 'lightning', 'education', 'training'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        (
            'svc_mentoring_bitcoin_business',
            default_provider_id,
            'Mentoring Business Bitcoin',
            'Mentoring stratégique pour développer un business Bitcoin : modèles économiques, réglementation, partenariats et croissance. Guidance personnalisée avec plan d''action.',
            'knowledge_transfer',
            300,
            '3h',
            ARRAY['Projet ou business existant', 'Objectifs business'],
            ARRAY['mentoring', 'business', 'bitcoin', 'strategy'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        (
            'svc_mentoring_technical',
            default_provider_id,
            'Mentoring Technique Bitcoin',
            'Mentoring technique approfondi : développement Bitcoin, intégration de protocoles, sécurité, architecture. Session adaptée à votre stack technique.',
            'knowledge_transfer',
            250,
            '2-3h',
            ARRAY['Connaissances techniques de base', 'Stack technique'],
            ARRAY['mentoring', 'technical', 'development', 'bitcoin'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        
        -- Services Communautaires
        (
            'svc_code_review',
            default_provider_id,
            'Code Review Bitcoin/Lightning',
            'Review approfondi de votre code Bitcoin ou Lightning : sécurité, bonnes pratiques, optimisation, architecture. Rapport détaillé avec recommandations prioritaires.',
            'community_services',
            150,
            '1-2h',
            ARRAY['Code source accessible', 'Contexte du projet'],
            ARRAY['code-review', 'bitcoin', 'lightning', 'security'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        (
            'svc_documentation',
            default_provider_id,
            'Rédaction Documentation Technique',
            'Rédaction de documentation technique complète pour votre projet Bitcoin : guides utilisateur, API docs, architecture, procédures. Documentation professionnelle et claire.',
            'community_services',
            200,
            '3-4h',
            ARRAY['Projet à documenter', 'Accès au code/projet'],
            ARRAY['documentation', 'technical-writing', 'bitcoin'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        ),
        (
            'svc_technical_support',
            default_provider_id,
            'Support Technique Avancé',
            'Support technique expert pour résoudre des problèmes complexes : debugging approfondi, optimisation, architecture, intégrations. Support prioritaire avec solutions détaillées.',
            'community_services',
            180,
            '2h',
            ARRAY['Problème technique défini', 'Accès au système'],
            ARRAY['support', 'technical', 'troubleshooting', 'bitcoin'],
            0.0,
            0,
            'active',
            NOW(),
            NOW()
        )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Services marketplace insérés avec succès';
END $$;

-- ============================================================
-- 3. VÉRIFICATION ET RÉSUMÉ
-- ============================================================

-- Afficher le résumé des données insérées
SELECT 
    '📊 Résumé des données insérées' as message,
    (SELECT COUNT(*) FROM service_categories) as categories_count,
    (SELECT COUNT(*) FROM t4g_services WHERE status = 'active') as services_active,
    (SELECT COUNT(*) FROM t4g_services WHERE category = 'technical_excellence') as services_technical,
    (SELECT COUNT(*) FROM t4g_services WHERE category = 'business_growth') as services_business,
    (SELECT COUNT(*) FROM t4g_services WHERE category = 'knowledge_transfer') as services_mentoring,
    (SELECT COUNT(*) FROM t4g_services WHERE category = 'community_services') as services_community;

-- Afficher les catégories créées
SELECT 
    '📁 Catégories de services' as type,
    name,
    description,
    default_price || ' ' || default_unit as pricing
FROM service_categories
ORDER BY name;

-- Afficher un échantillon des services créés
SELECT 
    '🛍️ Services Marketplace' as type,
    name,
    category,
    token_cost || ' T4G' as cost,
    estimated_duration,
    status
FROM t4g_services
ORDER BY category, token_cost
LIMIT 10;

