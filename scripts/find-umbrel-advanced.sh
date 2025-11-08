#!/bin/bash

# Script avancé pour trouver Umbrel sur le réseau local (macOS optimisé)
# Auteur: Assistant IA
# Date: $(date +%Y-%m-%d)

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Recherche avancée d'Umbrel sur le réseau local...${NC}"
echo "=================================================="

# Fonction pour tester une IP avec plus de détails
test_ip_detailed() {
    local ip=$1
    local timeout=3
    
    # Test de ping rapide
    if ping -c 1 -W $timeout $ip >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $ip est accessible"
        
        # Test des ports HTTP/HTTPS avec plus de détails
        local http_status=""
        local https_status=""
        
        # Test HTTP
        if curl -s --connect-timeout 3 --max-time 5 "http://$ip" >/dev/null 2>&1; then
            http_status="HTTP OK"
            echo -e "  ${GREEN}→ HTTP accessible sur http://$ip${NC}"
            
            # Vérifier si c'est Umbrel
            local response=$(curl -s --connect-timeout 3 --max-time 5 "http://$ip" 2>/dev/null)
            if echo "$response" | grep -i "umbrel" >/dev/null 2>&1; then
                echo -e "  ${GREEN}🎯 UMBREL DÉTECTÉ sur http://$ip${NC}"
                return 0
            fi
        fi
        
        # Test HTTPS
        if curl -s --connect-timeout 3 --max-time 5 "https://$ip" >/dev/null 2>&1; then
            https_status="HTTPS OK"
            echo -e "  ${GREEN}→ HTTPS accessible sur https://$ip${NC}"
            
            # Vérifier si c'est Umbrel
            local response=$(curl -s --connect-timeout 3 --max-time 5 "https://$ip" 2>/dev/null)
            if echo "$response" | grep -i "umbrel" >/dev/null 2>&1; then
                echo -e "  ${GREEN}🎯 UMBREL DÉTECTÉ sur https://$ip${NC}"
                return 0
            fi
        fi
        
        # Test des ports spécifiques d'Umbrel
        test_umbrel_ports $ip
        
        if [ -z "$http_status" ] && [ -z "$https_status" ]; then
            echo -e "  ${YELLOW}→ Ping OK mais pas de service web détecté${NC}"
        fi
    fi
    return 1
}

# Test des ports spécifiques d'Umbrel
test_umbrel_ports() {
    local ip=$1
    local ports=(80 443 3000 8080 9000)
    
    for port in "${ports[@]}"; do
        if nc -z -w2 $ip $port 2>/dev/null; then
            echo -e "  ${BLUE}→ Port $port ouvert${NC}"
            
            # Test HTTP sur ce port
            if curl -s --connect-timeout 2 --max-time 3 "http://$ip:$port" >/dev/null 2>&1; then
                local response=$(curl -s --connect-timeout 2 --max-time 3 "http://$ip:$port" 2>/dev/null)
                if echo "$response" | grep -i "umbrel" >/dev/null 2>&1; then
                    echo -e "  ${GREEN}🎯 UMBREL DÉTECTÉ sur http://$ip:$port${NC}"
                    return 0
                fi
            fi
        fi
    done
}

# Utiliser arp-scan si disponible (plus efficace)
scan_with_arp() {
    if command -v arp-scan >/dev/null 2>&1; then
        echo -e "${BLUE}🔍 Scan avec arp-scan...${NC}"
        
        local network_base=$1
        arp-scan --local --quiet | grep -E "^[0-9]" | while read line; do
            local ip=$(echo $line | awk '{print $1}')
            local mac=$(echo $line | awk '{print $2}')
            
            echo -e "${GREEN}📱 Appareil trouvé: $ip (MAC: $mac)${NC}"
            
            # Test spécifique pour Umbrel
            test_ip_detailed $ip
        done
    else
        echo -e "${YELLOW}⚠️  arp-scan non installé (installer avec: brew install arp-scan)${NC}"
    fi
}

# Utiliser netdiscover si disponible
scan_with_netdiscover() {
    if command -v netdiscover >/dev/null 2>&1; then
        echo -e "${BLUE}🔍 Scan avec netdiscover...${NC}"
        
        local network_base=$1
        netdiscover -r $network_base.0/24 -P | grep -E "^\s*[0-9]" | while read line; do
            local ip=$(echo $line | awk '{print $1}')
            local mac=$(echo $line | awk '{print $2}')
            
            echo -e "${GREEN}📱 Appareil trouvé: $ip (MAC: $mac)${NC}"
            
            # Test spécifique pour Umbrel
            test_ip_detailed $ip
        done
    else
        echo -e "${YELLOW}⚠️  netdiscover non installé${NC}"
    fi
}

# Scan avec les commandes macOS natives
scan_with_macos_native() {
    local network_base=$1
    
    echo -e "${BLUE}🔍 Scan avec les commandes macOS natives...${NC}"
    
    # Utiliser arp pour lister les appareils connus
    echo -e "${PURPLE}📋 Appareils dans le cache ARP:${NC}"
    arp -a | grep -E "\([0-9]" | while read line; do
        local ip=$(echo $line | sed 's/.*(\([^)]*\)).*/\1/')
        local mac=$(echo $line | awk '{print $4}')
        
        echo -e "${GREEN}📱 $ip (MAC: $mac)${NC}"
        
        # Test spécifique pour Umbrel
        test_ip_detailed $ip
    done
}

# Test direct d'umbrel.local avec plus d'options
test_umbrel_local_advanced() {
    echo -e "${BLUE}🌐 Test d'accès direct à umbrel.local...${NC}"
    
    local urls=("http://umbrel.local" "https://umbrel.local" "http://umbrel.local:3000" "https://umbrel.local:3000")
    
    for url in "${urls[@]}"; do
        if curl -s --connect-timeout 5 --max-time 10 "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Umbrel trouvé sur $url${NC}"
            
            # Vérifier que c'est bien Umbrel
            local response=$(curl -s --connect-timeout 5 --max-time 10 "$url" 2>/dev/null)
            if echo "$response" | grep -i "umbrel" >/dev/null 2>&1; then
                echo -e "${GREEN}🎯 Confirmation: C'est bien Umbrel !${NC}"
                return 0
            fi
        fi
    done
    
    echo -e "${YELLOW}⚠️  umbrel.local non accessible${NC}"
    return 1
}

# Fonction pour obtenir les informations réseau (macOS)
get_network_info_macos() {
    echo -e "${BLUE}📡 Informations réseau (macOS):${NC}"
    
    # Trouver l'interface principale
    local main_interface=$(route get default | grep interface | awk '{print $2}')
    
    if [ -n "$main_interface" ]; then
        echo "Interface principale: $main_interface"
        
        # Obtenir l'IP locale
        local local_ip=$(ifconfig $main_interface | grep 'inet ' | awk '{print $2}' | head -1)
        
        if [ -n "$local_ip" ] && [ "$local_ip" != "127.0.0.1" ]; then
            echo "IP locale: $local_ip"
            
            # Extraire le réseau de base
            local network_base=$(echo $local_ip | cut -d'.' -f1-3)
            echo "Réseau de base: $network_base.0/24"
            
            # Obtenir la passerelle
            local gateway=$(route get default | grep gateway | awk '{print $2}')
            echo "Passerelle: $gateway"
            
            # Obtenir le masque de sous-réseau
            local netmask=$(ifconfig $main_interface | grep 'inet ' | awk '{print $4}')
            echo "Masque: $netmask"
            
            # Stocker pour utilisation ultérieure
            echo "$network_base" > /tmp/network_base.tmp
            return 0
        fi
    fi
    
    echo -e "${RED}❌ Impossible de détecter l'interface réseau${NC}"
    return 1
}

# Fonction principale
main() {
    echo -e "${BLUE}🚀 Démarrage de la recherche avancée d'Umbrel...${NC}"
    echo ""
    
    # Test direct d'umbrel.local
    if test_umbrel_local_advanced; then
        echo -e "${GREEN}🎉 Umbrel trouvé via umbrel.local !${NC}"
        exit 0
    fi
    
    echo ""
    
    # Obtenir les informations réseau
    if ! get_network_info_macos; then
        echo -e "${RED}❌ Impossible de continuer sans informations réseau${NC}"
        exit 1
    fi
    
    # Récupérer le réseau de base
    local network_base=$(cat /tmp/network_base.tmp)
    
    echo ""
    
    # Scan avec les commandes macOS natives
    scan_with_macos_native $network_base
    
    echo ""
    
    # Scan avec arp-scan si disponible
    scan_with_arp $network_base
    
    echo ""
    
    # Scan avec netdiscover si disponible
    scan_with_netdiscover $network_base
    
    echo ""
    echo -e "${BLUE}📋 Méthodes manuelles supplémentaires:${NC}"
    echo "1. Ouvrez l'application 'Réseau' dans les Préférences Système"
    echo "2. Utilisez l'interface de votre routeur (généralement 192.168.0.1 ou 192.168.1.1)"
    echo "3. Utilisez une app mobile comme 'Fing' ou 'Network Analyzer'"
    echo "4. Vérifiez que Umbrel est allumé et connecté via Ethernet"
    
    echo ""
    echo -e "${YELLOW}💡 Si Umbrel n'est toujours pas trouvé:${NC}"
    echo "- Vérifiez que le nœud est allumé et connecté"
    echo "- Vérifiez que vous êtes sur le même réseau local"
    echo "- Vérifiez que le firewall ne bloque pas les connexions"
    echo "- Essayez de redémarrer Umbrel et votre routeur"
    echo "- Vérifiez les logs d'Umbrel pour des erreurs de réseau"
    
    # Nettoyer le fichier temporaire
    rm -f /tmp/network_base.tmp
}

# Vérifier les dépendances
check_dependencies() {
    local missing_deps=()
    
    if ! command -v curl >/dev/null 2>&1; then
        missing_deps+=("curl")
    fi
    
    if ! command -v ping >/dev/null 2>&1; then
        missing_deps+=("ping")
    fi
    
    if ! command -v nc >/dev/null 2>&1; then
        missing_deps+=("netcat")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo -e "${RED}❌ Dépendances manquantes: ${missing_deps[*]}${NC}"
        echo "Installez-les avec: brew install ${missing_deps[*]}"
        exit 1
    fi
}

# Point d'entrée
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_dependencies
    main "$@"
fi
