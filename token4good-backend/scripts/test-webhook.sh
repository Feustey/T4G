#!/bin/bash

# ============================================
# Script de Test Webhook Dazno → Token4Good
# ============================================

# Configuration (à ajuster selon l'environnement)
API_URL="${T4G_WEBHOOK_URL:-http://localhost:3000/api/webhooks/dazno}"
API_KEY="${T4G_API_KEY:-test_api_key_replace_me}"
WEBHOOK_SECRET="${T4G_WEBHOOK_SECRET:-test_webhook_secret_replace_me}"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Test Webhook Dazno → Token4Good         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Fonction pour envoyer un webhook
send_webhook() {
    local EVENT_TYPE=$1
    local PAYLOAD=$2
    local TEST_NAME=$3
    
    echo -e "${YELLOW}🧪 Test: ${TEST_NAME}${NC}"
    echo -e "   Event Type: ${EVENT_TYPE}"
    
    # Calculer la signature HMAC-SHA256
    SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.* //')
    
    # Envoyer le webhook
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "x-api-key: $API_KEY" \
        -H "x-t4g-signature: sha256=$SIGNATURE" \
        -d "$PAYLOAD")
    
    # Extraire le code HTTP et le body
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    # Afficher le résultat
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}   ✅ Succès (HTTP $HTTP_CODE)${NC}"
        echo "   Response: $BODY"
    else
        echo -e "${RED}   ❌ Échec (HTTP $HTTP_CODE)${NC}"
        echo "   Response: $BODY"
    fi
    echo ""
}

# ============================================
# Test 1: User Created
# ============================================
PAYLOAD_USER_CREATED='{
  "id": "test_webhook_001",
  "timestamp": "2025-10-15T10:00:00Z",
  "source": "token-for-good.com",
  "event_type": "user.created",
  "user_id": "test_user_123",
  "email": "test@example.com"
}'

send_webhook "user.created" "$PAYLOAD_USER_CREATED" "Création d'utilisateur"

# ============================================
# Test 2: Lightning Payment Received
# ============================================
PAYLOAD_PAYMENT_RECEIVED='{
  "id": "test_webhook_002",
  "timestamp": "2025-10-15T10:05:00Z",
  "source": "token-for-good.com",
  "event_type": "lightning.payment_received",
  "user_id": "test_user_123",
  "amount_msat": 50000,
  "payment_hash": "abc123def456789"
}'

send_webhook "lightning.payment_received" "$PAYLOAD_PAYMENT_RECEIVED" "Paiement Lightning reçu"

# ============================================
# Test 3: Lightning Payment Sent
# ============================================
PAYLOAD_PAYMENT_SENT='{
  "id": "test_webhook_003",
  "timestamp": "2025-10-15T10:10:00Z",
  "source": "token-for-good.com",
  "event_type": "lightning.payment_sent",
  "user_id": "test_user_123",
  "amount_msat": 20000,
  "payment_hash": "def456abc789123"
}'

send_webhook "lightning.payment_sent" "$PAYLOAD_PAYMENT_SENT" "Paiement Lightning envoyé"

# ============================================
# Test 4: T4G Balance Updated
# ============================================
PAYLOAD_BALANCE_UPDATED='{
  "id": "test_webhook_004",
  "timestamp": "2025-10-15T10:15:00Z",
  "source": "token-for-good.com",
  "event_type": "t4g.balance_updated",
  "user_id": "test_user_123",
  "new_balance": 3500
}'

send_webhook "t4g.balance_updated" "$PAYLOAD_BALANCE_UPDATED" "Mise à jour solde T4G"

# ============================================
# Test 5: Gamification Level Up
# ============================================
PAYLOAD_LEVEL_UP='{
  "id": "test_webhook_005",
  "timestamp": "2025-10-15T10:20:00Z",
  "source": "token-for-good.com",
  "event_type": "gamification.level_up",
  "user_id": "test_user_123",
  "new_level": 7,
  "points": 850
}'

send_webhook "gamification.level_up" "$PAYLOAD_LEVEL_UP" "Level up gamification"

# ============================================
# Test 6: User Updated
# ============================================
PAYLOAD_USER_UPDATED='{
  "id": "test_webhook_006",
  "timestamp": "2025-10-15T10:25:00Z",
  "source": "token-for-good.com",
  "event_type": "user.updated",
  "user_id": "test_user_123"
}'

send_webhook "user.updated" "$PAYLOAD_USER_UPDATED" "Mise à jour utilisateur"

# ============================================
# Test 7: Invalid Signature (Négatif)
# ============================================
echo -e "${YELLOW}🧪 Test: Signature invalide (test négatif)${NC}"
INVALID_PAYLOAD='{"id":"test","timestamp":"2025-10-15T10:30:00Z","source":"token-for-good.com","event_type":"user.created","user_id":"test","email":"test@test.com"}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -H "x-t4g-signature: sha256=invalid_signature_12345" \
    -d "$INVALID_PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}   ✅ Correctement rejeté (HTTP 401)${NC}"
else
    echo -e "${RED}   ❌ Devrait être rejeté mais HTTP $HTTP_CODE${NC}"
fi
echo ""

# ============================================
# Test 8: Missing API Key (Négatif)
# ============================================
echo -e "${YELLOW}🧪 Test: API Key manquante (test négatif)${NC}"
SIGNATURE=$(echo -n "$INVALID_PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.* //')

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "x-t4g-signature: sha256=$SIGNATURE" \
    -d "$INVALID_PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}   ✅ Correctement rejeté (HTTP 401)${NC}"
else
    echo -e "${RED}   ❌ Devrait être rejeté mais HTTP $HTTP_CODE${NC}"
fi
echo ""

# ============================================
# Résumé
# ============================================
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Tests Terminés                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Configuration utilisée:"
echo -e "  URL: ${API_URL}"
echo -e "  API Key: ${API_KEY:0:10}..."
echo -e "  Secret: ${WEBHOOK_SECRET:0:10}..."
echo ""
echo -e "${GREEN}✅ Vérifiez les logs du backend pour voir les webhooks traités${NC}"
echo ""

