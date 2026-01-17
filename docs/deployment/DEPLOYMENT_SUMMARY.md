# Token4Good v2 – Récapitulatif Déploiement (Railway + Vercel)

**Date :** 30 octobre 2025  
**Target Production :** 28 octobre 2025  
**Infrastructure :** Railway (Backend + PostgreSQL) & Vercel (Frontend)

---

## ✅ Résumé exécutif

- Backend Rust opérationnel sur Railway (service `token4good-backend`)
- Frontend Next.js 13 stable sur Vercel (`token4good.vercel.app` + `t4g.dazno.de`)
- PostgreSQL managé par Railway avec sauvegardes quotidiennes
- Intégrations OAuth (t4g, LinkedIn) et Dazno 100% fonctionnelles
- Nœud Lightning (LND) & stockage RGB gérés sur VPS dédié
- CI/CD Vercel automatisé (`.github/workflows/vercel-deploy.yml`)

---

## 🧱 Architecture cible

```
Utilisateurs → Vercel (Next.js) → Railway (Rust API) → Railway PostgreSQL
                                  ↓
                             VPS Lightning/RGB
```

---

## 🔄 Flux de déploiement

### Backend (Railway)
```
cd token4good-backend
railway login && railway link
./railway-deploy.sh
railway logs --follow
```

### Frontend (Vercel)
```
cd apps/dapp
vercel login && vercel link
./deploy-vercel-v2.sh --prod
vercel logs token4good --since 1h
```

---

## 📦 Pré-requis & variables clés

| Plateforme | Principales variables |
|------------|-----------------------|
| Railway | `DATABASE_URL`, `JWT_SECRET`, `RGB_NETWORK`, `LND_*`, `DAZNO_API_URL`, `ALLOWED_ORIGINS` |
| Vercel | `NEXT_PUBLIC_API_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `CLIENT_ID`, `CLIENT_SECRET`, `LINKEDIN_*`, `NEXT_PUBLIC_DAZNO_*` |

Secrets GitHub nécessaires : `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

---

## 🧪 Tests post-déploiement

```
# Backend
curl https://<backend>.up.railway.app/health

# Frontend
curl https://token4good.vercel.app/api/health
curl https://t4g.dazno.de/api/health

# Script santé complet
./token4good-backend/test-health.sh https://<backend>.up.railway.app
```

---

## 📋 Checklist Go-Live

- [ ] Variables Railway et Vercel vérifiées
- [ ] Secrets OAuth / JWT régénérés (< 90 jours)
- [ ] Tests backend `cargo test` et frontend `npm run build` réussis
- [ ] Health checks Railway + Vercel = 200
- [ ] OAuth t4g & LinkedIn testés manuellement
- [ ] Monitoring configuré (Railway webhooks, Vercel logs, UptimeRobot)

---

## 📊 Suivi & alerting

- Railway : `railway logs --follow`, métriques dashboard, webhooks → Slack (`RAILWAY_WEBHOOK_SETUP.md`)
- Vercel : `vercel logs`, Analytics dashboard
- Uptime : surveiller `https://<backend>/health`, `https://t4g.dazno.de/api/health`

---

## 🛡️ Rollback

| Composant | Action |
|-----------|--------|
| Backend | `railway deployments list` → `railway deployment rollback <id>` |
| Frontend | `vercel promote <deployment-url>` |

---

## 📞 Contacts

- DevOps : devops@token4good.com  
- Railway Support : https://railway.app/help  
- Vercel Support : https://vercel.com/support

---

**Prochaine étape** : suivre `PRODUCTION_DEPLOYMENT.md` pour les procédures complètes et synchroniser les variables d’environnement avant tout déploiement.
