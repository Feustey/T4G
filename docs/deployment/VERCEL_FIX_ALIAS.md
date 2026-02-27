# 🔧 Correction Problème d'Alias Vercel - Solution Appliquée

**Date** : 16 janvier 2026  
**Status** : ✅ Correctif appliqué - Configuration Dashboard requise  
**Problème** : Les imports `@t4g/*` cassent le build Vercel

---

## 🔍 Diagnostic du Problème

### Le Problème Identifié

Votre projet est un **monorepo Nx** avec cette structure :

```
T4G/
├── apps/dapp/          ← Root Directory Vercel (AVANT)
│   ├── pages/          ← Utilise @t4g/ui/components
│   ├── components/     ← Utilise @t4g/types
│   └── tsconfig.json   (baseUrl: "../..")
├── libs/               ← LES LIBS SONT ICI (hors de apps/dapp)
│   ├── ui/
│   │   ├── components/
│   │   ├── elements/
│   │   ├── layouts/
│   │   └── icons/
│   ├── types/
│   └── service/
└── shared/types/
```

**Le problème** :
- Vercel était configuré avec `Root Directory = apps/dapp`
- Les imports `@t4g/*` pointent vers `../../libs/*` (en dehors de apps/dapp)
- Vercel ne pouvait pas résoudre ces chemins car il ne voyait que `apps/dapp/`
- ❌ **Résultat** : `Module not found: Can't resolve '@t4g/ui/components'`

### Imports Impactés

**29 fichiers** dans `apps/dapp` utilisent ces imports :

```typescript
import { User } from '@t4g/types';                    // ❌ Échec
import { AppModal } from '@t4g/ui/layouts';           // ❌ Échec
import { RightPanel } from '@t4g/ui/layouts';         // ❌ Échec
import { ROLE_TYPE } from '@t4g/types';               // ❌ Échec
```

---

## ✅ Solution Appliquée : Root Directory à la Racine

### Changements Effectués

#### 1. `/vercel.json` (racine) - Modifié ✅

**Changement principal** : 
```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

**Avant** : `npm install --legacy-peer-deps && cd apps/dapp && npm install --legacy-peer-deps`  
**Après** : `npm install --legacy-peer-deps`

**Pourquoi** : Avec Root Directory à la racine, on installe depuis la racine et Vercel gère le reste.

#### 2. `/.vercelignore` - Mis à jour ✅

**Ajout de dossiers à ignorer** :
```
token4good-backend
.git
.github
staging-deploy
*.md
!README.md
.husky
node_modules
dist
contracts
tools
```

**Pourquoi** : Exclure les dossiers non nécessaires pour le build frontend.

---

## 🚀 Configuration Dashboard Vercel (ACTION REQUISE)

### Étape 1 : Accéder au Dashboard

🔗 https://vercel.com/dashboard

1. Sélectionnez votre projet
2. Cliquez sur **Settings** ⚙️

### Étape 2 : Modifier le Root Directory

1. Dans **Settings** → **General**
2. Trouvez la section **Root Directory**
3. Cliquez sur **Edit**
4. **CHANGEMENT CRITIQUE** :
   - ❌ **Valeur actuelle** : `apps/dapp`
   - ✅ **Nouvelle valeur** : `.` (point = racine)
5. Cliquez sur **Save**

### Étape 3 : Vérifier Build & Development Settings

Dans la même section **Settings** → **General** :

| Paramètre | Valeur |
|-----------|--------|
| **Framework Preset** | `Next.js` |
| **Build Command** | `cd apps/dapp && npm run build` |
| **Output Directory** | `apps/dapp/.next` |
| **Install Command** | `npm install --legacy-peer-deps` |
| **Node.js Version** | `20.x` (recommandé) |

### Étape 4 : Vérifier Variables d'Environnement

**Settings** → **Environment Variables** :

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `NEXT_PUBLIC_API_URL` | `https://apirust-production.up.railway.app` | Production, Preview, Development |
| `NEXT_PUBLIC_DAZNO_API_URL` | `https://www.token-for-good.com/api` | Production, Preview, Development |
| `NEXT_PUBLIC_DAZNO_USERS_API_URL` | `https://www.token-for-good.com/api` | Production, Preview, Development |
| `NEXT_PUBLIC_DAZNO_VERIFY_URL` | `https://www.token-for-good.com/api/verify` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `SKIP_ENV_VALIDATION` | `true` | Production |

### Étape 5 : Redéployer

#### Option A : Depuis le Dashboard Vercel

1. Allez dans **Deployments**
2. Trouvez le dernier déploiement
3. Cliquez sur les **trois points** (...) → **Redeploy**
4. ⚠️ **Important** : Décocher **"Use existing Build Cache"**
5. Cliquez sur **Redeploy**

#### Option B : Depuis votre Terminal

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G

# Commit les changements
git add vercel.json .vercelignore VERCEL_FIX_ALIAS.md
git commit -m "fix(vercel): configure root directory pour résoudre alias monorepo

- Change Root Directory de apps/dapp vers racine
- Simplifie installCommand (un seul npm install)
- Met à jour .vercelignore pour exclure dossiers inutiles
- Résout erreurs 'Module not found' pour imports @t4g/*

Fixes: #issue-number"

git push
```

Vercel détectera le nouveau commit et redéploiera automatiquement.

---

## ✅ Vérifications Post-Déploiement

### Build Logs Attendus

```bash
✓ Detected Nx monorepo
✓ Running install command: npm install --legacy-peer-deps...
✓ Installing dependencies...
✓ Dependencies installed (libs/, shared/ accessibles)
✓ Running build command: cd apps/dapp && npm run build...
✓ Resolving @t4g/ui/components → ../../libs/ui/components ✅
✓ Resolving @t4g/types → ../../libs/types ✅
✓ Transpiling packages with SWC...
✓ Compiled successfully
✓ Build completed successfully
```

### Tests à Effectuer

```bash
# 1. Vérifier que le site est accessible
curl -I https://votre-domaine.vercel.app
# ✅ HTTP/2 200

# 2. Vérifier la redirection racine
curl -I https://votre-domaine.vercel.app/
# ✅ HTTP/2 307 Location: /fr

# 3. Vérifier page française
curl https://votre-domaine.vercel.app/fr
# ✅ HTML chargé sans erreurs

# 4. Vérifier proxy backend
curl https://votre-domaine.vercel.app/health
# ✅ {"status":"ok"}
```

### Tests Navigateur

1. ✅ Ouvrir https://votre-domaine.vercel.app
2. ✅ Vérifier redirection vers /fr
3. ✅ Vérifier Console DevTools (pas d'erreurs critiques)
4. ✅ Tester navigation entre pages
5. ✅ Vérifier que les composants UI s'affichent correctement

---

## 🎯 Pourquoi Cette Solution Fonctionne

### Architecture de Build

**AVANT** (Root Directory = `apps/dapp`) :
```
Vercel Build Context
└── apps/dapp/                ← Vue limitée
    ├── pages/
    ├── components/
    └── ❌ libs/ inexistant    ← Imports @t4g/* échouent
```

**APRÈS** (Root Directory = `.`) :
```
Vercel Build Context
├── apps/dapp/                ← Application Next.js
│   ├── pages/
│   └── components/
├── libs/                     ← ✅ Accessible !
│   ├── ui/components/        ← @t4g/ui/components
│   ├── types/                ← @t4g/types
│   └── service/
└── shared/types/             ← @shared/types
```

### Résolution des Alias

Avec Root Directory à la racine, les alias TypeScript et Webpack fonctionnent :

**`apps/dapp/tsconfig.json`** :
```json
{
  "compilerOptions": {
    "baseUrl": "../..",           ← Pointe vers racine
    "paths": {
      "@t4g/ui/components": ["libs/ui/components/src/index.ts"],
      "@t4g/types": ["libs/types/src/index.ts"]
    }
  }
}
```

**`apps/dapp/next.config.js`** :
```javascript
webpack: (config) => {
  config.resolve.alias = {
    '@t4g/ui/components': path.resolve(__dirname, '../../libs/ui/components/src'),
    '@t4g/types': path.resolve(__dirname, '../../libs/types/src')
  };
}
```

**`transpilePackages`** (dans next.config.js) :
```javascript
transpilePackages: [
  '@t4g/types',
  '@t4g/ui/components',
  '@t4g/ui/layouts',
  // ... tous les packages du monorepo
]
```

Vercel peut maintenant :
1. ✅ Trouver les fichiers dans `libs/`
2. ✅ Résoudre les imports `@t4g/*`
3. ✅ Transpiler les packages avec SWC
4. ✅ Générer le build sans erreurs

---

## 🐛 Troubleshooting

### Erreur : "Module not found" persiste

**Cause** : Root Directory pas changé dans le Dashboard  
**Solution** : Vérifiez Settings → General → Root Directory = `.`

### Erreur : "No Next.js version detected"

**Cause** : Build Command incorrect  
**Solution** : Build Command doit être `cd apps/dapp && npm run build`

### Erreur : "Cannot find package.json"

**Cause** : Install Command s'exécute dans le mauvais répertoire  
**Solution** : Install Command doit être `npm install --legacy-peer-deps` (sans cd)

### Build très lent

**Cause** : Cache pas activé  
**Solution** : Settings → General → Enable Build Cache

### Erreur Cypress dependencies

**Cause** : Conflit peer dependencies  
**Solution** : Déjà résolu avec `--legacy-peer-deps`

---

## 📊 Résumé des Changements

| Fichier | Changement | Impact |
|---------|-----------|--------|
| `/vercel.json` | Simplifié `installCommand` | Installation depuis racine |
| `/.vercelignore` | Ajout dossiers à ignorer | Build plus rapide |
| **Dashboard Vercel** | Root Directory: `.` | ✅ Résout alias @t4g/* |

### Commandes Git

```bash
git status
# modified:   vercel.json
# modified:   .vercelignore
# new file:   VERCEL_FIX_ALIAS.md

git add vercel.json .vercelignore VERCEL_FIX_ALIAS.md
git commit -m "fix(vercel): configure root directory pour résoudre alias monorepo"
git push
```

---

## 📚 Documentation Associée

- `VERCEL_FIX_NOW.md` - Fix rapide précédent
- `VERCEL_COMPLETE_FIX.md` - Documentation complète
- `VERCEL_FIX_MONOREPO.md` - Guide monorepo
- `DEPLOIEMENT_PRODUCTION_GUIDE.md` - Guide déploiement complet

---

## ✅ Checklist Finale

### Avant Push

- [x] `vercel.json` modifié
- [x] `.vercelignore` mis à jour
- [x] Documentation créée

### Après Push

- [ ] Commit effectué
- [ ] Push vers GitHub
- [ ] Root Directory changé à `.` dans Dashboard Vercel
- [ ] Variables d'environnement vérifiées
- [ ] Redéploiement lancé
- [ ] Build réussi sans erreurs "Module not found"
- [ ] Application accessible et fonctionnelle

---

## 🎉 Résultat Attendu

Après ces changements :

✅ **Vercel voit tout le monorepo**  
✅ **Les imports `@t4g/*` se résolvent correctement**  
✅ **Build réussit sans erreurs d'alias**  
✅ **Application déployée avec succès**  
✅ **29 fichiers avec imports fonctionnent**  

---

## 💡 Pour les Futurs Déploiements

### Commande de Déploiement

```bash
# Depuis la racine du projet
./scripts/deploy-vercel.sh production
```

### Commandes Vercel CLI

```bash
# Déployer en production
vercel --prod

# Déployer en preview
vercel

# Voir les logs
vercel logs

# Lister les déploiements
vercel ls
```

---

**🚀 La configuration est prête ! Il ne reste plus qu'à changer le Root Directory dans le Dashboard Vercel.**

**Temps estimé** : 5 minutes  
**Difficulté** : Facile (changement de configuration uniquement)

---

**Date de création** : 16 janvier 2026  
**Dernière mise à jour** : 16 janvier 2026  
**Status** : ✅ Prêt pour application  
**Auteur** : Assistant IA (analyse + solution)
