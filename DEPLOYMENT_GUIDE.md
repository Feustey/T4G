# Token4Good v2 - Production Deployment Guide

**Date:** 2025-10-12
**Target Date:** 2025-10-28
**Environments:** Hostinger VPS (Backend + Frontend) | Alternative: Railway + Vercel

---

## 🎯 Architecture Actuelle - Hostinger VPS

> ⚠️ **Infrastructure Recommandée**: Nous utilisons actuellement un VPS Hostinger pour héberger l'ensemble de la stack.
> Pour le déploiement sur Hostinger, consultez: **[HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)**

```
┌──────────────────────────────────────────────┐
│  Serveur Hostinger VPS (147.79.101.32)       │
│  Domaine: t4g.dazno.de                       │
├──────────────────────────────────────────────┤
│                                              │
│  Nginx (80/443) → Backend Rust (3001)       │
│                   ↓                          │
│                   PostgreSQL (5432)          │
│                   ↓                          │
│                   LND + Bitcoin Core         │
│  Frontend (Static Next.js)                  │
│                                              │
└──────────────────────────────────────────────┘
```

### 🚀 Déploiement Rapide (Hostinger)

```bash
# Installation automatique complète
./scripts/deploy-hostinger.sh full

# Voir le guide rapide
cat QUICKSTART_HOSTINGER.md
```

---

## 📖 Autres Options de Déploiement

Ce document couvre également les déploiements alternatifs:
- **Railway** (Backend managé)
- **Vercel** (Frontend avec Edge Functions)

Pour la production Token4Good, **utilisez Hostinger** (ci-dessus).

---

## 🎯 Architecture Alternative - Railway + Vercel

```
┌─────────────────┐
│   Dazno.de      │
│  (Entry Point)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│   t4g.dazno.de (Vercel)     │
│   - Next.js Frontend        │
│   - Static Assets           │
│   - SSR Pages               │
└────────┬────────────────────┘
         │ Proxy /api/*
         ▼
┌─────────────────────────────┐
│   Railway Backend           │
│   - Rust Axum API           │
│   - RGB Proofs              │
│   - Lightning Network       │
└────────┬────────────────────┘
         │
         ├──────┬──────┬──────┐
         ▼      ▼      ▼      ▼
   ┌─────────┐ ┌─────┐ ┌────┐ ┌──────┐
   │Supabase │ │ LND │ │BTC │ │Dazno │
   │PostgreSQL│ │     │ │Core│ │ API  │
   └─────────┘ └─────┘ └────┘ └──────┘
```

---

## 📦 Phase 1: Backend Deployment (Railway)

### 1.1 Prérequis

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Vérifier l'installation
railway --version
```

### 1.2 Créer le Projet Railway

```bash
cd /Users/feustey/DAZ/T4G/RGB/token4good-backend

# Initialiser le projet
railway init

# Lier au projet existant (si déjà créé sur dashboard)
railway link

# Ou créer un nouveau projet
railway init --name token4good-backend
```

### 1.3 Configurer les Variables d'Environnement

**Via Railway Dashboard:** https://railway.app/project/token4good-backend/variables

```bash
# Database
DATABASE_URL=postgresql://postgres:<PASSWORD>@db.glikbylflheewbonytev.supabase.co:5432/postgres

# JWT
JWT_SECRET=<GENERATE_WITH: openssl rand -base64 64>
JWT_EXPIRY_HOURS=24

# Bitcoin & RGB
BITCOIN_NETWORK=mainnet
BITCOIN_RPC_URL=http://<BTC_USER>:<BTC_PASS>@<BTC_HOST>:8332
RGB_DATA_DIR=/data/rgb

# Lightning Network
LND_HOST=<LND_HOST>
LND_PORT=10009
LND_MACAROON_PATH=/secrets/lnd/admin.macaroon
LND_TLS_CERT_PATH=/secrets/lnd/tls.cert

# Dazno Integration
DAZNO_LIGHTNING_API_URL=https://api.dazno.de
DAZNO_USERS_API_URL=https://dazno.de/api
DAZNO_API_KEY=<DAZNO_API_KEY>

# Server
PORT=3000
RUST_LOG=info

# URLs
NEXTAUTH_URL=https://t4g.dazno.de
```

**Via CLI:**

```bash
# Ajouter une variable
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="$(openssl rand -base64 64)"
railway variables set RGB_DATA_DIR="/data/rgb"

# Lister les variables
railway variables list

# Importer depuis .env
railway variables set --from-env-file .env.production
```

### 1.4 Configurer les Volumes (Persistent Storage)

**Dashboard Railway:**
1. Aller dans **Settings** → **Volumes**
2. Créer un volume: `/data/rgb` (10GB)
3. Créer un volume: `/secrets/lnd` (1GB)

**Via CLI:**

```bash
railway volume create --name rgb-data --mount-path /data/rgb
railway volume create --name lnd-secrets --mount-path /secrets/lnd
```

### 1.5 Déployer le Backend

```bash
# Build et déploiement
railway up

# Suivre les logs en temps réel
railway logs --follow

# Vérifier le déploiement
railway status
```

**URL générée:** `https://token4good-backend-production.up.railway.app`

### 1.6 Tester le Déploiement

```bash
# Health check
curl https://token4good-backend-production.up.railway.app/health

# Test Lightning
curl https://token4good-backend-production.up.railway.app/api/lightning/node/info

# Test authentification
curl -X POST https://token4good-backend-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🌐 Phase 2: Frontend Deployment (Vercel)

### 2.1 Connecter le Repository GitHub

1. Aller sur https://vercel.com/new
2. Importer le repository: `github.com/your-org/T4G`
3. Sélectionner le framework: **Next.js**
4. Root Directory: `apps/dapp`
5. Build Command: `npm run build`
6. Output Directory: `.next`

### 2.2 Configurer les Variables d'Environnement

**Vercel Dashboard:** Project Settings → Environment Variables

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://token4good-backend-production.up.railway.app

# NextAuth
NEXTAUTH_URL=https://t4g.dazno.de
NEXTAUTH_SECRET=<GENERATE_WITH: openssl rand -base64 64>

# t4g SSO
AUTH_URL=https://login.re7.t4g.com
CLIENT_ID=token4good
CLIENT_SECRET=<t4g_CLIENT_SECRET>

# Dazno Integration
NEXT_PUBLIC_DAZNO_API_URL=https://api.dazno.de
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://dazno.de/api

# Database (pour migrations only)
DATABASE_URL=postgresql://postgres:<PASSWORD>@db.glikbylflheewbonytev.supabase.co:5432/postgres

# Feature Flags
FAKE_AUTH=false
SENTRY_IGNORE=false
```

**Via Vercel CLI:**

```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login

# Lier le projet
vercel link

# Ajouter des variables
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXTAUTH_SECRET production

# Lister les variables
vercel env ls
```

### 2.3 Configurer le Domaine Personnalisé

#### Option A: Via Dashboard Vercel

1. Aller dans **Settings** → **Domains**
2. Ajouter: `t4g.dazno.de`
3. Vercel fournira un enregistrement CNAME

#### Option B: Via CLI

```bash
vercel domains add t4g.dazno.de
```

#### Configuration DNS (chez le registrar)

Ajouter l'enregistrement CNAME:

```
Type: CNAME
Name: t4g
Value: cname.vercel-dns.com
TTL: 3600
```

**Vérifier la propagation DNS:**

```bash
dig t4g.dazno.de +short
nslookup t4g.dazno.de

# Attendre jusqu'à voir l'IP de Vercel
```

### 2.4 Déployer le Frontend

```bash
cd /Users/feustey/DAZ/T4G/RGB

# Déploiement production
vercel --prod

# Ou push vers la branche main (déploiement automatique)
git push origin main
```

**URL de production:** `https://t4g.dazno.de`

### 2.5 Configurer les Redirections (vercel.json)

Vérifier que `/api/*` est proxifié vers Railway:

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://token4good-backend-production.up.railway.app/api/$1"
    }
  ]
}
```

---

## 🔧 Phase 3: Services Externes

### 3.1 Bitcoin Core Setup (VPS Dédié)

**Option A: Infomaniak VPS**

```bash
# SSH vers le VPS
ssh root@<VPS_IP>

# Installer Bitcoin Core
wget https://bitcoincore.org/bin/bitcoin-core-27.0/bitcoin-27.0-x86_64-linux-gnu.tar.gz
tar -xzf bitcoin-27.0-x86_64-linux-gnu.tar.gz
sudo install -m 0755 -o root -g root -t /usr/local/bin bitcoin-27.0/bin/*

# Configurer bitcoin.conf
mkdir -p ~/.bitcoin
cat > ~/.bitcoin/bitcoin.conf <<EOF
server=1
rpcuser=bitcoinrpc
rpcpassword=$(openssl rand -base64 32)
rpcallowip=0.0.0.0/0
rpcbind=0.0.0.0
zmqpubrawblock=tcp://0.0.0.0:28332
zmqpubrawtx=tcp://0.0.0.0:28333
txindex=1

# Mainnet
chain=main

# Testnet (pour tests)
# testnet=1
EOF

# Démarrer Bitcoin Core
bitcoind -daemon

# Vérifier
bitcoin-cli getblockchaininfo
```

**Option B: Utiliser un Service Managé**

- **Blockstream Esplora:** https://blockstream.info/api
- **Alchemy Bitcoin:** https://www.alchemy.com/bitcoin
- **QuickNode:** https://www.quicknode.com/

### 3.2 Lightning Network (LND) Setup

```bash
# Installer LND
wget https://github.com/lightningnetwork/lnd/releases/download/v0.17.4-beta/lnd-linux-amd64-v0.17.4-beta.tar.gz
tar -xzf lnd-linux-amd64-v0.17.4-beta.tar.gz
sudo install -m 0755 -o root -g root -t /usr/local/bin lnd-linux-amd64-v0.17.4-beta/*

# Configurer lnd.conf
mkdir -p ~/.lnd
cat > ~/.lnd/lnd.conf <<EOF
[Application Options]
alias=Token4Good-LND
listen=0.0.0.0:9735
rpclisten=0.0.0.0:10009
restlisten=0.0.0.0:8080

[Bitcoin]
bitcoin.active=1
bitcoin.mainnet=1
bitcoin.node=bitcoind

[Bitcoind]
bitcoind.rpchost=localhost:8332
bitcoind.rpcuser=bitcoinrpc
bitcoind.rpcpass=<PASSWORD_FROM_BITCOIN_CONF>
bitcoind.zmqpubrawblock=tcp://localhost:28332
bitcoind.zmqpubrawtx=tcp://localhost:28333
EOF

# Démarrer LND
lnd

# Créer un wallet
lncli create

# Générer une adresse pour financer le wallet
lncli newaddress p2wkh

# Vérifier le statut
lncli getinfo
```

**Copier les credentials vers Railway:**

```bash
# Depuis le VPS
cat ~/.lnd/data/chain/bitcoin/mainnet/admin.macaroon | base64

# Upload vers Railway Volume
railway volume mount lnd-secrets
# Puis copier admin.macaroon et tls.cert dans /secrets/lnd/
```

### 3.3 Supabase PostgreSQL (Déjà Configuré)

**Vérifier la connexion:**

```bash
psql $DATABASE_URL -c "SELECT version();"
```

**Exécuter les migrations:**

```bash
cd token4good-backend
sqlx migrate run --database-url $DATABASE_URL
```

---

## 🧪 Phase 4: Tests Production

### 4.1 Smoke Tests

```bash
# Backend Health
curl https://token4good-backend-production.up.railway.app/health

# Frontend Load
curl https://t4g.dazno.de

# API via Frontend Proxy
curl https://t4g.dazno.de/api/users \
  -H "Authorization: Bearer $JWT_TOKEN"

# Lightning Node
curl https://token4good-backend-production.up.railway.app/api/lightning/node/info
```

### 4.2 End-to-End Tests

```typescript
// tests/e2e/production.test.ts

describe('Production E2E Tests', () => {
  const API_URL = 'https://token4good-backend-production.up.railway.app';
  const FRONTEND_URL = 'https://t4g.dazno.de';

  it('should authenticate user', async () => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.token).toBeDefined();
  });

  it('should create mentoring request', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/api/mentoring/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Test Request',
        description: 'Test Description',
        mentee_id: 'user123',
      }),
    });

    expect(response.status).toBe(201);
  });

  it('should create RGB proof', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/api/proofs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        request_id: 'req123',
        mentor_id: 'mentor123',
        mentee_id: 'mentee123',
        rating: 5,
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.proof.contract_id).toBeDefined();
  });

  it('should create Lightning invoice', async () => {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/api/lightning/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount_msat: 10000,
        description: 'Test invoice',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.payment_request).toBeDefined();
  });
});
```

**Exécuter les tests:**

```bash
npm run test:e2e:production
```

---

## 📊 Phase 5: Monitoring & Alerting

### 5.1 Railway Metrics

**Dashboard:** https://railway.app/project/token4good-backend/metrics

Métriques suivies:
- CPU Usage
- Memory Usage
- Network I/O
- Disk Usage
- Request Count
- Response Time

### 5.2 Logs Centralisés

```bash
# Railway logs
railway logs --follow

# Filtrer par niveau
railway logs --level error

# Export logs
railway logs --json > production-logs.json
```

### 5.3 Alerting (Railway Webhooks → Slack)

**Configurer les webhooks:**

1. Railway Dashboard → Settings → Webhooks
2. URL: `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`
3. Events: `deployment.failed`, `service.crashed`

**Slack notification format:**

```json
{
  "text": "🚨 Token4Good Backend Crashed",
  "attachments": [
    {
      "color": "danger",
      "fields": [
        {"title": "Service", "value": "token4good-backend", "short": true},
        {"title": "Status", "value": "Crashed", "short": true},
        {"title": "Time", "value": "2025-10-28 14:30:00", "short": false}
      ]
    }
  ]
}
```

### 5.4 Uptime Monitoring

**Utiliser UptimeRobot ou Pingdom:**

```bash
# Endpoints à monitorer
https://token4good-backend-production.up.railway.app/health
https://t4g.dazno.de
https://t4g.dazno.de/api/health

# Fréquence: 1 minute
# Alertes: Email + Slack après 2 échecs consécutifs
```

---

## 🔄 Phase 6: CI/CD Pipeline

### 6.1 GitHub Actions (Backend)

```yaml
# .github/workflows/deploy-backend.yml

name: Deploy Backend to Railway

on:
  push:
    branches: [main]
    paths:
      - 'token4good-backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          cd token4good-backend
          railway up --detach

      - name: Health Check
        run: |
          sleep 30
          curl -f https://token4good-backend-production.up.railway.app/health
```

### 6.2 GitHub Actions (Frontend)

```yaml
# .github/workflows/deploy-frontend.yml

name: Deploy Frontend to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'apps/dapp/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: apps/dapp
```

---

## 🚨 Phase 7: Rollback Procedures

### 7.1 Rollback Backend (Railway)

```bash
# Lister les déploiements
railway deployments list

# Rollback vers déploiement précédent
railway deployment rollback <DEPLOYMENT_ID>

# Vérifier
railway logs --follow
curl https://token4good-backend-production.up.railway.app/health
```

### 7.2 Rollback Frontend (Vercel)

**Via Dashboard:**
1. Deployments → Sélectionner déploiement précédent
2. ⋮ Menu → Promote to Production

**Via CLI:**

```bash
vercel rollback
```

---

## 📋 Pre-Launch Checklist

### Backend (Railway)
- [ ] Toutes les variables d'environnement configurées
- [ ] Volumes persistants créés (/data/rgb, /secrets/lnd)
- [ ] Health check retourne 200
- [ ] Bitcoin Core synchronisé
- [ ] LND opérationnel avec channels ouverts
- [ ] Supabase accessible
- [ ] Tests E2E passent à 100%
- [ ] Logs structurés (JSON)
- [ ] Monitoring actif

### Frontend (Vercel)
- [ ] DNS `t4g.dazno.de` configuré et propagé
- [ ] Variables d'environnement production
- [ ] Proxification `/api/*` vers Railway
- [ ] NextAuth fonctionnel
- [ ] Build production sans erreurs
- [ ] SSR/SSG pages optimisées
- [ ] Analytics configuré
- [ ] Erreurs capturées (Sentry)

### Services Externes
- [ ] Dazno API key valide
- [ ] t4g SSO configuré
- [ ] LinkedIn OAuth configuré
- [ ] Email SMTP fonctionnel

### Security
- [ ] HTTPS obligatoire (tous endpoints)
- [ ] Secrets rotated dans les 30 derniers jours
- [ ] Rate limiting actif
- [ ] CORS configuré correctement
- [ ] Headers sécurité (CSP, HSTS, etc.)

---

## 📞 Support & Escalation

| Niveau | Contact | Response Time |
|--------|---------|---------------|
| L1 - Monitoring Alert | Slack #alerts | Immediate |
| L2 - Service Down | DevOps On-Call | 15 minutes |
| L3 - Data Loss / Security | CTO | Immediate |

**Emergency Contacts:**
- DevOps: devops@token-for-good.com
- Security: security@token-for-good.com
- Dazno Support: support@dazno.de
- Railway Support: https://railway.app/help

---

**Dernière mise à jour:** 2025-09-30
**Responsable:** Claude Code
**Go-Live Target:** 2025-10-28