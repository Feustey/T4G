#!/bin/bash
# Build script pour Vercel avec copie des assets

set -e

echo "🔄 Préparation du build Next.js..."

# S'assurer qu'on est dans le bon répertoire
cd "$(dirname "$0")"

echo "✅ Répertoire courant: $(pwd)"
echo "📦 Installation des dépendances..."

# Installation si nécessaire
if [ ! -d "node_modules" ]; then
  cd ../.. && npm install --legacy-peer-deps && cd apps/dapp
fi

echo "🏗️  Build Next.js..."
npm run build

echo "✅ Build terminé avec succès!"
