#!/bin/bash

echo "========================================="
echo "🔍 Diagnostic T4G 502 Error"
echo "========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
check_service() {
    local name=$1
    local command=$2
    
    echo -n "Checking $name... "
    if eval "$command" &>/dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

echo "1️⃣  Services Status"
echo "-------------------"
systemctl is-active token4good-backend && echo -e "Backend: ${GREEN}✅ Active${NC}" || echo -e "Backend: ${RED}❌ Inactive${NC}"
systemctl is-active token4good-frontend && echo -e "Frontend: ${GREEN}✅ Active${NC}" || echo -e "Frontend: ${RED}❌ Inactive${NC}"
systemctl is-active nginx && echo -e "Nginx: ${GREEN}✅ Active${NC}" || echo -e "Nginx: ${RED}❌ Inactive${NC}"
echo ""

echo "2️⃣  Ports Listening"
echo "-------------------"
ss -tlnp | grep -E ':3000|:3001|:8000|:80|:443' | awk '{print $4, $7}'
echo ""

echo "3️⃣  Frontend Local Test"
echo "----------------------"
FRONTEND_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
if [ "$FRONTEND_LOCAL" == "200" ] || [ "$FRONTEND_LOCAL" == "307" ] || [ "$FRONTEND_LOCAL" == "301" ]; then
    echo -e "localhost:3000 → ${GREEN}✅ $FRONTEND_LOCAL${NC}"
else
    echo -e "localhost:3000 → ${RED}❌ $FRONTEND_LOCAL${NC}"
fi
echo ""

echo "4️⃣  Backend Local Test"
echo "----------------------"
BACKEND_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null)
if [ "$BACKEND_LOCAL" == "200" ]; then
    echo -e "localhost:3001/health → ${GREEN}✅ $BACKEND_LOCAL${NC}"
else
    echo -e "localhost:3001/health → ${RED}❌ $BACKEND_LOCAL${NC}"
fi
echo ""

echo "5️⃣  Nginx Configuration"
echo "----------------------"
nginx -t 2>&1 | grep -q "successful" && echo -e "Nginx config: ${GREEN}✅ Valid${NC}" || echo -e "Nginx config: ${RED}❌ Invalid${NC}"
echo ""

echo "6️⃣  Active Nginx Sites"
echo "----------------------"
ls -la /etc/nginx/sites-enabled/ | grep -E "\.dazno\.de|default" | awk '{print $9}'
echo ""

echo "7️⃣  Frontend Service Logs (last 10 lines)"
echo "-----------------------------------------"
journalctl -u token4good-frontend -n 10 --no-pager
echo ""

echo "8️⃣  Nginx Error Logs (last 10 lines)"
echo "------------------------------------"
tail -n 10 /var/log/nginx/t4g-error.log 2>/dev/null || echo "No error log found"
echo ""

echo "9️⃣  Frontend Service Details"
echo "----------------------------"
cat /etc/systemd/system/token4good-frontend.service 2>/dev/null || echo "Service file not found"
echo ""

echo "🔟 Diagnosis Summary"
echo "-------------------"
if [ "$FRONTEND_LOCAL" == "200" ] || [ "$FRONTEND_LOCAL" == "307" ] || [ "$FRONTEND_LOCAL" == "301" ]; then
    echo -e "${GREEN}Frontend is running locally${NC}"
    echo "→ Problem is likely in Nginx configuration"
    echo ""
    echo "Recommended fix:"
    echo "1. Check Nginx proxy_pass configuration"
    echo "2. Verify no conflicts with MCP configuration"
    echo "3. Reload Nginx: systemctl reload nginx"
else
    echo -e "${RED}Frontend is NOT responding locally${NC}"
    echo "→ Problem is with the frontend service itself"
    echo ""
    echo "Recommended fix:"
    echo "1. Check frontend service logs: journalctl -u token4good-frontend -n 50"
    echo "2. Restart frontend: systemctl restart token4good-frontend"
    echo "3. Check if Node.js is installed and working"
fi
echo ""
echo "========================================="
echo "Diagnostic Complete"
echo "========================================="

