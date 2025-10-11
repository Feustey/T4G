#!/bin/bash

echo "🏥 Token4Good Backend - Health Check Test"
echo "=========================================="

# URL du backend (local par défaut)
BACKEND_URL="${1:-http://localhost:3000}"

echo ""
echo "📍 Testing: $BACKEND_URL"
echo ""

# Test 1: Health endpoint
echo "1️⃣  Testing /health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "200" ]; then
    echo "  ✅ Health check OK (HTTP $HTTP_CODE)"
    echo "  📊 Response: $BODY"
else
    echo "  ❌ Health check FAILED (HTTP $HTTP_CODE)"
    echo "  Response: $BODY"
fi

echo ""

# Test 2: API Metrics endpoint (nécessite auth)
echo "2️⃣  Testing /api/metrics endpoint (requires auth)..."
METRICS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/metrics")
HTTP_CODE=$(echo "$METRICS_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" == "401" ]; then
    echo "  ✅ Metrics endpoint protected (HTTP $HTTP_CODE - Expected)"
elif [ "$HTTP_CODE" == "200" ]; then
    echo "  ⚠️  Metrics endpoint accessible without auth (HTTP $HTTP_CODE)"
else
    echo "  ❌ Unexpected response (HTTP $HTTP_CODE)"
fi

echo ""

# Test 3: Auth endpoint
echo "3️⃣  Testing /api/auth/login endpoint..."
AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","provider":"invalid"}' \
    "$BACKEND_URL/api/auth/login")
HTTP_CODE=$(echo "$AUTH_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" == "400" ] || [ "$HTTP_CODE" == "500" ]; then
    echo "  ✅ Auth endpoint responding (HTTP $HTTP_CODE - Expected for invalid provider)"
elif [ "$HTTP_CODE" == "404" ]; then
    echo "  ❌ Auth endpoint not found (HTTP $HTTP_CODE)"
else
    echo "  ⚠️  Unexpected response (HTTP $HTTP_CODE)"
fi

echo ""
echo "=========================================="
echo "Summary:"
echo "  Backend URL: $BACKEND_URL"
echo "  Health: $([ "$HTTP_CODE" == "200" ] && echo "✅" || echo "❌")"
echo "=========================================="
