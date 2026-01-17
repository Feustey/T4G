# Token4Good v2 🚀
**Modern Architecture - RGB Protocol + Lightning Network**

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-15%2F15-success)]()
[![Version](https://img.shields.io/badge/version-2.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

t4g wanted to build a platform which will enable to track and trace in a transparent and irrefutable way interactions between people, by creating a community of trust, supported by a network, issuing service counterpart by tokens (Token for Good).
An identified interaction is "rewarded" by a defined amount of token; the beneficiary then accesses a catalog of services (training, Knowledge Hub, mentoring, conferences, etc).

🔗 **Production:** https://t4g.dazno.de

---

## 🎯 Architecture v2 (Nouvelle)

```
Frontend (Vercel)          Backend (Railway)           Blockchain
─────────────────          ─────────────────           ──────────
Next.js 13          ←→     Rust + Axum         ←→     RGB Protocol
React 18                   PostgreSQL                  Lightning Network
JWT Auth                   JWT + OAuth                 Bitcoin Layer 2
```

**Stack Technique:**
- **Backend:** Rust + Axum + PostgreSQL + JWT
- **Frontend:** Next.js 13 + React 18 + TypeScript
- **Blockchain:** RGB Protocol + Lightning Network (LND)
- **Auth:** OAuth (t4g, LinkedIn, Dazno) + JWT
- **Déploiement:** Railway (backend) + Vercel (frontend)

**Améliorations v2:**
- ✅ Backend Rust performant (vs Node.js)
- ✅ RGB Protocol (vs Polygon smart contracts)
- ✅ Lightning Network (paiements instantanés)
- ✅ JWT Auth moderne (vs NextAuth)
- ✅ OAuth multi-providers
- ✅ PostgreSQL (vs MongoDB)

---

## 📚 Documentation

> **✨ Nouvelle Organisation** : Documentation réorganisée dans [`/docs/`](/docs/) pour faciliter la navigation.

| Pour... | Voir... |
|---------|---------|
| 🚀 **Démarrage rapide** | [START_HERE.md](START_HERE.md) |
| 📁 **Index documentation** | [/docs/README.md](/docs/README.md) |
| 🚢 **Déploiement** | [/docs/deployment/](/docs/deployment/) |
| 🔌 **API & Intégrations** | [/docs/api/](/docs/api/) + [/docs/integration/](/docs/integration/) |
| 🔄 **Migrations** | [/docs/migration/](/docs/migration/) |
| 📊 **Status projet** | [/docs/status/](/docs/status/) |

---

## ⚡ Quick Start

### Prérequis
```bash
# Rust (backend)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Node.js (frontend)
nvm install 18
nvm use 18

# CLI tools
npm install -g @railway/cli vercel
```

### Déploiement (5 min)
```bash
# 1. Backend (Railway)
cd token4good-backend
railway init && railway add -d postgres
./railway-deploy.sh

# 2. Frontend (Vercel)
cd ..
./deploy-vercel-v2.sh --prod

# 3. Vérifier
curl https://your-backend.railway.app/health
```

---

## 🏗️ Architecture Technique Détaillée

## Local development instructions

### Configuration / run dev

You must create a local environment in a `.env`, from the [`SAMPLE.env`](./SAMPLE.env) file in the root directory.
By default, it will use the `staging` database on GCP, and staging smart contracts on Mumbai Polygon testnet.

If you want to run all components locally:

- DB : ` docker run --name t4G -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=pass -d mongo`
- daemon: `node ./node_modules/@nrwl/cli/bin/nx serve daemon --port 3001`
- blockchain: difficult to run locally, outside scope.

To run main app (front+api):

`npm install -g nx`

`yarn`

`nx serve dapp`

### Deployment

#### Smartcontracts

T4G use Hardhat to deploy smart contract in [`/contracts`](./contracts/)

To deploy contracts (default to Bitcoin testnet): `npx hardhat run contracts/scripts/deploy.ts`
_(smart contracts address are automatically added to `.env`)_

#### DB

DB is MongoDB, a NoSQL database that update schema automatically, no need to deploy.

#### Daemon

(first time you will have to login **token4good** project on GCP with `gcloud auth login` & `gcloud auth configure-docker`)

**build, publish & restart container (staging & prod)**
**(staging)**

```
docker build -t eu.gcr.io/token4good/t4g-daemon:staging -f apps/daemon/Dockerfile . && \
docker push eu.gcr.io/token4good/t4g-daemon:staging && \
gcloud compute instances update-container daemon-staging --project=token4good
```

**(prod)**

```
docker build -t eu.gcr.io/token4good/t4g-daemon:prod -f apps/daemon/Dockerfile . && \
docker push eu.gcr.io/token4good/t4g-daemon:prod && \
gcloud compute instances update-container daemon --project=token4good
```

#### Front/API

just push code to Github :

- (staging) `dev` branch
- (prod) `main` branch

Vercel will deploy automatically new code to :

- (staging) https://t4-g-git-dev-t4-g.vercel.app/?debug
- (prod) https://token-for-good.com/

### Authentication

authorised domains (dev/staging):

- http://localhost
- https://t4-g-git-dev-t4-g.vercel.app/

authorised domains (prod):

- https://token-for-good.com/
- https://t4-g-iota.vercel.app/
- https://t4-g-t4-g.vercel.app/

Test user for Audendia testweb login: aencia@t4g.com / Mode20182018
