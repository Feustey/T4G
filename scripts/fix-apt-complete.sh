#!/bin/bash
#
# Token4Good - Réparation complète APT
# Usage: ./fix-apt-complete.sh
#

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== Réparation Complète APT ==="
echo "Date: $(date)"
echo ""

# 1. Réparer les dépendances cassées
echo -e "${GREEN}[1/4] Réparation des dépendances cassées...${NC}"
apt --fix-broken install -y 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Certaines dépendances ne peuvent pas être réparées automatiquement${NC}"
    echo "   Cela peut être normal si des packages sont en cours de mise à jour"
}

# 2. Corriger les sources APT dupliquées
echo -e "${GREEN}[2/4] Correction des sources APT...${NC}"
if [ -f "/etc/apt/sources.list.d/ubuntu-mirrors.list" ]; then
    # Créer une sauvegarde
    cp /etc/apt/sources.list.d/ubuntu-mirrors.list /etc/apt/sources.list.d/ubuntu-mirrors.list.backup.$(date +%Y%m%d)
    
    # Corriger le fichier
    cat > /etc/apt/sources.list.d/ubuntu-mirrors.list << 'EOF'
# Ubuntu Mirrors - Sources uniques
deb http://archive.ubuntu.com/ubuntu/ focal main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu/ focal-updates main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu/ focal-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu/ focal-security main restricted universe multiverse
EOF
    echo -e "${GREEN}✓ Sources APT corrigées${NC}"
else
    echo -e "${GREEN}✓ Aucun problème de sources détecté${NC}"
fi

# 3. Mettre à jour les sources
echo -e "${GREEN}[3/4] Mise à jour des sources APT...${NC}"
apt update -qq 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Mise à jour partielle (normal si certains repos sont temporairement indisponibles)${NC}"
}

# 4. Nettoyer APT
echo -e "${GREEN}[4/4] Nettoyage APT...${NC}"
apt clean -qq 2>/dev/null || true
apt autoclean -qq 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Réparation APT terminée!${NC}"
echo ""
echo "Vous pouvez maintenant relancer le nettoyage:"
echo "  ./cleanup-disk.sh"
echo ""
echo "Ou si vous voulez forcer la réparation des kernels:"
echo "  apt autoremove --purge -y"
echo "  apt install -f"


