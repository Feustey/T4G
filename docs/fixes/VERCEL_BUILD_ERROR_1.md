# Fix Vercel Build Error 1 (sans détail)

**Symptôme :** Build bloque sur Vercel avec "Command npm run build exited with 1".

## Fix appliqué dans le code (Sentry)

L'upload Sentry en build peut provoquer un exit 1 si le token est invalide.  
→ **Correction :** Sur Vercel (`VERCEL=1`), l'upload est désactivé (dryRun).  
→ Vérifier que `next.config.js` contient bien `dryRun: !hasValidSentry`.

## Solution rapide (Dashboard Vercel)

### 1. Root Directory

**Option A :** Root Directory = `apps/dapp` (recommandé)
- Settings → General → Root Directory → `apps/dapp`
- **Important :** Activer "Include source files outside of the Root Directory" (Build Step) pour accéder à `libs/`

**Option B :** Root Directory = vide (racine du repo)
- Le `vercel.json` à la racine sera utilisé
- Build : `cd apps/dapp && npm run build`

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
