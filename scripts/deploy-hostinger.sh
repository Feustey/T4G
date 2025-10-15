#!/bin/bash
###############################################################################
# Token4Good v2 - Script de Déploiement Hostinger VPS
# Date: 2025-10-12
# Target: 147.79.101.32
###############################################################################

set -euo pipefail

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SSH_HOST="147.79.101.32"
SSH_USER="root"
SSH_PASS="Criteria0-Cadmium5-Attempt9-Exit2-Floss1"
DEPLOY_DIR="/var/www/token4good"
DOMAIN="t4g.dazno.de"

# Fonctions d'affichage
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier les prérequis locaux
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    if ! command -v sshpass &> /dev/null; then
        log_error "sshpass n'est pas installé. Installation..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install hudochenkov/sshpass/sshpass
        else
            sudo apt-get install -y sshpass
        fi
    fi
    
    if ! command -v rsync &> /dev/null; then
        log_error "rsync n'est pas installé"
        exit 1
    fi
    
    log_success "Prérequis OK"
}

# Fonction SSH helper
ssh_exec() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$@"
}

# Copier fichiers vers serveur
scp_copy() {
    local src=$1
    local dest=$2
    sshpass -p "$SSH_PASS" scp -o StrictHostKeyChecking=no -r "$src" "$SSH_USER@$SSH_HOST:$dest"
}

# Étape 1: Setup initial du serveur
setup_server() {
    log_info "=== Étape 1: Configuration initiale du serveur ==="
    
    ssh_exec << 'EOF'
        echo "📦 Mise à jour du système..."
        apt update -y && apt upgrade -y
        
        echo "🔧 Installation des outils de base..."
        apt install -y curl wget git vim htop ufw fail2ban certbot python3-certbot-nginx \
                       build-essential pkg-config libssl-dev libpq-dev
        
        echo "🔒 Configuration du firewall..."
        ufw --force enable
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        echo "🛡️  Configuration Fail2Ban..."
        systemctl enable fail2ban
        systemctl start fail2ban
EOF
    
    log_success "Configuration serveur complète"
}

# Étape 2: Installation PostgreSQL
setup_postgresql() {
    log_info "=== Étape 2: Installation PostgreSQL ==="
    
    ssh_exec << 'EOF'
        echo "📦 Installation PostgreSQL..."
        apt install -y postgresql postgresql-contrib
        
        systemctl enable postgresql
        systemctl start postgresql
        
        echo "🗄️  Création de la base de données..."
        sudo -u postgres psql -c "CREATE DATABASE token4good;" 2>/dev/null || echo "DB existe déjà"
        sudo -u postgres psql -c "CREATE USER t4g_user WITH ENCRYPTED PASSWORD 'T4G_Production_2025!';" 2>/dev/null || echo "User existe déjà"
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE token4good TO t4g_user;"
        
        echo "✅ PostgreSQL configuré"
EOF
    
    log_success "PostgreSQL installé et configuré"
}

# Étape 3: Installation Rust
setup_rust() {
    log_info "=== Étape 3: Installation Rust ==="
    
    ssh_exec << 'EOF'
        if ! command -v cargo &> /dev/null; then
            echo "📦 Installation de Rust..."
            curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
            source ~/.cargo/env
        else
            echo "✅ Rust déjà installé"
        fi
        
        source ~/.cargo/env
        rustc --version
        cargo --version
EOF
    
    log_success "Rust installé"
}

# Étape 4: Déploiement du Backend
deploy_backend() {
    log_info "=== Étape 4: Déploiement du Backend ==="
    
    # Build local
    log_info "🏗️  Build du backend en local..."
    cd token4good-backend
    cargo build --release
    cd ..
    
    # Créer la structure sur le serveur
    ssh_exec "mkdir -p $DEPLOY_DIR/token4good-backend $DEPLOY_DIR/data/{rgb,lnd,bitcoin}"
    
    # Copier le binaire
    log_info "📤 Upload du binaire..."
    scp_copy token4good-backend/target/release/token4good-backend "$DEPLOY_DIR/token4good-backend/"
    
    # Copier la config
    scp_copy token4good-backend/Cargo.toml "$DEPLOY_DIR/token4good-backend/"
    
    # Créer le fichier .env
    log_info "⚙️  Configuration des variables d'environnement..."
    ssh_exec "cat > $DEPLOY_DIR/token4good-backend/.env" << 'ENVEOF'
# Server
PORT=3001
HOST=0.0.0.0
RUST_LOG=info,token4good_backend=debug

# Database
DATABASE_URL=postgresql://t4g_user:T4G_Production_2025!@localhost:5432/token4good

# JWT
JWT_SECRET=Criteria0-Cadmium5-Attempt9-Exit2-Floss1-Production-JWT-2025
JWT_EXPIRATION_HOURS=24

# Bitcoin & RGB
BITCOIN_NETWORK=mainnet
RGB_DATA_DIR=/var/www/token4good/data/rgb
RGB_NETWORK=mainnet

# Lightning Network
LND_HOST=localhost
LND_PORT=10009
LND_MACAROON_PATH=/var/www/token4good/data/lnd/admin.macaroon
LND_TLS_CERT_PATH=/var/www/token4good/data/lnd/tls.cert

# Dazno Integration
DAZNO_API_URL=https://dazno.de/api
DAZNO_LIGHTNING_API_URL=https://api.dazno.de
DAZNO_USERS_API_URL=https://dazno.de/api

# CORS
ALLOWED_ORIGINS=https://t4g.dazno.de,https://dazno.de

# Logging
LOG_LEVEL=info
ENVEOF
    
    # Créer le service systemd
    log_info "🔧 Création du service systemd..."
    ssh_exec "cat > /etc/systemd/system/token4good-backend.service" << 'SERVICEEOF'
[Unit]
Description=Token4Good Backend (Rust + Axum)
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/token4good/token4good-backend
Environment=PATH=/root/.cargo/bin:/usr/local/bin:/usr/bin:/bin
EnvironmentFile=/var/www/token4good/token4good-backend/.env
ExecStart=/var/www/token4good/token4good-backend/token4good-backend
Restart=always
RestartSec=10

StandardOutput=journal
StandardError=journal
SyslogIdentifier=token4good-backend

NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
SERVICEEOF
    
    # Démarrer le service
    ssh_exec << 'EOF'
        systemctl daemon-reload
        systemctl enable token4good-backend
        systemctl restart token4good-backend
        sleep 3
        systemctl status token4good-backend --no-pager
EOF
    
    log_success "Backend déployé"
}

# Étape 5: Installation Nginx
setup_nginx() {
    log_info "=== Étape 5: Configuration Nginx ==="
    
    ssh_exec << 'EOF'
        apt install -y nginx
        
        # Configuration Nginx
        cat > /etc/nginx/sites-available/token4good << 'NGINXEOF'
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

    # SSL (sera configuré par certbot)
    ssl_certificate /etc/letsencrypt/live/t4g.dazno.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/t4g.dazno.de/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    access_log /var/log/nginx/token4good-access.log;
    error_log /var/log/nginx/token4good-error.log warn;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend
    location / {
        root /var/www/token4good/frontend;
        try_files $uri $uri/ $uri.html /index.html =404;
        
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
NGINXEOF

        ln -sf /etc/nginx/sites-available/token4good /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        mkdir -p /var/www/certbot
        
        systemctl enable nginx
        systemctl restart nginx
EOF
    
    log_success "Nginx configuré"
}

# Étape 6: SSL avec Let's Encrypt
setup_ssl() {
    log_info "=== Étape 6: Configuration SSL ==="
    
    log_warning "⚠️  Assurez-vous que le DNS $DOMAIN pointe vers $SSH_HOST"
    read -p "Continuer avec l'installation SSL? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ssh_exec << 'EOF'
            certbot certonly \
              --webroot \
              --webroot-path=/var/www/certbot \
              --email admin@dazno.de \
              --agree-tos \
              --no-eff-email \
              -d t4g.dazno.de
            
            systemctl reload nginx
            
            # Auto-renewal
            echo "0 0,12 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" > /etc/cron.d/certbot
EOF
        
        log_success "SSL configuré"
    else
        log_warning "SSL ignoré - à configurer manuellement plus tard"
    fi
}

# Étape 7: Déploiement Frontend
deploy_frontend() {
    log_info "=== Étape 7: Déploiement du Frontend ==="
    
    # Build frontend
    log_info "🏗️  Build du frontend..."
    cd apps/dapp
    
    # Créer .env.production
    cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://t4g.dazno.de/api
NEXT_PUBLIC_DAZNO_API_URL=https://api.dazno.de
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://dazno.de/api
EOF
    
    npm install
    npm run build
    
    # Créer export statique si nécessaire
    if [ -d "out" ]; then
        EXPORT_DIR="out"
    else
        EXPORT_DIR=".next"
    fi
    
    cd ../..
    
    # Créer répertoire sur serveur
    ssh_exec "mkdir -p $DEPLOY_DIR/frontend"
    
    # Upload frontend
    log_info "📤 Upload du frontend..."
    scp_copy "apps/dapp/$EXPORT_DIR/*" "$DEPLOY_DIR/frontend/"
    
    # Recharger Nginx
    ssh_exec "systemctl reload nginx"
    
    log_success "Frontend déployé"
}

# Étape 8: Tests
run_tests() {
    log_info "=== Étape 8: Tests de déploiement ==="
    
    log_info "🧪 Test Backend Health..."
    ssh_exec "curl -f http://localhost:3001/health" && log_success "Backend OK" || log_error "Backend FAIL"
    
    log_info "🧪 Test Nginx..."
    ssh_exec "nginx -t" && log_success "Nginx config OK" || log_error "Nginx config FAIL"
    
    log_info "🧪 Test PostgreSQL..."
    ssh_exec "psql -U t4g_user -d token4good -h localhost -c 'SELECT 1;'" && log_success "PostgreSQL OK" || log_error "PostgreSQL FAIL"
    
    log_info "🧪 Test HTTPS (si SSL configuré)..."
    if curl -f https://$DOMAIN/health &> /dev/null; then
        log_success "HTTPS OK"
    else
        log_warning "HTTPS non accessible (normal si SSL pas encore configuré)"
    fi
}

# Afficher le statut
show_status() {
    log_info "=== Status des Services ==="
    
    ssh_exec << 'EOF'
        echo "Backend:"
        systemctl is-active token4good-backend
        
        echo "PostgreSQL:"
        systemctl is-active postgresql
        
        echo "Nginx:"
        systemctl is-active nginx
        
        echo ""
        echo "Logs Backend (dernières 10 lignes):"
        journalctl -u token4good-backend -n 10 --no-pager
EOF
}

# Menu principal
show_menu() {
    echo ""
    echo "=========================================="
    echo "  Token4Good - Déploiement Hostinger VPS"
    echo "=========================================="
    echo ""
    echo "1) Déploiement Complet (recommandé pour première fois)"
    echo "2) Setup Serveur uniquement"
    echo "3) Déployer Backend uniquement"
    echo "4) Déployer Frontend uniquement"
    echo "5) Configurer SSL"
    echo "6) Tests"
    echo "7) Afficher le Status"
    echo "8) Quitter"
    echo ""
}

# Main
main() {
    check_prerequisites
    
    if [ $# -eq 0 ]; then
        # Mode interactif
        while true; do
            show_menu
            read -p "Choix: " choice
            
            case $choice in
                1)
                    setup_server
                    setup_postgresql
                    setup_rust
                    deploy_backend
                    setup_nginx
                    setup_ssl
                    deploy_frontend
                    run_tests
                    show_status
                    log_success "🎉 Déploiement complet terminé!"
                    break
                    ;;
                2)
                    setup_server
                    setup_postgresql
                    setup_rust
                    ;;
                3)
                    deploy_backend
                    ;;
                4)
                    deploy_frontend
                    ;;
                5)
                    setup_ssl
                    ;;
                6)
                    run_tests
                    ;;
                7)
                    show_status
                    ;;
                8)
                    log_info "Au revoir!"
                    exit 0
                    ;;
                *)
                    log_error "Choix invalide"
                    ;;
            esac
        done
    else
        # Mode commande
        case $1 in
            full)
                setup_server
                setup_postgresql
                setup_rust
                deploy_backend
                setup_nginx
                setup_ssl
                deploy_frontend
                run_tests
                show_status
                ;;
            backend)
                deploy_backend
                ;;
            frontend)
                deploy_frontend
                ;;
            status)
                show_status
                ;;
            *)
                echo "Usage: $0 [full|backend|frontend|status]"
                exit 1
                ;;
        esac
    fi
}

# Exécution
main "$@"

