# Contributing to Token4Good

Thank you for your interest in Token4Good! This project uses the RGB Protocol to issue proof-of-impact tokens on Bitcoin, settled via Lightning Network. We welcome contributors of all levels.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Where to Start](#where-to-start)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Areas Needing Help](#areas-needing-help)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)

---

## Code of Conduct

Be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/). Harassment, trolling, or dismissive behavior will not be tolerated.

---

## Where to Start

1. **Read the README** — understand the project purpose and architecture
2. **Browse open issues** — look for `good-first-issue` and `help-wanted` labels on [GitHub Issues](https://github.com/Feustey/T4G/issues)
3. **Ask questions** — open a new issue with the `question` label, we respond quickly
4. **Join the RGB community** — [Discord RGB Protocol](https://discord.gg/rgb) if you want to discuss the protocol itself

---

## Development Setup

### Requirements

| Tool | Version | Purpose |
|------|---------|---------|
| Rust | stable (≥ 1.75) | Backend |
| Node.js | 18.x | Frontend |
| Docker | any recent | PostgreSQL + LND (regtest) |
| sqlx-cli | latest | DB migrations |

### Backend (Rust)

```bash
cd token4good-backend

# Install Rust if needed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Copy and configure environment
cp ../SAMPLE.env .env
# Required: DATABASE_URL, JWT_SECRET
# Optional for RGB: RGB_DATA_DIR, BITCOIN_NETWORK=regtest
# Optional for LND: LND_HOST, LND_MACAROON_PATH, LND_TLS_CERT_PATH

# Start PostgreSQL locally
docker run -d --name t4g-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=token4good \
  -p 5432:5432 postgres:15

# Run migrations
cargo install sqlx-cli --no-default-features --features postgres
DATABASE_URL=postgresql://postgres:password@localhost:5432/token4good sqlx migrate run

# Build and run
cargo run

# Verify
curl http://localhost:3000/health
```

### Frontend (Next.js)

```bash
# From repo root
cp SAMPLE.env .env
# Set: NEXT_PUBLIC_API_URL=http://localhost:3000

npm install
npx nx serve dapp
# → http://localhost:4200
```

### Running Tests

```bash
# Backend unit tests
cargo test --manifest-path token4good-backend/Cargo.toml

# Backend with logs
RUST_LOG=debug cargo test -- --nocapture

# Frontend
npx nx test dapp

# Frontend with coverage
npx nx test dapp --coverage
```

---

## How to Contribute

### 1. Fork & Clone

```bash
git clone https://github.com/<your-username>/T4G.git
cd T4G
git remote add upstream https://github.com/Feustey/T4G.git
```

### 2. Create a Branch

Use a descriptive name:

```bash
git checkout -b feat/rgb-schema-validation
git checkout -b fix/lightning-payment-timeout
git checkout -b docs/rgb-proof-lifecycle
```

### 3. Make Your Changes

- Keep commits small and focused
- Write or update tests for your changes
- Make sure `cargo test` and `npx nx test dapp` pass

### 4. Open a Pull Request

- Reference the related issue: `Closes #42`
- Describe **what** you changed and **why**
- Include screenshots for UI changes
- A maintainer will review within a few days

---

## Areas Needing Help

### RGB Protocol (Rust)
> Requires familiarity with `rgbstd`, `bpcore`, or `rgb-lib`

- **[help-wanted]** Implement RGB transfers over BOLT12 offers
- **[help-wanted]** Add multi-schema support (code review proofs, documentation proofs)
- **[good-first-issue]** Write unit tests for `rgb.rs` contract creation
- **[good-first-issue]** Add a `verify_proof` endpoint that performs full client-side RGB validation
- **[discussion]** Evaluate migration from CLI-based RGB to `rgb-lib` for embedded use

### Lightning Network (Rust)
> Requires familiarity with LND REST API or BOLT specs

- **[help-wanted]** Improve payment reliability (retry logic, timeout handling)
- **[good-first-issue]** Add integration tests for `lightning.rs` with a mock LND
- **[good-first-issue]** Add BOLT11 invoice expiry handling

### Backend (Rust / Axum)
> General Rust + web API skills

- **[good-first-issue]** Add pagination to `GET /api/proofs` endpoint
- **[good-first-issue]** Add input validation with `validator` crate
- **[help-wanted]** Improve error messages to be more descriptive for frontend clients
- **[help-wanted]** Add OpenAPI / Swagger spec generation with `utoipa`

### Frontend (React / Next.js)
> React + TypeScript skills

- **[good-first-issue]** Build a "Proof Explorer" page — display a proof by contract ID
- **[good-first-issue]** Add a proof QR code for easy sharing
- **[help-wanted]** Add i18n for the proof verification flow

### Documentation
> No coding required

- **[good-first-issue]** Write an English explainer for the RGB proof lifecycle
- **[good-first-issue]** Add JSDoc comments to frontend service functions
- **[good-first-issue]** Add Rust `///` doc comments to public service methods

---

## Pull Request Process

1. Ensure all tests pass locally before submitting
2. Keep PRs focused — one feature/fix per PR is preferred
3. Update the relevant documentation if your change affects behavior
4. PRs are reviewed by a maintainer; expect feedback within a few days
5. Once approved, a maintainer will merge

---

## Code Style

### Rust

```bash
# Format before committing
cargo fmt --manifest-path token4good-backend/Cargo.toml

# Lint
cargo clippy --manifest-path token4good-backend/Cargo.toml -- -D warnings
```

- Use `tracing::info!` / `tracing::error!` for logging, not `println!`
- Return `Result<T, AppError>` from all route handlers
- Async functions use `tokio::spawn` for background work

### TypeScript / React

```bash
# Lint
npx nx lint dapp

# Format
npx prettier --write "apps/dapp/**/*.{ts,tsx}"
```

- Use TypeScript strict mode
- Prefer named exports over default exports
- Keep components small and focused

---

## Questions?

Open an issue with the `question` label — there are no dumb questions. We are happy to explain any part of the RGB integration, the Lightning payment flow, or the overall architecture.
