#!/bin/bash
#
# Token4Good - Script de nettoyage d'espace disque
# Usage: ./cleanup-disk.sh [--aggressive]
#

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

AGGRESSIVE_MODE=false

# Parser les arguments
if [ "$1" = "--aggressive" ]; then
    AGGRESSIVE_MODE=true
    echo -e "${YELLOW}⚠️  MODE AGRESSIF ACTIVÉ${NC}"
fi

echo "=== Token4Good Disk Cleanup ==="
echo "Date: $(date)"
echo ""

# Fonction pour afficher l'espace disque
show_disk_space() {
    echo -e "${GREEN}Espace disque:${NC}"
    df -h / | tail -1 | awk '{print "  Utilisé: " $3 "/" $2 " (" $5 ")"}'
    echo ""
}

# Espace avant nettoyage
echo -e "${YELLOW}AVANT nettoyage:${NC}"
show_disk_space

# 1. Nettoyer journald (logs systemd)
echo -e "${GREEN}[1/8] Nettoyage des logs systemd...${NC}"
journalctl --vacuum-time=7d --quiet
journalctl --vacuum-size=500M --quiet

# 2. Nettoyer APT
echo -e "${GREEN}[2/8] Nettoyage du cache APT...${NC}"
# Réparer les dépendances cassées d'abord
apt --fix-broken install -y -qq 2>/dev/null || true
# Puis nettoyer
apt clean -qq 2>/dev/null || true
apt autoclean -qq 2>/dev/null || true
apt autoremove -y -qq 2>/dev/null || true

# 3. Nettoyer logs nginx anciens
echo -e "${GREEN}[3/8] Nettoyage des anciens logs nginx...${NC}"
find /var/log/nginx/ -name "*.gz" -type f -mtime +30 -delete 2>/dev/null || true
find /var/log/nginx/ -name "*.log.*" -type f -mtime +30 -delete 2>/dev/null || true

# 4. Nettoyer logs PostgreSQL anciens
echo -e "${GREEN}[4/8] Nettoyage des anciens logs PostgreSQL...${NC}"
find /var/log/postgresql/ -name "*.log.*" -type f -mtime +30 -delete 2>/dev/null || true

# 5. Nettoyer fichiers temporaires
echo -e "${GREEN}[5/8] Nettoyage des fichiers temporaires...${NC}"
find /tmp -type f -atime +7 -delete 2>/dev/null || true
find /var/tmp -type f -atime +7 -delete 2>/dev/null || true

# 6. Nettoyer vieux backups
echo -e "${GREEN}[6/8] Nettoyage des anciens backups...${NC}"
if [ -d "/var/backups/postgresql" ]; then
    find /var/backups/postgresql/ -name "*.sql.gz" -mtime +30 -delete 2>/dev/null || true
fi
if [ -d "/var/backups/frontend" ]; then
    find /var/backups/frontend/ -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
fi

# 7. Nettoyer Cargo cache
echo -e "${GREEN}[7/8] Nettoyage du cache Cargo...${NC}"
if [ -d "/root/.cargo/registry/cache" ]; then
    find /root/.cargo/registry/cache -type f -atime +90 -delete 2>/dev/null || true
    find /root/.cargo/registry/src -type d -atime +90 -exec rm -rf {} + 2>/dev/null || true
fi

# 8. Nettoyer les builds Rust anciens (si pas en production)
if [ "$AGGRESSIVE_MODE" = true ]; then
    echo -e "${YELLOW}[8/8] Mode agressif: nettoyage des builds Rust...${NC}"
    if [ -d "/var/www/token4good/token4good-backend/target/debug" ]; then
        rm -rf /var/www/token4good/token4good-backend/target/debug
        echo "  ✓ Dossier target/debug supprimé"
    fi
    
    # Nettoyer les logs Bitcoin si présents
    if [ -d "/root/.bitcoin" ]; then
        find /root/.bitcoin/ -name "debug.log.*" -delete 2>/dev/null || true
        echo "  ✓ Anciens logs Bitcoin supprimés"
    fi
    
    # Nettoyer les logs LND
    if [ -d "/root/.lnd/logs" ]; then
        find /root/.lnd/logs/ -name "*.log" -mtime +30 -delete 2>/dev/null || true
        echo "  ✓ Anciens logs LND supprimés"
    fi
else
    echo -e "${GREEN}[8/8] Mode normal (utilisez --aggressive pour plus de nettoyage)${NC}"
fi

echo ""
echo -e "${YELLOW}APRÈS nettoyage:${NC}"
show_disk_space

# Afficher les gros répertoires
echo -e "${GREEN}Top 5 des plus gros répertoires:${NC}"
du -sh /var/* 2>/dev/null | sort -hr | head -5 | while read size dir; do
    echo "  $size  $dir"
done

echo ""
echo -e "${GREEN}✅ Nettoyage terminé!${NC}"

