#!/bin/bash

# Script complet pour trouver Umbrel sur le réseau local
# Combine toutes les méthodes de détection disponibles
# Auteur: Assistant IA
# Date: $(date +%Y-%m-%d)

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables globales
UMBREL_FOUND=false
UMBREL_URL=""
NETWORK_BASE=""

echo -e "${BLUE}🔍 Recherche complète d'Umbrel sur le réseau local...${NC}"
echo "=================================================="

# Fonction pour tester une IP avec détection Umbrel
test_ip_for_umbrel() {
    local ip=$1
    local timeout=3
    
    # Test de ping rapide
    if ping -c 1 -W $timeout $ip >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $ip est accessible"
        
        # Test des ports et protocoles
        local ports=(80 443 3000 8080 9000)
        local protocols=("http" "https")
        
        for protocol in "${protocols[@]}"; do
            for port in "${ports[@]}"; do
                local url="$protocol://$ip"
                if [ $port -ne 80 ] && [ $port -ne 443 ]; then
                    url="$protocol://$ip:$port"
                fi
                
                if curl -s --connect-timeout 2 --max-time 3 "$url" >/dev/null 2>&1; then
                    echo -e "  ${GREEN}→ Service web sur $url${NC}"
                    
                    # Vérifier si c'est Umbrel
                    local response=$(curl -s --connect-timeout 2 --max-time 3 "$url" 2>/dev/null)
                    if echo "$response" | grep -i "umbrel" >/dev/null 2>&1; then
                        echo -e "  ${GREEN}🎯 UMBREL DÉTECTÉ sur $url${NC}"
                        UMBREL_FOUND=true
                        UMBREL_URL="$url"
                        return 0
                    fi
                fi
            done
        done
        
        echo -e "  ${YELLOW}→ Ping OK mais pas de service web Umbrel détecté${NC}"
    fi
    return 1
}

# Scan agressif d'une plage d'IP
scan_range_aggressive() {
    local base_ip=$1
    local start=$2
    local end=$3
    local max_jobs=20
    
    echo -e "${BLUE}🔍 Scan agressif de la plage $base_ip.$start-$end...${NC}"
    
    local job_count=0
    for i in $(seq $start $end); do
        if [ $job_count -ge $max_jobs ]; then
            wait
            job_count=0
        fi
        
        test_ip_for_umbrel "$base_ip.$i" &
        ((job_count++))
    done
    
    wait
}

# Scan avec nmap si disponible
scan_with_nmap() {
    if command -v nmap >/dev/null 2>&1; then
        echo -e "${BLUE}🔍 Scan avec nmap...${NC}"
        
        local network_base=$1
        echo "Scan en cours de $network_base.0/24..."
        
        nmap -sn "$network_base.0/24" | grep -E "Nmap scan report" | while read line; do
            local ip=$(echo $line | awk '{print $5}')
            if [ -n "$ip" ]; then
                echo -e "${GREEN}📱 Appareil trouvé: $ip${NC}"
                test_ip_for_umbrel $ip
            fi
        done
    else
        echo -e "${YELLOW}⚠️  nmap non installé (installer avec: brew install nmap)${NC}"
    fi
}

# Scan avec arp-scan si disponible
scan_with_arp_scan() {
    if command -v arp-scan >/dev/null 2>&1; then
        echo -e "${BLUE}🔍 Scan avec arp-scan...${NC}"
        
        local network_base=$1
        arp-scan --local --quiet 2>/dev/null | grep -E "^[0-9]" | while read line; do
            local ip=$(echo $line | awk '{print $1}')
            local mac=$(echo $line | awk '{print $2}')
            
            echo -e "${GREEN}📱 Appareil trouvé: $ip (MAC: $mac)${NC}"
            test_ip_for_umbrel $ip
        done
    else
        echo -e "${YELLOW}⚠️  arp-scan non installé (installer avec: brew install arp-scan)${NC}"
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
        test_ip_for_umbrel $ip
    done
}

# Test direct d'umbrel.local avec toutes les variantes
test_umbrel_local_complete() {
    echo -e "${BLUE}🌐 Test d'accès direct à umbrel.local...${NC}"
    
    local urls=(
        "http://umbrel.local"
        "https://umbrel.local"
        "http://umbrel.local:3000"
        "https://umbrel.local:3000"
        "http://umbrel.local:8080"
        "https://umbrel.local:8080"
    )
    
    for url in "${urls[@]}"; do
        if curl -s --connect-timeout 5 --max-time 10 "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Service accessible sur $url${NC}"
            
            # Vérifier que c'est bien Umbrel
            local response=$(curl -s --connect-timeout 5 --max-time 10 "$url" 2>/dev/null)
            if echo "$response" | grep -i "umbrel" >/dev/null 2>&1; then
                echo -e "${GREEN}🎯 UMBREL CONFIRMÉ sur $url${NC}"
                UMBREL_FOUND=true
                UMBREL_URL="$url"
                return 0
            fi
        fi
    done
    
    echo -e "${YELLOW}⚠️  umbrel.local non accessible${NC}"
    return 1
}

# Obtenir les informations réseau (macOS)
get_network_info() {
    echo -e "${BLUE}📡 Informations réseau:${NC}"
    
    # Trouver l'interface principale
    local main_interface=$(route get default | grep interface | awk '{print $2}')
    
    if [ -n "$main_interface" ]; then
        echo "Interface principale: $main_interface"
        
        # Obtenir l'IP locale
        local local_ip=$(ifconfig $main_interface | grep 'inet ' | awk '{print $2}' | head -1)
        
        if [ -n "$local_ip" ] && [ "$local_ip" != "127.0.0.1" ]; then
            echo "IP locale: $local_ip"
            
            # Extraire le réseau de base
            NETWORK_BASE=$(echo $local_ip | cut -d'.' -f1-3)
            echo "Réseau de base: $NETWORK_BASE.0/24"
            
            # Obtenir la passerelle
            local gateway=$(route get default | grep gateway | awk '{print $2}')
            echo "Passerelle: $gateway"
            
            return 0
        fi
    fi
    
    echo -e "${RED}❌ Impossible de détecter l'interface réseau${NC}"
    return 1
}

# Fonction pour afficher les résultats
show_results() {
    echo ""
    echo "=================================================="
    
    if [ "$UMBREL_FOUND" = true ]; then
        echo -e "${GREEN}🎉 UMBREL TROUVÉ !${NC}"
        echo -e "${GREEN}📍 URL: $UMBREL_URL${NC}"
        echo ""
        echo -e "${CYAN}💡 Vous pouvez maintenant:${NC}"
        echo "1. Ouvrir $UMBREL_URL dans votre navigateur"
        echo "2. Configurer votre nœud Umbrel"
        echo "3. Accéder à vos applications Bitcoin/Lightning"
    else
        echo -e "${RED}❌ Umbrel non trouvé sur le réseau local${NC}"
        echo ""
        echo -e "${YELLOW}🔍 Méthodes alternatives à essayer:${NC}"
        echo "1. Vérifiez l'interface de votre routeur (généralement $NETWORK_BASE.1)"
        echo "2. Utilisez une app mobile comme 'Fing' ou 'Network Analyzer'"
        echo "3. Vérifiez que Umbrel est allumé et connecté via Ethernet"
        echo "4. Essayez de redémarrer Umbrel et votre routeur"
        echo "5. Vérifiez les logs d'Umbrel pour des erreurs de réseau"
        echo ""
        echo -e "${PURPLE}🛠️  Outils recommandés:${NC}"
        echo "- Installer nmap: brew install nmap"
        echo "- Installer arp-scan: brew install arp-scan"
        echo "- Utiliser l'app 'Fing' sur mobile"
    fi
}

# Fonction principale
main() {
    echo -e "${BLUE}🚀 Démarrage de la recherche complète d'Umbrel...${NC}"
    echo ""
    
    # Test direct d'umbrel.local
    if test_umbrel_local_complete; then
        show_results
        exit 0
    fi
    
    echo ""
    
    # Obtenir les informations réseau
    if ! get_network_info; then
        echo -e "${RED}❌ Impossible de continuer sans informations réseau${NC}"
        exit 1
    fi
    
    echo ""
    
    # Scan avec les commandes macOS natives
    scan_with_macos_native $NETWORK_BASE
    
    echo ""
    
    # Scan avec arp-scan si disponible
    scan_with_arp_scan $NETWORK_BASE
    
    echo ""
    
    # Scan avec nmap si disponible
    scan_with_nmap $NETWORK_BASE
    
    echo ""
    echo -e "${BLUE}🔍 Scan agressif des IPs courantes...${NC}"
    
    # Scanner les IPs courantes avec plus de parallélisme
    scan_range_aggressive $NETWORK_BASE 1 50
    scan_range_aggressive $NETWORK_BASE 100 200
    
    # Afficher les résultats
    show_results
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
