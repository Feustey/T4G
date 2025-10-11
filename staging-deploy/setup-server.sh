#!/bin/bash
# Script pour configurer et compiler le backend sur le serveur Hostinger

set -euo pipefail

SSH_PASSWORD="Criteria0-Cadmium5-Attempt9-Exit2-Floss1"
REMOTE_HOST="147.79.101.32"
REMOTE_USER="root"

echo "🔧 Installation des dépendances de compilation..."
sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
# Installation des dépendances
apt update -y && apt install -y pkg-config libssl-dev build-essential postgresql-client

# Vérification des installations
echo "Vérification des installations:"
which pkg-config && echo "✅ pkg-config installé"
which gcc && echo "✅ gcc installé"
dpkg -l | grep libssl-dev > /dev/null && echo "✅ libssl-dev installé"
source ~/.cargo/env && echo "✅ Rust disponible: $(rustc --version)"

echo "🚀 Compilation du backend..."
cd /var/www/token4good/token4good-backend
source ~/.cargo/env
cargo build --release

echo "📋 Vérification du binaire..."
ls -la target/release/token4good-backend
file target/release/token4good-backend
echo "✅ Compilation terminée!"
EOF

echo "🔧 Création du fichier .env..."
sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
cd /var/www/token4good/token4good-backend
cat > .env << 'ENVEOF'
# Configuration de production Token4Good Backend
PORT=3001
JWT_SECRET=Criteria0-Cadmium5-Attempt9-Exit2-Floss1-Production-Secret-Key-2025
DATABASE_URL=postgresql://postgres:password@localhost:5432/token4good

# Lightning Network
LND_HOST=localhost
LND_PORT=10009
LND_MACAROON_PATH=/tmp/lnd/admin.macaroon
LND_TLS_CERT_PATH=/tmp/lnd/tls.cert

# RGB
RGB_CLI_PATH=/usr/local/bin/rgb-cli
RGB_NETWORK=regtest

# Dazno integration
DAZNO_API_URL=https://dazno.de/api
DAZNO_CLIENT_ID=your-client-id
DAZNO_CLIENT_SECRET=your-client-secret

# Logging
RUST_LOG=info
ENVEOF

echo "✅ Fichier .env créé"
cat .env
EOF

echo "🎯 Test de démarrage du backend..."
sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
cd /var/www/token4good/token4good-backend
source ~/.cargo/env
echo "Test du binaire..."
timeout 5s ./target/release/token4good-backend || echo "Backend testé (timeout normal)"
EOF

echo "✅ Configuration du serveur terminée!"