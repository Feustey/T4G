# 🔧 Correction Configuration Vercel pour Monorepo

## Problème Identifié

Vercel ne détecte pas Next.js car le projet est un monorepo Nx et le Root Directory n'est pas configuré correctement.

## ✅ Solution : Configuration Dashboard Vercel

### Étape 1 : Accéder aux Paramètres du Projet

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `token4good-dapp`
3. Cliquez sur **Settings** (⚙️)

### Étape 2 : Configurer le Root Directory

1. Dans le menu de gauche, cliquez sur **General**
2. Trouvez la section **Root Directory**
3. Cliquez sur **Edit**
4. Entrez : `apps/dapp`
5. Cliquez sur **Save**

### Étape 3 : Vérifier la Configuration Build

Dans **Settings > General**, vérifiez que :

**Framework Preset** : Next.js
- ✅ Devrait être détecté automatiquement une fois le Root Directory configuré

**Build Command** :
```bash
npm run build
```

**Install Command** :
```bash
npm install
```

**Output Directory** :
```bash
.next
```
(Laisser vide si détecté automatiquement)

### Étape 4 : Variables d'Environnement

Dans **Settings > Environment Variables**, ajoutez :

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://apirust-production.up.railway.app` | Production |
| `NEXT_PUBLIC_DAZNO_API_URL` | `https://api.dazno.de/api/v1` | Production |
| `NEXT_PUBLIC_DAZNO_USERS_API_URL` | `https://api.dazno.de/api/v1/users` | Production |
| `NODE_ENV` | `production` | Production |
| `SKIP_ENV_VALIDATION` | `true` | Production |

### Étape 5 : Redéployer

1. Allez dans l'onglet **Deployments**
2. Trouvez le dernier déploiement en échec
3. Cliquez sur les trois points (...) > **Redeploy**

Ou depuis le terminal :

```bash
cd apps/dapp
vercel --prod
```

## 📋 Configuration Actuelle

### Fichiers Créés/Mis à Jour

1. **`/vercel.json`** (racine) - Configuration globale
2. **`/apps/dapp/vercel.json`** - Configuration spécifique au dapp

Ces fichiers configurent :
- ✅ Framework Next.js explicite
- ✅ Rewrites vers le backend Rust sur Railway
- ✅ Headers de sécurité (CORS, X-Frame-Options, etc.)
- ✅ Redirections (/ → /fr)
- ✅ Variables d'environnement

## 🔍 Vérification Post-Déploiement

Une fois le déploiement réussi, vérifiez :

```bash
# Frontend accessible
curl -I https://votre-domaine.vercel.app

# Health check
curl https://votre-domaine.vercel.app/health

# API redirigée vers Railway
curl https://votre-domaine.vercel.app/api/backend/health
```

## 📊 Structure Monorepo Nx

```
/
├── apps/
│   └── dapp/              ← Root Directory Vercel (apps/dapp)
│       ├── package.json   ← Next.js 14.2.15
│       ├── vercel.json    ← Config Vercel locale
│       ├── next.config.js
│       └── pages/
├── package.json           ← Next.js 13.5.0 (racine)
└── vercel.json            ← Config Vercel globale
```

## ⚠️ Points Importants

1. **Root Directory** : DOIT être `apps/dapp` dans les settings Vercel
2. **package.json** : Next.js est dans `apps/dapp/package.json` (v14.2.15)
3. **Monorepo** : Vercel détectera automatiquement Nx mais doit pointer vers le bon répertoire
4. **Build Command** : Simple `npm run build` (pas de `cd apps/dapp`)

## 🐛 Troubleshooting

### Erreur : "No Next.js version detected"
➡️ **Solution** : Configurer Root Directory = `apps/dapp`

### Erreur : "Build command failed"
➡️ **Solution** : Vérifier que `npm install` s'exécute dans `apps/dapp`

### Erreur : "Module not found"
➡️ **Solution** : Vérifier les imports relatifs dans le code

## 📚 Documentation Vercel

- [Monorepo Support](https://vercel.com/docs/monorepos)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## ✅ Checklist Déploiement

- [ ] Root Directory configuré sur `apps/dapp`
- [ ] Variables d'environnement ajoutées
- [ ] Framework détecté comme Next.js
- [ ] Build command = `npm run build`
- [ ] Install command = `npm install`
- [ ] Redéploiement lancé
- [ ] Vérification des endpoints (/, /health, /api/backend/health)

## 🚀 Prochaine Étape

Une fois le déploiement réussi, mettez à jour le domaine custom si nécessaire :

**Settings > Domains** : Ajouter `t4g.dazno.de` ou votre domaine personnalisé

