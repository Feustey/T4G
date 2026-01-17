# 🚀 Guide de Déploiement Production - Token4Good v2

**Date:** 16 janvier 2026  
**Durée estimée:** 60-90 minutes  
**Status:** ✅ PRÊT À DÉPLOYER

---

## ⚡ Déploiement Express (3 Commandes)

### 1️⃣ Backend Railway (30 min)

```bash
# Se positionner dans le dossier backend
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G/token4good-backend

# Connexion Railway (ouvrira le navigateur)
railway login

# Déploiement automatique
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G
./scripts/deploy-railway.sh production
```

**Important:** Le script vous demandera de configurer les variables d'environnement dans Railway Dashboard.

### 2️⃣ Mise à Jour Configuration (2 min)

Après le déploiement backend, vous obtiendrez une URL comme:
```
https://token4good-backend-production-XXXXX.up.railway.app
```

Mettez à jour `vercel.json` avec cette URL (voir section "Variables à Remplacer" ci-dessous).

### 3️⃣ Frontend Vercel (20 min)

```bash
# Connexion Vercel
vercel login

# Déploiement automatique
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G
./scripts/deploy-vercel.sh production
```

---

## 📋 Variables d'Environnement Railway

### Variables Backend Requises

Copiez-collez ces variables dans le Railway Dashboard après avoir exécuté le script:

```bash
# === JWT Authentication ===
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRATION_HOURS=24

# === PostgreSQL ===
# DATABASE_URL est automatiquement créé par Railway lors de l'ajout de PostgreSQL

# === RGB Protocol ===
RGB_DATA_DIR=/app/data/rgb
RGB_NETWORK=mainnet

# === Lightning Network ===
# À adapter selon votre configuration LND
LND_REST_HOST=https://votre-lnd-node.com:8080
LND_MACAROON_PATH=<votre-macaroon-base64>
LND_TLS_CERT_PATH=<votre-cert-base64>

# === Dazno Integration ===
DAZNO_API_URL=https://api.dazno.de

# === Server Configuration ===
HOST=0.0.0.0
PORT=3000
RUST_LOG=info,token4good_backend=debug

# === CORS ===
ALLOWED_ORIGINS=https://t4g.dazno.de,https://token4good.vercel.app
```

### Comment générer JWT_SECRET

```bash
openssl rand -base64 32
```

Copiez le résultat et collez-le comme valeur de `JWT_SECRET` dans Railway.

---

## 📋 Variables d'Environnement Vercel

### Variables Frontend Requises

À configurer dans Vercel Dashboard ou via CLI:

```bash
# === Backend API ===
NEXT_PUBLIC_API_URL=https://VOTRE-URL-RAILWAY.up.railway.app

# === OAuth Providers ===
NEXT_PUBLIC_DAZNO_VERIFY_URL=https://dazno.de/api/auth/verify-session

# === Supabase (si utilisé) ===
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

---

## 🔧 Variables à Remplacer

### Dans vercel.json

**Fichier:** `/Users/stephanecourant/Documents/DAZ/_T4G/T4G/vercel.json`

Recherchez la ligne contenant `destination` et remplacez l'URL par votre URL Railway:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://VOTRE-URL-RAILWAY.up.railway.app/api/:path*"
    }
  ]
}
```

**⚠️ Important:** Remplacez `VOTRE-URL-RAILWAY.up.railway.app` par l'URL obtenue lors du déploiement Railway.

---

## 🧪 Tests Post-Déploiement

### 1. Backend Railway

```bash
# Health check
curl https://VOTRE-URL-RAILWAY.up.railway.app/health

# Expected response:
# {"status":"healthy","timestamp":"2026-01-16T..."}
```

### 2. Frontend Vercel

```bash
# Page d'accueil
curl https://token4good.vercel.app/

# API proxy (doit rediriger vers Railway)
curl https://token4good.vercel.app/api/health
```

### 3. Authentification

1. Ouvrez https://token4good.vercel.app/login
2. Testez l'authentification avec un provider OAuth
3. Vérifiez que le JWT est stocké dans localStorage
4. Vérifiez que les routes protégées fonctionnent

---

## 📊 Monitoring

### Logs Backend (Railway)

```bash
# Logs en temps réel
railway logs --follow --environment production

# Logs récents
railway logs --environment production
```

### Logs Frontend (Vercel)

```bash
# Logs en temps réel
vercel logs --follow

# Logs d'un déploiement spécifique
vercel logs <deployment-url>
```

### Dashboard

- **Railway:** https://railway.app/dashboard
- **Vercel:** https://vercel.com/dashboard

---

## 🔄 Rollback en Cas de Problème

### Backend Railway

```bash
# Lister les déploiements
railway deployments --environment production

# Rollback vers le précédent
railway rollback --environment production
```

### Frontend Vercel

```bash
# Lister les déploiements
vercel ls

# Rollback vers un déploiement spécifique
vercel rollback <deployment-url>
```

---

## 🐛 Troubleshooting

### Backend ne démarre pas

1. **Vérifier les logs:**
   ```bash
   railway logs --environment production
   ```

2. **Vérifier les variables:**
   ```bash
   railway variables --environment production
   ```

3. **Problèmes courants:**
   - `JWT_SECRET` manquant ou invalide
   - `DATABASE_URL` non configuré
   - Port déjà utilisé (changer `PORT`)

### Frontend ne se connecte pas au backend

1. **Vérifier vercel.json:**
   - L'URL Railway est-elle correcte?
   - Le proxy `/api/*` est-il configuré?

2. **Vérifier CORS:**
   - `ALLOWED_ORIGINS` dans Railway contient-il l'URL Vercel?

3. **Vérifier les variables Vercel:**
   ```bash
   vercel env ls
   ```

### Erreurs 502/503

- Le backend est peut-être en train de démarrer (attendre 30s-1min)
- Vérifier que Railway n'a pas de problème de ressources
- Vérifier les health checks dans Railway

---

## 🎯 Checklist Complète

### Avant le Déploiement

- [ ] Railway CLI installé (`railway --version`)
- [ ] Vercel CLI installé (`vercel --version`)
- [ ] Compte Railway créé
- [ ] Compte Vercel créé
- [ ] Code git commité et pushé

### Déploiement Backend

- [ ] `railway login` effectué
- [ ] Variables d'environnement configurées
- [ ] PostgreSQL ajouté au projet
- [ ] Backend déployé avec succès
- [ ] URL Railway notée
- [ ] Health check backend OK

### Configuration Frontend

- [ ] `vercel.json` mis à jour avec URL Railway
- [ ] Variables Vercel configurées
- [ ] Build local réussi

### Déploiement Frontend

- [ ] `vercel login` effectué
- [ ] Frontend déployé avec succès
- [ ] Health check frontend OK
- [ ] Login fonctionnel

### Post-Déploiement

- [ ] Monitoring configuré
- [ ] DNS configuré (si domaine custom)
- [ ] Tests E2E passés
- [ ] Documentation mise à jour
- [ ] Équipe notifiée

---

## 📞 Support

### Documentation

- [DEPLOY_READY.md](DEPLOY_READY.md) - Guide détaillé
- [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) - Checklist exhaustive
- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Architecture production

### Aide Technique

- **Railway:** https://railway.app/help
- **Vercel:** https://vercel.com/support
- **Documentation Railway:** https://docs.railway.app
- **Documentation Vercel:** https://vercel.com/docs

---

## 🚀 C'est Parti !

### Commandes à Exécuter

```bash
# 1. Backend Railway
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G/token4good-backend
railway login
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G
./scripts/deploy-railway.sh production

# 2. Mettre à jour vercel.json avec l'URL Railway obtenue

# 3. Frontend Vercel
vercel login
./scripts/deploy-vercel.sh production
```

### Durée Estimée

- **Backend:** ~30 minutes
- **Configuration:** ~2 minutes
- **Frontend:** ~20 minutes
- **Tests:** ~10 minutes
- **Total:** ~60 minutes

---

**Bonne chance avec votre déploiement ! 🚀**

**Si vous rencontrez un problème, consultez la section Troubleshooting ci-dessus ou les logs Railway/Vercel.**

---

**Créé le:** 16 janvier 2026  
**Version:** 2.0.0  
**Status:** ✅ PRÊT À UTILISER
