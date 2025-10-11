#!/bin/bash

# Script de déploiement Vercel pour Token4Good RGB
# Usage: ./scripts/deploy-vercel.sh [production|preview]

set -e

ENVIRONMENT=${1:-preview}
PROJECT_ROOT=$(pwd)

echo "🚀 Déploiement Token4Good RGB sur Vercel"
echo "Environment: $ENVIRONMENT"
echo "Project root: $PROJECT_ROOT"

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "vercel.json" ]; then
    echo "❌ Erreur: vercel.json non trouvé. Assurez-vous d'être dans le dossier racine du projet."
    exit 1
fi

# Vérifier l'installation de Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

# Vérifier la connexion Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Connexion à Vercel..."
    vercel login
fi

# Aller dans le dossier de l'app
cd apps/dapp

# Vérifier les dépendances
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Build test local
echo "🔨 Test du build local..."
npm run build

echo "✅ Build local réussi"

# Déploiement
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🌟 Déploiement en PRODUCTION..."
    vercel --prod
else
    echo "🔍 Déploiement en PREVIEW..."
    vercel
fi

echo "✅ Déploiement terminé!"

# Test du health endpoint (après déploiement)
echo "🩺 Test du health endpoint..."
sleep 10  # Attendre que le déploiement soit actif

if [ "$ENVIRONMENT" = "production" ]; then
    HEALTH_URL="https://app.token-for-good.com/api/health"
else
    # Récupérer l'URL de preview depuis vercel
    PREVIEW_URL=$(vercel ls | grep "token4good-rgb" | head -1 | awk '{print $2}')
    HEALTH_URL="https://$PREVIEW_URL/api/health"
fi

echo "Testing: $HEALTH_URL"
if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
    echo "✅ Health check réussi!"
    curl -s "$HEALTH_URL" | jq '.'
else
    echo "⚠️  Health check échoué. Vérifiez les logs avec: vercel logs --follow"
fi

echo ""
echo "🎉 Déploiement terminé!"
echo "📱 App URL: ${HEALTH_URL%/api/health}"
echo "🩺 Health: $HEALTH_URL"
echo "📊 Dashboard: https://vercel.com/dashboard"
echo ""

# Retour au dossier racine
cd "$PROJECT_ROOT"