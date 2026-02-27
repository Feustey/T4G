# Guide de déploiement Vercel - Token4Good RGB

## 📋 Checklist de déploiement

### 1. Prérequis
- [ ] Compte Vercel créé
- [ ] CLI Vercel installé (`npm i -g vercel`)
- [ ] Base de données Supabase PostgreSQL configurée
- [ ] Backend Rust déployé sur Railway/Heroku
- [ ] Domaine `app.token-for-good.com` configuré

### 2. Installation CLI Vercel
```bash
npm i -g vercel
vercel login
```

### 3. Premier déploiement
```bash
cd /Users/stephanecourant/Documents/DAZ/Token4RGB/RGB
vercel

# Répondre aux questions :
# ? Set up and deploy "RGB"? [Y/n] y
# ? Which scope do you want to deploy to? Your Personal Account
# ? Link to existing project? [y/N] n
# ? What's your project's name? token4good-rgb
# ? In which directory is your code located? ./apps/dapp
```

### 4. Variables d'environnement à configurer

#### Dans Vercel Dashboard → Settings → Environment Variables

##### Production
```bash
NEXTAUTH_URL=https://app.token-for-good.com
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
NEXT_PUBLIC_API_URL=https://token4good-backend-production.up.railway.app
NEXT_PUBLIC_DAZNO_API_URL=https://api.token-for-good.com
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://token-for-good.com/api
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.glikbylflheewbonytev.supabase.co:5432/postgres
NODE_ENV=production
```

##### Preview
```bash
NEXTAUTH_URL=https://token4good-rgb-preview.vercel.app
NEXT_PUBLIC_API_URL=https://token4good-backend-staging.up.railway.app
# ... autres variables identiques
```

### 5. Configuration du domaine

#### DNS Configuration
```bash
# Chez votre provider DNS
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 300
```

#### Dans Vercel
1. Dashboard → Settings → Domains
2. Ajouter `app.token-for-good.com`
3. Vérifier la configuration SSL

### 6. Test des endpoints

#### Health Check
```bash
curl https://app.token-for-good.com/api/health
```

Réponse attendue :
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "nextauth_url": "https://app.token-for-good.com",
  "api_url": "https://token4good-backend-production.up.railway.app",
  "dazno_api_configured": true,
  "dazno_users_api_configured": true,
  "version": "2.0.0"
}
```

#### Test d'intégration Dazno
```bash
curl -H "Origin: https://token-for-good.com" https://app.token-for-good.com/api/auth/providers
```

### 7. Commandes de déploiement

#### Déploiement manuel
```bash
# Preview
vercel

# Production
vercel --prod
```

#### Via GitHub Actions
Les déploiements sont automatiques via `.github/workflows/vercel-deploy.yml`

### 8. Secrets GitHub Actions

Dans GitHub → Settings → Secrets and variables → Actions :

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
NEXTAUTH_URL=https://app.token-for-good.com
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_API_URL=https://token4good-backend-production.up.railway.app
NEXT_PUBLIC_DAZNO_API_URL=https://api.token-for-good.com
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://token-for-good.com/api
```

### 9. Monitoring et logs

#### Voir les logs
```bash
vercel logs --follow
vercel logs --function=api/auth/[...nextauth]
```

#### Analytics
Dashboard Vercel → Analytics pour :
- Page views
- Performance metrics
- Error tracking

### 10. Configuration Backend (Railway)

#### Variables d'environnement Railway
```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.glikbylflheewbonytev.supabase.co:5432/postgres
JWT_SECRET=your-jwt-secret-key
RGB_DATA_DIR=/tmp/rgb_data
RUST_LOG=info
PORT=3000
```

#### Déploiement Backend
```bash
# Railway
railway login
railway init
railway up

# Ou via GitHub integration
```

### 11. Tests de production

#### Test de connexion
1. Aller sur `https://app.token-for-good.com`
2. Vérifier redirection vers `/fr`
3. Tester page de login
4. Vérifier intégration Dazno

#### Test API
```bash
# Test backend
curl https://token4good-backend-production.up.railway.app/api/health

# Test proxy
curl https://app.token-for-good.com/api/backend/health
```

### 12. Troubleshooting

#### Erreurs communes

**Build failed**
```bash
# Vérifier les dépendances
cd apps/dapp
npm install
npm run build
```

**Environment variables**
```bash
# Vérifier via health endpoint
curl https://app.token-for-good.com/api/health
```

**CORS errors**
Vérifier `next.config.js` headers configuration

**NextAuth errors**
Vérifier `NEXTAUTH_URL` et `NEXTAUTH_SECRET`

#### Logs utiles
```bash
# Vercel logs
vercel logs --follow

# Railway logs
railway logs --follow

# Browser console
# Ouvrir DevTools → Console
```

### 13. URLs finales

- **Production**: https://app.token-for-good.com
- **Backend API**: https://token4good-backend-production.up.railway.app
- **Health Check**: https://app.token-for-good.com/api/health
- **Auth**: https://app.token-for-good.com/api/auth/providers

### 14. Maintenance

#### Mise à jour
```bash
git push origin main  # Déploiement automatique via GitHub Actions
```

#### Rollback
```bash
vercel rollback [deployment-url]
```

#### Monitoring
- Vercel Dashboard → Analytics
- Railway Dashboard → Metrics
- Supabase Dashboard → Database Monitoring

## 🚀 Ready for production!

Une fois ces étapes complétées, votre application Token4Good RGB sera entièrement déployée et opérationnelle.