#!/bin/bash
#
# Token4Good - Correction des sources APT dupliquées
# Usage: ./fix-apt-sources.sh
#

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== Correction des Sources APT ==="
echo "Date: $(date)"
echo ""

# Vérifier le fichier problématique
if [ -f "/etc/apt/sources.list.d/ubuntu-mirrors.list" ]; then
    echo -e "${YELLOW}Problème détecté: Sources APT dupliquées${NC}"
    echo ""
    
    # Afficher le contenu actuel
    echo -e "${GREEN}Contenu actuel:${NC}"
    cat /etc/apt/sources.list.d/ubuntu-mirrors.list
    echo ""
    
    # Créer une sauvegarde
    cp /etc/apt/sources.list.d/ubuntu-mirrors.list /etc/apt/sources.list.d/ubuntu-mirrors.list.backup
    echo -e "${GREEN}✓ Sauvegarde créée: ubuntu-mirrors.list.backup${NC}"
    
    # Corriger le fichier (supprimer les doublons)
    echo -e "${GREEN}Correction en cours...${NC}"
    
    # Créer un nouveau fichier sans doublons
    cat > /etc/apt/sources.list.d/ubuntu-mirrors.list << 'EOF'
# Ubuntu Mirrors - Sources uniques
deb http://archive.ubuntu.com/ubuntu/ focal main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu/ focal-updates main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu/ focal-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu/ focal-security main restricted universe multiverse
EOF
    
    echo -e "${GREEN}✓ Fichier corrigé${NC}"
    echo ""
    
    # Afficher le nouveau contenu
    echo -e "${GREEN}Nouveau contenu:${NC}"
    cat /etc/apt/sources.list.d/ubuntu-mirrors.list
    echo ""
    
    # Mettre à jour APT
    echo -e "${GREEN}Mise à jour des sources APT...${NC}"
    apt update -qq 2>/dev/null || true
    
    echo -e "${GREEN}✅ Correction terminée!${NC}"
    echo ""
    echo "Les avertissements APT ne devraient plus apparaître."
    
else
    echo -e "${GREEN}✓ Aucun problème de sources APT détecté${NC}"
fi

echo ""
echo "Vous pouvez maintenant relancer le nettoyage:"
echo "  ./cleanup-disk.sh"
