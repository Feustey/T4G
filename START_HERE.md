# 🚀 Token4Good v2 – Point de départ Déploiement Cloud

Bienvenue ! Ce guide express vous oriente vers les ressources essentielles pour exploiter l’infrastructure **Railway + Vercel** de Token4Good.

---

## 🔗 Téléportation immédiate

```
# 1. Lire le plan de déploiement complet
cat PRODUCTION_DEPLOYMENT.md

# 2. Préparer le backend Railway
cd token4good-backend
railway login && railway link

# 3. Déployer le frontend Vercel
cd apps/dapp
vercel login && ./deploy-vercel-v2.sh --prod
```

---

## 📚 Fichiers essentiels

| Fichier | Pourquoi le lire ? | Temps |
|---------|--------------------|-------|
| **PRODUCTION_DEPLOYMENT.md** | Architecture détaillée Railway + Vercel | 12 min |
| **DEPLOYMENT_GUIDE.md** | Étapes opérationnelles condensées | 6 min |
| **PRODUCTION_DEPLOYMENT_CHECKLIST.md** *(si créé)* | Checklist finale go-live | 3 min |
| **RAILWAY_WEBHOOK_SETUP.md** | Webhooks & alerting Railway → Slack | 4 min |

---

## 🗺️ Parcours recommandé

```
Vous êtes ici ─▶ START_HERE.md
                  │
                  ▼
        ┌──────────────────────────┐
        │ PRODUCTION_DEPLOYMENT.md │ ← Vue globale & schémas
        └──────────┬───────────────┘
                   │
          ┌────────▼────────┐
          │ DEPLOYMENT_GUIDE│ ← Commandes Railway / Vercel
          └────────┬────────┘
                   │
           ┌───────▼────────┬─────────┐
           │                 │         │
           ▼                 ▼         ▼
  railway-deploy.sh   deploy-vercel    RAILWAY_WEBHOOK_SETUP
  (backend)           (frontend)       (alerting)
```

---

## 🔑 Variables à vérifier avant tout déploiement

- Railway : `DATABASE_URL`, `JWT_SECRET`, `LND_*`, `RGB_NETWORK`, `ALLOWED_ORIGINS`
- Vercel : `NEXT_PUBLIC_API_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, OAuth t4g & LinkedIn, `NEXT_PUBLIC_DAZNO_*`
- Secrets GitHub (CI/CD) : `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## 🧪 Check rapide post-déploiement

```
# Backend Railway
railway status
curl https://<backend>.up.railway.app/health

# Frontend Vercel
curl https://token4good.vercel.app/api/health

# Domaine custom (si DNS propagé)
curl https://app.token-for-good.com/api/health
```

---

## 📞 Contacts & support

- Slack `#token4good-ops`
- devops@token4good.com
- Dashboard Railway : https://railway.app/dashboard
- Dashboard Vercel : https://vercel.com/dashboard

✉️ **Tip :** gardez `PRODUCTION_DEPLOYMENT.md` ouvert pendant vos opérations : tout y est référencé.
