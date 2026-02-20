# Token4Good (T4G)

**Proof-of-Impact tokens on Bitcoin using RGB Protocol + Lightning Network**

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Backend](https://img.shields.io/badge/backend-Rust%20%2B%20Axum-orange)]()
[![RGB](https://img.shields.io/badge/protocol-RGB-purple)]()
[![Lightning](https://img.shields.io/badge/payments-Lightning%20Network-yellow)]()

> Token4Good is a community trust platform that **tokenizes peer interactions as verifiable proofs on the RGB Protocol**, settled via Lightning Network on Bitcoin. Each mentoring session, knowledge transfer, or contribution generates an immutable, transferable proof anchored on-chain.

**Production:** https://t4g.dazno.de

---

## Why RGB?

We chose RGB Protocol over Ethereum/Polygon smart contracts for three reasons:

1. **Client-side validation** — Proof verification happens locally, without trusting a blockchain node. The issuer and recipient co-validate each state transition.
2. **Confidentiality** — Only the parties involved see the proof details. The Bitcoin transaction only anchors a commitment hash.
3. **Bitcoin security** — Proofs are anchored to Bitcoin transactions, not a sidechain or L2 with different security assumptions.

Each "proof of impact" is an RGB contract: a mentor and a mentee sign off on a session, and a `MentoringProof` token is issued and transferred over Lightning (via BOLT12 / keysend).

---

## Architecture

```
┌─────────────────────┐        ┌──────────────────────────┐        ┌───────────────────┐
│   Frontend          │        │   Backend (Rust + Axum)  │        │   Bitcoin Layer   │
│   Next.js 13        │◄──────►│   PostgreSQL (Supabase)  │◄──────►│   RGB Protocol    │
│   React 18          │  REST  │   JWT + OAuth            │        │   Lightning (LND) │
│   TypeScript        │        │   RGB Service            │        │   Bitcoin mainnet │
└─────────────────────┘        └──────────────────────────┘        └───────────────────┘
       Vercel                            Railway
```

**Stack:**
- **Backend:** Rust + Axum + SQLx + PostgreSQL
- **RGB:** `rgbstd`, `bpcore`, `amplify` crates — custom `MentoringProof` schema
- **Lightning:** LND REST API (invoice creation, keysend, payment status)
- **Frontend:** Next.js 13 + React 18 + TypeScript
- **Auth:** OAuth (LinkedIn, custom t4g provider) + JWT
- **Deploy:** Railway (backend) + Vercel (frontend)

---

## RGB Implementation

The RGB logic lives in [`token4good-backend/src/services/rgb.rs`](token4good-backend/src/services/rgb.rs) and [`rgb_native.rs`](token4good-backend/src/services/rgb_native.rs).

**Proof lifecycle:**

```
1. Session agreed between mentor & mentee
       ↓
2. Backend creates RGB contract (MentoringProof schema)
   └── Anchored to a Bitcoin UTXO via OP_RETURN commitment
       ↓
3. Lightning invoice generated for the session fee
   └── LND REST API → payment_request
       ↓
4. On payment confirmation → RGB state transition
   └── Ownership transferred from issuer to mentee
       ↓
5. Proof stored in PostgreSQL + RGB data dir
   └── Verifiable by any party with the contract ID
```

**Key types:**
```rust
// MentoringProof RGB contract schema
const MENTORING_SCHEMA_NAME: &str = "MentoringProof";
const MENTORING_TICKER: &str    = "T4G-PROOF";

pub struct ProofMetadata {
    pub mentor_id:        String,
    pub mentee_id:        String,
    pub session_topic:    String,
    pub duration_minutes: u32,
    pub impact_score:     f64,
    pub timestamp:        String,
}
```

---

## Quick Start (Local Development)

### Prerequisites

```bash
# Rust (stable)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Node.js 18
nvm install 18 && nvm use 18

# Docker (for PostgreSQL + LND in regtest)
# https://docs.docker.com/get-docker/
```

### Backend

```bash
cd token4good-backend

# 1. Copy environment template
cp ../.env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET, BITCOIN_NETWORK=regtest

# 2. Start local database
docker-compose up -d postgres

# 3. Run migrations
cargo install sqlx-cli
sqlx migrate run

# 4. Start backend
cargo run

# 5. Health check
curl http://localhost:3000/health
```

### Frontend

```bash
# From repo root
cp SAMPLE.env .env
# Edit .env: set NEXT_PUBLIC_API_URL=http://localhost:3000

npm install
npx nx serve dapp
# → http://localhost:4200
```

### Run Tests

```bash
# Backend (Rust)
cargo test --manifest-path token4good-backend/Cargo.toml

# Frontend (Jest)
npx nx test dapp
```

---

## API Overview

Full reference: [`token4good-backend/README.md`](token4good-backend/README.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Multi-provider login → JWT |
| `GET` | `/api/users/me` | Authenticated user profile |
| `POST` | `/api/proofs` | Create RGB proof contract |
| `GET` | `/api/proofs/:id/verify` | Verify proof (client-side RGB validation) |
| `POST` | `/api/proofs/:id/transfer` | Transfer proof via Lightning |
| `POST` | `/api/lightning/invoice` | Create LND invoice |
| `GET` | `/api/lightning/payment/:hash/status` | Check payment status |
| `GET` | `/health` | Service health (DB + RGB + LND) |

---

## Project Structure

```
T4G/
├── token4good-backend/     # Rust backend
│   ├── src/
│   │   ├── routes/         # Axum route handlers
│   │   ├── services/
│   │   │   ├── rgb.rs          # RGB proof contracts
│   │   │   ├── rgb_native.rs   # Low-level RGB operations
│   │   │   ├── lightning.rs    # LND REST integration
│   │   │   └── database.rs     # SQLx PostgreSQL
│   │   ├── models/         # Rust data structures
│   │   └── middleware/     # JWT auth, CORS
│   └── migrations/         # PostgreSQL schema
├── apps/dapp/              # Next.js 13 frontend
│   ├── pages/              # Next.js pages + API routes
│   ├── components/         # React components
│   └── services/           # API client
├── docs/                   # Documentation
└── CONTRIBUTING.md         # How to contribute
```

---

## Roadmap

- [x] RGB `MentoringProof` schema and contract creation
- [x] Lightning Network invoice + payment flow
- [x] PostgreSQL storage with full proof history
- [x] OAuth authentication (LinkedIn, t4g)
- [x] Production deployment (Railway + Vercel)
- [ ] **RGB transfers over BOLT12** (help wanted — see [#issues](https://github.com/Feustey/T4G/issues))
- [ ] **RGB schema validation tests** (good first issue)
- [ ] Multi-language RGB proof schemas (code review, documentation, support)
- [ ] RGB proof explorer (public verification UI)
- [ ] Mobile-friendly proof wallet

---

## Contributing

We are actively looking for contributors familiar with:

- **RGB Protocol** (rgb-lib, rgbstd) — help improve proof schema and validation
- **Rust async** (Axum, Tokio) — help with performance and testing
- **Lightning Network** (LND, BOLT specs) — help with payment reliability
- **React / Next.js** — help build the proof explorer UI

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for details.

**Join the conversation:**
- Open an [Issue](https://github.com/Feustey/T4G/issues) to ask questions or propose changes
- RGB community: [Discord RGB Protocol](https://discord.gg/rgb)
- Bitcoin devs: [Stacker News](https://stacker.news) | [Delving Bitcoin](https://delvingbitcoin.org)

---

## License

[MIT](LICENSE)

---

## Acknowledgements

Built on top of:
- [RGB Protocol](https://rgb.tech) by Maxim Orlovsky / LNP/BP Standards Association
- [Axum](https://github.com/tokio-rs/axum) web framework
- [LND](https://github.com/lightningnetwork/lnd) by Lightning Labs
- [Next.js](https://nextjs.org) by Vercel
