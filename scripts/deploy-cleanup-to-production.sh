#!/bin/bash
#
# Token4Good - Déploiement des scripts de nettoyage vers production
# Usage: ./deploy-cleanup-to-production.sh
#

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVER="root@147.79.101.32"
SERVER_PASSWORD="Criteria0-Cadmium5-Attempt9-Exit2-Floss1"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Déploiement Scripts de Nettoyage - Token4Good${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Vérifier que les scripts existent
if [ ! -f "scripts/cleanup-disk.sh" ] || [ ! -f "scripts/check-disk-space.sh" ]; then
    echo -e "${RED}❌ Erreur: Scripts non trouvés${NC}"
    echo "   Assurez-vous d'être dans le répertoire racine du projet"
    exit 1
fi

echo -e "${GREEN}[1/5] Vérification des scripts locaux...${NC}"
ls -lh scripts/cleanup-disk.sh scripts/check-disk-space.sh
echo ""

echo -e "${GREEN}[2/5] Copie des scripts vers le serveur...${NC}"
echo "   Serveur: $SERVER"
echo "   Note: Vous devrez entrer le mot de passe du serveur"
echo ""

# Copier les scripts
scp scripts/cleanup-disk.sh "$SERVER:/root/" && echo "   ✓ cleanup-disk.sh copié"
scp scripts/check-disk-space.sh "$SERVER:/root/" && echo "   ✓ check-disk-space.sh copié"
echo ""

echo -e "${GREEN}[3/5] Configuration des permissions sur le serveur...${NC}"
ssh "$SERVER" "chmod +x /root/cleanup-disk.sh /root/check-disk-space.sh && ls -lh /root/*.sh"
echo ""

echo -e "${GREEN}[4/5] Test du script de monitoring...${NC}"
ssh "$SERVER" "/root/check-disk-space.sh"
echo ""

echo -e "${YELLOW}[5/5] Configuration des cron jobs (optionnel)...${NC}"
echo ""
echo "Pour automatiser le nettoyage, exécutez sur le serveur:"
echo ""
echo -e "${BLUE}  ssh $SERVER${NC}"
echo -e "${BLUE}  crontab -e${NC}"
echo ""
echo "Et ajoutez ces lignes:"
echo ""
echo -e "${GREEN}  # Nettoyage automatique tous les dimanches à 4h${NC}"
echo -e "${GREEN}  0 4 * * 0 /root/cleanup-disk.sh >> /var/log/disk-cleanup.log 2>&1${NC}"
echo ""
echo -e "${GREEN}  # Monitoring toutes les heures avec alertes${NC}"
echo -e "${GREEN}  0 * * * * /root/check-disk-space.sh --alert-email admin@dazno.de${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Déploiement terminé avec succès!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Commandes disponibles sur le serveur:"
echo ""
echo -e "  ${YELLOW}./check-disk-space.sh${NC}           - Vérifier l'espace disque"
echo -e "  ${YELLOW}./cleanup-disk.sh${NC}               - Nettoyage normal"
echo -e "  ${YELLOW}./cleanup-disk.sh --aggressive${NC}  - Nettoyage agressif"
echo ""
echo "Documentation: DISK_CLEANUP_GUIDE.md"
echo ""

