#!/bin/bash
# Mise à jour de la configuration serveur pour Token4Good v2

set -euo pipefail

SSH_PASSWORD="Criteria0-Cadmium5-Attempt9-Exit2-Floss1"
REMOTE_HOST="147.79.101.32"
REMOTE_USER="root"

echo "🔧 Mise à jour configuration serveur Hostinger..."

sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
set -euo pipefail

echo "📝 Mise à jour service systemd..."

cat > /etc/systemd/system/token4good-backend.service << 'SERVICE_EOF'
[Unit]
Description=Token4Good v2 Backend API (Rust/Axum)
After=network.target
Wants=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/token4good/token4good-backend
EnvironmentFile=/var/www/token4good/token4good-backend/.env
Environment=RUST_LOG=info,token4good_backend=debug
ExecStart=/var/www/token4good/token4good-backend/target/release/token4good-backend
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
SERVICE_EOF

systemctl daemon-reload
echo "✅ Service systemd mis à jour"

echo ""
echo "📊 Configuration actuelle:"
echo "========================"
echo "Service systemd: /etc/systemd/system/token4good-backend.service"
echo "Nginx config: /etc/nginx/sites-available/token4good"
echo "Backend path: /var/www/token4good/token4good-backend"
echo ""
echo "Port actuel nginx: 3001"
echo "Port backend .env: $(grep '^PORT=' /var/www/token4good/token4good-backend/.env 2>/dev/null || echo 'Non défini')"
echo ""
echo "✅ Mise à jour terminée"
EOF

echo "✅ Configuration serveur mise à jour!"
