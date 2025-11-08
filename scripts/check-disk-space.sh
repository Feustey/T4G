#!/bin/bash
#
# Token4Good - Monitoring de l'espace disque
# Usage: ./check-disk-space.sh [--alert-email admin@dazno.de]
#

# Seuil d'alerte (en pourcentage)
THRESHOLD=80
CRITICAL_THRESHOLD=90
ALERT_EMAIL=""

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --alert-email)
            ALERT_EMAIL="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== Token4Good Disk Space Monitor ==="
echo "Date: $(date)"
echo ""

# Obtenir l'utilisation du disque
USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
USAGE_HUMAN=$(df -h / | tail -1 | awk '{print $3 "/" $2}')

# Afficher le statut avec couleur
if [ $USAGE -ge $CRITICAL_THRESHOLD ]; then
    echo -e "${RED}🔴 CRITIQUE: Espace disque à ${USAGE}%${NC}"
    echo "   $USAGE_HUMAN utilisés"
    STATUS="CRITICAL"
elif [ $USAGE -ge $THRESHOLD ]; then
    echo -e "${YELLOW}⚠️  ATTENTION: Espace disque à ${USAGE}%${NC}"
    echo "   $USAGE_HUMAN utilisés"
    STATUS="WARNING"
else
    echo -e "${GREEN}✅ OK: Espace disque à ${USAGE}%${NC}"
    echo "   $USAGE_HUMAN utilisés"
    STATUS="OK"
fi

echo ""

# Afficher les détails
echo "Détails par partition:"
df -h | grep -E '^/dev|Filesystem'
echo ""

# Top 10 des plus gros répertoires
echo "Top 10 des plus gros répertoires dans /var:"
du -sh /var/* 2>/dev/null | sort -hr | head -10

echo ""
echo "Top 10 des plus gros répertoires dans /root:"
du -sh /root/.* /root/* 2>/dev/null | sort -hr | head -10 | grep -v "Permission denied"

# Afficher l'espace utilisé par les services Token4Good
echo ""
echo "Espace utilisé par Token4Good:"
if [ -d "/var/www/token4good" ]; then
    du -sh /var/www/token4good 2>/dev/null
fi
if [ -d "/root/.bitcoin" ]; then
    echo "Bitcoin: $(du -sh /root/.bitcoin 2>/dev/null | awk '{print $1}')"
fi
if [ -d "/root/.lnd" ]; then
    echo "LND: $(du -sh /root/.lnd 2>/dev/null | awk '{print $1}')"
fi
if [ -d "/var/backups" ]; then
    echo "Backups: $(du -sh /var/backups 2>/dev/null | awk '{print $1}')"
fi
if [ -d "/var/log" ]; then
    echo "Logs: $(du -sh /var/log 2>/dev/null | awk '{print $1}')"
fi

# Envoyer une alerte par email si nécessaire
if [ -n "$ALERT_EMAIL" ] && [ "$STATUS" != "OK" ]; then
    SUBJECT="ALERT: Disk Space ${STATUS} on Token4Good Server"
    MESSAGE="⚠️ Disk usage is at ${USAGE}% on Token4Good production server.

Status: ${STATUS}
Usage: ${USAGE_HUMAN}
Threshold: ${THRESHOLD}%
Critical: ${CRITICAL_THRESHOLD}%

Action required: Connect to server and run cleanup:
ssh root@147.79.101.32
/root/cleanup-disk.sh

Date: $(date)
"
    
    echo "$MESSAGE" | mail -s "$SUBJECT" "$ALERT_EMAIL" 2>/dev/null || echo "Note: Email non envoyé (mail non configuré)"
fi

echo ""
if [ $USAGE -ge $CRITICAL_THRESHOLD ]; then
    echo -e "${RED}🚨 ACTION IMMÉDIATE REQUISE:${NC}"
    echo "   Exécutez: ./cleanup-disk.sh --aggressive"
elif [ $USAGE -ge $THRESHOLD ]; then
    echo -e "${YELLOW}💡 Recommandation:${NC}"
    echo "   Exécutez: ./cleanup-disk.sh"
else
    echo -e "${GREEN}✅ Tout est OK${NC}"
fi

