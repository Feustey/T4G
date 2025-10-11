# Build stage
FROM rust:1.75 as builder

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies
RUN cargo build --release && rm -rf src

# Copy source code
COPY src ./src
COPY token4good.schema.yaml ./

# Build the application
RUN cargo build --release

# Runtime stage
FROM ubuntu:22.04

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    expect \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Bitcoin Core (for regtest)
RUN wget https://bitcoin.org/bin/bitcoin-core-25.0/bitcoin-25.0-x86_64-linux-gnu.tar.gz && \
    tar -xzf bitcoin-25.0-x86_64-linux-gnu.tar.gz && \
    mv bitcoin-25.0/bin/* /usr/local/bin/ && \
    rm -rf bitcoin-25.0*

# Install LND
RUN wget https://github.com/lightningnetwork/lnd/releases/download/v0.17.0-beta/lnd-linux-amd64-v0.17.0-beta.tar.gz && \
    tar -xzf lnd-linux-amd64-v0.17.0-beta.tar.gz && \
    mv lnd-linux-amd64-v0.17.0-beta/lnd /usr/local/bin/ && \
    mv lnd-linux-amd64-v0.17.0-beta/lncli /usr/local/bin/ && \
    rm -rf lnd-linux-amd64-v0.17.0-beta*

# Install RGB Node (placeholder - adapt to actual RGB installation)
# RUN wget https://github.com/RGB-Tools/rgb-node/releases/latest/download/rgb-node-linux && \
#     chmod +x rgb-node-linux && \
#     mv rgb-node-linux /usr/local/bin/rgb-node

# Copy the binary from builder stage
COPY --from=builder /app/target/release/token4good-backend /app/token4good-backend
COPY --from=builder /app/token4good.schema.yaml /app/

# Copy scripts
COPY scripts/ ./scripts/
RUN chmod +x scripts/*.sh

# Create directories for data
RUN mkdir -p /app/data/bitcoin /app/data/lnd /app/data/rgb

# Expose ports
EXPOSE 3000 18443 10009

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start script
CMD ["./scripts/start.sh"]
