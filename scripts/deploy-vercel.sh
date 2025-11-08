#!/bin/bash

set -euo pipefail

# Script de déploiement automatisé pour Vercel
# Usage: ./scripts/deploy-vercel.sh [preview|production]

ENVIRONMENT="${1:-preview}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/apps/dapp"

echo "🚀 Token4Good - Déploiement Vercel"
echo "Environment: $ENVIRONMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "Installation: npm install -g vercel"
    exit 1
fi

# Vérifier que l'utilisateur est connecté
if ! vercel whoami &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à Vercel"
    echo "Exécutez: vercel login"
    exit 1
fi

cd "$PROJECT_ROOT"

# Fonction pour vérifier la configuration
check_configuration() {
    echo "📝 Vérification de la configuration..."
    
    # Vérifier vercel.json dans apps/dapp
    if [ ! -f "$FRONTEND_DIR/vercel.json" ]; then
        echo "❌ vercel.json non trouvé dans apps/dapp"
        exit 1
    fi
    
    # Vérifier package.json et Next.js
    if [ ! -f "$FRONTEND_DIR/package.json" ]; then
        echo "❌ package.json non trouvé dans apps/dapp"
        exit 1
    fi
    
    if ! grep -q '"next"' "$FRONTEND_DIR/package.json"; then
        echo "❌ Next.js non trouvé dans package.json"
        exit 1
    fi
    
    echo "✅ Configuration vérifiée"
    echo ""
    echo "⚠️  IMPORTANT: Vérifiez dans le Dashboard Vercel que:"
    echo "   - Root Directory = 'apps/dapp'"
    echo "   - Framework = Next.js"
    echo "   Voir: VERCEL_FIX_MONOREPO.md pour les instructions"
    echo ""
}

# Fonction pour configurer les variables d'environnement
configure_env_vars() {
    echo ""
    echo "📝 Configuration des variables d'environnement..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Note: Les variables doivent être configurées dans le dashboard Vercel
    echo "⚠️  Assurez-vous que ces variables sont configurées dans Vercel:"
    echo ""
    echo "Variables requises:"
    echo "- NEXT_PUBLIC_API_URL (URL du backend Railway)"
    echo "- NEXT_PUBLIC_DAZNO_API_URL"
    echo "- NEXT_PUBLIC_DAZNO_USERS_API_URL"
    echo "- NEXT_PUBLIC_DAZNO_VERIFY_URL"
    echo ""
    echo "Configurez-les dans: https://vercel.com/dashboard"
    echo ""
    read -p "Variables configurées? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Configuration annulée"
        exit 1
    fi
}

# Fonction pour déployer le frontend
deploy_frontend() {
    echo ""
    echo "📦 Déploiement du frontend..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "$FRONTEND_DIR"
    
    # Build local pour vérifier qu'il n'y a pas d'erreurs
    echo "🔨 Build de vérification..."
    if ! npm run build; then
        echo "❌ Build échoué. Corrigez les erreurs avant de déployer."
        exit 1
    fi
    
    echo "✅ Build local réussi"
    
    # Déploiement depuis le répertoire frontend
    # IMPORTANT: Le Root Directory doit être configuré dans Vercel Dashboard
    echo ""
    echo "⚠️  Déploiement depuis le projet racine..."
    echo "   Assurez-vous que Root Directory = 'apps/dapp' dans Vercel"
    echo ""
    
    cd "$PROJECT_ROOT"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "🚀 Déploiement en production..."
        vercel --prod
    else
        echo "🔍 Déploiement en preview..."
        vercel
    fi
    
    echo "✅ Déploiement terminé"
}

# Fonction pour obtenir l'URL du déploiement
get_deployment_url() {
    echo ""
    echo "🌐 Récupération de l'URL de déploiement..."
    
    FRONTEND_URL=$(vercel ls --meta environment="$ENVIRONMENT" 2>/dev/null | head -n 1 || echo "")
    
    if [ -n "$FRONTEND_URL" ]; then
        echo "✅ Frontend URL: $FRONTEND_URL"
    else
        echo "⚠️  URL non disponible immédiatement"
        echo "   Vérifiez dans: https://vercel.com/dashboard"
    fi
}

# Fonction pour tester le déploiement
test_deployment() {
    if [ -n "${FRONTEND_URL:-}" ]; then
        echo ""
        echo "🧪 Test du déploiement..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        sleep 10  # Attendre que le service démarre
        
        if curl -f -s "$FRONTEND_URL" > /dev/null; then
            echo "✅ Frontend accessible"
        else
            echo "⚠️  Frontend non accessible immédiatement"
            echo "   Vérifiez les logs: vercel logs"
        fi
        
        # Tester le proxy API
        if curl -f -s "$FRONTEND_URL/health" > /dev/null; then
            echo "✅ Proxy API fonctionnel"
        else
            echo "⚠️  Proxy API non accessible"
            echo "   Vérifiez la configuration des rewrites dans vercel.json"
        fi
    fi
}

# Fonction pour configurer le domaine personnalisé
configure_domain() {
    echo ""
    echo "🌐 Configuration du domaine personnalisé"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    read -p "Voulez-vous configurer t4g.dazno.de maintenant? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel domains add t4g.dazno.de
        echo ""
        echo "📝 N'oubliez pas de configurer le CNAME dans votre DNS:"
        echo "   Type: CNAME"
        echo "   Name: t4g"
        echo "   Value: cname.vercel-dns.com"
    fi
}

# Menu principal
main() {
    check_configuration
    configure_env_vars
    deploy_frontend
    get_deployment_url
    test_deployment
    
    if [ "$ENVIRONMENT" = "production" ]; then
        configure_domain
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Déploiement Vercel terminé avec succès!"
    echo ""
    echo "📝 Prochaines étapes:"
    echo "1. Testez l'application complète"
    echo "2. Vérifiez les flows d'authentification"
    echo "3. Testez les paiements Lightning"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "- Logs: vercel logs --follow"
    echo "- Redéployer: vercel --prod (ou vercel pour preview)"
    echo "- Rollback: vercel rollback <deployment-url>"
    echo "- Liste: vercel ls"
    echo ""
    echo "🌐 Dashboard: https://vercel.com/dashboard"
}

# Exécution
main "$@"
