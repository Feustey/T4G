# Token4Good v2 – Guide de Déploiement Cloud

**Dernière mise à jour :** 30 octobre 2025  
**Cible production :** 28 octobre 2025  
**Infrastructure officielle :** Railway (backend + base de données) & Vercel (frontend)

---

## 🔭 Vue d’ensemble

```
Utilisateurs ──▶ Vercel (Next.js) ──▶ Railway (Rust API) ──▶ Railway PostgreSQL
                                      │
                                      ▼
                               LND + RGB (VPS dédié)
```

- **Backend** : `token4good-backend` compilé via Railway, exposé en HTTPS
- **Frontend** : Next.js 13 déployé sur Vercel (`token4good.vercel.app` / `app.token-for-good.com`)
- **Base de données** : PostgreSQL managé par Railway (backups quotidiens)
- **Lightning / RGB** : nœud LND + stockage RGB sur un VPS séparé

---

## 📚 Références rapides

| Ressource | Description |
|-----------|-------------|
| `PRODUCTION_DEPLOYMENT.md` | Guide détaillé Railway + Vercel (source principale) |
| `token4good-backend/railway-deploy.sh` | Script de build + déploiement backend |
| `deploy-vercel-v2.sh` | Script de déploiement frontend |
| `RAILWAY_WEBHOOK_SETUP.md` | Intégration des webhooks Railway |
| `.github/workflows/vercel-deploy.yml` | CI/CD officiel pour le frontend |

---

## 1. Préparation

### 1.1 Outils nécessaires

```
npm install -g @railway/cli vercel
brew install jq
```

### 1.2 Accès requis
- Compte Railway avec droits sur le projet `token4good-backend`
- Compte Vercel (organisation Token4Good)
- Accès au dépôt GitHub `Feustey/T4G`
- Accès au VPS Lightning (pour LND et RGB)

---

## 2. Backend Rust sur Railway

### 2.1 Initialisation

```
cd token4good-backend
railway login
railway link        # sélection du service production
railway status
```

### 2.2 Variables d’environnement essentielles

| Clé | Description |
|-----|-------------|
| `DATABASE_URL` | Gérée automatiquement par Railway Postgres |
| `JWT_SECRET` | Token 32+ chars (`openssl rand -base64 32`) |
| `RGB_NETWORK` | `mainnet` / `testnet` |
| `LND_REST_HOST` / `LND_MACAROON_PATH` / `LND_TLS_CERT_PATH` | Connexion Lightning |
| `DAZNO_API_URL` | `https://token-for-good.com` |
| `ALLOWED_ORIGINS` | URLs autorisées (Vercel + Dazno) |

```
# Chargement depuis un fichier .env
railway variables set --from-env-file .env.production

# Vérification
railway variables list
```

### 2.3 Déploiement

```
./railway-deploy.sh    # build + déploiement automatisé
# ou
railway up             # déploiement manuel

railway logs --follow  # monitoring temps réel
```

### 2.4 Vérifications

```
railway status
curl https://<service>.up.railway.app/health
./test-health.sh https://<service>.up.railway.app
```

---

## 3. Frontend Next.js sur Vercel

### 3.1 Initialisation projet

```
cd apps/dapp
vercel login
vercel link           # associer au projet Vercel existant
vercel env pull       # synchroniser les variables
```

### 3.2 Variables d’environnement majeures

| Clé | Valeur attendue |
|-----|-----------------|
| `NEXT_PUBLIC_API_URL` | URL publique du backend Railway |
| `NEXT_PUBLIC_APP_URL` | `https://token4good.vercel.app` ou domaine custom |
| `NEXTAUTH_SECRET` | Secret NextAuth (32+ chars) |
| `NEXTAUTH_URL` | URL publique frontend |
| `CLIENT_ID` / `CLIENT_SECRET` | OAuth t4g |
| `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` | OAuth LinkedIn |
| `NEXT_PUBLIC_DAZNO_*` | URLs Dazno |

### 3.3 Déploiement

```
./deploy-vercel-v2.sh --prod
# ou
vercel --prod
```

### 3.4 Vérifications

```
vercel open
curl https://token4good.vercel.app/api/health
```

### 3.5 Domaine personnalisé

1. Ajouter `app.token-for-good.com` sur Vercel (Project Settings → Domains)  
2. Créer un enregistrement DNS `CNAME t4g → cname.vercel-dns.com`  
3. Vérifier propagation : `dig app.token-for-good.com +short`

---

## 4. Base de données Railway PostgreSQL

```
railway connect postgres
# psql $DATABASE_URL

# Exemple : appliquer les migrations SQLx
cd token4good-backend
sqlx migrate run --database-url $DATABASE_URL

# Vérifier la connexion
psql $DATABASE_URL -c "SELECT NOW();"
```

Backups automatiques activés par Railway (rétention 7 jours par défaut).

---

## 5. Lightning & RGB (VPS dédié)

- Synchroniser Bitcoin Core et LND sur le VPS
- Exporter `admin.macaroon` et `tls.cert` en base64
- Monter le volume Railway `/secrets/lnd` et y copier les fichiers
- Mettre à jour les variables Railway `LND_MACAROON_PATH`, `LND_TLS_CERT_PATH`

```
# Vérifier la connectivité depuis Railway
curl https://<service>.up.railway.app/api/lightning/node/info
```

---

## 6. Checklist

### Avant déploiement
- [ ] Tests backend (`cargo test`) OK
- [ ] Tests frontend (`npm run build`) OK
- [ ] Variables d’environnement à jour (Railway + Vercel)
- [ ] Secrets sensibles régénérés (< 90 jours)

### Après déploiement
- [ ] `railway status` ✅
- [ ] `curl https://<backend>/health` → 200
- [ ] `curl https://token4good.vercel.app/api/health` → 200
- [ ] Flux OAuth t4g & LinkedIn vérifiés
- [ ] Tests automatisés `npm run test:e2e` (si disponibles)

---

## 7. Monitoring & Alerting

| Action | Commande |
|--------|----------|
| Logs backend | `railway logs --follow` |
| Redeploy backend | `railway redeploy backend` |
| Logs frontend | `vercel logs token4good --since 1h` |
| Health check script | `./token4good-backend/test-health.sh <url>` |
| Uptime | Configurer UptimeRobot sur `/health` (Railway & Vercel) |

Pour les notifications automatiques, suivre `RAILWAY_WEBHOOK_SETUP.md` et connecter les webhooks Railway à Slack / Teams.

---

## 8. CI/CD

- **Frontend** : `.github/workflows/vercel-deploy.yml`
- **Backend** : déploiement via `railway-deploy.sh` ou via déploiement manuel (webhooks Railway à configurer)
- **Secrets GitHub** minimum : `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## 9. Dépannage rapide

| Problème | Diagnostic | Remède |
|----------|------------|--------|
| Backend 500 | `railway logs --service backend` | Corriger env/DB puis `railway redeploy` |
| 404 API côté frontend | Vérifier `NEXT_PUBLIC_API_URL` sur Vercel | Redéployer frontend |
| OAuth échoue | Revoir redirect URLs & secrets OAuth | Mettre à jour Vercel + fournisseurs |
| LND indisponible | Tester endpoint `/api/lightning/node/info` | Vérifier VPS + macaroon |
| Latence élevée | Vérifier métriques Railway | Augmenter plan Railway ou activer cache |

---

## 10. Rollback

### Backend (Railway)
```
railway deployments list
railway deployment rollback <deployment-id>
railway logs --follow
```

### Frontend (Vercel)
```
vercel ls
vercel promote <deployment-url>
# ou Dashboard Vercel → Deployments → Promote
```

---

## 11. Contacts

- **DevOps** : devops@token4good.com
- **Railway Support** : https://railway.app/help
- **Vercel Support** : https://vercel.com/support
- **Incident critique** : Slack `#token4good-ops`

---

➡️ Pour plus de détails opérationnels, consultez `PRODUCTION_DEPLOYMENT.md` et synchronisez les variables d’environnement via `railway variables` / `vercel env`.
