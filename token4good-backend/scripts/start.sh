#!/bin/bash

set -euo pipefail

echo "Starting Token4Good Backend..."

# Create data directories
mkdir -p /app/data/bitcoin /app/data/lnd /app/data/rgb

# Start Bitcoin Core in regtest mode
echo "Starting Bitcoin Core (regtest)..."
bitcoind \
    -regtest \
    -daemon \
    -datadir=/app/data/bitcoin \
    -rpcuser=bitcoin \
    -rpcpassword=password \
    -rpcallowip=0.0.0.0/0 \
    -rpcport=18443 \
    -port=18444 \
    -fallbackfee=0.0002 \
    -zmqpubrawblock=tcp://0.0.0.0:28332 \
    -zmqpubrawtx=tcp://0.0.0.0:28333

# Wait for Bitcoin to start
echo "Waiting for Bitcoin Core to start..."
sleep 10

# Generate initial blocks
echo "Generating initial blocks..."
bitcoin-cli -regtest -rpcuser=bitcoin -rpcpassword=password -datadir=/app/data/bitcoin generate 101

# Start LND
echo "Starting LND..."
lnd \
    --lnddir=/app/data/lnd \
    --bitcoin.active \
    --bitcoin.regtest \
    --bitcoin.node=bitcoind \
    --bitcoind.rpcuser=bitcoin \
    --bitcoind.rpcpass=password \
    --bitcoind.rpchost=localhost:18443 \
    --bitcoind.zmqpubrawblock=tcp://localhost:28332 \
    --bitcoind.zmqpubrawtx=tcp://localhost:28333 \
    --rpclisten=0.0.0.0:10009 \
    --restlisten=0.0.0.0:8080 \
    --listen=0.0.0.0:9735 \
    --debuglevel=info &

# Wait for LND to start
echo "Waiting for LND to start..."
sleep 15

# Initialize LND wallet if it doesn't exist
if [ ! -f /app/data/lnd/wallet.db ]; then
    echo "Creating LND wallet..."
    expect << EOF
spawn lncli --lnddir=/app/data/lnd --network=regtest create
expect "Input wallet password:"
send "password\r"
expect "Confirm password:"
send "password\r"
expect "Do you have an existing cipher seed mnemonic you want to use?"
send "n\r"
expect "Your cipher seed can optionally be encrypted."
send "n\r"
expect eof
EOF
fi

# Unlock wallet
echo "Unlocking LND wallet..."
expect << EOF
spawn lncli --lnddir=/app/data/lnd --network=regtest unlock
expect "Input wallet password:"
send "password\r"
expect eof
EOF

# Wait a bit more for wallet to be ready
sleep 5

# Initialize RGB if needed
echo "Initializing RGB..."
if [ ! -d /app/data/rgb/contracts ]; then
    mkdir -p /app/data/rgb/contracts
fi

# Copy RGB schema
cp /app/token4good.schema.yaml /app/data/rgb/

# Health check endpoint
echo "Setting up health check..."
cat > /tmp/health_check.sh << 'EOF'
#!/bin/bash
curl -f http://localhost:3000/health 2>/dev/null || echo "unhealthy"
EOF
chmod +x /tmp/health_check.sh

# Start the Rust backend
echo "Starting Token4Good Rust backend..."
exec /app/token4good-backend
