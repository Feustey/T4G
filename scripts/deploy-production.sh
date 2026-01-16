#!/bin/bash

# Script de déploiement production Token4Good v2
# Guide interactif pour déployer sur Railway + Vercel

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo ""
echo "🚀 ═══════════════════════════════════════════════════════════"
echo "🚀  Token4Good v2 - Déploiement Production"
echo "🚀 ═══════════════════════════════════════════════════════════"
echo ""
echo "Ce script va vous guider à travers les étapes de déploiement."
echo ""

# Fonction pour afficher un message de succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher un message d'info
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Fonction pour afficher un avertissement
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Fonction pour afficher une erreur
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Vérification des prérequis"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Railway CLI
    if command -v railway &> /dev/null; then
        success "Railway CLI installé ($(railway --version))"
    else
        error "Railway CLI n'est pas installé"
        echo ""
        echo "Installation: npm install -g @railway/cli"
        exit 1
    fi
    
    # Vercel CLI
    if command -v vercel &> /dev/null; then
        VERCEL_VERSION=$(vercel --version | head -n1)
        success "Vercel CLI installé ($VERCEL_VERSION)"
    else
        error "Vercel CLI n'est pas installé"
        echo ""
        echo "Installation: npm install -g vercel"
        exit 1
    fi
    
    echo ""
}

# Étape 1: Backend Railway
deploy_backend() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 ÉTAPE 1/3 - Déploiement Backend Railway"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    warning "Vous allez devoir vous connecter à Railway dans le navigateur."
    echo ""
    read -p "Appuyez sur Entrée pour continuer..."
    
    # Connexion Railway
    info "Connexion à Railway..."
    railway login
    
    if railway whoami &> /dev/null; then
        success "Connecté à Railway"
        echo ""
        info "Utilisateur: $(railway whoami)"
    else
        error "Échec de connexion à Railway"
        exit 1
    fi
    
    echo ""
    warning "Le script de déploiement Railway va maintenant s'exécuter."
    warning "Il vous demandera de configurer les variables d'environnement."
    echo ""
    read -p "Appuyez sur Entrée pour lancer le déploiement backend..."
    
    # Déploiement
    cd "$PROJECT_ROOT"
    if [ -f "scripts/deploy-railway.sh" ]; then
        bash scripts/deploy-railway.sh production
    else
        error "Script deploy-railway.sh non trouvé"
        exit 1
    fi
}

# Étape 2: Mise à jour vercel.json
update_vercel_config() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 ÉTAPE 2/3 - Configuration Frontend"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    info "URL Railway actuelle dans vercel.json:"
    grep -A 1 '"source": "/api/:path\*"' "$PROJECT_ROOT/vercel.json" | grep "destination"
    echo ""
    
    warning "Vérifiez que l'URL Railway dans vercel.json correspond à votre déploiement."
    echo ""
    echo "Si vous devez la mettre à jour:"
    echo "1. Ouvrez: $PROJECT_ROOT/vercel.json"
    echo "2. Recherchez: \"destination\": \"https://...railway.app\""
    echo "3. Remplacez par l'URL obtenue à l'étape 1"
    echo ""
    read -p "L'URL est-elle correcte? (o/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        warning "Mettez à jour vercel.json et relancez ce script."
        exit 0
    fi
    
    success "Configuration frontend prête"
}

# Étape 3: Frontend Vercel
deploy_frontend() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌐 ÉTAPE 3/3 - Déploiement Frontend Vercel"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    warning "Vous allez devoir vous connecter à Vercel dans le navigateur."
    echo ""
    read -p "Appuyez sur Entrée pour continuer..."
    
    # Connexion Vercel
    info "Connexion à Vercel..."
    vercel login
    
    echo ""
    success "Connecté à Vercel"
    
    echo ""
    warning "Le script de déploiement Vercel va maintenant s'exécuter."
    echo ""
    read -p "Appuyez sur Entrée pour lancer le déploiement frontend..."
    
    # Déploiement
    cd "$PROJECT_ROOT"
    if [ -f "scripts/deploy-vercel.sh" ]; then
        bash scripts/deploy-vercel.sh production
    else
        error "Script deploy-vercel.sh non trouvé"
        exit 1
    fi
}

# Tests post-déploiement
test_deployment() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧪 Tests Post-Déploiement"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    info "Tests recommandés à effectuer manuellement:"
    echo ""
    echo "1. Backend Railway:"
    echo "   curl https://VOTRE-URL-RAILWAY/health"
    echo ""
    echo "2. Frontend Vercel:"
    echo "   - Ouvrir https://token4good.vercel.app"
    echo "   - Tester le login"
    echo "   - Vérifier les appels API"
    echo ""
    echo "3. Logs:"
    echo "   - Railway: railway logs --follow"
    echo "   - Vercel: vercel logs --follow"
    echo ""
}

# Résumé final
show_summary() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 Déploiement Terminé!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    success "Token4Good v2 est maintenant en production! 🚀"
    echo ""
    echo "📊 Dashboards:"
    echo "   - Railway: https://railway.app/dashboard"
    echo "   - Vercel: https://vercel.com/dashboard"
    echo ""
    echo "📚 Documentation:"
    echo "   - Guide: $PROJECT_ROOT/DEPLOIEMENT_PRODUCTION_GUIDE.md"
    echo "   - Troubleshooting: $PROJECT_ROOT/DEPLOY_READY.md"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "   - Logs Railway: railway logs --follow"
    echo "   - Logs Vercel: vercel logs --follow"
    echo "   - Rollback Railway: railway rollback"
    echo "   - Rollback Vercel: vercel rollback <url>"
    echo ""
}

# Menu principal
main() {
    check_prerequisites
    
    echo ""
    echo "📋 Plan de déploiement:"
    echo "   1. Backend Rust sur Railway (~30 min)"
    echo "   2. Mise à jour configuration (~2 min)"
    echo "   3. Frontend Next.js sur Vercel (~20 min)"
    echo ""
    echo "⏱️  Durée totale estimée: 60 minutes"
    echo ""
    
    read -p "Voulez-vous continuer? (o/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        info "Déploiement annulé"
        exit 0
    fi
    
    # Exécution des étapes
    deploy_backend
    update_vercel_config
    deploy_frontend
    test_deployment
    show_summary
}

# Exécution
main "$@"
