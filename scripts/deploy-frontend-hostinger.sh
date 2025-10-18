#!/bin/bash

# Script de déploiement frontend Next.js sur Hostinger VPS
# Usage: ./deploy-frontend-hostinger.sh

set -e

echo "🚀 Déploiement Frontend Next.js sur Hostinger VPS"
echo "=================================================="

# Configuration
SERVER_IP="147.79.101.32"
SERVER_USER="root"
SERVER_PASSWORD="Criteria0-Cadmium5-Attempt9-Exit2-Floss1"
FRONTEND_DIR="/var/www/token4good/frontend"
BACKEND_DIR="/var/www/token4good/token4good-backend"
PROJECT_DIR="/Users/stephanecourant/Documents/DAZ/_T4G/T4G/apps/dapp"

echo "📦 Build du frontend Next.js..."
cd "$PROJECT_DIR"

# Vérifier que le build existe
if [ ! -d ".next" ]; then
    echo "❌ Build Next.js non trouvé. Exécution de npm run build..."
    npm run build
fi

echo "✅ Build Next.js prêt"

# Créer un package temporaire
echo "📦 Création du package de déploiement..."
TEMP_DIR="/tmp/t4g-frontend-$(date +%s)"
mkdir -p "$TEMP_DIR"

# Copier les fichiers nécessaires
cp -r .next "$TEMP_DIR/"
cp -r public "$TEMP_DIR/"
cp -r node_modules "$TEMP_DIR/"
cp package.json "$TEMP_DIR/"
cp package-lock.json "$TEMP_DIR/"
cp next.config.js "$TEMP_DIR/"
cp .env.production "$TEMP_DIR/"

echo "✅ Package créé dans $TEMP_DIR"

# Upload vers le serveur
echo "📤 Upload vers le serveur Hostinger..."
sshpass -p "$SERVER_PASSWORD" scp -r "$TEMP_DIR"/* "$SERVER_USER@$SERVER_IP:$FRONTEND_DIR/"

echo "✅ Upload terminé"

# Configuration sur le serveur
echo "⚙️ Configuration sur le serveur..."
sshpass -p "$SERVER_PASSWORD" ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
    echo "🔧 Configuration du frontend Next.js..."
    
    # Arrêter le service frontend s'il existe
    systemctl stop token4good-frontend 2>/dev/null || true
    
    # Installer les dépendances
    cd /var/www/token4good/frontend
    npm install --production
    
    # Créer le service systemd pour le frontend
    cat > /etc/systemd/system/token4good-frontend.service << 'SERVICE_EOF'
[Unit]
Description=Token4Good Frontend (Next.js)
After=network.target token4good-backend.service
Requires=token4good-backend.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/token4good/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=NEXT_PUBLIC_API_URL=https://t4g.dazno.de/api
Environment=NEXT_PUBLIC_DAZNO_API_URL=https://api.dazno.de
Environment=NEXT_PUBLIC_DAZNO_USERS_API_URL=https://dazno.de/api
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=token4good-frontend

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
SERVICE_EOF

    # Recharger systemd
    systemctl daemon-reload
    
    # Démarrer le service frontend
    systemctl enable token4good-frontend
    systemctl start token4good-frontend
    
    # Vérifier le statut
    systemctl status token4good-frontend --no-pager
    
    echo "✅ Service frontend configuré et démarré"
EOF

# Mise à jour de la configuration Nginx
echo "🌐 Mise à jour de la configuration Nginx..."
sshpass -p "$SERVER_PASSWORD" ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
    # Sauvegarder la config actuelle
    cp /etc/nginx/sites-available/t4g.dazno.de /etc/nginx/sites-available/t4g.dazno.de.backup.$(date +%Y%m%d_%H%M%S)
    
    # Créer la nouvelle configuration
    cat > /etc/nginx/sites-available/t4g.dazno.de << 'NGINX_EOF'
# Token4Good - Production Configuration avec Frontend Next.js

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name t4g.dazno.de;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name t4g.dazno.de;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/t4g.dazno.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/t4g.dazno.de/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/t4g.dazno.de/chain.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/t4g-access.log;
    error_log /var/log/nginx/t4g-error.log warn;

    # Backend API Proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Frontend Next.js Proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # WebSocket support pour HMR
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
NGINX_EOF

    # Tester la configuration
    nginx -t
    
    # Recharger Nginx
    systemctl reload nginx
    
    echo "✅ Configuration Nginx mise à jour"
EOF

# Tests de validation
echo "🧪 Tests de validation..."
echo "Test 1: Health check backend"
curl -s https://t4g.dazno.de/health | jq . || echo "❌ Health check échoué"

echo "Test 2: Frontend accessible"
curl -I https://t4g.dazno.de/ | head -1 || echo "❌ Frontend inaccessible"

echo "Test 3: API backend"
curl -I https://t4g.dazno.de/api/users | head -1 || echo "❌ API backend inaccessible"

# Nettoyage
echo "🧹 Nettoyage..."
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 Déploiement frontend terminé !"
echo "=================================="
echo "🌐 Frontend: https://t4g.dazno.de"
echo "🔧 API Backend: https://t4g.dazno.de/api"
echo "❤️ Health Check: https://t4g.dazno.de/health"
echo ""
echo "📊 Services actifs:"
sshpass -p "$SERVER_PASSWORD" ssh "$SERVER_USER@$SERVER_IP" "systemctl is-active token4good-backend token4good-frontend nginx postgresql@16-main"
echo ""
echo "✅ Déploiement réussi !"
