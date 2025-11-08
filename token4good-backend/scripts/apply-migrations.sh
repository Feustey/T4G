#!/bin/bash
# Script pour appliquer toutes les migrations de la base de données PostgreSQL

set -e

echo "🔧 Application des migrations de la base de données Token4Good..."

# Vérifier que DATABASE_URL est définie
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERREUR: La variable DATABASE_URL n'est pas définie"
    echo ""
    echo "Exemple:"
    echo "  export DATABASE_URL='postgresql://user:password@localhost:5432/dbname'"
    echo "  ou"
    echo "  DATABASE_URL='postgresql://user:password@localhost:5432/dbname' ./scripts/apply-migrations.sh"
    exit 1
fi

# Extraire les informations de connexion pour affichage (masquer le mot de passe)
DB_INFO=$(echo "$DATABASE_URL" | sed 's/:[^@]*@/@***:***@/')
echo "📊 Base de données: $DB_INFO"

# Vérifier si sqlx-cli est installé
if ! command -v sqlx &> /dev/null; then
    echo "⚠️  sqlx-cli n'est pas installé. Installation..."
    cargo install sqlx-cli --no-default-features --features postgres
fi

# Aller dans le répertoire backend
cd "$(dirname "$0")/.." || exit 1

# Appliquer les migrations
echo ""
echo "🔄 Application des migrations..."
sqlx migrate run

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations appliquées avec succès!"
    echo ""
    echo "Vérification des tables créées..."
    sqlx migrate info
else
    echo ""
    echo "❌ Erreur lors de l'application des migrations"
    exit 1
fi

