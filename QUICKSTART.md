# Token4Good v2 - Quick Start Guide
**5 minutes pour démarrer en production** 🚀

---

## 📋 Prérequis

```bash
# Installer les CLI
npm install -g @railway/cli vercel

# Login
railway login
vercel login
```

---

## 🚀 Déploiement en 5 Étapes

### 1️⃣ Backend (Railway) - 2 min

```bash
cd token4good-backend

# Créer projet + PostgreSQL
railway init
railway add -d postgres

# Configurer les variables (copier depuis .env.example)
railway open  # Dashboard → Variables

# Déployer
./railway-deploy.sh
```

**Variables essentielles:**
```
JWT_SECRET=<openssl rand -base64 32>
DATABASE_URL=<auto-créé par Railway>
DAZNO_API_URL=https://dazno.de
```

### 2️⃣ Frontend (Vercel) - 2 min

```bash
cd ..  # Retour à la racine

# Mettre à jour vercel.json avec l'URL Railway
# Ligne 13: destination: "https://YOUR-BACKEND.railway.app/api/$1"

# Déployer
./deploy-vercel-v2.sh --prod
```

**Variables essentielles (Vercel dashboard):**
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
CLIENT_ID=<t4g_oauth_id>
CLIENT_SECRET=<t4g_oauth_secret>
LINKEDIN_CLIENT_ID=<linkedin_oauth_id>
LINKEDIN_CLIENT_SECRET=<linkedin_oauth_secret>
```

### 3️⃣ DNS - 1 min

```bash
# Dans votre DNS provider (ex: Cloudflare)
Type: CNAME
Name: t4g
Value: cname.vercel-dns.com

# Puis
vercel domains add t4g.dazno.de
```

### 4️⃣ Vérification - 30 sec

```bash
# Backend
curl https://your-backend.railway.app/health

# Frontend
curl https://t4g.dazno.de/api/health

# OAuth (navigateur)
open https://t4g.dazno.de/login-v2
```

### 5️⃣ Monitoring - 30 sec

```bash
# Logs backend
railway logs --follow

# Logs frontend
vercel logs --follow
```

---

## ✅ Checklist Post-Déploiement

- [ ] Health check backend OK (200)
- [ ] Health check frontend OK (200)
- [ ] Login t4g fonctionne
- [ ] Login LinkedIn fonctionne
- [ ] Login Dazno fonctionne
- [ ] JWT stocké dans localStorage
- [ ] Metrics endpoint accessible (avec auth)

---

## 🐛 Troubleshooting Rapide

### Backend 502
```bash
railway logs
# → Vérifier JWT_SECRET et DATABASE_URL
```

### Frontend API error
```bash
# Vérifier vercel.json rewrites
# Vérifier CORS backend (ALLOWED_ORIGINS)
```

### OAuth failed
```bash
# Vérifier redirect URIs dans dashboards OAuth:
# - t4g: https://t4g.dazno.de/auth/callback/t4g
# - LinkedIn: https://t4g.dazno.de/auth/callback/linkedin
```

---

## 📚 Documentation Complète

- **Déploiement détaillé:** [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
- **Migration complète:** [MIGRATION_PROGRESS.md](MIGRATION_PROGRESS.md)
- **Livraison finale:** [FINAL_DELIVERY.md](FINAL_DELIVERY.md)

---

## 🎯 URLs Importantes

| Service | URL | Notes |
|---------|-----|-------|
| Backend | https://YOUR.railway.app | À remplacer |
| Frontend | https://t4g.dazno.de | Configurer DNS |
| Health | /health | Status système |
| Metrics | /api/metrics | Nécessite JWT |
| Login | /login-v2 | Nouvelle page |

---

**Temps total:** ~5 minutes
**Difficulté:** ⭐⭐☆☆☆

✨ **C'est parti!** ✨
