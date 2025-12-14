#!/bin/bash
# Script de build complet pour Token4Good v2
# Build le backend Rust et le frontend Next.js
# ===========================================

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔨 Build complet Token4Good v2${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Fonction pour afficher les messages
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifier que nous sommes à la racine du projet
if [ ! -f "package.json" ]; then
    error "Vous devez exécuter ce script depuis la racine du projet"
    exit 1
fi

# Créer un répertoire pour les artefacts de build
BUILD_DIR="dist"
mkdir -p "$BUILD_DIR"

# ============================================
# PARTIE 1: Build du Backend Rust
# ============================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 BUILD BACKEND RUST${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd token4good-backend

# Vérifier que Rust est installé
if ! command -v cargo &> /dev/null; then
    error "Rust/Cargo n'est pas installé"
    info "Installez Rust avec: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

info "Vérification de la compilation Rust..."
if cargo check --release; then
    success "Vérification de compilation réussie"
else
    error "La vérification de compilation a échoué"
    exit 1
fi

info "Build du backend en mode release..."
if cargo build --release --locked; then
    success "Build backend réussi!"
    
    # Copier le binaire dans le répertoire de build
    mkdir -p "../$BUILD_DIR/backend"
    cp target/release/token4good-backend "../$BUILD_DIR/backend/" 2>/dev/null || true
    
    # Afficher la taille du binaire
    if [ -f "target/release/token4good-backend" ]; then
        BINARY_SIZE=$(du -h target/release/token4good-backend | cut -f1)
        info "Taille du binaire: $BINARY_SIZE"
    fi
else
    error "Build backend échoué"
    exit 1
fi

cd ..

# ============================================
# PARTIE 2: Build du Frontend Next.js
# ============================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🌐 BUILD FRONTEND NEXT.JS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
    exit 1
fi

NODE_VERSION=$(node -v)
info "Version Node.js: $NODE_VERSION"

# Installer les dépendances si node_modules n'existe pas
if [ ! -d "node_modules" ]; then
    warning "node_modules n'existe pas, installation des dépendances..."
    npm install
fi

# Build avec Nx (recommandé pour les monorepos)
info "Build du frontend avec Nx..."

# Vérifier que Nx est disponible
if command -v npx &> /dev/null; then
    if npx nx build dapp --configuration=production; then
        success "Build frontend réussi avec Nx!"
        
        # Vérifier que le build existe
        if [ -d "dist/apps/dapp" ]; then
            BUILD_SIZE=$(du -sh dist/apps/dapp | cut -f1)
            info "Taille du build frontend: $BUILD_SIZE"
        fi
    else
        warning "Build Nx échoué, tentative avec Next.js directement..."
        cd apps/dapp
        
        # Build Next.js avec la configuration standard (next.config.js)
        # La configuration standard est déjà configurée pour gérer les libs
        export NODE_ENV=production
        if npm run build; then
            success "Build frontend réussi avec Next.js!"
        else
            error "Build frontend échoué"
            exit 1
        fi
        
        cd ../..
    fi
else
    error "npx n'est pas disponible"
    exit 1
fi

# ============================================
# RÉSUMÉ
# ============================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ BUILD COMPLET RÉUSSI!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📦 Artéfacts générés:"
echo ""

# Backend
if [ -f "$BUILD_DIR/backend/token4good-backend" ] || [ -f "token4good-backend/target/release/token4good-backend" ]; then
    echo -e "${GREEN}  ✓ Backend Rust${NC}"
    echo "    → token4good-backend/target/release/token4good-backend"
fi

# Frontend
if [ -d "dist/apps/dapp" ]; then
    echo -e "${GREEN}  ✓ Frontend Next.js${NC}"
    echo "    → dist/apps/dapp/"
elif [ -d "apps/dapp/.next" ]; then
    echo -e "${GREEN}  ✓ Frontend Next.js${NC}"
    echo "    → apps/dapp/.next/"
fi

echo ""
info "Pour démarrer le backend: cd token4good-backend && ./target/release/token4good-backend"
info "Pour démarrer le frontend: cd apps/dapp && npm start"
echo ""
success "Build terminé avec succès! 🎉"

