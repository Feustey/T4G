# 🚀 Instructions Finales de Déploiement Token4Good v2

**Date:** 16 décembre 2025  
**Status Backend:** ✅ DÉPLOYÉ  
**Status Frontend:** ⚠️ CONFIGURATION MANUELLE REQUISE

---

## ✅ Ce Qui a Été Complété

### Backend Railway - 100% ✅
- **URL:** https://apirust-production.up.railway.app
- **Status:** ✅ Opérationnel
- **Health Check:** ✅ Tous les services OK (database, rgb, dazno)
- **Variables d'environnement:** ✅ Configurées

**Test du backend:**
```bash
curl https://apirust-production.up.railway.app/health
# Retourne: {"status":"ok", "version":"0.1.0", ...}
```

### Frontend Vercel - Configuration Requise ⚠️

Le frontend est prêt à être déployé mais nécessite une configuration manuelle dans le dashboard Vercel car le projet utilise un monorepo Nx.

---

## 📋 Actions Requises

### Étape 1: Configurer le Projet Vercel (5 minutes)

1. **Ouvrir le Dashboard Vercel**
   - Aller sur: https://vercel.com/feusteys-projects/t4-g
   - Ou: https://vercel.com/dashboard

2. **Configurer le Root Directory**
   - Cliquer sur "Settings" dans le projet `t4-g`
   - Aller dans "General"
   - Trouver la section "Root Directory"
   - **Changer de "." vers "apps/dapp"**
   - Sauvegarder

3. **Vérifier le Framework**
   - Dans "Settings" > "General"
   - "Framework Preset" doit être sur "Next.js"
   - Si ce n'est pas le cas, le sélectionner

4. **Vérifier les Build Commands**
   - Dans "Settings" > "General"
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install --legacy-peer-deps`
   - **Output Directory:** `.next`

### Étape 2: Vérifier les Variables d'Environnement (Déjà Configurées ✅)

Les variables suivantes ont déjà été ajoutées en production:
- ✅ `NEXT_PUBLIC_API_URL` = `https://apirust-production.up.railway.app`
- ✅ `NEXT_PUBLIC_DAZNO_API_URL` = `https://api.token-for-good.com`
- ✅ `NEXT_PUBLIC_DAZNO_USERS_API_URL` = `https://token-for-good.com/api`
- ✅ `NEXT_PUBLIC_DAZNO_VERIFY_URL` = `https://token-for-good.com/api/auth/verify-session`

### Étape 3: Déployer le Frontend (2 minutes)

Une fois le Root Directory configuré:

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G
vercel --prod --yes
```

**Ou depuis le dashboard:**
- Cliquer sur "Deployments"
- Cliquer sur "Redeploy" sur le dernier déploiement
- Sélectionner "Use existing Build Cache: No"
- Cliquer sur "Redeploy"

---

## 🌐 URLs de Production Attendues

### Backend
- API: https://apirust-production.up.railway.app
- Health: https://apirust-production.up.railway.app/health
- Docs: https://apirust-production.up.railway.app/api/health

### Frontend (après déploiement)
- Principal: https://t4-g-feusteys-projects.vercel.app
- Domaine personnalisé: https://app.token-for-good.com (à configurer)

---

## ✅ Checklist Post-Déploiement

Une fois le frontend déployé:

### Tests de Base
```bash
# 1. Tester le frontend
curl https://t4-g-feusteys-projects.vercel.app

# 2. Tester le proxy API
curl https://t4-g-feusteys-projects.vercel.app/health

# 3. Tester l'authentification (dans le navigateur)
# - Aller sur https://t4-g-feusteys-projects.vercel.app/login
# - Essayer de se connecter
```

### Tests Fonctionnels
- [ ] Page de login s'affiche
- [ ] Authentification Dazno fonctionne
- [ ] Dashboard utilisateur accessible
- [ ] Les services sont listés
- [ ] Le profil utilisateur se charge

### Monitoring
- [ ] Vérifier les logs Railway: `railway logs`
- [ ] Vérifier les logs Vercel: `vercel logs`
- [ ] Configurer les alertes (optionnel)

---

## 🔧 Configuration Domaine Personnalisé (Optionnel)

Pour utiliser `app.token-for-good.com`:

1. **Dans Vercel Dashboard:**
   - Aller dans "Settings" > "Domains"
   - Cliquer sur "Add"
   - Entrer: `app.token-for-good.com`
   - Suivre les instructions

2. **Dans votre DNS (token-for-good.com):**
   - Ajouter un enregistrement CNAME:
     - Name: `t4g`
     - Value: `cname.vercel-dns.com`
     - TTL: 3600

---

## 🚨 Troubleshooting

### Si le Build Échoue Encore

**Erreur: "No Next.js version detected"**
- ✅ Vérifier que Root Directory = `apps/dapp`
- ✅ Vérifier que Framework = `Next.js`
- ✅ Redéployer depuis le dashboard

**Erreur: "Cannot read tsconfig.base.json"**
- ✅ S'assurer de déployer depuis la racine du repo
- ✅ Vérifier que `.vercelignore` n'exclut pas les fichiers nécessaires

**Erreur de Build Timeout**
- Augmenter le timeout dans Settings > General > Build & Development Settings

### Si l'API Ne Répond Pas

```bash
# Vérifier que le backend est up
curl https://apirust-production.up.railway.app/health

# Vérifier les logs
railway logs --follow
```

### Si le Frontend Ne Se Connecte Pas au Backend

Vérifier dans le navigateur (Console):
- Les requêtes API vont vers `https://apirust-production.up.railway.app`
- Pas d'erreurs CORS
- Les variables d'environnement sont chargées

---

## 📊 État Actuel du Déploiement

| Composant | Status | URL | Actions Requises |
|-----------|--------|-----|------------------|
| Backend Railway | ✅ Déployé | https://apirust-production.up.railway.app | Aucune |
| Base de Données | ✅ Opérationnelle | PostgreSQL (Supabase via Railway) | Aucune |
| Frontend Vercel | ⚠️ Config Requise | - | Configurer Root Directory |
| DNS app.token-for-good.com | ⏳ À Configurer | - | Après déploiement frontend |

---

## 🎯 Prochaines Étapes

### Immédiat
1. ✅ Backend déployé
2. ⏳ Configurer Root Directory Vercel → `apps/dapp`
3. ⏳ Redéployer frontend
4. ⏳ Tester l'application

### Court Terme (Semaine 1)
- Configurer le domaine `app.token-for-good.com`
- Mettre en place le monitoring
- Tests end-to-end complets
- Collecter les premiers retours

### Moyen Terme (Mois 1)
- Optimisations performance
- Analytics avancées
- A/B testing
- Amélioration continue

---

## 📞 Support

### Documentation
- Guide complet: [DEPLOY_READY.md](DEPLOY_READY.md)
- Checklist: [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)
- API Docs: [API_INTEGRATION_COMPLETE.md](API_INTEGRATION_COMPLETE.md)

### Ressources Externes
- Railway Dashboard: https://railway.app/project/4c5e9d1a-2200-453b-bb4f-54926b978866
- Vercel Dashboard: https://vercel.com/feusteys-projects/t4-g
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs

---

## ✨ Félicitations !

Le backend est **100% déployé et opérationnel** ! 🎉

Il ne reste plus qu'à configurer le Root Directory dans Vercel et redéployer le frontend.

---

**Dernière mise à jour:** 16 décembre 2025  
**Auteur:** Assistant de Déploiement  
**Version:** 2.0.0


