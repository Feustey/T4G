#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔧 Installation des dépendances pour l'environnement RGB${NC}"

# Vérifier si on est sur macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}Ce script est conçu pour macOS${NC}"
    exit 1
fi

# Créer le répertoire de travail
WORK_DIR="$HOME/RGB"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# Cloner le repo principal
echo -e "${YELLOW}Clonage du repo RGB...${NC}"
if [ ! -d "$WORK_DIR/RGB" ]; then
    git clone https://github.com/Feustey/RGB.git
    cd RGB
else
    cd RGB
    git pull
fi

# Vérifier si Homebrew est installé
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Installation de Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Installer Bitcoin Core
echo -e "${YELLOW}Installation de Bitcoin Core...${NC}"
brew install bitcoin

# Installer LND
echo -e "${YELLOW}Installation de LND...${NC}"
brew install lnd

# Installer Rust si nécessaire
if ! command -v cargo &> /dev/null; then
    echo -e "${YELLOW}Installation de Rust...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
fi

# Installer jq (pour le parsing JSON)
echo -e "${YELLOW}Installation de jq...${NC}"
brew install jq

# Installer Electrs
echo -e "${YELLOW}Installation d'Electrs...${NC}"
if ! command -v electrs &> /dev/null; then
    git clone https://github.com/romanz/electrs.git /tmp/electrs
    cd /tmp/electrs
    cargo install --locked --path .
    cd "$WORK_DIR/RGB"
    rm -rf /tmp/electrs
fi

# Installer RGB Node
echo -e "${YELLOW}Installation de RGB Node...${NC}"
if [ ! -d "/tmp/rgb-node" ]; then
    git clone https://github.com/RGB-WG/rgb-node.git /tmp/rgb-node
    cd /tmp/rgb-node
    cargo build --release

    # Installer les binaires RGB
    echo -e "${YELLOW}Installation des binaires RGB...${NC}"
    sudo cp target/release/rgb-cli /usr/local/bin/
    sudo cp target/release/stashd /usr/local/bin/
    sudo cp target/release/contractd /usr/local/bin/
    sudo cp target/release/proxy-server /usr/local/bin/

    cd "$WORK_DIR/RGB"
    rm -rf /tmp/rgb-node
fi

# Installation des dépendances Node.js
echo -e "${YELLOW}Installation des dépendances Node.js...${NC}"
if ! command -v yarn &> /dev/null; then
    echo -e "${YELLOW}Installation de Yarn...${NC}"
    npm install -g yarn
fi

# Installation des dépendances du projet
yarn install

# Vérifier les installations
echo -e "${YELLOW}Vérification des installations...${NC}"
COMMANDS=("bitcoind" "bitcoin-cli" "lnd" "electrs" "rgb-cli" "stashd" "contractd" "proxy-server" "jq" "yarn" "node")

for cmd in "${COMMANDS[@]}"; do
    if command -v $cmd &> /dev/null; then
        echo -e "${GREEN}✓ $cmd installé${NC}"
    else
        echo -e "${RED}✗ $cmd non trouvé${NC}"
        MISSING_DEPS=1
    fi
done

if [ -n "$MISSING_DEPS" ]; then
    echo -e "${RED}Certaines dépendances n'ont pas été installées correctement${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Toutes les dépendances sont installées !${NC}"
echo -e "${YELLOW}Configuration de l'environnement :${NC}"
echo -e "1. Le repo RGB est cloné dans : ${GREEN}$WORK_DIR/RGB${NC}"
echo -e "2. Les binaires RGB sont installés dans : ${GREEN}/usr/local/bin${NC}"
echo -e "3. Les configurations Bitcoin/LND sont dans : ${GREEN}~/.bitcoin et ~/.lnd${NC}"
echo -e "\n${YELLOW}Pour démarrer l'environnement :${NC}"
echo -e "1. cd $WORK_DIR/RGB"
echo -e "2. ./scripts/setup_regtest.sh"
echo -e "\n${YELLOW}Note: Redémarrez votre terminal pour que tous les changements prennent effet${NC}" 