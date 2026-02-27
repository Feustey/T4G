# Instructions de Déploiement Vercel - Token4Good RGB v2

## 🚀 Déploiement Direct sur Vercel

### Étape 1: Préparer le Repository

1. **Commit et Push** des dernières modifications :
```bash
git add .
git commit -m "Prepare for Vercel deployment - Token4Good RGB v2"
git push origin main
```

### Étape 2: Configuration Vercel

1. **Aller sur** : https://vercel.com/feusteys-projects/token4good

2. **Settings → Environment Variables** :

#### Variables Critiques à Configurer :

```bash
# Authentication
NEXTAUTH_URL=https://token4good.vercel.app
NEXTAUTH_SECRET=your-super-secret-jwt-key-min-32-chars

# API Backend
NEXT_PUBLIC_API_URL=https://token4good-backend-production.up.railway.app/api

# Dazno Integration  
NEXT_PUBLIC_DAZNO_API_URL=https://token-for-good.com/api
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://api.token-for-good.com/users
DAZNO_CLIENT_ID=token4good-production
DAZNO_CLIENT_SECRET=your-dazno-secret

# Database (Supabase)
DATABASE_URL=postgresql://postgres:your-password@db.glikbylflheewbonytev.supabase.co:5432/postgres

# Build Configuration
NODE_ENV=production
SKIP_ENV_VALIDATION=true
```

### Étape 3: Build Configuration

1. **Settings → General → Build & Output Settings** :

```bash
Framework Preset: Next.js
Build Command: cd apps/dapp && npm ci && npm run build
Output Directory: apps/dapp/.next
Install Command: npm ci
Node.js Version: 18.x
```

### Étape 4: Deploy Settings

1. **Settings → Git** :
   - ✅ Automatic deployments from `main` branch
   - ✅ Preview deployments from all branches

### Étape 5: Lancer le Déploiement

#### Option A: Via Interface Vercel
1. Aller sur **Deployments**
2. Cliquer **Deploy** 
3. Sélectionner `main` branch
4. Attendre le build (5-10 minutes)

#### Option B: Via CLI
```bash
# Installer Vercel CLI
npm install -g vercel@latest

# Login
vercel login

# Deploy
vercel --prod
```

### Étape 6: Vérification Post-Déploiement

Une fois déployé, vérifier :

1. **Site Principal** : https://token4good.vercel.app
   - ✅ Page d'accueil charge
   - ✅ Redirections fonctionnent (/ → /fr)

2. **Authentication** : https://token4good.vercel.app/login
   - ✅ Bouton Dazno présent
   - ✅ Redirection CORS configurée

3. **API Routes** : https://token4good.vercel.app/api/health
   - ✅ Health check répond
   - ✅ Backend proxy fonctionne

4. **Backend Integration** : 
   - ✅ Appels vers Railway backend
   - ✅ CORS configuré pour Dazno

## 🔧 Troubleshooting

### Problème 1: Build Failed - TypeScript Errors
**Solution** : Ajouter dans Environment Variables :
```bash
SKIP_ENV_VALIDATION=true
NODE_ENV=production
```

### Problème 2: CORS Errors
**Solution** : Vérifier dans `vercel.json` :
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://token-for-good.com" }
      ]
    }
  ]
}
```

### Problème 3: Backend API Not Found
**Solution** : Vérifier la variable :
```bash
NEXT_PUBLIC_API_URL=https://token4good-backend-production.up.railway.app/api
```

### Problème 4: NextAuth Errors
**Solution** : Configurer :
```bash
NEXTAUTH_URL=https://token4good.vercel.app
NEXTAUTH_SECRET=your-secret-32-chars-minimum
```

## 📊 Configuration Optimale

### vercel.json (déjà configuré)
```json
{
  "version": 2,
  "name": "token4good",
  "framework": "nextjs",
  "builds": [
    {
      "src": "apps/dapp/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/backend/(.*)",
      "dest": "https://token4good-backend-production.up.railway.app/api/$1"
    }
  ]
}
```

### next.config.js (optimisé pour Vercel)
- ✅ i18n configuration
- ✅ CORS headers pour Dazno
- ✅ Image optimization
- ✅ TypeScript error handling

## 🎯 Résultat Attendu

### URLs de Production
- **Main** : https://token4good.vercel.app
- **French** : https://token4good.vercel.app/fr
- **English** : https://token4good.vercel.app/en
- **Login** : https://token4good.vercel.app/login
- **Dashboard** : https://token4good.vercel.app/dashboard

### Features Fonctionnelles
- ✅ Authentification Dazno
- ✅ Interface multilingue (FR/EN)
- ✅ Dashboard utilisateur
- ✅ Système de mentoring
- ✅ Intégration backend Rust
- ✅ API proxy vers Railway

### Performance
- ✅ SSG/SSR optimisé
- ✅ Image optimization
- ✅ Bundle splitting automatique
- ✅ CDN global Vercel

## 🔐 Sécurité

### Headers Configurés
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: origin-when-cross-origin
- ✅ CORS: Dazno integration

### Variables Sensibles
- ❌ Jamais exposer les secrets en frontend
- ✅ Utiliser NEXT_PUBLIC_ pour variables publiques
- ✅ Chiffrer toutes les communications (HTTPS)

---

## 🎉 Commande Rapide

Pour déployer immédiatement :

```bash
# 1. Push les changements
git add . && git commit -m "Deploy to Vercel" && git push

# 2. Aller sur Vercel Dashboard
open https://vercel.com/feusteys-projects/token4good

# 3. Configurer les variables d'environnement
# 4. Lancer le déploiement

# 5. Vérifier le résultat
open https://token4good.vercel.app
```

**Le déploiement est prêt ! 🚀**