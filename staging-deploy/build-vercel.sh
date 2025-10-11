#!/bin/bash
# Script de build optimisé pour Vercel
# ====================================

set -e

echo "🔧 Préparation du build pour Vercel..."

cd apps/dapp

# Backup configuration actuelle
if [ -f "next.config.js" ]; then
    cp next.config.js next.config.js.backup
fi

# Utiliser la configuration optimisée pour la production
cp next.config.production.js next.config.js

echo "✅ Configuration production activée"

# Variables d'environnement par défaut pour le build
export NODE_ENV=production
export SKIP_ENV_VALIDATION=true

# Désactiver Sentry si pas configuré
if [ -z "$SENTRY_AUTH_TOKEN" ]; then
    export SENTRY_DISABLE_AUTO_UPLOAD=true
fi

echo "🏗️ Lancement du build Next.js..."

# Build avec gestion d'erreur
if npm run build; then
    echo "✅ Build réussi!"
    
    # Restaurer la configuration si backup existe
    if [ -f "next.config.js.backup" ]; then
        cp next.config.js.backup next.config.js
        rm next.config.js.backup
    fi
    
    exit 0
else
    echo "❌ Build échoué"
    
    # Restaurer la configuration si backup existe
    if [ -f "next.config.js.backup" ]; then
        cp next.config.js.backup next.config.js
        rm next.config.js.backup
    fi
    
    exit 1
fi