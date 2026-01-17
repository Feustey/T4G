# Token4Good – Documentation de Déploiement Cloud

Ce récapitulatif centralise toutes les ressources nécessaires pour opérer la plateforme Token4Good v2 sur **Railway (backend + base de données)** et **Vercel (frontend)**.

---

## 🧭 Itinéraire recommandé

1. `START_HERE.md` – orientation rapide (3 min)  
2. `PRODUCTION_DEPLOYMENT.md` – architecture complète (12 min)  
3. `DEPLOYMENT_GUIDE.md` – procédures opérationnelles (6 min)  
4. Scripts : `token4good-backend/railway-deploy.sh` & `deploy-vercel-v2.sh`

---

## 📂 Structure de cette documentation

| Section | Contenu | Public |
|---------|---------|--------|
| **Guides principaux** | `START_HERE.md`, `PRODUCTION_DEPLOYMENT.md`, `DEPLOYMENT_GUIDE.md` | DevOps / Tech Leads |
| **Scripts** | `token4good-backend/railway-deploy.sh`, `deploy-vercel-v2.sh`, `token4good-backend/test-health.sh` | DevOps |
| **CI/CD** | `.github/workflows/vercel-deploy.yml`, `RAILWAY_WEBHOOK_SETUP.md` | DevOps |
| **Checklists** | `PRODUCTION_DEPLOYMENT.md` (section checklist), `FINAL_SUMMARY.md` | Tous |

---

## 🔑 Informations critiques

### Environnements

- **Backend** : Railway – service `token4good-backend`
- **Base de données** : Railway PostgreSQL (backups automatiques)
- **Frontend** : Vercel – projet `token4good`
- **Domaines** : `token4good.vercel.app`, `t4g.dazno.de`
- **Blockchain** : VPS dédié LND + stockage RGB

### Variables d’environnement incontournables

| Plateforme | Variables |
|------------|-----------|
| Railway | `DATABASE_URL`, `JWT_SECRET`, `RGB_NETWORK`, `LND_*`, `DAZNO_API_URL`, `ALLOWED_ORIGINS` |
| Vercel | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `CLIENT_ID`, `CLIENT_SECRET`, `LINKEDIN_*`, `NEXT_PUBLIC_DAZNO_*` |

---

## 🛠️ Commandes usuelles

### Backend (Railway)
```
cd token4good-backend
railway login && railway link
./railway-deploy.sh        # build + déploiement
railway logs --follow      # logs temps réel
railway redeploy backend   # redeploiement rapide
```

### Frontend (Vercel)
```
cd apps/dapp
vercel login && vercel link
./deploy-vercel-v2.sh --prod
vercel logs token4good --since 1h
```

### Vérifications
```
curl https://<backend>.up.railway.app/health
curl https://token4good.vercel.app/api/health
curl https://t4g.dazno.de/api/health
```

---

## 📊 Monitoring & Alerting

- **Railway** : `railway logs`, métriques dashboard, webhooks (`RAILWAY_WEBHOOK_SETUP.md`)
- **Vercel** : `vercel logs`, Analytics dashboard
- **Uptime** : UptimeRobot/Pingdom (endpoints `/health` Railway & Vercel)
- **Incidents** : Slack `#token4good-ops` + email `devops@token4good.com`

---

## 🔄 Rollback express

| Composant | Action |
|-----------|--------|
| Backend | `railway deployments list` → `railway deployment rollback <id>` |
| Frontend | `vercel promote <deployment-url>` |

---

## 📅 Historique

| Date | Mise à jour | Auteur |
|------|-------------|--------|
| 30 oct. 2025 | Migration doc legacy VPS → Railway/Vercel | Stéphane Courant |
| 01 oct. 2025 | Publication initiale v2.0 | Équipe Token4Good |

---

### Besoin d’aide ?

- devops@token4good.com  
- Railway Support : https://railway.app/help  
- Vercel Support : https://vercel.com/support

Bon déploiement !
