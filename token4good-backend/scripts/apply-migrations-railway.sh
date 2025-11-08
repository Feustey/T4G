#!/bin/bash
# Script pour appliquer les migrations avec une connexion Railway

set -e

HOST="shinkansen.proxy.rlwy.net"
PORT="31505"
DB_NAME="railway"

echo "🔧 Application des migrations sur Railway PostgreSQL..."
echo "📍 Host: $HOST:$PORT"
echo ""

# Vérifier si le mot de passe est fourni
if [ -z "$RAILWAY_DB_PASSWORD" ]; then
    echo "❓ Mot de passe non fourni dans RAILWAY_DB_PASSWORD"
    echo ""
    echo "Options:"
    echo "  1. Fournir le mot de passe:"
    echo "     export RAILWAY_DB_PASSWORD='votre_mot_de_passe'"
    echo "     ./scripts/apply-migrations-railway.sh"
    echo ""
    echo "  2. Utiliser directement DATABASE_URL complète:"
    echo "     export DATABASE_URL='postgresql://postgres:[PASSWORD]@shinkansen.proxy.rlwy.net:31505/railway'"
    echo "     sqlx migrate run"
    echo ""
    echo "  3. Récupérer depuis Railway dashboard:"
    echo "     railway open → Variables → DATABASE_URL"
    echo ""
    read -sp "Entrez le mot de passe PostgreSQL Railway: " PASSWORD
    echo ""
    
    if [ -z "$PASSWORD" ]; then
        echo "❌ Mot de passe requis pour continuer"
        exit 1
    fi
    
    export DATABASE_URL="postgresql://postgres:${PASSWORD}@${HOST}:${PORT}/${DB_NAME}"
else
    export DATABASE_URL="postgresql://postgres:${RAILWAY_DB_PASSWORD}@${HOST}:${PORT}/${DB_NAME}"
fi

# Masquer le mot de passe dans les logs
MASKED_URL=$(echo "$DATABASE_URL" | sed 's/:[^@]*@/:***@/')
echo "📊 Connexion: $MASKED_URL"
echo ""

# Vérifier la connexion
echo "🔍 Test de connexion..."
if sqlx migrate info 2>&1 | grep -q "error\|failed"; then
    echo "❌ Erreur de connexion à la base de données"
    echo "Vérifiez que:"
    echo "  - Le mot de passe est correct"
    echo "  - La base de données est accessible"
    echo "  - Le port 31505 n'est pas bloqué par un firewall"
    exit 1
fi

# Afficher l'état actuel des migrations
echo ""
echo "📋 État actuel des migrations:"
sqlx migrate info

echo ""
echo "🔄 Application des migrations..."
sqlx migrate run

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations appliquées avec succès!"
    echo ""
    echo "📊 Vérification finale:"
    sqlx migrate info
else
    echo ""
    echo "❌ Erreur lors de l'application des migrations"
    exit 1
fi

