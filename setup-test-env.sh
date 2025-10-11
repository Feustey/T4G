#!/bin/bash
# Setup script for Token4Good RGB testing environment
# ===================================================

set -e

echo "🔧 Configuration de l'environnement de test Token4Good RGB"
echo "============================================================"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "token4good-backend/Cargo.toml" ]; then
    echo -e "${RED}❌ Erreur: Exécuter ce script depuis la racine du projet RGB${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Répertoire de travail: $(pwd)${NC}"

# 1. Setup Rust backend environment
echo -e "\\n${YELLOW}1. Configuration backend Rust${NC}"

# Copy test environment
if [ -f "test-backend.env" ]; then
    cp test-backend.env token4good-backend/.env
    echo -e "${GREEN}✅ Configuration .env copiée${NC}"
else
    echo -e "${RED}❌ Fichier test-backend.env non trouvé${NC}"
    exit 1
fi

# 2. Check Rust toolchain
echo -e "\\n${YELLOW}2. Vérification Rust${NC}"
if command -v cargo &> /dev/null; then
    RUST_VERSION=$(rustc --version)
    echo -e "${GREEN}✅ Rust installé: $RUST_VERSION${NC}"
else
    echo -e "${RED}❌ Rust non installé${NC}"
    echo "📥 Installation via: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# 3. Install dependencies
echo -e "\\n${YELLOW}3. Installation dépendances${NC}"
cd token4good-backend

echo "📦 Installation des dépendances Cargo..."
cargo check 2>/dev/null || echo -e "${YELLOW}⚠️  Certaines dépendances peuvent nécessiter une base de données${NC}"

cd ..

# 4. Check Node.js for test script
echo -e "\\n${YELLOW}4. Vérification Node.js${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installé: $NODE_VERSION${NC}"
    
    # Install test dependencies
    if [ ! -d "node_modules" ]; then
        echo "📦 Installation dépendances test..."
        npm install axios
    fi
else
    echo -e "${RED}❌ Node.js requis pour les tests${NC}"
    exit 1
fi

# 5. Setup test database (if needed)
echo -e "\\n${YELLOW}5. Configuration base de données${NC}"
echo -e "${YELLOW}⚠️  Assurez-vous que Supabase est configuré avec la connexion dans test-backend.env${NC}"

# 6. Make test scripts executable
echo -e "\\n${YELLOW}6. Configuration scripts de test${NC}"
chmod +x test-e2e.js
chmod +x test-scenario.js
echo -e "${GREEN}✅ Scripts de test configurés${NC}"

# 7. Summary
echo -e "\\n${GREEN}🎉 ENVIRONNEMENT DE TEST PRÊT${NC}"
echo "================================"
echo ""
echo "🚀 Pour lancer les tests:"
echo "   1. Démarrer le backend: cd token4good-backend && cargo run"
echo "   2. Dans un autre terminal: node test-e2e.js"
echo ""
echo "📊 Fichiers de test disponibles:"
echo "   - test-e2e.js        : Test end-to-end complet"
echo "   - test-scenario.js   : Test de scenario utilisateur"
echo "   - test-backend.env   : Configuration environnement"
echo ""
echo "📝 Configuration:"
echo "   - Backend URL: http://localhost:3000"
echo "   - Base de données: Supabase PostgreSQL"
echo "   - RGB: Mode regtest"
echo "   - Lightning: Mode test"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "   - Configurez DATABASE_URL dans test-backend.env"
echo "   - Assurez-vous que Supabase est accessible"
echo "   - Le backend doit être démarré avant les tests"

# Check if backend is running
echo -e "\\n${YELLOW}🔍 Vérification backend...${NC}"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend détecté sur http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend non démarré sur http://localhost:3000${NC}"
    echo "   Démarrez avec: cd token4good-backend && cargo run"
fi

echo -e "\\n${GREEN}✨ Prêt pour les tests!${NC}"