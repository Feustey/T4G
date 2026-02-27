# Fix Vercel Build Error 1 (sans détail)

**Symptôme :** Build bloque sur Vercel avec "error 1" sans message détaillé.

## Solution rapide (Dashboard Vercel)

### 1. Root Directory (CRITIQUE)

1. Aller sur https://vercel.com/dashboard → Projet T4G
2. **Settings** → **General**
3. **Root Directory** → **Edit**
4. Entrer : `apps/dapp`
5. **Save**

### 2. Build & Development Settings

Vérifier que :
- **Build Command :** `npm run build` (ou vide pour auto)
- **Install Command :** `npm install --legacy-peer-deps`
- **Output Directory :** vide (Next.js gère automatiquement)

### 3. Variables d'environnement

Vérifier la présence de :
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL` ou `NEXTAUTH_URL`
- `MAGIC_LINK_SECRET` ou `NEXTAUTH_SECRET`

### 4. Redéployer

1. **Deployments** → dernier déploiement
2. **Redeploy** → cocher **"Use existing Build Cache: No"**

## Si Root Directory = "" (racine du repo)

Le `vercel.json` à la racine est utilisé. Vérifier :
- `outputDirectory` : `apps/dapp/.next`
- Node 20 : `.nvmrc` présent avec `20`

## Debug : logs détaillés

Pour voir l'erreur réelle :
1. **Deployments** → cliquer sur le déploiement en erreur
2. **Building** → dérouler les logs
3. Chercher les lignes en rouge **avant** "Command exited with 1"

## Causes courantes

| Cause | Solution |
|-------|----------|
| Root Directory incorrect | Mettre `apps/dapp` |
| Node version | `.nvmrc` avec `20` |
| Sentry upload fail | `SENTRY_AUTH_TOKEN` valide ou absent |
| Mémoire insuffisante | Upgrade plan Vercel |
| Dépendances peer | `--legacy-peer-deps` dans install |
