# 🚀 Guide de Déploiement Production - Token4Good

**Date:** 13 novembre 2025  
**Status:** ✅ Code prêt - Build réussi  
**Durée estimée:** 30-45 minutes

---

## ✅ Pré-requis Validés

- ✅ Backend compilé (release mode)
- ✅ 15 nouveaux endpoints API Dazno implémentés
- ✅ Frontend TypeScript mis à jour
- ✅ 0 erreurs de compilation
- ✅ Documentation complète créée

---

## 📋 Étapes de Déploiement

### Étape 1: Déployer le Backend sur Railway (15-20 min)

#### 1.1 Lier le Projet Railway

```bash
cd token4good-backend

# Se connecter à Railway (si pas déjà fait)
railway login

# Lier au projet Railway
railway link
# Sélectionner votre workspace: "Feustey's Projects"
# Sélectionner le projet: "token4good-backend" (ou créer nouveau)

# Vérifier la connexion
railway status
```

#### 1.2 Configurer les Variables d'Environnement

```bash
# Générer un JWT secret fort
JWT_SECRET=$(openssl rand -base64 32)

# Configurer les variables Railway
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_EXPIRATION_HOURS="24"
railway variables set RUST_LOG="info,token4good_backend=debug"
railway variables set HOST="0.0.0.0"
railway variables set PORT="3000"

# Variables PostgreSQL (créées automatiquement par Railway)
# DATABASE_URL sera automatiquement configuré

# Variables Lightning (à configurer avec vos valeurs)
railway variables set LND_REST_HOST="https://your-lnd-node.com:8080"
railway variables set LND_MACAROON_PATH="<base64-encoded-macaroon>"

# Variables Dazno
railway variables set DAZNO_LIGHTNING_API_URL="https://api.dazno.de"
railway variables set DAZNO_USERS_API_URL="https://dazno.de/api"

# CORS
railway variables set ALLOWED_ORIGINS="https://t4g.dazno.de,https://t4g-dazno-de.vercel.app"
```

#### 1.3 Ajouter PostgreSQL

```bash
# Ajouter PostgreSQL au projet
railway add -d postgres

# Attendre que PostgreSQL soit provisionné (~2 min)
railway status
```

#### 1.4 Déployer

```bash
# Déployer le backend
railway up

# Suivre les logs
railway logs --follow
```

**✅ Validation:**
```bash
# Une fois déployé, obtenir l'URL
railway domain

# Tester le health check
curl https://VOTRE-URL-RAILWAY.up.railway.app/health
```

**Réponse attendue:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-13T..."
}
```

---

### Étape 2: Déployer le Frontend sur Vercel (10-15 min)

#### 2.1 Mettre à Jour vercel.json

```bash
cd /Users/stephanecourant/.cursor/worktrees/T4G/xN2og

# Éditer vercel.json et remplacer l'URL du backend
# Changer:
#   "destination": "https://token4good-backend-production.up.railway.app/api/$1"
# Par:
#   "destination": "https://VOTRE-URL-RAILWAY/api/$1"
```

#### 2.2 Se Connecter à Vercel

```bash
# Installer Vercel CLI si nécessaire
npm install -g vercel

# Se connecter
vercel login
```

#### 2.3 Configurer les Variables d'Environnement Vercel

Allez sur: https://vercel.com/dashboard → Votre projet → Settings → Environment Variables

Ajouter:
```
NEXT_PUBLIC_API_URL=https://VOTRE-URL-RAILWAY.up.railway.app
NEXT_PUBLIC_APP_URL=https://t4g.dazno.de
NEXT_PUBLIC_DAZNO_VERIFY_URL=https://dazno.de/api/auth/verify-session
NEXT_PUBLIC_GTM_ID=GTM-NCQWLBN
```

#### 2.4 Déployer

```bash
# Déployer en production
vercel --prod

# Ou utiliser le script
./scripts/deploy-vercel.sh production
```

**✅ Validation:**
```bash
# Tester le frontend
curl https://t4g.dazno.de/api/health
```

---

### Étape 3: Configurer le DNS (5 min)

#### 3.1 Ajouter le Domaine dans Vercel

```bash
vercel domains add t4g.dazno.de
```

#### 3.2 Configurer le DNS

Dans votre provider DNS (Cloudflare, etc.):

```
Type: CNAME
Name: t4g
Value: cname.vercel-dns.com
TTL: Auto
```

---

### Étape 4: Tests Post-Déploiement (10 min)

#### 4.1 Test Backend

```bash
# Health check
curl https://VOTRE-URL-RAILWAY.up.railway.app/health

# Test auth endpoint
curl https://VOTRE-URL-RAILWAY.up.railway.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

#### 4.2 Test Frontend + Proxy

```bash
# Via le frontend (devrait proxy vers le backend)
curl https://t4g.dazno.de/api/health

# Test page d'accueil
curl -I https://t4g.dazno.de
```

#### 4.3 Test Nouveaux Endpoints Dazno

```bash
# Obtenir un token JWT d'abord
TOKEN="votre_jwt_token"
DAZNO_TOKEN="votre_dazno_token"

# Test webhook
curl https://t4g.dazno.de/api/dazno/v1/webhook \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Dazno-Token: $DAZNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://test.com/webhook",
    "events": ["payment.received"]
  }'

# Test LNURL-pay
curl https://t4g.dazno.de/api/dazno/v1/lnurl/pay \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Dazno-Token: $DAZNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "min_sendable": 1000,
    "max_sendable": 100000,
    "metadata": "Test LNURL"
  }'

# Test multi-wallets
curl https://t4g.dazno.de/api/dazno/v1/wallet \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Dazno-Token: $DAZNO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Wallet"}'
```

---

## 📊 Monitoring Post-Déploiement

### Railway Dashboard

```bash
# Ouvrir le dashboard
railway open

# Surveiller les logs
railway logs --follow

# Vérifier les métriques
# CPU, Memory, Requests/s dans le dashboard
```

### Vercel Dashboard

```bash
# Ouvrir le dashboard
vercel open

# Voir les logs de déploiement
vercel logs --follow
```

---

## 🚨 Résolution de Problèmes

### Backend ne répond pas

```bash
# Vérifier les logs
railway logs --tail 100

# Vérifier les variables d'environnement
railway variables

# Redémarrer le service
railway restart
```

### Frontend ne proxy pas vers le backend

1. Vérifier `vercel.json` - URL Railway correcte
2. Vérifier CORS dans le backend (ALLOWED_ORIGINS)
3. Redéployer le frontend:
```bash
vercel --prod --force
```

### Base de données inaccessible

```bash
# Vérifier PostgreSQL
railway run psql $DATABASE_URL -c "SELECT 1"

# Si erreur, recréer la DB
railway add -d postgres --force
```

---

## 📈 Métriques de Succès

### Checklist Validation Production

- [ ] **Backend Railway**
  - [ ] Health check répond 200 OK
  - [ ] Logs sans erreurs critiques
  - [ ] PostgreSQL connecté
  - [ ] Métriques CPU < 80%
  - [ ] Métriques Memory < 80%

- [ ] **Frontend Vercel**
  - [ ] Page d'accueil charge
  - [ ] API proxy fonctionne
  - [ ] DNS t4g.dazno.de résolu
  - [ ] HTTPS actif

- [ ] **Nouveaux Endpoints**
  - [ ] Webhooks accessibles
  - [ ] LNURL endpoints répondent
  - [ ] Multi-wallets fonctionnent

- [ ] **Sécurité**
  - [ ] JWT_SECRET unique et fort
  - [ ] CORS correctement configuré
  - [ ] HTTPS forcé partout
  - [ ] Variables sensibles en variables d'env

---

## 🎉 Félicitations !

Si toutes les étapes sont validées, **Token4Good v2 est en production** avec :

✅ **Backend Rust** performant et sécurisé  
✅ **Frontend Next.js** moderne et rapide  
✅ **15 nouveaux endpoints** API Dazno  
✅ **Webhooks** pour notifications temps réel  
✅ **LNURL** pour paiements simplifiés  
✅ **Multi-wallets** pour organisation financière  

---

## 📞 Support

### Documentation Technique
- [DAZNO_API_EXTENSIONS.md](DAZNO_API_EXTENSIONS.md)
- [DAZNO_INTEGRATION_COMPLETE.md](DAZNO_INTEGRATION_COMPLETE.md)
- [IMPLEMENTATION_SUMMARY_DAZNO.md](IMPLEMENTATION_SUMMARY_DAZNO.md)

### Aide Déploiement
- Railway: https://railway.app/help
- Vercel: https://vercel.com/support

### Contact
- Email: support@token4good.com
- Documentation: Ce repository

---

## 🔄 Rollback en Cas de Problème

### Backend

```bash
# Lister les déploiements
railway deployments

# Rollback vers la version précédente
railway rollback <deployment-id>
```

### Frontend

```bash
# Lister les déploiements
vercel ls

# Rollback
vercel rollback <deployment-url>
```

---

**Guide créé:** 13 novembre 2025  
**Dernière validation:** Build successful  
**Prêt pour déploiement:** ✅ OUI

**Bonne chance ! 🚀**




