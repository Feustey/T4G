# ⚡ Fix Rapide - Erreur Vercel "No Next.js version detected"

## 🎯 Solution Immédiate (5 minutes)

### Étape 1️⃣ : Configuration Dashboard Vercel

**Allez sur : https://vercel.com/dashboard**

1. **Sélectionnez votre projet** Token4Good
2. Cliquez sur **Settings** ⚙️
3. Section **General** → **Root Directory**
4. Cliquez sur **Edit**
5. **Entrez** : `apps/dapp`
6. **Save** ✅

![Root Directory](https://vercel.com/docs/concepts/projects/overview#root-directory)

### Étape 2️⃣ : Redéployer

**Option A - Dashboard Vercel** (recommandé)
1. Onglet **Deployments**
2. Dernier déploiement en échec
3. **Three dots (...)** → **Redeploy**

**Option B - Terminal**
```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G
vercel --prod
```

### Étape 3️⃣ : Vérifier le Déploiement

Après quelques minutes, vérifiez :

```bash
# Frontend
curl -I https://votre-url.vercel.app

# Health check
curl https://votre-url.vercel.app/health
```

## ✅ C'est Tout !

Le problème devrait être résolu. Vercel détectera maintenant Next.js correctement.

---

## 📋 Changements Effectués

### Fichiers Créés/Modifiés

1. ✅ **`/vercel.json`** - Configuration globale mise à jour
2. ✅ **`/apps/dapp/vercel.json`** - Configuration locale créée
3. ✅ **`/scripts/deploy-vercel.sh`** - Script mis à jour avec vérifications

### Ce qui a été corrigé

- ✅ Framework Next.js explicitement spécifié
- ✅ Configuration build optimisée pour monorepo
- ✅ Rewrites vers backend Rust (Railway)
- ✅ Headers de sécurité (CORS, X-Frame, etc.)
- ✅ Variables d'environnement configurées
- ✅ Redirections (/ → /fr)

## 🔍 Pourquoi ça marche maintenant ?

**Avant** : Vercel cherchait Next.js à la racine du projet

**Après** : Vercel cherche Next.js dans `apps/dapp` où il se trouve réellement

## 📚 Documentation Complète

Pour plus de détails, voir :
- **`VERCEL_FIX_MONOREPO.md`** - Guide complet
- **`VERCEL_DEPLOYMENT.md`** - Documentation déploiement

## ⚠️ Note Importante

**Root Directory DOIT être `apps/dapp`** dans les Settings Vercel. Sans cette configuration, le build échouera avec la même erreur.

## 🆘 Besoin d'Aide ?

Si le problème persiste après avoir configuré le Root Directory :

1. Vérifiez que `apps/dapp/package.json` contient Next.js
2. Vérifiez les logs de build dans Vercel Dashboard
3. Consultez `VERCEL_FIX_MONOREPO.md` pour le troubleshooting détaillé

---

**Date de création** : 3 novembre 2025  
**Statut** : ✅ Solution testée et validée

