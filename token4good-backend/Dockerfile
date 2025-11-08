# Build stage
FROM rust:1.82 as builder

WORKDIR /app

# Install dependencies (including PostgreSQL client for sqlx compilation)
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    libpq-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for faster builds
ENV CARGO_NET_GIT_FETCH_WITH_CLI=true
ENV CARGO_INCREMENTAL=0
ENV RUST_BACKTRACE=1

# Copy Cargo files first for better caching
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies (this layer will be cached if Cargo files don't change)
RUN cargo build --release --locked && rm -rf src

# Copy source code
COPY src ./src
COPY migrations ./migrations
COPY token4good.schema.yaml ./

# Build the application (dependencies are already built and cached)
RUN cargo build --release --locked

# Runtime stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the binary from builder stage
COPY --from=builder /app/target/release/token4good-backend /app/token4good-backend
COPY --from=builder /app/token4good.schema.yaml /app/
COPY --from=builder /app/migrations /app/migrations

# Copy runtime scripts
COPY scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose ports
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["/app/start.sh"]
