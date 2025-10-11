#!/bin/bash
set -e

# Couleurs pour le logging
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Configuration de l'environnement de test RGB${NC}"

# Vérifier si Bitcoin Core est installé
if ! command -v bitcoind &> /dev/null; then
    echo -e "${RED}Bitcoin Core n'est pas installé. Exécutez d'abord install_dependencies.sh${NC}"
    exit 1
fi

# Configuration de Bitcoin Core en mode regtest
BITCOIN_CONF="$HOME/.bitcoin/bitcoin.conf"
mkdir -p "$HOME/.bitcoin"

echo -e "${YELLOW}Configuration de Bitcoin Core...${NC}"
cat > "$BITCOIN_CONF" << EOF
regtest=1
server=1
rpcuser=rgbuser
rpcpassword=rgbpass
rpcallowip=127.0.0.1
txindex=1
zmqpubrawblock=tcp://127.0.0.1:28332
zmqpubrawtx=tcp://127.0.0.1:28333
fallbackfee=0.0001
EOF

# Configuration de LND
LND_CONF="$HOME/.lnd/lnd.conf"
mkdir -p "$HOME/.lnd"

echo -e "${YELLOW}Configuration de LND...${NC}"
cat > "$LND_CONF" << EOF
[Application Options]
debuglevel=info
maxpendingchannels=10
listen=localhost:9735
rpclisten=localhost:10009
restlisten=localhost:8080

[Bitcoin]
bitcoin.active=1
bitcoin.regtest=1
bitcoin.node=bitcoind

[Bitcoind]
bitcoind.rpcuser=rgbuser
bitcoind.rpcpass=rgbpass
bitcoind.zmqpubrawblock=tcp://127.0.0.1:28332
bitcoind.zmqpubrawtx=tcp://127.0.0.1:28333
EOF

# Configuration d'Electrs
ELECTRS_CONF="$HOME/.electrs/config.toml"
mkdir -p "$HOME/.electrs"

echo -e "${YELLOW}Configuration d'Electrs...${NC}"
cat > "$ELECTRS_CONF" << EOF
network = "regtest"
daemon_rpc_addr = "127.0.0.1:18443"
daemon_p2p_addr = "127.0.0.1:18444"
cookie_file = "$HOME/.bitcoin/.cookie"
electrum_rpc_addr = "127.0.0.1:60401"
db_dir = "$HOME/.electrs/db"
EOF

# Configuration de RGB Node
RGB_DIR="$HOME/.rgb"
mkdir -p "$RGB_DIR"

echo -e "${YELLOW}Configuration de RGB Node...${NC}"
cat > "$RGB_DIR/rgb.conf" << EOF
network = "regtest"
stash_endpoint = "127.0.0.1:60401"
contract_endpoint = "127.0.0.1:60402"
proxy_endpoint = "127.0.0.1:60403"
data_dir = "$RGB_DIR/data"
EOF

# Démarrage des services
echo -e "${YELLOW}Démarrage des services...${NC}"

# Démarrer Bitcoin Core
bitcoind -daemon
sleep 5

# Générer des blocs initiaux pour avoir des fonds de test
bitcoin-cli -regtest generatetoaddress 101 $(bitcoin-cli -regtest getnewaddress)

# Démarrer LND
lnd &
sleep 5

# Démarrer Electrs
electrs --conf "$ELECTRS_CONF" &
sleep 5

# Démarrer les services RGB
stashd --config "$RGB_DIR/rgb.conf" &
contractd --config "$RGB_DIR/rgb.conf" &
proxy-server --config "$RGB_DIR/rgb.conf" &

echo -e "${GREEN}✅ Environnement de test configuré et démarré !${NC}"
echo -e "\n${YELLOW}Services en cours d'exécution :${NC}"
echo -e "1. Bitcoin Core (regtest)"
echo -e "2. LND"
echo -e "3. Electrs"
echo -e "4. RGB Node (stashd, contractd, proxy-server)"

echo -e "\n${YELLOW}Pour interagir avec l'environnement :${NC}"
echo -e "- Bitcoin CLI : ${GREEN}bitcoin-cli -regtest${NC}"
echo -e "- LND CLI : ${GREEN}lncli --network=regtest${NC}"
echo -e "- RGB CLI : ${GREEN}rgb-cli${NC}"

echo -e "\n${YELLOW}Pour arrêter tous les services :${NC}"
echo -e "bitcoin-cli -regtest stop"
echo -e "lncli --network=regtest stop"
echo -e "pkill electrs"
echo -e "pkill -f 'stashd|contractd|proxy-server'" 