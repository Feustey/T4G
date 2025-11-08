#!/bin/bash

# Script pour trouver Umbrel sur le réseau local
# Auteur: Assistant IA
# Date: $(date +%Y-%m-%d)

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Recherche d'Umbrel sur le réseau local...${NC}"
echo "=================================================="

# Fonction pour tester une IP
test_ip() {
    local ip=$1
    local timeout=2
    
    # Test de ping rapide
    if ping -c 1 -W $timeout $ip >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $ip est accessible"
        
        # Test des ports HTTP/HTTPS
        if curl -s --connect-timeout 3 --max-time 5 "http://$ip" >/dev/null 2>&1; then
            echo -e "  ${GREEN}→ HTTP accessible sur http://$ip${NC}"
            return 0
        elif curl -s --connect-timeout 3 --max-time 5 "https://$ip" >/dev/null 2>&1; then
            echo -e "  ${GREEN}→ HTTPS accessible sur https://$ip${NC}"
            return 0
        else
            echo -e "  ${YELLOW}→ Ping OK mais pas de service web détecté${NC}"
        fi
    fi
    return 1
}

# Fonction pour scanner une plage d'IP
scan_range() {
    local base_ip=$1
    local start=$2
    local end=$3
    
    echo -e "${BLUE}Scan de la plage $base_ip.$start-$end...${NC}"
    
    for i in $(seq $start $end); do
        test_ip "$base_ip.$i" &
    done
    
    # Attendre que tous les processus en arrière-plan se terminent
    wait
}

# Détecter l'interface réseau principale
get_network_info() {
    echo -e "${BLUE}📡 Informations réseau:${NC}"
    
    local local_ip=""
    local network_base=""
    
    # Détection pour macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # Trouver l'interface principale sur macOS
        local main_interface=$(route get default | grep interface | awk '{print $2}')
        
        if [ -n "$main_interface" ]; then
            echo "Interface principale: $main_interface"
            
            # Obtenir l'IP locale sur macOS
            local_ip=$(ifconfig $main_interface | grep 'inet ' | awk '{print $2}' | head -1)
        fi
    else
        # Détection pour Linux
        local main_interface=$(ip route | grep default | awk '{print $5}' | head -1)
        if [ -z "$main_interface" ]; then
            main_interface=$(route -n | grep '^0.0.0.0' | awk '{print $8}' | head -1)
        fi
        
        if [ -n "$main_interface" ]; then
            echo "Interface principale: $main_interface"
            local_ip=$(ip addr show $main_interface | grep 'inet ' | awk '{print $2}' | cut -d'/' -f1 | head -1)
        fi
    fi
    
    if [ -n "$local_ip" ] && [ "$local_ip" != "127.0.0.1" ]; then
        echo "IP locale: $local_ip"
        
        # Extraire le réseau de base
        network_base=$(echo $local_ip | cut -d'.' -f1-3)
        echo "Réseau de base: $network_base.0/24"
        
        # Stocker pour utilisation ultérieure
        echo "$network_base" > /tmp/network_base.tmp
        return 0
    fi
    
    echo -e "${RED}❌ Impossible de détecter l'interface réseau${NC}"
    return 1
}

# Test direct d'umbrel.local
test_umbrel_local() {
    echo -e "${BLUE}🌐 Test d'accès direct à umbrel.local...${NC}"
    
    if curl -s --connect-timeout 5 --max-time 10 "http://umbrel.local" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Umbrel trouvé sur http://umbrel.local${NC}"
        return 0
    elif curl -s --connect-timeout 5 --max-time 10 "https://umbrel.local" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Umbrel trouvé sur https://umbrel.local${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  umbrel.local non accessible${NC}"
        return 1
    fi
}

# Scan avec nmap si disponible
scan_with_nmap() {
    if command -v nmap >/dev/null 2>&1; then
        echo -e "${BLUE}🔍 Scan avec nmap...${NC}"
        
        local network_base=$1
        nmap -sn "$network_base.0/24" | grep -E "Nmap scan report|MAC Address" | while read line; do
            if [[ $line == *"Nmap scan report"* ]]; then
                local ip=$(echo $line | awk '{print $5}')
                echo -e "${GREEN}📱 Appareil trouvé: $ip${NC}"
                
                # Test spécifique pour Umbrel
                if curl -s --connect-timeout 3 --max-time 5 "http://$ip" | grep -i "umbrel" >/dev/null 2>&1; then
                    echo -e "  ${GREEN}🎯 UMBREL DÉTECTÉ sur http://$ip${NC}"
                fi
            fi
        done
    else
        echo -e "${YELLOW}⚠️  nmap non installé, scan basique uniquement${NC}"
    fi
}

# Fonction principale
main() {
    echo -e "${BLUE}🚀 Démarrage de la recherche d'Umbrel...${NC}"
    echo ""
    
    # Test direct d'umbrel.local
    if test_umbrel_local; then
        echo -e "${GREEN}🎉 Umbrel trouvé via umbrel.local !${NC}"
        exit 0
    fi
    
    echo ""
    
    # Obtenir les informations réseau
    if ! get_network_info; then
        echo -e "${RED}❌ Impossible de continuer sans informations réseau${NC}"
        exit 1
    fi
    
    # Récupérer le réseau de base depuis le fichier temporaire
    if [ -f /tmp/network_base.tmp ]; then
        local network_base=$(cat /tmp/network_base.tmp)
    else
        echo -e "${RED}❌ Impossible de récupérer les informations réseau${NC}"
        exit 1
    fi
    
    echo ""
    
    # Scan avec nmap si disponible
    scan_with_nmap $network_base
    
    echo ""
    echo -e "${BLUE}🔍 Scan manuel des IPs courantes...${NC}"
    
    # Scanner les IPs courantes (1-50 et 100-150)
    scan_range $network_base 1 50
    scan_range $network_base 100 150
    
    # Nettoyer le fichier temporaire
    rm -f /tmp/network_base.tmp
    
    echo ""
    echo -e "${BLUE}📋 Résumé des méthodes alternatives:${NC}"
    echo "1. Vérifiez l'interface de votre routeur (généralement 192.168.1.1 ou 192.168.0.1)"
    echo "2. Utilisez une app mobile comme 'Fing' pour scanner le réseau"
    echo "3. Vérifiez que Umbrel est allumé et connecté via Ethernet"
    echo "4. Essayez de redémarrer Umbrel et votre routeur"
    
    echo ""
    echo -e "${YELLOW}💡 Si Umbrel n'est pas trouvé, vérifiez:${NC}"
    echo "- Que le nœud est allumé et connecté"
    echo "- Que vous êtes sur le même réseau local"
    echo "- Que le firewall ne bloque pas les connexions"
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
        echo "Installez-les avec: sudo apt-get install ${missing_deps[*]}"
        exit 1
    fi
}

# Point d'entrée
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_dependencies
    main "$@"
fi
