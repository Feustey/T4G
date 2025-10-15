#!/bin/bash
###############################################################################
# Token4Good v2 - Script de Test de Déploiement
# Date: 2025-10-12
# Usage: ./test-deployment.sh [local|production]
###############################################################################

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MODE="${1:-production}"
if [ "$MODE" = "local" ]; then
    BASE_URL="http://localhost:3001"
    FRONTEND_URL="http://localhost:3000"
else
    BASE_URL="https://t4g.dazno.de"
    FRONTEND_URL="https://t4g.dazno.de"
fi

SSH_HOST="147.79.101.32"
SSH_USER="root"
SSH_PASS="Criteria0-Cadmium5-Attempt9-Exit2-Floss1"

# Compteurs
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Fonctions d'affichage
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

test_command() {
    local description=$1
    local command=$2
    ((TESTS_TOTAL++))
    
    echo -n "Test $TESTS_TOTAL: $description... "
    if eval "$command" > /dev/null 2>&1; then
        log_success "PASS"
        return 0
    else
        log_error "FAIL"
        return 1
    fi
}

# Fonction SSH helper
ssh_exec() {
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$@" 2>/dev/null
}

# Header
echo ""
echo "=========================================="
echo "  Token4Good - Tests de Déploiement"
echo "=========================================="
echo ""
echo "Mode: $MODE"
echo "Backend URL: $BASE_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Section 1: Tests Backend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1. Tests Backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_command "Backend Health Check" \
    "curl -f -s $BASE_URL/health"

test_command "Backend Status 200" \
    "[ \$(curl -s -o /dev/null -w '%{http_code}' $BASE_URL/health) = '200' ]"

test_command "Backend JSON Response" \
    "curl -s $BASE_URL/health | grep -q 'status'"

# Section 2: Tests Frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  2. Tests Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_command "Frontend Accessible" \
    "curl -f -s $FRONTEND_URL"

test_command "Frontend Status 200" \
    "[ \$(curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL) = '200' ]"

test_command "Frontend HTML Content" \
    "curl -s $FRONTEND_URL | grep -q '<html'"

# Section 3: Tests SSL/HTTPS (production seulement)
if [ "$MODE" = "production" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  3. Tests SSL/HTTPS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    test_command "HTTPS Accessible" \
        "curl -f -s https://t4g.dazno.de/health"

    test_command "SSL Certificate Valid" \
        "echo | openssl s_client -connect t4g.dazno.de:443 -servername t4g.dazno.de 2>/dev/null | grep -q 'Verify return code: 0'"

    test_command "HTTP Redirect to HTTPS" \
        "[ \$(curl -s -o /dev/null -w '%{redirect_url}' http://t4g.dazno.de) = 'https://t4g.dazno.de/' ]"
fi

# Section 4: Tests Services (production seulement)
if [ "$MODE" = "production" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  4. Tests Services Système"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    test_command "Backend Service Running" \
        "ssh_exec 'systemctl is-active token4good-backend'"

    test_command "PostgreSQL Running" \
        "ssh_exec 'systemctl is-active postgresql'"

    test_command "Nginx Running" \
        "ssh_exec 'systemctl is-active nginx'"

    test_command "Backend Process Exists" \
        "ssh_exec 'pgrep -f token4good-backend'"

    test_command "PostgreSQL Port Open" \
        "ssh_exec 'ss -tlnp | grep -q 5432'"

    test_command "Nginx Port 80 Open" \
        "ssh_exec 'ss -tlnp | grep -q :80'"

    test_command "Nginx Port 443 Open" \
        "ssh_exec 'ss -tlnp | grep -q :443'"
fi

# Section 5: Tests Base de Données
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  5. Tests Base de Données"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$MODE" = "production" ]; then
    test_command "PostgreSQL Connection" \
        "ssh_exec 'psql -U t4g_user -d token4good -h localhost -c \"SELECT 1;\"'"

    test_command "Database Exists" \
        "ssh_exec 'psql -U t4g_user -d token4good -h localhost -c \"SELECT datname FROM pg_database WHERE datname = '\'token4good\'';\" | grep -q token4good'"

    test_command "Users Table Exists" \
        "ssh_exec 'psql -U t4g_user -d token4good -h localhost -c \"\dt users\" 2>&1 | grep -q users'"
fi

# Section 6: Tests API
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  6. Tests API Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_command "API Health Endpoint" \
    "curl -f -s $BASE_URL/api/health"

test_command "API Returns JSON" \
    "curl -s $BASE_URL/health | python3 -m json.tool"

# Test Auth endpoint (devrait retourner 401 sans token)
((TESTS_TOTAL++))
echo -n "Test $TESTS_TOTAL: API Auth Endpoint (expects 401)... "
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' $BASE_URL/api/users)
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "200" ]; then
    log_success "PASS (got $HTTP_CODE)"
else
    log_error "FAIL (got $HTTP_CODE, expected 401 or 200)"
fi

# Section 7: Tests Performance
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  7. Tests Performance"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test temps de réponse
((TESTS_TOTAL++))
echo -n "Test $TESTS_TOTAL: Backend Response Time (<500ms)... "
RESPONSE_TIME=$(curl -s -o /dev/null -w '%{time_total}' $BASE_URL/health)
RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d. -f1)
if [ "$RESPONSE_TIME_MS" -lt 500 ]; then
    log_success "PASS (${RESPONSE_TIME_MS}ms)"
else
    log_warning "SLOW (${RESPONSE_TIME_MS}ms)"
    ((TESTS_FAILED++))
fi

# Section 8: Tests Sécurité
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  8. Tests Sécurité"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$MODE" = "production" ]; then
    test_command "HTTPS Enforced" \
        "[ \$(curl -s -o /dev/null -w '%{http_code}' -L http://t4g.dazno.de/health) = '200' ]"

    ((TESTS_TOTAL++))
    echo -n "Test $TESTS_TOTAL: Security Headers Present... "
    HEADERS=$(curl -s -I https://t4g.dazno.de)
    if echo "$HEADERS" | grep -q "Strict-Transport-Security" && \
       echo "$HEADERS" | grep -q "X-Frame-Options"; then
        log_success "PASS"
    else
        log_warning "MISSING"
        ((TESTS_FAILED++))
    fi

    test_command "No Server Version Exposed" \
        "! curl -s -I $FRONTEND_URL | grep -i 'Server:.*nginx/[0-9]'"
fi

# Section 9: Tests Logs (production seulement)
if [ "$MODE" = "production" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  9. Tests Logs"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    test_command "Backend Logs Accessible" \
        "ssh_exec 'journalctl -u token4good-backend -n 1'"

    test_command "Nginx Logs Exist" \
        "ssh_exec 'test -f /var/log/nginx/token4good-access.log'"

    test_command "No Recent Backend Errors" \
        "! ssh_exec 'journalctl -u token4good-backend --since \"5 minutes ago\" | grep -i error'"
fi

# Section 10: Tests Ressources (production seulement)
if [ "$MODE" = "production" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  10. Tests Ressources Système"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    ((TESTS_TOTAL++))
    echo -n "Test $TESTS_TOTAL: Disk Space Available (>10%)... "
    DISK_USAGE=$(ssh_exec "df -h / | tail -1 | awk '{print \$5}' | sed 's/%//'")
    if [ "$DISK_USAGE" -lt 90 ]; then
        log_success "PASS (${DISK_USAGE}% used)"
    else
        log_error "FAIL (${DISK_USAGE}% used)"
    fi

    ((TESTS_TOTAL++))
    echo -n "Test $TESTS_TOTAL: Memory Available (>20%)... "
    MEM_USAGE=$(ssh_exec "free | grep Mem | awk '{printf \"%.0f\", \$3/\$2 * 100}'")
    if [ "$MEM_USAGE" -lt 80 ]; then
        log_success "PASS (${MEM_USAGE}% used)"
    else
        log_warning "HIGH (${MEM_USAGE}% used)"
        ((TESTS_FAILED++))
    fi
fi

# Résumé
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Résumé des Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total:  $TESTS_TOTAL tests"
echo -e "${GREEN}Passed: $TESTS_PASSED tests${NC}"
echo -e "${RED}Failed: $TESTS_FAILED tests${NC}"
echo ""

# Calcul du pourcentage
SUCCESS_RATE=$(echo "scale=1; $TESTS_PASSED * 100 / $TESTS_TOTAL" | bc)

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests sont passés! (100%)${NC}"
    echo ""
    exit 0
elif [ "$TESTS_FAILED" -le 2 ]; then
    echo -e "${YELLOW}⚠️  Quelques tests ont échoué ($SUCCESS_RATE% de réussite)${NC}"
    echo "Consultez les logs pour plus de détails."
    echo ""
    exit 1
else
    echo -e "${RED}❌ Plusieurs tests ont échoué ($SUCCESS_RATE% de réussite)${NC}"
    echo "Le déploiement nécessite une attention."
    echo ""
    exit 2
fi

