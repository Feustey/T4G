# Guide de Déploiement Token4Good RGB v2 sur Vercel

## 🚀 Configuration Vercel pour https://vercel.com/feusteys-projects/token4good/deployments

### 📋 Prérequis

1. **Compte Vercel** configuré avec le projet `token4good`
2. **Repository GitHub** synchronisé
3. **Variables d'environnement** Supabase/Dazno configurées
4. **Build Next.js** optimisé

## 🔧 Variables d'Environnement Requises

### Variables Critiques pour Production

```bash
# Authentication
NEXTAUTH_URL=https://token4good.vercel.app
NEXTAUTH_SECRET=your-secure-random-secret-32-chars-min

# Base de données Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.glikbylflheewbonytev.supabase.co:5432/postgres

# API URLs
NEXT_PUBLIC_API_URL=https://token4good-backend-production.up.railway.app/api
NEXT_PUBLIC_DAZNO_API_URL=https://dazno.de/api
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://api.dazno.de/users

# Dazno Integration
DAZNO_CLIENT_ID=token4good-prod
DAZNO_CLIENT_SECRET=your-dazno-secret
DAZNO_API_KEY=your-dazno-api-key

# Analytics & Monitoring
SENTRY_DSN=your-sentry-dsn
VERCEL_ANALYTICS_ID=your-analytics-id

# Optional Features
POLYGONSCAN_BASEURL=https://polygonscan.com
UPDATES_URL=wss://token4good.com/updates
```

### Variables Sentry (Optionnelles)

```bash
SENTRY_ORG=your-org
SENTRY_PROJECT=token4good
SENTRY_AUTH_TOKEN=your-sentry-token
```

## 📁 Structure de Déploiement

```
/
├── vercel.json              # Configuration Vercel
├── apps/dapp/              # Application Next.js
│   ├── package.json        # Dependencies
│   ├── next.config.js      # Configuration Next.js optimisée
│   ├── pages/              # Pages et API routes
│   ├── components/         # Composants React
│   └── public/             # Assets statiques
└── token4good-backend/     # Backend Rust (déployé séparément)
```

## 🔄 Process de Déploiement

### 1. Préparation du Build

```bash
# Installation des dépendances
cd apps/dapp
npm install

# Vérification TypeScript
npm run type-check

# Test du build local
npm run build
```

### 2. Configuration Vercel

Le fichier `vercel.json` est déjà configuré avec :
- **Build source** : `apps/dapp/package.json`
- **Routes** : Redirection vers le backend Rust
- **Headers CORS** : Configuration pour Dazno
- **Functions** : Timeout 30s pour les API routes

### 3. Variables d'Environnement dans Vercel

1. **Aller sur** : https://vercel.com/feusteys-projects/token4good/settings/environment-variables

2. **Ajouter les variables** :
   ```
   NEXTAUTH_URL → https://token4good.vercel.app
   NEXTAUTH_SECRET → [SECURE_RANDOM_STRING]
   DATABASE_URL → postgresql://postgres:[PASSWORD]@db.glikbylflheewbonytev.supabase.co:5432/postgres
   NEXT_PUBLIC_API_URL → https://token4good-backend-production.up.railway.app/api
   NEXT_PUBLIC_DAZNO_API_URL → https://dazno.de/api
   NEXT_PUBLIC_DAZNO_USERS_API_URL → https://api.dazno.de/users
   ```

3. **Environnements** : Production, Preview, Development

### 4. Déploiement Automatique

Le déploiement se fait automatiquement via :
- **Git Push** → Déploiement automatique
- **Pull Request** → Preview deployment
- **Main Branch** → Production deployment

## 🛠 Optimisations Vercel

### Next.js Configuration

```javascript
// apps/dapp/next.config.js
module.exports = {
  // Optimisations Vercel
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  
  // Headers CORS pour Dazno
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://dazno.de' },
          // ... autres headers
        ],
      },
    ]
  },
  
  // Images optimisées
  images: {
    domains: ['dazno.de', 'api.dazno.de', 'token4good.com'],
  },
}
```

### Performance

- ✅ **Static Generation** : Pages statiques
- ✅ **API Routes** : Serverless functions optimisées
- ✅ **Image Optimization** : Next.js Image component
- ✅ **Bundle Splitting** : Automatic code splitting
- ✅ **CDN** : Global edge network

## 🔗 Intégrations

### Backend Rust (Railway)

```bash
# URL Backend Production
BACKEND_URL=https://token4good-backend-production.up.railway.app

# Routes disponibles
/health              # Health check
/api/auth/*         # Authentication
/api/mentoring/*    # Mentoring management
/api/users/*        # User management
/api/proofs/*       # RGB proofs
/api/lightning/*    # Lightning Network
```

### Base de Données (Supabase)

```sql
-- Schema déjà déployé
-- Tables : users, mentoring_requests, mentoring_proofs, proofs, services
-- RLS policies actives
-- Indexes optimisés
```

### Authentication (Dazno)

```javascript
// Configuration NextAuth
providers: [
  {
    id: 'dazno',
    name: 'Dazno',
    type: 'oauth',
    // Configuration OAuth Dazno
  }
]
```

## 📊 Monitoring & Analytics

### Vercel Analytics

```javascript
// _app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

### Sentry Error Tracking

```javascript
// sentry.client.config.js
import { init } from '@sentry/nextjs';

init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

## 🚦 Health Checks

### Frontend Health

```bash
# Health check URL
GET https://token4good.vercel.app/api/health

# Response
{
  "status": "ok",
  "timestamp": "2025-06-27T16:00:00.000Z",
  "version": "2.0.0"
}
```

### Backend Health

```bash
# Backend health
GET https://token4good-backend-production.up.railway.app/health

# Response
{
  "status": "ok",
  "services": {
    "database": "connected",
    "rgb": "initialized",
    "lightning": "connected",
    "dazno": "configured"
  }
}
```

## 🎯 Checklist de Déploiement

### Avant le Déploiement

- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ Build local testé et fonctionnel
- [ ] ✅ Types TypeScript validés
- [ ] ✅ Backend Rust accessible
- [ ] ✅ Base de données Supabase opérationnelle
- [ ] ✅ Integration Dazno testée

### Après le Déploiement

- [ ] ✅ Site accessible sur https://token4good.vercel.app
- [ ] ✅ Pages principales chargent correctement
- [ ] ✅ Authentication Dazno fonctionnelle
- [ ] ✅ APIs backend accessibles
- [ ] ✅ Monitoring actif (Sentry/Analytics)
- [ ] ✅ Performance optimale (Lighthouse > 90)

## 🐛 Troubleshooting

### Erreurs Communes

1. **Build Failed**
   ```bash
   # Vérifier les dépendances
   npm ci
   npm run build
   ```

2. **Environment Variables**
   ```bash
   # Vérifier dans Vercel dashboard
   vercel env ls
   ```

3. **CORS Errors**
   ```javascript
   // Vérifier next.config.js headers
   Access-Control-Allow-Origin: 'https://dazno.de'
   ```

4. **API Routes Timeout**
   ```json
   // vercel.json
   "functions": {
     "apps/dapp/pages/api/**/*.js": {
       "maxDuration": 30
     }
   }
   ```

### Debug Mode

```bash
# Local development avec debug
NEXT_DEBUG=1 npm run dev

# Vercel logs
vercel logs [deployment-url]
```

## 🔐 Sécurité

### Headers de Sécurité

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    },
  ]
}
```

### Variables Sensibles

- ❌ **Ne jamais exposer** : Clés privées, secrets
- ✅ **Variables publiques** : Préfixe `NEXT_PUBLIC_`
- ✅ **Chiffrement** : Toutes les connexions HTTPS
- ✅ **Validation** : Input sanitization

---

## 🎉 Résultat Attendu

Une fois déployé, Token4Good RGB v2 sera accessible sur :

**🌐 URL Production** : https://token4good.vercel.app

**📱 Features Disponibles** :
- ✅ Authentification Dazno
- ✅ Dashboard utilisateur
- ✅ Système de mentoring
- ✅ Wallet Lightning/RGB
- ✅ Marketplace de services
- ✅ Interface multilingue (FR/EN)

Le déploiement est **prêt** et la configuration est **optimisée** pour Vercel ! 🚀