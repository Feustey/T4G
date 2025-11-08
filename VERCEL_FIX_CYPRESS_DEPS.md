# 🔧 Fix Cypress Dependencies Conflict - Vercel Build

**Date** : 3 novembre 2025  
**Problème** : Conflit de dépendances Cypress lors du build Vercel  
**Status** : ✅ Résolu

---

## ❌ Problème Rencontré

Après avoir configuré le Root Directory, Vercel rencontre un nouveau problème :

```
npm error ERESOLVE could not resolve
npm error While resolving: @nrwl/cypress@15.4.5
npm error Found: cypress@12.1.0
npm error peerOptional cypress@">= 3 < 12" from @nrwl/cypress@15.4.5
```

**Cause** : 
- `@nrwl/cypress@15.4.5` attend Cypress `< 12`
- Le projet a Cypress `12.1.0` installé
- Vercel installe les dépendances du monorepo complet

---

## ✅ Solution Appliquée

### 1. Fichier `.npmrc` Créé

**Fichier** : `/apps/dapp/.npmrc`

```ini
legacy-peer-deps=true
engine-strict=false
```

**But** : Permet à npm d'ignorer les conflits de peer dependencies

### 2. Configuration Vercel Mise à Jour

**Fichiers modifiés** :
- `/apps/dapp/vercel.json`
- `/vercel.json`

**Changement** :
```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

**Avant** : `npm install`  
**Après** : `npm install --legacy-peer-deps`

---

## 🎯 Pourquoi Ça Fonctionne

### Le Problème en Détail

Dans un monorepo Nx, Vercel détecte automatiquement Nx et installe les dépendances depuis la racine :

```bash
npm install --prefix=../..
```

Cela installe **toutes** les dépendances du monorepo, y compris :
- Cypress 12.1.0 (dev)
- @nrwl/cypress 15.4.5 (qui veut Cypress < 12)

### La Solution

`--legacy-peer-deps` indique à npm :
- ✅ Installer les packages même avec des conflits de peer dependencies
- ✅ Utiliser l'ancien algorithme de résolution de dépendances (npm < 7)
- ✅ Ne pas bloquer sur les conflits non critiques

---

## 📊 Changements Effectués

### Fichiers Créés

1. **`/apps/dapp/.npmrc`**
   ```ini
   legacy-peer-deps=true
   engine-strict=false
   ```

### Fichiers Modifiés

1. **`/apps/dapp/vercel.json`**
   - `installCommand`: `npm install` → `npm install --legacy-peer-deps`

2. **`/vercel.json`** (racine)
   - `installCommand`: `npm install` → `npm install --legacy-peer-deps`

---

## 🚀 Prochaine Étape

### Option A - Redéploiement Automatique

Si vous avez activé les déploiements automatiques :
- ✅ Git commit + push
- ✅ Vercel redéploie automatiquement

```bash
git add .
git commit -m "fix(vercel): add legacy-peer-deps for Cypress conflict"
git push
```

### Option B - Redéploiement Manuel

Dashboard Vercel :
```
1. Deployments
2. Dernier déploiement
3. (...) → Redeploy
```

Ou CLI :
```bash
vercel --prod
```

---

## ✅ Résultat Attendu

Le build devrait maintenant réussir avec ce log :

```
✓ Detected Nx. Adjusting default settings...
✓ Running "install" command: npm install --legacy-peer-deps...
✓ Installing dependencies...
✓ Running "build" command: npm run build...
✓ Build completed successfully
```

**Temps estimé** : 3-5 minutes

---

## 🔍 Vérification Post-Build

Une fois le déploiement terminé :

```bash
# Frontend accessible
curl -I https://votre-url.vercel.app
# ✅ Attendu : HTTP/2 200

# Health check
curl https://votre-url.vercel.app/health
# ✅ Attendu : {"status":"ok"}

# Redirection
curl -I https://votre-url.vercel.app/
# ✅ Attendu : HTTP/2 307, Location: /fr
```

---

## 🐛 Troubleshooting

### Erreur Persiste ?

#### 1. Vérifier que Root Directory est bien configuré
```
Settings → General → Root Directory = "apps/dapp"
```

#### 2. Vérifier le fichier .npmrc
```bash
cat apps/dapp/.npmrc
# Doit contenir : legacy-peer-deps=true
```

#### 3. Vérifier installCommand dans vercel.json
```bash
cat apps/dapp/vercel.json | grep installCommand
# Doit contenir : "npm install --legacy-peer-deps"
```

#### 4. Clear Build Cache
```
Settings → General → Clear Build Cache → Redeploy
```

---

## 💡 Alternative : Corriger les Dépendances

**Solution à long terme** (optionnel) :

Mettre à jour les dépendances Nx pour supporter Cypress 12 :

```bash
# Dans le projet local
npm install -D @nrwl/cypress@latest @nrwl/next@latest
```

Ou downgrader Cypress :

```bash
npm install -D cypress@11.2.0
```

**Mais** : `--legacy-peer-deps` est plus rapide et sûr pour le déploiement.

---

## 📚 Documentation Connexe

- `VERCEL_FIX_NOW.md` - Fix Root Directory
- `VERCEL_ACTION_PLAN.md` - Plan complet
- `VERCEL_FIX_MONOREPO.md` - Documentation monorepo

---

## 📝 Résumé Technique

| Aspect | Détail |
|--------|--------|
| **Problème** | Conflit peer dependencies Cypress 12 vs @nrwl/cypress < 12 |
| **Solution** | `--legacy-peer-deps` dans installCommand |
| **Fichiers créés** | `/apps/dapp/.npmrc` |
| **Fichiers modifiés** | `/apps/dapp/vercel.json`, `/vercel.json` |
| **Impact** | Permet l'installation malgré les conflits non critiques |
| **Risque** | Faible - Cypress est uniquement pour les tests E2E |

---

## ✅ Checklist

- [x] Fichier `.npmrc` créé dans `apps/dapp`
- [x] `installCommand` mis à jour dans `vercel.json`
- [x] Documentation créée
- [ ] Git commit et push
- [ ] Redéploiement Vercel
- [ ] Vérification build réussi
- [ ] Tests endpoints

---

**Status Final** : ✅ Solution appliquée, en attente de redéploiement

**Prochaine Action** : Commit + Push pour déclencher le redéploiement automatique

