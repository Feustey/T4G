# Dockerfile racine — déploie le backend Rust depuis le monorepo T4G
# Le contexte Docker est la racine du repo ; les sources sont dans token4good-backend/

# ──────────────────────────────────────────────
# Étape 1 : Build
# ──────────────────────────────────────────────
FROM rust:latest AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    libpq-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV CARGO_NET_GIT_FETCH_WITH_CLI=true
ENV CARGO_INCREMENTAL=0
ENV RUST_BACKTRACE=1

# Copier les fichiers Cargo depuis le sous-répertoire backend
COPY token4good-backend/Cargo.toml token4good-backend/Cargo.lock ./

# Build des dépendances uniquement (couche cachée)
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release --locked && rm -rf src

# Copier le code source et les migrations
COPY token4good-backend/src ./src
COPY token4good-backend/migrations ./migrations
COPY token4good-backend/build.rs ./build.rs
COPY token4good-backend/token4good.schema.yaml ./token4good.schema.yaml

# Build final
RUN cargo build --release --locked

# ──────────────────────────────────────────────
# Étape 2 : Image de production légère
# ──────────────────────────────────────────────
FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/token4good-backend /app/token4good-backend
COPY --from=builder /app/migrations /app/migrations
COPY --from=builder /app/token4good.schema.yaml /app/token4good.schema.yaml
COPY token4good-backend/scripts/start.sh /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["/app/start.sh"]
