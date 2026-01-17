# Token4Good v2 - Production Deployment Guide
**Version:** 2.0.0
**Date:** 2025-10-01

---

## 🎯 Architecture de Production

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Frontend       │────────▶│  Backend Rust    │────────▶│  PostgreSQL     │
│  (Vercel)       │  HTTPS  │  (Railway)       │         │  (Railway)      │
│  Next.js 13     │         │  Axum + JWT      │         │                 │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │
        │                            │
        │                            ▼
        │                   ┌──────────────────┐
        │                   │                  │
        └──────────────────▶│  Lightning (LND) │
          OAuth Callbacks   │  + RGB Protocol  │
                            │                  │
                            └──────────────────┘
```

---

## 📦 Composants

### 1. Backend Rust (Railway)
- **Framework:** Axum 0.6
- **Base de données:** PostgreSQL 16
- **Authentification:** JWT
- **Blockchain:** RGB Protocol + Lightning Network

### 2. Frontend Next.js (Vercel)
- **Framework:** Next.js 13
- **Déploiement:** Vercel (Edge Functions)
- **API Proxy:** Vercel Rewrites → Railway Backend

### 3. Base de données (Railway PostgreSQL)
- **Version:** PostgreSQL 16
- **Storage:** Managed by Railway
- **Backups:** Automatic daily

---

## 🚀 Déploiement Backend (Railway)

### Prérequis
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login
```

### Étapes de déploiement

#### 1. Créer un nouveau projet Railway
```bash
cd token4good-backend
railway init
railway link
```

#### 2. Configurer PostgreSQL
```bash
railway add -d postgres
```

Cela créera automatiquement la variable `DATABASE_URL`.

#### 3. Configurer les variables d'environnement

Dans le dashboard Railway (`railway open`), ajouter:

```bash
# JWT
JWT_SECRET=<générer-avec-openssl-rand-base64-32>
JWT_EXPIRATION_HOURS=24

# RGB
RGB_DATA_DIR=/app/rgb_data
RGB_NETWORK=mainnet

# Lightning Network
LND_REST_HOST=https://your-lnd-node.com:8080
LND_MACAROON_PATH=<base64-encoded-macaroon>
LND_TLS_CERT_PATH=<base64-encoded-cert>

# Dazno
DAZNO_API_URL=https://dazno.de

# Server
HOST=0.0.0.0
PORT=3000
RUST_LOG=info,token4good_backend=debug

# CORS
ALLOWED_ORIGINS=https://token4good.vercel.app,https://t4g.dazno.de
```

#### 4. Déployer
```bash
./railway-deploy.sh
```

Ou manuellement:
```bash
railway up
```

#### 5. Obtenir l'URL du backend
```bash
railway domain
# Exemple: token4good-backend-production.up.railway.app
```

---

## 🌐 Déploiement Frontend (Vercel)

### Prérequis
```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login
```

### Étapes de déploiement

#### 1. Configurer vercel.json

Mettre à jour `vercel.json` avec l'URL Railway:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR-BACKEND.up.railway.app/api/$1"
    }
  ]
}
```

#### 2. Configurer les variables d'environnement

Dans le dashboard Vercel, ajouter:

```bash
# Backend
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_URL=https://token4good.vercel.app

# t4g OAuth
CLIENT_ID=your_t4g_client_id
CLIENT_SECRET=your_t4g_client_secret
AUTH_URL=https://oauth.t4g.com

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Dazno
NEXT_PUBLIC_DAZNO_VERIFY_URL=https://dazno.de/api/auth/verify-session

# NextAuth (Legacy - transition)
NEXTAUTH_SECRET=<générer-nouveau-secret>
NEXTAUTH_URL=https://token4good.vercel.app

# Analytics
NEXT_PUBLIC_GTM_ID=GTM-NCQWLBN
```

#### 3. Déployer

```bash
# Preview deployment
./deploy-vercel-v2.sh

# Production deployment
./deploy-vercel-v2.sh --prod
```

Ou manuellement:
```bash
vercel --prod
```

---

## 🔧 Configuration DNS

### Sous-domaine t4g.dazno.de

Dans votre DNS provider (Cloudflare, etc.):

```
Type: CNAME
Name: t4g
Value: cname.vercel-dns.com
TTL: Auto
```

Puis dans Vercel:
```bash
vercel domains add t4g.dazno.de
```

---

## ✅ Vérification du Déploiement

### 1. Backend Health Check
```bash
curl https://your-backend.railway.app/health
```

Réponse attendue:
```json
{
  "status": "healthy",
  "database": true,
  "lightning": true,
  "rgb": true,
  "timestamp": "2025-10-01T12:00:00Z"
}
```

### 2. Frontend Health Check
```bash
curl https://token4good.vercel.app/api/health
```

Devrait proxy vers le backend et retourner la même réponse.

### 3. Test OAuth Flow

1. Accéder à `https://token4good.vercel.app/login-v2`
2. Cliquer "Login with LinkedIn"
3. Vérifier la redirection OAuth
4. Vérifier le callback et l'obtention du JWT

### 4. Script de test automatique
```bash
cd token4good-backend
./test-health.sh https://your-backend.railway.app
```

---

## 📊 Monitoring & Logs

### Railway Logs
```bash
railway logs
```

Ou dans le dashboard: `railway open` → Logs tab

### Vercel Logs
```bash
vercel logs
```

Ou dans le dashboard: https://vercel.com/dashboard

### Métriques

Endpoint metrics (authentifié):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-backend.railway.app/api/metrics
```

---

## 🔐 Sécurité

### Checklist Production

- [ ] JWT_SECRET: Secret fort (32+ chars)
- [ ] DATABASE_URL: Pas hardcodé, en variable d'env
- [ ] HTTPS: Forcé sur tous les endpoints
- [ ] CORS: Limité aux domaines autorisés
- [ ] Rate Limiting: Activé (60 req/min)
- [ ] Admin Routes: Protégées par middleware admin
- [ ] OAuth Secrets: Stockés dans Vercel Secrets
- [ ] LND Macaroon: Base64 encoded, en variable d'env
- [ ] Logs: Pas de secrets loggés

### Rotation des Secrets

**JWT Secret** (tous les 90 jours):
```bash
# Générer nouveau secret
openssl rand -base64 32

# Mettre à jour Railway
railway variables set JWT_SECRET=<nouveau-secret>

# Restart
railway restart
```

**OAuth Secrets** (tous les 180 jours):
- Regénérer dans les dashboards t4g/LinkedIn
- Mettre à jour dans Vercel

---

## 🐛 Troubleshooting

### Backend ne démarre pas
```bash
# Vérifier les logs
railway logs

# Vérifier les variables
railway variables

# Vérifier la DB
railway run psql $DATABASE_URL -c "SELECT 1"
```

### Frontend ne proxy pas vers le backend
1. Vérifier `vercel.json` rewrites
2. Vérifier CORS dans backend
3. Vérifier les logs Vercel

### OAuth ne fonctionne pas
1. Vérifier les redirect URIs dans les dashboards OAuth
2. Vérifier `CLIENT_ID` et `CLIENT_SECRET`
3. Vérifier les logs des callbacks: `/api/auth/callback/*`

### JWT invalide
1. Vérifier que `JWT_SECRET` est identique backend/frontend
2. Vérifier l'expiration du token
3. Tester avec: `jwt.io`

---

## 🔄 Rollback

### Backend (Railway)
```bash
# Lister les déploiements
railway deployments

# Rollback vers version précédente
railway rollback <deployment-id>
```

### Frontend (Vercel)
```bash
# Lister les déploiements
vercel ls

# Rollback vers version précédente
vercel rollback <deployment-url>
```

---

## 📈 Scaling

### Backend (Railway)
Dans le dashboard Railway:
- Compute: Ajuster les ressources (vCPU, RAM)
- Autoscaling: Configurer min/max replicas
- Database: Upgrade plan si nécessaire

### Frontend (Vercel)
Autoscaling automatique par Vercel.

---

## 🧪 Tests E2E Production

```bash
# Backend
./token4good-backend/test-health.sh https://your-backend.railway.app

# Frontend + Proxy
curl https://token4good.vercel.app/api/health

# OAuth Flow (manuel)
# 1. Ouvrir https://token4good.vercel.app/login-v2
# 2. Tester chaque provider
# 3. Vérifier JWT dans localStorage

# Metrics (avec JWT)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://token4good.vercel.app/api/metrics
```

---

## 📞 Support

**Backend Issues:**
- Logs: `railway logs`
- Dashboard: https://railway.app/dashboard

**Frontend Issues:**
- Logs: `vercel logs`
- Dashboard: https://vercel.com/dashboard

**Database Issues:**
- Railway PostgreSQL dashboard
- Backups: Automatic daily

---

## 📝 Checklist Finale

### Avant le déploiement
- [ ] Tous les tests passent
- [ ] Variables d'environnement configurées
- [ ] Secrets rotés récemment
- [ ] DNS configuré
- [ ] HTTPS activé

### Après le déploiement
- [ ] Health checks OK
- [ ] OAuth flows testés
- [ ] Métriques accessibles
- [ ] Logs sans erreurs
- [ ] Performance acceptable (< 500ms)

### Post-déploiement
- [ ] Monitoring configuré (Sentry, etc.)
- [ ] Alertes configurées
- [ ] Documentation à jour
- [ ] Équipe notifiée

---

**Dernière mise à jour:** 2025-10-01
**Maintenu par:** Token4Good DevOps Team
**Contact:** support@token4good.com
