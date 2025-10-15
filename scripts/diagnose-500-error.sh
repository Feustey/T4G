#!/bin/bash
# Script de diagnostic et correction de l'erreur 500
# Token4Good Production - Hostinger VPS

set -euo pipefail

# Configuration
SSH_HOST="147.79.101.32"
SSH_USER="root"
SSH_PASS="Criteria0-Cadmium5-Attempt9-Exit2-Floss1"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

ssh_exec() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$@" 2>/dev/null
}

echo "🔍 DIAGNOSTIC ERREUR 500 - Token4Good Production"
echo "================================================"

# 1. Vérifier l'état des services
log_info "1. Vérification des services système..."
echo "Services status:"
ssh_exec "systemctl status token4good-backend --no-pager -l"
ssh_exec "systemctl status postgresql@16-main --no-pager -l"
ssh_exec "systemctl status nginx --no-pager -l"

# 2. Vérifier les logs du backend
log_info "2. Analyse des logs backend (dernières 50 lignes)..."
ssh_exec "journalctl -u token4good-backend -n 50 --no-pager"

# 3. Vérifier la connectivité base de données
log_info "3. Test de connexion PostgreSQL..."
ssh_exec "psql -U t4g_user -d token4good -h localhost -c 'SELECT version();'"

# 4. Vérifier les variables d'environnement
log_info "4. Vérification des variables d'environnement..."
ssh_exec "cat /var/www/token4good/token4good-backend/.env 2>/dev/null || echo 'Fichier .env non trouvé'"

# 5. Vérifier les ressources système
log_info "5. État des ressources système..."
ssh_exec "free -h"
ssh_exec "df -h /"
ssh_exec "ps aux | grep token4good-backend"

# 6. Test de l'endpoint health
log_info "6. Test de l'endpoint health..."
curl -v https://t4g.dazno.de/health || echo "Erreur curl"

# 7. Vérifier les logs Nginx
log_info "7. Logs Nginx (erreurs récentes)..."
ssh_exec "tail -20 /var/log/nginx/t4g-error.log 2>/dev/null || echo 'Pas de logs d\'erreur Nginx'"

echo ""
echo "🔧 ACTIONS DE CORRECTION RECOMMANDÉES:"
echo "======================================"

# Redémarrer le service backend
log_info "Redémarrage du service backend..."
ssh_exec "systemctl restart token4good-backend"
sleep 5

# Vérifier que le service redémarre correctement
if ssh_exec "systemctl is-active token4good-backend" | grep -q "active"; then
    log_success "Service backend redémarré avec succès"
else
    log_error "Échec du redémarrage du service backend"
fi

# Test final
log_info "Test final de l'endpoint health..."
sleep 10
if curl -f -s https://t4g.dazno.de/health > /dev/null; then
    log_success "✅ L'erreur 500 est corrigée !"
    curl -s https://t4g.dazno.de/health | jq .
else
    log_error "❌ L'erreur 500 persiste"
    echo "Consultez les logs ci-dessus pour plus de détails"
fi
