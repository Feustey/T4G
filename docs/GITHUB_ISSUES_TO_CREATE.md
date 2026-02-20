# GitHub Issues à créer

Aller sur : https://github.com/Feustey/T4G/issues/new

Créer les issues suivantes une par une. Les labels à créer d'abord : `good-first-issue`, `help-wanted`, `question`, `discussion`, `rgb`, `lightning`, `rust`, `frontend`, `documentation`.

---

## Issue 1 — `good-first-issue` `rust` `rgb`

**Title:** Write unit tests for RGB contract creation (`rgb.rs`)

**Body:**
```
## Context

The RGB proof contract creation logic is in `token4good-backend/src/services/rgb.rs`.
Currently there are no unit tests for this service.

## Task

Add `#[tokio::test]` tests for:
- `RGBService::new()` initializes correctly with a temp data dir
- `create_mentoring_proof()` returns a valid `ContractId`
- `verify_proof()` returns `true` for a contract that was just created
- Error cases: missing data dir, invalid metadata

## Why this matters

RGB client-side validation is the core value proposition of the project.
Tests ensure we don't silently break proof issuance.

## Useful context

- RGB crates used: `rgbstd`, `bpcore`, `amplify`
- Test pattern used in the codebase: `#[tokio::test]` async functions
- Run with: `cargo test --manifest-path token4good-backend/Cargo.toml`

## Difficulty

Beginner Rust — copy existing test patterns, no RGB protocol knowledge required.
```

---

## Issue 2 — `good-first-issue` `rust`

**Title:** Add pagination to `GET /api/proofs` endpoint

**Body:**
```
## Context

The `GET /api/proofs` endpoint currently returns all proofs for the authenticated user.
As usage grows, this will become slow and expensive.

## Task

Add `?page=1&limit=20` query parameters to `GET /api/proofs`:
- Default: `limit=20`, `page=1`
- Max limit: 100
- Return total count in response: `{ "data": [...], "total": 42, "page": 1, "limit": 20 }`

## Files to modify

- `token4good-backend/src/routes/proofs.rs` — add query param extraction
- `token4good-backend/src/services/database.rs` — add `LIMIT` / `OFFSET` to SQL query
- Update the response struct in `token4good-backend/src/models/`

## Difficulty

Beginner Rust + SQL — no blockchain knowledge required.
```

---

## Issue 3 — `good-first-issue` `documentation`

**Title:** Add `///` doc comments to all public methods in `rgb.rs` and `lightning.rs`

**Body:**
```
## Context

The two core services (`rgb.rs`, `lightning.rs`) lack Rust doc comments on their public methods.
This makes it hard for new contributors to understand what each function does.

## Task

Add `///` doc comments to all `pub` functions in:
- `token4good-backend/src/services/rgb.rs`
- `token4good-backend/src/services/lightning.rs`

Each comment should explain:
- What the function does
- Key parameters
- What it returns / what errors it can produce

Then run `cargo doc --open` to verify the docs render correctly.

## Difficulty

Beginner — read the code, write plain English explanations. No Rust expertise needed.
```

---

## Issue 4 — `good-first-issue` `frontend`

**Title:** Build a "Proof Explorer" page — display any RGB proof by contract ID

**Body:**
```
## Context

Token4Good issues RGB proof contracts that are publicly verifiable.
We want a simple page at `/proof/[id]` where anyone can paste a contract ID
and see the proof details (mentor, mentee, topic, timestamp, verification status).

## Task

Create `apps/dapp/pages/proof/[id].tsx` that:
1. Calls `GET /api/proofs/:id` with the contract ID from the URL
2. Displays: mentor name, mentee name, session topic, date, impact score
3. Shows a "Verified" / "Unverified" badge based on `GET /api/proofs/:id/verify`
4. Works without authentication (public page)

## Design reference

Follow the existing component style in `apps/dapp/components/`.
Use Tailwind CSS classes already present in the project.

## Difficulty

Beginner React + Next.js — no blockchain knowledge required.
```

---

## Issue 5 — `help-wanted` `rgb` `rust`

**Title:** Implement RGB proof transfers over BOLT12 offers

**Body:**
```
## Context

Currently, RGB proof transfers are initiated after a Lightning BOLT11 invoice is paid.
We want to explore using BOLT12 offers for a better UX:
- Reusable payment codes (no need to generate a new invoice per session)
- Better privacy (blinded paths)

## Task

Research and prototype:
1. Generate a BOLT12 offer in LND (`lncli offer`)
2. Associate an RGB state transition with offer fulfillment
3. Update `token4good-backend/src/services/lightning.rs` with BOLT12 support
4. Document the flow with a sequence diagram

## References

- LND BOLT12 support: https://docs.lightning.engineering/lightning-network-tools/lnd/bolt12
- RGB + Lightning: https://rgb.tech/power/lightning/
- Current LND integration: `token4good-backend/src/services/lightning.rs`

## Difficulty

Advanced — requires knowledge of Lightning Network (BOLT12) and ideally RGB.
Please comment on this issue before starting so we can coordinate.
```

---

## Issue 6 — `help-wanted` `rust`

**Title:** Add OpenAPI spec generation with `utoipa`

**Body:**
```
## Context

Token4Good has ~15 API endpoints but no machine-readable spec.
This makes integration harder for external developers and the Dazno team.

## Task

Add `utoipa` to generate an OpenAPI 3.0 spec from the Axum route handlers:
1. Add `utoipa` + `utoipa-swagger-ui` to `Cargo.toml`
2. Annotate route handlers with `#[utoipa::path(...)]`
3. Expose `/api/docs` (Swagger UI) and `/api/openapi.json`
4. Cover at minimum: auth, proofs, lightning, users endpoints

## References

- utoipa: https://github.com/juhaku/utoipa
- Example with Axum: https://github.com/juhaku/utoipa/tree/master/examples/axum-utoipa

## Difficulty

Intermediate Rust — requires understanding of Axum extractors and response types.
```

---

## Issue 7 — `discussion` `rgb`

**Title:** RFC: Migrate from CLI-based RGB to embedded `rgb-lib`

**Body:**
```
## Background

Currently `token4good-backend/src/services/rgb.rs` uses `rgbstd` and `bpcore` crates
with some CLI subprocess calls (`rgb-cli`). This works but has limitations:
- CLI calls are slow and fragile
- Hard to unit test
- Dependency on external `rgb-cli` binary

## Proposal

Evaluate migrating to `rgb-lib` (https://github.com/RGB-WG/rgb-lib) which provides
a higher-level Rust API for contract creation, state transitions, and validation — 
without subprocess calls.

## Questions for discussion

1. Does `rgb-lib` support the `MentoringProof` custom schema we use?
2. What would the migration effort look like?
3. Are there known limitations of `rgb-lib` for production use?

Anyone with experience using `rgb-lib` in production is very welcome to comment!

## References

- rgb-lib: https://github.com/RGB-WG/rgb-lib
- Our current RGB service: `token4good-backend/src/services/rgb.rs`
- RGB Discord: https://discord.gg/rgb
```

---

## Labels to create on GitHub

Go to: https://github.com/Feustey/T4G/labels

| Label | Color | Description |
|-------|-------|-------------|
| `good-first-issue` | `#7057ff` | Good for newcomers |
| `help-wanted` | `#008672` | Extra attention is needed |
| `rgb` | `#6f2da8` | Related to RGB Protocol |
| `lightning` | `#f9c23c` | Related to Lightning Network |
| `rust` | `#ce4a10` | Backend Rust code |
| `frontend` | `#0075ca` | Next.js / React |
| `documentation` | `#0075ca` | Documentation improvements |
| `discussion` | `#e4e669` | RFC / architectural discussion |
| `question` | `#d876e3` | Further information requested |
