#!/bin/bash

set -euo pipefail

# Script de déploiement automatisé pour Railway
# Usage: ./scripts/deploy-railway.sh [staging|production]

ENVIRONMENT="${1:-staging}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/token4good-backend"

echo "🚀 Token4Good - Déploiement Railway"
echo "Environment: $ENVIRONMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier que Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé"
    echo "Installation: npm install -g @railway/cli"
    exit 1
fi

# Vérifier que l'utilisateur est connecté
if ! railway whoami &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à Railway"
    echo "Exécutez: railway login"
    exit 1
fi

cd "$BACKEND_DIR"

# Fonction pour générer un secret JWT sécurisé
generate_jwt_secret() {
    openssl rand -base64 32
}

# Fonction pour configurer les variables d'environnement
configure_env_vars() {
    echo ""
    echo "📝 Configuration des variables d'environnement..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Afficher les variables existantes
    echo ""
    echo "Variables actuelles:"
    railway variables --kv --environment "$ENVIRONMENT" 2>/dev/null || echo "Aucune variable configurée"
    
    echo ""
    echo "🔐 Génération d'un nouveau JWT_SECRET..."
    JWT_SECRET=$(generate_jwt_secret)
    
    echo ""
    echo "⚠️  Configuration des variables d'environnement requises:"
    echo ""
    echo "Ouvrez le dashboard Railway pour configurer ces variables:"
    echo "  https://railway.app/project/$(railway status --json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)/settings"
    echo ""
    echo "Variables requises:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "JWT_SECRET=$JWT_SECRET"
    echo "JWT_EXPIRATION_HOURS=24"
    echo ""
    echo "RGB_DATA_DIR=/app/data/rgb"
    echo "RGB_NETWORK=mainnet"
    echo ""
    echo "LND_REST_HOST=https://your-lnd-node.com:8080"
    echo "LND_MACAROON_PATH=<base64-encoded-macaroon>"
    echo "LND_TLS_CERT_PATH=<base64-encoded-cert>"
    echo ""
    echo "DAZNO_API_URL=https://api.token-for-good.com"
    echo ""
    echo "HOST=0.0.0.0"
    echo "PORT=3000"
    echo "RUST_LOG=info,token4good_backend=debug"
    echo ""
    echo "ALLOWED_ORIGINS=https://app.token-for-good.com,https://token-for-good.com,https://token-for-good.com"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "Appuyez sur Entrée une fois les variables configurées dans Railway..."
    echo ""
    echo "✅ Configuration validée"
}

# Fonction pour déployer le backend
deploy_backend() {
    echo ""
    echo "📦 Compilation et déploiement du backend..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Vérifier le Dockerfile
    if [ ! -f "Dockerfile" ]; then
        echo "❌ Dockerfile non trouvé dans $BACKEND_DIR"
        exit 1
    fi
    
    # Vérifier railway.json
    if [ ! -f "railway.json" ]; then
        echo "❌ railway.json non trouvé"
        exit 1
    fi
    
    # Link vers le bon environment
    echo "🔗 Connexion à l'environnement $ENVIRONMENT..."
    railway link --environment "$ENVIRONMENT"
    
    # Configuration des variables
    configure_env_vars
    
    # Déploiement
    echo "🚢 Déploiement en cours..."
    railway up --environment "$ENVIRONMENT"
    
    echo "✅ Déploiement terminé"
}

# Fonction pour obtenir l'URL du déploiement
get_deployment_url() {
    echo ""
    echo "🌐 Récupération de l'URL de déploiement..."
    BACKEND_URL=$(railway domain --environment "$ENVIRONMENT" 2>/dev/null || echo "")
    
    if [ -z "$BACKEND_URL" ]; then
        echo "⚠️  Aucun domaine configuré. Générez-en un avec:"
        echo "   railway domain --environment $ENVIRONMENT"
    else
        echo "✅ Backend URL: https://$BACKEND_URL"
        echo ""
        echo "📋 Mise à jour de vercel.json avec cette URL:"
        echo "   https://$BACKEND_URL"
    fi
}

# Fonction pour tester le déploiement
test_deployment() {
    if [ -n "$BACKEND_URL" ]; then
        echo ""
        echo "🧪 Test du déploiement..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        sleep 10  # Attendre que le service démarre
        
        if curl -f -s "https://$BACKEND_URL/health" > /dev/null; then
            echo "✅ Health check réussi"
            curl -s "https://$BACKEND_URL/health" | jq '.'
        else
            echo "❌ Health check échoué"
            echo "Vérifiez les logs: railway logs --environment $ENVIRONMENT"
            exit 1
        fi
    fi
}

# Fonction pour afficher les logs
show_logs() {
    echo ""
    echo "📋 Logs du déploiement (Ctrl+C pour quitter):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    railway logs --environment "$ENVIRONMENT"
}

# Menu principal
main() {
    case "${2:-deploy}" in
        "logs")
            show_logs
            ;;
        "test")
            get_deployment_url
            test_deployment
            ;;
        "deploy"|*)
            deploy_backend
            get_deployment_url
            test_deployment
            
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "✅ Déploiement Railway terminé avec succès!"
            echo ""
            echo "📝 Prochaines étapes:"
            echo "1. Mettez à jour vercel.json avec l'URL du backend"
            echo "2. Déployez le frontend: ./scripts/deploy-vercel.sh"
            echo "3. Configurez le DNS pour app.token-for-good.com"
            echo ""
            echo "🔧 Commandes utiles:"
            echo "- Logs: railway logs --environment $ENVIRONMENT --follow"
            echo "- Variables: railway variables --environment $ENVIRONMENT"
            echo "- Redéployer: railway up --environment $ENVIRONMENT"
            echo "- Rollback: railway rollback --environment $ENVIRONMENT"
            ;;
    esac
}

# Exécution
main "$@"

