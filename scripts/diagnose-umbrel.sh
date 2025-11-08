#!/bin/bash

# Script de diagnostic Umbrel simple
# Auteur: Assistant IA

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Diagnostic Umbrel - Recherche simple${NC}"
echo "=============================================="

# 1. Test umbrel.local
echo -e "\n${BLUE}1. Test umbrel.local${NC}"
if ping -c 1 umbrel.local >/dev/null 2>&1; then
    echo -e "${GREEN}✓ umbrel.local répond au ping${NC}"
    umbrel_ip=$(nslookup umbrel.local | grep "Address:" | tail -1 | awk '{print $2}')
    echo "IP résolue: $umbrel_ip"
    
    # Test HTTP
    if curl -s --connect-timeout 5 "http://umbrel.local" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ HTTP accessible sur umbrel.local${NC}"
        if curl -s "http://umbrel.local" | grep -i "umbrel" >/dev/null; then
            echo -e "${GREEN}🎯 UMBREL TROUVÉ sur http://umbrel.local${NC}"
            exit 0
        fi
    fi
    
    # Test HTTPS
    if curl -s --connect-timeout 5 "https://umbrel.local" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ HTTPS accessible sur umbrel.local${NC}"
        if curl -s "https://umbrel.local" | grep -i "umbrel" >/dev/null; then
            echo -e "${GREEN}🎯 UMBREL TROUVÉ sur https://umbrel.local${NC}"
            exit 0
        fi
    fi
else
    echo -e "${YELLOW}⚠ umbrel.local ne répond pas au ping${NC}"
fi

# 2. Informations réseau
echo -e "\n${BLUE}2. Informations réseau${NC}"
local_ip=$(ifconfig en0 | grep 'inet ' | awk '{print $2}')
echo "IP locale: $local_ip"
network_base=$(echo $local_ip | cut -d'.' -f1-3)
echo "Réseau: $network_base.0/24"

# 3. Scan ARP
echo -e "\n${BLUE}3. Appareils dans le cache ARP${NC}"
arp -a | grep -E "\([0-9]" | while read line; do
    ip=$(echo $line | sed 's/.*(\([^)]*\)).*/\1/')
    mac=$(echo $line | awk '{print $4}')
    echo "📱 $ip (MAC: $mac)"
done

# 4. Test des IPs courantes
echo -e "\n${BLUE}4. Test des IPs courantes d'Umbrel${NC}"
common_ips=("192.168.0.20" "192.168.1.20" "192.168.0.100" "192.168.1.100" "192.168.0.200" "192.168.1.200")

for ip in "${common_ips[@]}"; do
    echo -n "Test $ip... "
    if ping -c 1 -W 1 "$ip" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Ping OK${NC}"
        
        # Test HTTP
        if curl -s --connect-timeout 3 "http://$ip" >/dev/null 2>&1; then
            echo "  → HTTP accessible"
            if curl -s "http://$ip" | grep -i "umbrel" >/dev/null; then
                echo -e "  ${GREEN}🎯 UMBREL TROUVÉ sur http://$ip${NC}"
                exit 0
            fi
        fi
        
        # Test HTTPS
        if curl -s --connect-timeout 3 "https://$ip" >/dev/null 2>&1; then
            echo "  → HTTPS accessible"
            if curl -s "https://$ip" | grep -i "umbrel" >/dev/null; then
                echo -e "  ${GREEN}🎯 UMBREL TROUVÉ sur https://$ip${NC}"
                exit 0
            fi
        fi
    else
        echo -e "${YELLOW}✗ Pas de réponse${NC}"
    fi
done

# 5. Scan rapide du réseau local
echo -e "\n${BLUE}5. Scan rapide du réseau $network_base.0/24${NC}"
echo "Scan en cours... (cela peut prendre quelques secondes)"

# Scan avec nmap si disponible
if command -v nmap >/dev/null 2>&1; then
    nmap -sn "$network_base.0/24" | grep "Nmap scan report" | awk '{print $5}' | while read ip; do
        if [ "$ip" != "$local_ip" ]; then
            echo "📱 Appareil trouvé: $ip"
            
            # Test HTTP rapide
            if curl -s --connect-timeout 2 "http://$ip" >/dev/null 2>&1; then
                if curl -s "http://$ip" | grep -i "umbrel" >/dev/null; then
                    echo -e "${GREEN}🎯 UMBREL TROUVÉ sur http://$ip${NC}"
                    exit 0
                fi
            fi
        fi
    done
else
    echo -e "${YELLOW}⚠ nmap non disponible${NC}"
fi

# 6. Résumé
echo -e "\n${BLUE}6. Résumé${NC}"
echo -e "${YELLOW}❌ Umbrel non trouvé sur le réseau local${NC}"
echo ""
echo -e "${BLUE}💡 Vérifications à faire:${NC}"
echo "1. Vérifiez que votre nœud Umbrel est allumé"
echo "2. Vérifiez qu'il est connecté via Ethernet"
echo "3. Vérifiez que vous êtes sur le même réseau WiFi/Ethernet"
echo "4. Essayez de redémarrer Umbrel"
echo "5. Vérifiez l'interface de votre routeur (généralement $network_base.1)"
echo "6. Utilisez une app mobile comme 'Fing' pour scanner le réseau"
echo ""
echo -e "${BLUE}🔧 Commandes utiles:${NC}"
echo "- Ouvrir l'interface du routeur: open http://$network_base.1"
echo "- Vérifier les logs d'Umbrel (si accessible via SSH)"
echo "- Redémarrer Umbrel: sudo reboot (sur le nœud)"

