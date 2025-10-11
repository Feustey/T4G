#!/bin/bash
set -e

echo "🚀 Token4Good Backend - Railway Deployment"
echo "=========================================="

# Vérifier que Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install with: npm i -g @railway/cli"
    exit 1
fi

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "Cargo.toml" ]; then
    echo "❌ Cargo.toml not found. Run this script from token4good-backend directory"
    exit 1
fi

echo ""
echo "📋 Pre-deployment checks..."

# Vérifier la compilation
echo "  → Testing compilation..."
cargo check --release
if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi
echo "  ✅ Compilation OK"

# Vérifier les tests
echo "  → Running tests..."
cargo test --lib
if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi
echo "  ✅ Tests OK"

echo ""
echo "🔧 Railway Configuration..."

# Vérifier si railway.json existe
if [ ! -f "railway.json" ]; then
    echo "⚠️  railway.json not found, creating default configuration..."
    cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cargo build --release"
  },
  "deploy": {
    "startCommand": "./target/release/token4good-backend",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
    echo "  ✅ railway.json created"
fi

echo ""
echo "📦 Deploying to Railway..."
echo "  ℹ️  Make sure you have set the following environment variables in Railway dashboard:"
echo "     - DATABASE_URL"
echo "     - JWT_SECRET"
echo "     - LND_REST_HOST"
echo "     - LND_MACAROON_PATH (base64 encoded)"
echo "     - DAZNO_API_URL"
echo ""

# Déploiement
railway up

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Next steps:"
    echo "  1. Check logs: railway logs"
    echo "  2. Open dashboard: railway open"
    echo "  3. Get domain: railway domain"
    echo ""
    echo "🔗 Health check: https://your-domain.railway.app/health"
else
    echo "❌ Deployment failed"
    exit 1
fi
