# 🔧 Solution 404 sur app.token-for-good.com - Diagnostic Final

**Date:** 16 janvier 2026  
**Status:** ⏳ Configuration i18n ajoutée | Déploiement Vercel échoué

---

## 🎯 Problème Identifié

La 404 sur `app.token-for-good.com` est causée par **2 configurations manquantes** :

### 1. Configuration i18n dans next.config.js ✅ CORRIGÉ

**Problème:** L'application utilise `router.locale` mais `next.config.js` n'avait pas de configuration i18n.

**Solution appliquée:**
```javascript
// next.config.js
i18n: {
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
}
```

### 2. Redirection racine dans vercel.json ✅ CORRIGÉ

**Problème:** La page d'accueil `/` doit rediriger vers `/fr` (locale par défaut).

**Solution appliquée:**
```json
// vercel.json
"redirects": [
  {
    "source": "/",
    "destination": "/fr",
    "permanent": false
  }
]
```

---

## ⚠️ Problème Actuel : Déploiement Vercel Échoué

### Erreur Rencontrée

```bash
Error: Your project's latest production deployment has errored.
```

Le build échoue sur Vercel, empêchant l'ajout du domaine `app.token-for-good.com`.

### Diagnostic

**✅ Build local fonctionne:**
```bash
cd apps/dapp
npm run build
# ✓ Compiled successfully
```

**❌ Build Vercel échoue** sans message d'erreur détaillé.

---

## 🚀 Solutions Pour Finaliser

### Solution 1: Consulter les Logs Vercel (RECOMMANDÉ)

1. **Aller sur:** https://vercel.com/feusteys-projects/dapp/9A1DXSeeKoQe96mwKvDfxdni5QHy

2. **Voir la section "Build Logs"** pour identifier l'erreur exacte

3. **Erreurs possibles:**
   - Timeout de build (dépasse la limite Vercel)
   - Problème de mémoire
   - Module manquant malgré package.json
   - Erreur de compilation Next.js

### Solution 2: Build Prebuilt (RAPIDE)

Builder localement et uploader le résultat :

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G/apps/dapp

# Build local
rm -rf .next
npm run build

# Vérifier que .next/ existe et est complet
ls -la .next/

# Déployer avec le build
vercel --prebuilt --prod
```

### Solution 3: Augmenter la Limite de Build

Si c'est un problème de timeout/mémoire dans les settings Vercel:

1. **Settings → General → Build & Development Settings**
2. Vérifier "Build Command": `npm run build`
3. Vérifier "Output Directory": `.next`
4. Si disponible, augmenter le timeout ou la mémoire

### Solution 4: Simplifier le Build

Désactiver temporairement certaines optimisations :

```javascript
// next.config.js
const nextConfig = {
  // ...
  
  // Désactiver SWC si problème
  swcMinify: false,
  
  // Ou désactiver les optimisations images
  // images: {
  //   unoptimized: true,
  // },
};
```

---

## 📋 Fichiers Modifiés (Dernière Session)

### apps/dapp/next.config.js ✅

```javascript
// Ajouté :
i18n: {
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
}
```

### apps/dapp/vercel.json ✅

```json
// Ajouté :
"redirects": [
  {
    "source": "/",
    "destination": "/fr",
    "permanent": false
  }
]
```

---

## 🧪 Tests de Validation

### Test Local ✅

```bash
cd apps/dapp
npm run build
npm start

# Tester dans le navigateur:
# http://localhost:3000/      → devrait rediriger vers /fr
# http://localhost:3000/fr    → devrait afficher la page et rediriger vers /login
```

### Test Production (Après Déploiement)

```bash
# Health check backend
curl https://app.token-for-good.com/health

# Page d'accueil
curl -L https://app.token-for-good.com/

# Login
curl https://app.token-for-good.com/fr/login
```

---

## 🔍 Debugging Vercel

### Commandes Utiles

```bash
# Liste des déploiements
vercel ls

# Logs du dernier déploiement
vercel logs <deployment-url>

# Informations du projet
vercel inspect <deployment-url>

# Redéployer en forçant
vercel --prod --force

# Build prebuilt
vercel --prebuilt --prod
```

### Dashboard Vercel

**URL:** https://vercel.com/feusteys-projects/dapp

**À vérifier:**
1. **Deployments** → Dernier déploiement → **Build Logs**
2. **Settings → General:**
   - Root Directory: `.` ou vide
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install --legacy-peer-deps`
3. **Settings → Environment Variables:**
   - Toutes les variables NEXT_PUBLIC_* présentes en Production

---

## 📊 Récapitulatif de l'État

```
┌────────────────────────────────────────────────┐
│  COMPOSANT         STATUS                      │
├────────────────────────────────────────────────┤
│  Backend Railway   ✅ OPÉRATIONNEL             │
│  Build Local       ✅ FONCTIONNE               │
│  Config i18n       ✅ AJOUTÉE                  │
│  Redirect /→/fr    ✅ AJOUTÉE                  │
│  Build Vercel      ❌ ÉCHOUE (à debugger)      │
│  Domaine t4g.*     ⏳ ATTEND BUILD OK          │
└────────────────────────────────────────────────┘
```

---

## 🎯 Action Immédiate

**Deux options parallèles:**

### Option A: Debug via Dashboard (10 min)
1. Ouvrir https://vercel.com/feusteys-projects/dapp
2. Cliquer sur le dernier déploiement
3. Lire les "Build Logs" complets
4. Identifier l'erreur exacte
5. Corriger et redéployer

### Option B: Deploy Prebuilt (5 min)
```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G/apps/dapp
npm run build
vercel --prebuilt --prod
```

**Si prebuilt réussit:**
```bash
vercel domains add app.token-for-good.com
```

---

## 📝 Configuration DNS (Après Build OK)

Une fois le build réussi et le domaine ajouté:

```
Provider DNS: (où token-for-good.com est géré)
Type: CNAME
Name: t4g
Value: cname.vercel-dns.com
TTL: 3600
```

**Vérification:**
```bash
nslookup app.token-for-good.com
# Devrait pointer vers Vercel

curl https://app.token-for-good.com/
# Devrait afficher l'application
```

---

## ✅ Ce Qui Est Prêt

- ✅ Backend 100% opérationnel
- ✅ Frontend refactoré (standalone)
- ✅ Build local fonctionnel
- ✅ Configuration i18n ajoutée
- ✅ Redirection racine configurée
- ✅ Toutes les dépendances installées
- ✅ Variables d'environnement configurées

## ⏳ Ce Qui Reste

- ⏳ Résoudre l'erreur de build Vercel
- ⏳ Ajouter le domaine app.token-for-good.com
- ⏳ Configurer le DNS
- ⏳ Tester l'application en production

---

**Prochaine Action:** Consulter les Build Logs sur https://vercel.com/feusteys-projects/dapp pour identifier l'erreur exacte, ou tenter un déploiement prebuilt.

**ETA:** 5-15 minutes selon la solution choisie.

---

**Créé le:** 16 janvier 2026  
**Dernière mise à jour:** 16 janvier 2026 16:05
