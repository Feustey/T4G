#!/bin/bash

# Script de déploiement frontend Next.js sur Hostinger VPS - Version Production
# Usage: ./deploy-frontend-production.sh

set -e

echo "🚀 Déploiement Frontend Next.js Token4Good"
echo "==========================================="

# Configuration
SERVER="root@147.79.101.32"
REMOTE_DIR="/var/www/token4good/frontend"
LOCAL_DIR="/Users/stephanecourant/Documents/DAZ/_T4G/T4G/apps/dapp"

# Étape 1: Vérifier la connexion SSH
echo "🔐 Test de connexion SSH..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $SERVER "echo 'Connection OK'" 2>/dev/null; then
    echo "⚠️ Impossible de se connecter au serveur via clé SSH"
    echo "💡 Utilisation du mot de passe..."
    USE_PASSWORD=true
else
    echo "✅ Connexion SSH OK"
    USE_PASSWORD=false
fi

# Étape 2: Préparer le package de déploiement
echo ""
echo "📦 Préparation du package de déploiement..."
cd "$LOCAL_DIR"

# Créer un tarball léger (sans node_modules)
echo "   Création du tarball..."
tar -czf /tmp/t4g-frontend-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.next/cache' \
    --exclude='.git' \
    .next package.json package-lock.json next.config.js .env.production public/

echo "✅ Package créé: /tmp/t4g-frontend-deploy.tar.gz"

# Étape 3: Upload vers le serveur
echo ""
echo "📤 Upload vers le serveur..."
if [ "$USE_PASSWORD" = true ]; then
    sshpass -p "Criteria0-Cadmium5-Attempt9-Exit2-Floss1" scp -o ConnectTimeout=30 \
        /tmp/t4g-frontend-deploy.tar.gz $SERVER:/tmp/
else
    scp -o ConnectTimeout=30 /tmp/t4g-frontend-deploy.tar.gz $SERVER:/tmp/
fi

echo "✅ Upload terminé"

# Étape 4: Installation et configuration sur le serveur
echo ""
echo "⚙️ Installation sur le serveur..."

if [ "$USE_PASSWORD" = true ]; then
    sshpass -p "Criteria0-Cadmium5-Attempt9-Exit2-Floss1" ssh -o ConnectTimeout=30 $SERVER bash << 'ENDSSH'
        set -e
        
        echo "🔧 Configuration du frontend..."
        
        # Créer le répertoire si nécessaire
        mkdir -p /var/www/token4good/frontend
        cd /var/www/token4good/frontend
        
        # Extraire le tarball
        echo "   Extraction du package..."
        tar -xzf /tmp/t4g-frontend-deploy.tar.gz
        
        # Installer Node.js si nécessaire
        if ! command -v node &> /dev/null; then
            echo "   Installation de Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt-get install -y nodejs
        fi
        
        # Installer les dépendances de production
        echo "   Installation des dépendances..."
        npm install --production --legacy-peer-deps
        
        # Créer le fichier .env.production si nécessaire
        cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://t4g.dazno.de/api
NEXT_PUBLIC_DAZNO_API_URL=https://api.dazno.de
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://dazno.de/api
NODE_ENV=production
EOF
        
        # Créer ou mettre à jour le service systemd
        echo "   Configuration du service systemd..."
        cat > /etc/systemd/system/token4good-frontend.service << 'EOF'
[Unit]
Description=Token4Good Frontend (Next.js)
After=network.target token4good-backend.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/token4good/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/var/www/token4good/frontend/.env.production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

StandardOutput=journal
StandardError=journal
SyslogIdentifier=token4good-frontend

NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
        
        # Recharger systemd et démarrer le service
        echo "   Démarrage du service frontend..."
        systemctl daemon-reload
        systemctl enable token4good-frontend
        systemctl restart token4good-frontend
        
        # Attendre que le service démarre
        sleep 5
        
        # Vérifier le statut
        if systemctl is-active --quiet token4good-frontend; then
            echo "✅ Service frontend actif"
        else
            echo "❌ Erreur: service frontend non actif"
            journalctl -u token4good-frontend -n 20
            exit 1
        fi
        
        # Mettre à jour la configuration Nginx
        echo "   Configuration Nginx..."
        cat > /etc/nginx/sites-available/t4g.dazno.de << 'EOF'
# Token4Good - Production Configuration

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

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name t4g.dazno.de;

    ssl_certificate /etc/letsencrypt/live/t4g.dazno.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/t4g.dazno.de/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/t4g.dazno.de/chain.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    access_log /var/log/nginx/t4g-access.log;
    error_log /var/log/nginx/t4g-error.log warn;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF
        
        # Activer le site
        ln -sf /etc/nginx/sites-available/t4g.dazno.de /etc/nginx/sites-enabled/
        
        # Tester et recharger Nginx
        if nginx -t 2>&1; then
            systemctl reload nginx
            echo "✅ Nginx rechargé"
        else
            echo "❌ Erreur de configuration Nginx"
            nginx -t
            exit 1
        fi
        
        # Nettoyage
        rm -f /tmp/t4g-frontend-deploy.tar.gz
        
        echo ""
        echo "✅ Installation terminée sur le serveur"
ENDSSH
else
    ssh -o ConnectTimeout=30 $SERVER bash << 'ENDSSH'
        set -e
        
        echo "🔧 Configuration du frontend..."
        
        # Créer le répertoire si nécessaire
        mkdir -p /var/www/token4good/frontend
        cd /var/www/token4good/frontend
        
        # Extraire le tarball
        echo "   Extraction du package..."
        tar -xzf /tmp/t4g-frontend-deploy.tar.gz
        
        # Installer Node.js si nécessaire
        if ! command -v node &> /dev/null; then
            echo "   Installation de Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt-get install -y nodejs
        fi
        
        # Installer les dépendances de production
        echo "   Installation des dépendances..."
        npm install --production --legacy-peer-deps
        
        # Créer le fichier .env.production si nécessaire
        cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://t4g.dazno.de/api
NEXT_PUBLIC_DAZNO_API_URL=https://api.dazno.de
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://dazno.de/api
NODE_ENV=production
EOF
        
        # Créer ou mettre à jour le service systemd
        echo "   Configuration du service systemd..."
        cat > /etc/systemd/system/token4good-frontend.service << 'EOF'
[Unit]
Description=Token4Good Frontend (Next.js)
After=network.target token4good-backend.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/token4good/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/var/www/token4good/frontend/.env.production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

StandardOutput=journal
StandardError=journal
SyslogIdentifier=token4good-frontend

NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
        
        # Recharger systemd et démarrer le service
        echo "   Démarrage du service frontend..."
        systemctl daemon-reload
        systemctl enable token4good-frontend
        systemctl restart token4good-frontend
        
        # Attendre que le service démarre
        sleep 5
        
        # Vérifier le statut
        if systemctl is-active --quiet token4good-frontend; then
            echo "✅ Service frontend actif"
        else
            echo "❌ Erreur: service frontend non actif"
            journalctl -u token4good-frontend -n 20
            exit 1
        fi
        
        # Mettre à jour la configuration Nginx
        echo "   Configuration Nginx..."
        cat > /etc/nginx/sites-available/t4g.dazno.de << 'EOF'
# Token4Good - Production Configuration

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

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name t4g.dazno.de;

    ssl_certificate /etc/letsencrypt/live/t4g.dazno.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/t4g.dazno.de/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/t4g.dazno.de/chain.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    access_log /var/log/nginx/t4g-access.log;
    error_log /var/log/nginx/t4g-error.log warn;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF
        
        # Activer le site
        ln -sf /etc/nginx/sites-available/t4g.dazno.de /etc/nginx/sites-enabled/
        
        # Tester et recharger Nginx
        if nginx -t 2>&1; then
            systemctl reload nginx
            echo "✅ Nginx rechargé"
        else
            echo "❌ Erreur de configuration Nginx"
            nginx -t
            exit 1
        fi
        
        # Nettoyage
        rm -f /tmp/t4g-frontend-deploy.tar.gz
        
        echo ""
        echo "✅ Installation terminée sur le serveur"
ENDSSH
fi

# Étape 5: Tests de validation
echo ""
echo "🧪 Tests de validation..."
sleep 10  # Attendre que tout se stabilise

echo "   Test 1: Health check backend..."
if curl -s -f https://t4g.dazno.de/health > /dev/null 2>&1; then
    echo "   ✅ Backend opérationnel"
else
    echo "   ⚠️ Backend inaccessible"
fi

echo "   Test 2: Frontend accessible..."
if curl -s -f -I https://t4g.dazno.de/ > /dev/null 2>&1; then
    echo "   ✅ Frontend accessible"
else
    echo "   ⚠️ Frontend inaccessible"
fi

echo "   Test 3: API backend..."
if curl -s -f -I https://t4g.dazno.de/api/users > /dev/null 2>&1; then
    echo "   ✅ API backend opérationnelle"
else
    echo "   ⚠️ API backend inaccessible"
fi

# Nettoyage local
rm -f /tmp/t4g-frontend-deploy.tar.gz

echo ""
echo "🎉 Déploiement Frontend Terminé !"
echo "=================================="
echo ""
echo "🌐 URLs de Production:"
echo "   Frontend: https://t4g.dazno.de"
echo "   API Backend: https://t4g.dazno.de/api"
echo "   Health Check: https://t4g.dazno.de/health"
echo ""
echo "📊 Commandes Utiles:"
echo "   Logs frontend: ssh $SERVER 'journalctl -u token4good-frontend -f'"
echo "   Logs backend: ssh $SERVER 'journalctl -u token4good-backend -f'"
echo "   Status: ssh $SERVER 'systemctl status token4good-frontend token4good-backend'"
echo ""
echo "✅ Déploiement Production Réussi !"

