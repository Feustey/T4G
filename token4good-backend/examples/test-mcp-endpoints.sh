#!/bin/bash
# Script de test pour les endpoints MCP API v1
# 
# Usage:
#   chmod +x test-mcp-endpoints.sh
#   ./test-mcp-endpoints.sh

set -e

BASE_URL="http://localhost:3000"
JWT_TOKEN="${JWT_TOKEN:-your_jwt_token_here}"
DAZNO_TOKEN="${DAZNO_TOKEN:-your_dazno_token_here}"

echo "🔍 Test des endpoints MCP API v1"
echo "================================="
echo ""

# Fonction helper pour les requêtes
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo "Testing: $description"
    echo "Request: $method $BASE_URL$endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "x-dazno-token: $DAZNO_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "x-dazno-token: $DAZNO_TOKEN" \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "✅ HTTP $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo "❌ HTTP $http_code"
        echo "$body"
    fi
    echo ""
}

# 1. Wallet Operations
echo "=== WALLET OPERATIONS ==="
test_endpoint "GET" "/api/dazno/v1/wallet/balance/user123" "Get wallet balance"
test_endpoint "GET" "/api/dazno/v1/wallet/payments/user123?limit=10" "Get wallet payments"

# 2. Channel Management
echo "=== CHANNEL MANAGEMENT ==="
test_endpoint "GET" "/api/dazno/v1/channels/user123" "List user channels"
test_endpoint "GET" "/api/dazno/v1/channels/detail/channel123" "Get channel details"

# Exemple d'ouverture de canal
OPEN_CHANNEL_DATA='{"node_pubkey":"02abc123...","amount_msat":10000000}'
test_endpoint "POST" "/api/dazno/v1/channels/open" "Open channel" "$OPEN_CHANNEL_DATA"

test_endpoint "POST" "/api/dazno/v1/channels/channel123/close?force=false" "Close channel"

# 3. Node Information
echo "=== NODE INFORMATION ==="
test_endpoint "GET" "/api/dazno/v1/nodes" "List all nodes"
test_endpoint "GET" "/api/dazno/v1/nodes?q=alice" "Search nodes"
test_endpoint "GET" "/api/dazno/v1/nodes/02abc123..." "Get node info"

# 4. Lightning Network Analysis
echo "=== LIGHTNING NETWORK ANALYSIS ==="
test_endpoint "GET" "/api/dazno/v1/lightning/stats" "Get network stats"

# Exemple d'analyse de routage
ROUTING_DATA='{"from_node":"02abc123...","to_node":"03def456...","amount_msat":1000000}'
test_endpoint "POST" "/api/dazno/v1/lightning/routing" "Analyze routing" "$ROUTING_DATA"

echo ""
echo "================================="
echo "✅ Tests terminés!"
echo ""
echo "Note: Assurez-vous que le backend est démarré et que les tokens sont valides."

