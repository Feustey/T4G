#!/bin/bash
#
# Script de correction pour l'erreur 502 sur t4g.dazno.de
# À exécuter sur le serveur : ssh root@147.79.101.32
#

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}🔧 Correction T4G 502 Error${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Fonction de log
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Étape 1: Diagnostic
log_info "Étape 1: Diagnostic des services"
echo "-----------------------------------"

if systemctl is-active --quiet token4good-backend; then
    log_success "Backend: Actif"
else
    log_error "Backend: Inactif"
    systemctl start token4good-backend
fi

if systemctl is-active --quiet token4good-frontend; then
    log_success "Frontend: Actif"
    FRONTEND_WAS_ACTIVE=1
else
    log_error "Frontend: Inactif - Démarrage..."
    FRONTEND_WAS_ACTIVE=0
fi

if systemctl is-active --quiet nginx; then
    log_success "Nginx: Actif"
else
    log_error "Nginx: Inactif"
    systemctl start nginx
fi

echo ""

# Étape 2: Vérifier si le frontend fonctionne localement
log_info "Étape 2: Test du frontend en local"
echo "-----------------------------------"

FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")

if [ "$FRONTEND_RESPONSE" == "200" ] || [ "$FRONTEND_RESPONSE" == "307" ] || [ "$FRONTEND_RESPONSE" == "301" ]; then
    log_success "Frontend répond en local (code: $FRONTEND_RESPONSE)"
    FRONTEND_OK=1
else
    log_error "Frontend ne répond pas en local (code: $FRONTEND_RESPONSE)"
    FRONTEND_OK=0
fi

echo ""

# Étape 3: Si le frontend ne fonctionne pas, le redémarrer
if [ $FRONTEND_OK -eq 0 ]; then
    log_info "Étape 3: Redémarrage du frontend"
    echo "-----------------------------------"
    
    systemctl stop token4good-frontend 2>/dev/null || true
    sleep 2
    systemctl start token4good-frontend
    sleep 5
    
    # Re-test
    FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")
    
    if [ "$FRONTEND_RESPONSE" == "200" ] || [ "$FRONTEND_RESPONSE" == "307" ] || [ "$FRONTEND_RESPONSE" == "301" ]; then
        log_success "Frontend répond maintenant (code: $FRONTEND_RESPONSE)"
        FRONTEND_OK=1
    else
        log_error "Frontend ne répond toujours pas"
        log_info "Vérification des logs:"
        journalctl -u token4good-frontend -n 20 --no-pager
        echo ""
        log_error "Le problème est dans le service frontend lui-même"
        log_info "Actions recommandées:"
        echo "  1. Vérifier que Node.js est installé: node --version"
        echo "  2. Vérifier le fichier server.js: ls -la /var/www/token4good/frontend/server.js"
        echo "  3. Tester manuellement: cd /var/www/token4good/frontend && PORT=3000 node server.js"
        exit 1
    fi
    echo ""
fi

# Étape 4: Backup de la configuration Nginx actuelle
log_info "Étape 4: Backup configuration Nginx"
echo "------------------------------------"

BACKUP_DIR="/var/backups/nginx"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/t4g.dazno.de.$(date +%Y%m%d_%H%M%S).conf"

if [ -f /etc/nginx/sites-available/t4g.dazno.de ]; then
    cp /etc/nginx/sites-available/t4g.dazno.de "$BACKUP_FILE"
    log_success "Backup créé: $BACKUP_FILE"
else
    log_warning "Fichier de config non trouvé, création d'une nouvelle config"
fi

echo ""

# Étape 5: Créer une nouvelle configuration Nginx optimisée
log_info "Étape 5: Configuration Nginx optimisée"
echo "---------------------------------------"

cat > /etc/nginx/sites-available/t4g.dazno.de << 'NGINX_CONFIG_EOF'
# Token4Good - Configuration Nginx
# Cohabitation avec MCP (api.dazno.de)

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

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/t4g.dazno.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/t4g.dazno.de/privkey.pem;
    
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

    # Logs
    access_log /var/log/nginx/t4g-access.log;
    error_log /var/log/nginx/t4g-error.log warn;

    # Health Check (Backend)
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
    }

    # Frontend Next.js (Standalone)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # Headers essentiels
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # WebSocket support (pour Next.js)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts généreux
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Désactiver buffering
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Gestion des erreurs
        proxy_intercept_errors off;
    }
}
NGINX_CONFIG_EOF

log_success "Configuration Nginx créée"
echo ""

# Étape 6: Activer le site
log_info "Étape 6: Activation du site"
echo "----------------------------"

ln -sf /etc/nginx/sites-available/t4g.dazno.de /etc/nginx/sites-enabled/t4g.dazno.de
log_success "Site activé"
echo ""

# Étape 7: Tester la configuration Nginx
log_info "Étape 7: Test configuration Nginx"
echo "----------------------------------"

if nginx -t 2>&1 | grep -q "successful"; then
    log_success "Configuration Nginx valide"
else
    log_error "Configuration Nginx invalide"
    nginx -t
    echo ""
    log_error "Restauration de la backup"
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" /etc/nginx/sites-available/t4g.dazno.de
        log_success "Backup restaurée"
    fi
    exit 1
fi

echo ""

# Étape 8: Recharger Nginx
log_info "Étape 8: Rechargement Nginx"
echo "----------------------------"

systemctl reload nginx
log_success "Nginx rechargé"
echo ""

# Étape 9: Tests finaux
log_info "Étape 9: Tests de validation"
echo "-----------------------------"

sleep 2

# Test local
LOCAL_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")
if [ "$LOCAL_TEST" == "200" ] || [ "$LOCAL_TEST" == "307" ] || [ "$LOCAL_TEST" == "301" ]; then
    log_success "Test local: OK ($LOCAL_TEST)"
else
    log_error "Test local: FAIL ($LOCAL_TEST)"
fi

# Test public (depuis le serveur lui-même)
PUBLIC_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://t4g.dazno.de/ 2>/dev/null || echo "000")
if [ "$PUBLIC_TEST" == "200" ] || [ "$PUBLIC_TEST" == "307" ] || [ "$PUBLIC_TEST" == "301" ]; then
    log_success "Test public: OK ($PUBLIC_TEST)"
else
    log_error "Test public: FAIL ($PUBLIC_TEST)"
    log_warning "Vérifiez les logs Nginx:"
    echo "  tail -f /var/log/nginx/t4g-error.log"
fi

# Test backend
BACKEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://t4g.dazno.de/health 2>/dev/null || echo "000")
if [ "$BACKEND_TEST" == "200" ]; then
    log_success "Test backend: OK ($BACKEND_TEST)"
else
    log_error "Test backend: FAIL ($BACKEND_TEST)"
fi

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}✨ Correction terminée${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo "📊 Résumé:"
echo "  - Frontend local:  $LOCAL_TEST"
echo "  - Frontend public: $PUBLIC_TEST"
echo "  - Backend health:  $BACKEND_TEST"
echo ""

if [ "$PUBLIC_TEST" == "200" ] || [ "$PUBLIC_TEST" == "307" ] || [ "$PUBLIC_TEST" == "301" ]; then
    log_success "🎉 Le site t4g.dazno.de fonctionne !"
    echo ""
    echo "Testez depuis votre navigateur:"
    echo "  https://t4g.dazno.de/"
else
    log_error "Le problème persiste"
    echo ""
    echo "Commandes de débuggage:"
    echo "  journalctl -u token4good-frontend -f"
    echo "  tail -f /var/log/nginx/t4g-error.log"
    echo "  curl -v http://localhost:3000/"
fi

echo ""

