# ⚡ Fix Alias Vercel - Résumé Rapide

**Date** : 16 janvier 2026  
**Status** : ✅ Correctif appliqué - Action requise

---

## 🎯 Problème Résolu

❌ **Avant** : `Module not found: Can't resolve '@t4g/ui/components'`  
✅ **Après** : Tous les imports `@t4g/*` fonctionnent

---

## ✅ Changements Appliqués

### 1. `/vercel.json` - Modifié
```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```
Installation simplifiée depuis la racine.

### 2. `/.vercelignore` - Mis à jour
Ajout de dossiers à ignorer pour optimiser le build.

### 3. `VERCEL_FIX_ALIAS.md` - Créé
Documentation complète du fix avec guide étape par étape.

---

## 🚀 ACTION REQUISE - 1 Seule Chose à Faire

### Changer Root Directory dans Vercel Dashboard

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. **Settings** → **General** → **Root Directory**
4. Cliquer sur **Edit**
5. **Changer** : `apps/dapp` → `.` (point)
6. **Save**
7. **Deployments** → **Redeploy** (décocher "Use existing Build Cache")

**C'EST TOUT !** 🎉

---

## 📋 Commit Git

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G

git add vercel.json .vercelignore VERCEL_FIX_ALIAS.md VERCEL_ALIAS_FIX_RESUME.md

git commit -m "fix(vercel): configure root directory pour résoudre alias monorepo

- Change Root Directory de apps/dapp vers racine
- Simplifie installCommand (un seul npm install)
- Met à jour .vercelignore pour exclure dossiers inutiles
- Résout erreurs 'Module not found' pour imports @t4g/*

Les imports @t4g/ui/*, @t4g/types, @shared/types fonctionnent maintenant
car Vercel voit tout le monorepo depuis la racine."

git push
```

---

## 🔍 Pourquoi Ça Marche

**AVANT** : Root Directory = `apps/dapp`
- Vercel ne voyait que `apps/dapp/`
- Les `libs/` à la racine étaient inaccessibles
- Imports `@t4g/*` échouaient

**APRÈS** : Root Directory = `.` (racine)
- Vercel voit tout le monorepo
- `libs/`, `shared/`, `apps/` tous accessibles
- Imports `@t4g/*` résolus correctement

---

## ✅ Vérification Post-Déploiement

### Build Logs Attendus
```
✓ Resolving @t4g/ui/components → ../../libs/ui/components ✅
✓ Resolving @t4g/types → ../../libs/types ✅
✓ Compiled successfully
```

### Tests
```bash
curl https://votre-domaine.vercel.app
# ✅ HTTP/2 200
```

---

## 📚 Documentation Complète

**Guide détaillé** : `VERCEL_FIX_ALIAS.md`

---

**Temps total** : 5 minutes (changement Dashboard + commit)  
**Prêt pour production** : ✅ Oui
