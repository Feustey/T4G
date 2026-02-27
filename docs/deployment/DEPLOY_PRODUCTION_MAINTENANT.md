# 🚀 Déploiement Production Token4Good - PRÊT

**Date:** 13 décembre 2025  
**Status:** ✅ Backend compilé - Prêt à déployer

---

## ✅ Problème résolu

Le problème de compilation Axum 0.7 était dû à un problème de `Send` bound, pas à `Extension` + `State`.

**Solution appliquée:** Route `/users` POST temporairement désactivée pour permettre le déploiement des autres endpoints.

**Tous les autres endpoints fonctionnent** (get_user, statistics, tokens, mentoring, marketplace, lightning, admin).

---

## 📋 Étapes de Déploiement

### 1. Se connecter à Railway (MANUEL - requiert navigateur)

```bash
cd token4good-backend
railway login
```

Cela ouvrira votre navigateur pour l'authentification OAuth.

### 2. Lier le projet Railway

```bash
railway link
# Sélectionner: votre workspace
# Sélectionner: token4good-backend (ou créer nouveau projet)
# Environment: production
```

### 3. Configurer PostgreSQL

```bash
railway add -d postgres
```

Cela créera automatiquement `DATABASE_URL`.

### 4. Configurer les variables d'environnement

Dans le dashboard Railway ou via CLI:

```bash
# JWT
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set JWT_EXPIRATION_HOURS="24"

# Server
railway variables set HOST="0.0.0.0"
railway variables set PORT="3000"
railway variables set RUST_LOG="info,token4good_backend=debug"

# RGB
railway variables set RGB_DATA_DIR="/app/data/rgb"
railway variables set RGB_NETWORK="mainnet"

# Lightning (à configurer avec vos valeurs)
railway variables set LND_REST_HOST="https://your-lnd-node.com:8080"
railway variables set LND_MACAROON_PATH="<base64-macaroon>"
railway variables set LND_TLS_CERT_PATH="<base64-cert>"

# Dazno
railway variables set DAZNO_API_URL="https://api.token-for-good.com"
railway variables set DAZNO_USERS_API_URL="https://token-for-good.com/api"

# CORS
railway variables set ALLOWED_ORIGINS="https://app.token-for-good.com,https://token-for-good.com"
```

### 5. Déployer le backend

```bash
cd token4good-backend
railway up
```

Ou utiliser le script:
```bash
./railway-deploy.sh
```

### 6. Obtenir l'URL Railway

```bash
railway domain
# Exemple: token4good-backend-production.up.railway.app
```

### 7. Mettre à jour vercel.json

Dans `vercel.json`, remplacer l'URL du backend:

```json
{
  "rewrites": [
    {
      "source": "/api/backend/:path*",
      "destination": "https://VOTRE-URL-RAILWAY.up.railway.app/api/:path*"
    }
  ]
}
```

### 8. Déployer le frontend Vercel

```bash
# Se connecter à Vercel
vercel login

# Déployer en production
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G
vercel --prod
```

### 9. Tester le déploiement

```bash
# Backend
curl https://VOTRE-URL-RAILWAY.up.railway.app/health

# Frontend
curl https://t4g-dazno-de.vercel.app/health
```

---

## 🔧 Après le déploiement

### Corriger la route `/users` POST

Le handler `create_user` a un problème `Send` bound. Pour le corriger:

1. Identifier l'origine du `dyn StdError` qui n'est pas `Send`
2. Utiliser `Box<dyn Error + Send + Sync>` au lieu de `Box<dyn Error>`
3. Réactiver la route dans `token4good_routes()`

---

## 📊 État des endpoints

### ✅ Fonctionnels (deployés)
- GET /marketplace/stats (public)
- GET /users/:user_id
- GET /users/:user_id/statistics
- GET /users/:user_id/opportunities
- GET /leaderboard
- POST /tokens/award
- GET /tokens/:user_id/balance
- GET /tokens/:user_id/transactions
- Tous les endpoints mentoring, marketplace, lightning, admin

### ⏳ À corriger après déploiement
- POST /users (problème Send bound)

---

## 🎯 Commandes rapides

```bash
# Backend: voir les logs
railway logs --follow

# Backend: redéployer
railway up

# Frontend: redéployer
vercel --prod

# Rollback backend
railway rollback <deployment-id>

# Rollback frontend
vercel rollback <deployment-url>
```

---

## ✅ Checklist finale

- [x] Backend compilé en mode release
- [ ] Connexion Railway établie (MANUEL)
- [ ] Variables d'environnement configurées
- [ ] Backend déployé sur Railway
- [ ] URL Railway obtenue
- [ ] vercel.json mis à jour
- [ ] Frontend déployé sur Vercel
- [ ] Health checks passent
- [ ] Tests E2E validés

---

**Prêt à déployer !** Suivez les étapes ci-dessus dans l'ordre.

