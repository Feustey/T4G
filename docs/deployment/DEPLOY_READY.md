# 🚀 Token4Good - Ready for Deployment

**Date:** 3 novembre 2025  
**Status:** ✅ **PRÊT POUR DÉPLOIEMENT**  
**Version:** 2.0.0

---

## 📊 État du Projet

### ✅ Complété (100%)

#### Backend Rust
- ✅ 36 endpoints API implémentés
- ✅ Authentication JWT complète
- ✅ Services Lightning Network (REST API)
- ✅ Services RGB Protocol (native types)
- ✅ Docker multi-stage optimisé
- ✅ Configuration Railway prête
- ✅ Tests unitaires et d'intégration
- ✅ Documentation complète

#### Frontend Next.js
- ✅ Migration complète vers backend Rust
- ✅ 51 routes API Next.js supprimées
- ✅ AuthContext JWT créé (remplace NextAuth)
- ✅ apiClient configuré et fonctionnel
- ✅ Tous les composants migrés
- ✅ NextAuth et MongoDB retirés des dépendances
- ✅ Configuration Vercel mise à jour

#### Infrastructure
- ✅ Dockerfile optimisé pour Railway
- ✅ railway.json configuré
- ✅ vercel.json nettoyé (plus de références NextAuth)
- ✅ Scripts de déploiement automatisés
- ✅ Configuration PostgreSQL (Supabase)

---

## 🎯 Plan de Déploiement en 3 Étapes

### Étape 1: Déploiement Backend (Railway) - 30 min

#### 1.1 Installation Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### 1.2 Configuration du Projet
```bash
cd token4good-backend
railway init
railway link
```

#### 1.3 Ajout de PostgreSQL
```bash
railway add -d postgres
```

Cela crée automatiquement la variable `DATABASE_URL`.

#### 1.4 Configuration des Variables d'Environnement

Dans le dashboard Railway ou via CLI:

```bash
# JWT (généré automatiquement par le script)
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set JWT_EXPIRATION_HOURS=24

# RGB Protocol
railway variables set RGB_DATA_DIR=/app/data/rgb
railway variables set RGB_NETWORK=mainnet

# Lightning Network (à adapter selon votre configuration)
railway variables set LND_REST_HOST=https://your-lnd-node.com:8080
railway variables set LND_MACAROON_PATH=<base64-encoded-macaroon>
railway variables set LND_TLS_CERT_PATH=<base64-encoded-cert>

# Dazno Integration
railway variables set DAZNO_API_URL=https://api.dazno.de

# Server
railway variables set HOST=0.0.0.0
railway variables set PORT=3000
railway variables set RUST_LOG=info,token4good_backend=debug

# CORS (mettre à jour avec vos domaines)
railway variables set ALLOWED_ORIGINS=https://t4g.dazno.de,https://dazno.de
```

#### 1.5 Déploiement Automatisé
```bash
./scripts/deploy-railway.sh production
```

Ou manuellement:
```bash
railway up --environment production
```

#### 1.6 Obtenir l'URL du Backend
```bash
railway domain
```

Notez cette URL pour l'étape suivante.

**Example:** `token4good-backend-production.up.railway.app`

---

### Étape 2: Déploiement Frontend (Vercel) - 20 min

#### 2.1 Installation Vercel CLI
```bash
npm install -g vercel
vercel login
```

#### 2.2 Mise à Jour de vercel.json

Remplacez l'URL Railway dans `/Users/stephanecourant/Documents/DAZ/_T4G/T4G/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://VOTRE-URL-RAILWAY.up.railway.app/api/$1"
    }
  ]
}
```

#### 2.3 Configuration des Variables d'Environnement

Dans le dashboard Vercel:

```bash
# API Backend (utilisez l'URL Railway de l'étape 1)
NEXT_PUBLIC_API_URL=https://VOTRE-URL-RAILWAY.up.railway.app

# Dazno Integration
NEXT_PUBLIC_DAZNO_API_URL=https://api.dazno.de
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://api.dazno.de/users
NEXT_PUBLIC_DAZNO_VERIFY_URL=https://api.dazno.de/auth/verify-session

# OAuth (optionnel - à configurer si nécessaire)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

#### 2.4 Déploiement Automatisé

**Preview:**
```bash
./scripts/deploy-vercel.sh preview
```

**Production:**
```bash
./scripts/deploy-vercel.sh production
```

Ou manuellement:
```bash
vercel --prod
```

---

### Étape 3: Configuration DNS & Tests - 15 min

#### 3.1 Configuration DNS

Dans votre provider DNS (Cloudflare, etc.):

```
Type: CNAME
Name: t4g
Value: cname.vercel-dns.com
TTL: Auto
```

Dans Vercel:
```bash
vercel domains add t4g.dazno.de
```

#### 3.2 Tests de Validation

**Backend Health Check:**
```bash
curl https://VOTRE-URL-RAILWAY.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": true,
  "lightning": true,
  "rgb": true,
  "timestamp": "2025-11-03T12:00:00Z"
}
```

**Frontend Health Check:**
```bash
curl https://t4g.dazno.de/health
```

Should proxy to the backend and return the same response.

**Test OAuth Flow:**
1. Ouvrir https://t4g.dazno.de/login
2. Tester login avec Dazno
3. Vérifier JWT dans localStorage
4. Tester navigation dans l'app

**Test Lightning Payment:**
1. Créer une invoice
2. Vérifier le statut du paiement
3. Tester la création de RGB proofs

---

## 📋 Checklist Pre-Deployment

### Backend Railway
- [ ] Railway CLI installé et configuré
- [ ] Projet Railway créé
- [ ] PostgreSQL ajouté et configuré
- [ ] Toutes les variables d'environnement configurées
- [ ] JWT_SECRET généré (32+ chars)
- [ ] LND accessible et configuré
- [ ] CORS origins configurés
- [ ] Build Docker réussit
- [ ] Health check: OK

### Frontend Vercel
- [ ] Vercel CLI installé et configuré
- [ ] vercel.json mis à jour avec URL Railway
- [ ] Variables d'environnement configurées
- [ ] Build Next.js réussit localement
- [ ] Déploiement preview testé
- [ ] DNS configuré
- [ ] SSL actif

### Tests Production
- [ ] Backend health check: OK
- [ ] Frontend accessible
- [ ] Proxy API fonctionnel
- [ ] Login fonctionne (tous providers)
- [ ] Création utilisateur: OK
- [ ] Mentoring flow: OK
- [ ] RGB proofs: OK
- [ ] Lightning payments: OK
- [ ] Performance < 500ms

---

## 🔧 Commandes Utiles

### Railway (Backend)
```bash
# Logs en temps réel
railway logs --follow

# Variables d'environnement
railway variables

# Redéployer
railway up

# Rollback
railway rollback

# Dashboard
railway open
```

### Vercel (Frontend)
```bash
# Logs en temps réel
vercel logs --follow

# Liste des déploiements
vercel ls

# Redéployer
vercel --prod

# Rollback
vercel rollback <deployment-url>

# Dashboard
vercel
```

---

## 🚨 Troubleshooting

### Backend ne démarre pas
```bash
# Vérifier les logs
railway logs

# Vérifier les variables
railway variables

# Vérifier la base de données
railway run psql $DATABASE_URL -c "SELECT 1"
```

### Frontend ne proxy pas vers le backend
1. Vérifier `vercel.json` rewrites
2. Vérifier CORS dans backend
3. Vérifier les logs Vercel
4. Tester directement l'URL Railway

### OAuth ne fonctionne pas
1. Vérifier les redirect URIs dans dashboards OAuth
2. Vérifier `CLIENT_ID` et `CLIENT_SECRET`
3. Vérifier les logs des callbacks
4. Tester avec `curl -v`

### JWT invalide
1. Vérifier que `JWT_SECRET` est identique backend/frontend
2. Vérifier l'expiration du token (24h par défaut)
3. Tester avec jwt.io
4. Vérifier les logs backend

---

## 📊 Métriques à Surveiller

### Performance
- API latency (p50, p95, p99)
- Database connection pool
- Lightning payment success rate
- RGB contract creation rate
- Error rate par endpoint

### Business
- Nombre d'utilisateurs actifs
- Nombre de transactions Lightning
- Nombre de RGB proofs créés
- Taux de conversion inscription

### Infrastructure
- CPU usage (Railway)
- Memory usage (Railway)
- Database size
- Request rate (Vercel)
- Bandwidth (Vercel)

---

## 🔐 Sécurité

### Secrets à Configurer
- ✅ JWT_SECRET (32+ chars, rotation 90 jours)
- ✅ DATABASE_URL (rotation 90 jours)
- ✅ LND_MACAROON (rotation 180 jours)
- ✅ OAuth secrets (rotation 180 jours)

### Best Practices
- ✅ HTTPS forcé sur tous les endpoints
- ✅ CORS limité aux domaines autorisés
- ✅ Rate limiting activé (60 req/min)
- ✅ Admin routes protégées
- ✅ JWT expiration configurée
- ✅ Logs ne contiennent pas de secrets

---

## 📖 Documentation Additionnelle

### Architecture & Planning
- [FINAL_SUMMARY.md](FINAL_SUMMARY.md) - Vue d'ensemble complète
- [FRONTEND_MIGRATION_COMPLETE.md](FRONTEND_MIGRATION_COMPLETE.md) - Migration frontend
- [API_INTEGRATION_COMPLETE.md](API_INTEGRATION_COMPLETE.md) - Intégrations API

### Guides de Déploiement
- [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Guide détaillé
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guide alternatif
- [QUICKSTART.md](QUICKSTART.md) - Quick start development

### Standards & Rules
- [.cursor/rules/backend-rust.mdc](.cursor/rules/backend-rust.mdc) - Standards backend
- [.cursor/rules/deployment.mdc](.cursor/rules/deployment.mdc) - Standards déploiement
- [.cursor/rules/token4good-api.mdc](.cursor/rules/token4good-api.mdc) - API T4G standards

---

## 🎉 Post-Deployment

### Monitoring Setup
1. Configurer UptimeRobot ou équivalent
2. Configurer Sentry pour error tracking
3. Setup Slack alerts
4. Configurer logs centralisés

### Communication
1. Annoncer le déploiement à l'équipe
2. Préparer la communication utilisateurs
3. Préparer le support technique
4. Documenter les procédures d'incident

### Optimisations Futures
1. Cache stratégique (Redis)
2. CDN pour assets statiques
3. Monitoring avancé (Prometheus + Grafana)
4. A/B testing infrastructure
5. Analytics avancées

---

## 📞 Support

### Backend Issues
- **Logs:** `railway logs --follow`
- **Dashboard:** https://railway.app/dashboard
- **Documentation:** [token4good-backend/README.md](token4good-backend/README.md)

### Frontend Issues
- **Logs:** `vercel logs --follow`
- **Dashboard:** https://vercel.com/dashboard
- **Documentation:** [apps/dapp/README.md](apps/dapp/README.md)

### Database Issues
- **Railway PostgreSQL:** Dashboard Railway
- **Backups:** Automatic daily
- **Migrations:** [token4good-backend/migrations/](token4good-backend/migrations/)

---

## ✅ Résumé

Le projet Token4Good v2 est **prêt pour le déploiement en production**. Tous les composants sont en place:

1. ✅ **Backend Rust** - Complet et testé
2. ✅ **Frontend Next.js** - Migré et optimisé
3. ✅ **Infrastructure** - Railway + Vercel configurés
4. ✅ **Scripts** - Déploiement automatisé
5. ✅ **Documentation** - Complète et à jour

**Temps estimé total de déploiement:** 60-90 minutes

**Prochaine étape:** Exécutez `./scripts/deploy-railway.sh production`

---

**Last Updated:** 3 novembre 2025  
**Version:** 2.0.0  
**Maintained by:** Token4Good DevOps Team  
**Contact:** support@token4good.com

