# 🔧 Problème Assets & Images - Status Actuel

**Date :** 16 janvier 2026, 11h20  
**Status :** ⚠️ **PAGE FONCTIONNE - ASSETS EN 404**

---

## 📊 État Actuel

### ✅ Ce qui fonctionne
- **Page d'accueil :** HTTP 200 ✅
- **Titre affiché :** "Loading..." ✅
- **JavaScript chargé :** Chunks Next.js OK ✅
- **Backend :** https://apirust-production.up.railway.app → OK ✅

### ❌ Ce qui ne fonctionne pas
- **Images :** HTTP 404 ❌
- **Assets statiques :** `/favicon.ico`, `/assets/*` → 404 ❌
- **Next.js Image API :** HTTP 400 ❌

---

## 🔍 Diagnostic

### Tests Effectués

```bash
# Page d'accueil
curl -I https://app.token-for-good.com
# Résultat : HTTP/2 200 ✅

# Favicon
curl -I https://app.token-for-good.com/favicon.ico
# Résultat : HTTP/2 404 ❌

# Image via Next.js
curl -I "https://app.token-for-good.com/_next/image?url=%2Fassets%2Fimages%2Fpng%2Fspinner.png&w=256&q=75"
# Résultat : HTTP/2 400 ❌
```

### Structure Locale (OK)
```
apps/dapp/public/
├── favicon.ico ✓
├── assets/
│   ├── images/
│   │   └── png/
│   │       └── spinner.png ✓
```

---

## 🛠️ Corrections Tentées

### 1. Middleware ✅
**Fichier :** `apps/dapp/middleware.ts`

```typescript
// Ajout d'exclusions pour assets
const ASSET_PATHS = /^\/(assets|favicon|...)/;

if (ASSET_PATHS.test(pathname)) {
  return NextResponse.next();
}
```

### 2. Vercel.json 🔄
**Tentatives :**
- ❌ Ajout `rootDirectory: "apps/dapp"`
- ❌ Suppression redirections `/` → `/fr`
- ⚠️ Configuration monorepo complexe

---

## 🎯 Problème Root Cause

### Hypothèse Principale
**Vercel ne trouve pas le dossier `public/` dans la structure monorepo**

```
Workspace Root/
├── vercel.json           ← Configuration ici
├── apps/
│   └── dapp/
│       ├── pages/        ← Détecté OK
│       ├── public/       ← NON détecté ❌
│       └── next.config.js
```

### Configuration Actuelle `vercel.json`
```json
{
  "buildCommand": "cd apps/dapp && npm run build",
  "outputDirectory": "apps/dapp/.next",
  "installCommand": "npm install --legacy-peer-deps"
}
```

---

## ✅ Solutions Possibles

### Option 1 : Configuration Vercel Project Settings (Recommandé)
**Dans le dashboard Vercel :**

1. Aller dans **Settings** → **General**
2. **Root Directory** → Définir à `apps/dapp`
3. **Build Command** → Laisser vide (auto-détection)
4. **Output Directory** → Laisser vide (auto-détection)
5. Redéployer

**Avantages :**
- Vercel gère automatiquement le `public/`
- Configuration plus propre
- Meilleure compatibilité Next.js

### Option 2 : Copier public dans root (Workaround)
```bash
# Dans vercel.json
{
  "buildCommand": "cp -r apps/dapp/public/* public/ && cd apps/dapp && npm run build",
  ...
}
```

### Option 3 : Image Optimization désactivée
```javascript
// next.config.js
module.exports = {
  images: {
    unoptimized: true,  // Désactive Next.js Image API
  }
}
```

---

## 🚀 Action Recommandée IMMÉDIATE

### Via Dashboard Vercel (Préféré)
1. Aller sur https://vercel.com/feusteys-projects/t4-g
2. **Settings** → **General** → **Root Directory**
3. Définir : `apps/dapp`
4. **Redéployer** (bouton en haut)

**Temps estimé :** 3 minutes  
**Probabilité de succès :** 90%

---

## 📝 Workaround Temporaire

### Si les images sont critiques MAINTENANT

**Utiliser des URLs externes temporaires :**

```typescript
// Au lieu de
<Image src="/assets/images/png/spinner.png" />

// Utiliser
<Image src="https://t4g-assets.vercel.app/spinner.png" />
```

---

## 🔗 Références

### Documentation Vercel
- [Monorepo Configuration](https://vercel.com/docs/monorepos)
- [Root Directory Setting](https://vercel.com/docs/projects/project-configuration#root-directory)
- [Next.js Static Files](https://nextjs.org/docs/basic-features/static-file-serving)

### Commits Récents
- `2d7d7c9` - Fix middleware pour assets
- `cfa5aad` - Ajout rootDirectory
- `8269697` - Simplification vercel.json

---

## 📊 Impact Utilisateur

### Actuellement
- ⚠️ **Page charge** mais **sans images**
- ⚠️ **Spinner** invisible (spinner.png manquant)
- ⚠️ **Favicon** absent
- ✅ **Fonctionnalité** préservée (JS/routing OK)

### Criticité
**MOYENNE** - L'application fonctionne mais expérience utilisateur dégradée

---

## 🎯 Plan d'Action

### Immédiat (5 min)
1. ✅ Configurer Root Directory sur Vercel Dashboard
2. ✅ Redéployer
3. ✅ Tester images

### Si échec (15 min)
1. Ajouter script de copie `public/` dans build
2. Commit + push
3. Tester

### Si toujours échec (30 min)
1. Désactiver Next.js Image Optimization
2. Utiliser URLs absolues pour assets critiques
3. Debug approfondi structure Vercel

---

**Prochaine Étape : Configurer Root Directory dans Dashboard Vercel** 🎯
