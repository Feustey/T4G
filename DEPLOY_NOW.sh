#!/bin/bash

# Script de déploiement rapide - Token4Good v2
# Exécutez simplement: ./DEPLOY_NOW.sh

cat << "EOF"

🚀 ═══════════════════════════════════════════════════════════
   Token4Good v2 - Déploiement Production
🚀 ═══════════════════════════════════════════════════════════

   Status: ✅ PRÊT À DÉPLOYER
   Version: 2.0.0
   Date: 16 janvier 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Ce qui va se passer:

   1️⃣  Backend Rust → Railway        (~30 min)
   2️⃣  Configuration vercel.json     (~2 min)
   3️⃣  Frontend Next.js → Vercel     (~20 min)

   ⏱️  Durée totale: ~60 minutes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Prérequis vérifiés:
   - Railway CLI installé
   - Vercel CLI installé
   - Code 100% prêt
   - Tests passés
   - Documentation complète

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Documentation disponible:
   - DEPLOIEMENT_PRODUCTION_GUIDE.md (guide complet)
   - DEPLOY_READY.md (guide détaillé)
   - DEPLOY_CHECKLIST.md (checklist)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

echo ""
read -p "Prêt à déployer en production? (o/n) " -n 1 -r
echo ""
echo ""

if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo "🚀 Lancement du déploiement..."
    echo ""
    exec ./scripts/deploy-production.sh
else
    echo "ℹ️  Déploiement annulé."
    echo ""
    echo "📖 Pour plus d'informations, consultez:"
    echo "   - DEPLOIEMENT_PRODUCTION_GUIDE.md"
    echo ""
    echo "🚀 Quand vous serez prêt, exécutez:"
    echo "   ./DEPLOY_NOW.sh"
    echo ""
fi
