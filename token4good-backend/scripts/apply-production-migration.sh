#!/bin/bash
# Script pour appliquer la migration complète de production
# Usage: ./scripts/apply-production-migration.sh [DATABASE_URL]

set -e

MIGRATION_FILE="migrations/005_production_complete_migration.sql"

echo "🔧 Application de la migration complète de production..."
echo ""

# Déterminer la DATABASE_URL
if [ -n "$1" ]; then
    DATABASE_URL="$1"
elif [ -n "$DATABASE_URL" ]; then
    echo "✅ Utilisation de DATABASE_URL depuis l'environnement"
else
    echo "❌ ERREUR: DATABASE_URL non fournie"
    echo ""
    echo "Usage:"
    echo "  $0 'postgresql://user:password@host:port/database'"
    echo "  ou"
    echo "  DATABASE_URL='postgresql://...' $0"
    echo ""
    exit 1
fi

# Masquer le mot de passe dans les logs
MASKED_URL=$(echo "$DATABASE_URL" | sed 's/:[^@]*@/:***@/')
echo "📊 Connexion: $MASKED_URL"
echo ""

# Vérifier que le fichier de migration existe
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Fichier de migration non trouvé: $MIGRATION_FILE"
    exit 1
fi

# Vérifier la connexion
echo "🔍 Test de connexion..."
if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Erreur de connexion à la base de données"
    echo "Vérifiez que:"
    echo "  - La DATABASE_URL est correcte"
    echo "  - La base de données est accessible"
    echo "  - Les credentials sont valides"
    exit 1
fi

echo "✅ Connexion réussie"
echo ""

# Exécuter la migration
echo "🔄 Application de la migration..."
echo ""

psql "$DATABASE_URL" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration appliquée avec succès!"
    echo ""
    echo "📊 Vérification des tables créées..."
    psql "$DATABASE_URL" -c "
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
    "
else
    echo ""
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi





