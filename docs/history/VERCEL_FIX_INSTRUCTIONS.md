# 🔧 Instructions pour Résoudre le Problème de Déploiement Vercel

**Date :** 18 janvier 2026  
**Status :** ⚠️ **Action Manuelle Requise**

---

## 🎯 Problème

Les déploiements Vercel échouent systématiquement avec une erreur de build (0ms build time), car Vercel ne trouve pas correctement les fichiers dans la structure monorepo.

**Erreur observée :**
```
Build: [0ms]  → Build ne s'exécute jamais
Status: ● Error
```

---

## ✅ Solution : Configurer le Root Directory dans Vercel Dashboard

###  Étape 1 : Accéder aux Paramètres du Projet

1. Allez sur **Vercel Dashboard** : https://vercel.com/feusteys-projects/token4good
2. Cliquez sur **"Settings"** (Paramètres)
3. Dans la barre latérale, cliquez sur **"General"**

### Étape 2 : Configurer le Root Directory

1. Trouvez la section **"Root Directory"**
2. Cliquez sur **"Edit"**
3. Entrez : `apps/dapp`
4. Cochez la case **"Include source files outside of the Root Directory in the Build Step"**
5. Cliquez sur **"Save"**

###  Étape 3 : Configurer les Build Settings

Toujours dans **Settings → General** :

1. Trouvez **"Build & Development Settings"**
2. Configurez comme suit :

   **Framework Preset :** `Next.js`
   
   **Build Command :**
   ```bash
   npm run build
   ```
   
   **Install Command :**
   ```bash
   npm install --legacy-peer-deps
   ```
   
   **Output Directory :**  
   Laisser vide (Next.js utilise automatiquement `.next`)

3. Cliquez sur **"Save"**

### Étape 4 : Variables d'Environnement

Vérifiez que ces variables sont définies dans **Settings → Environment Variables** :

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `NEXT_PUBLIC_API_URL` | `https://apirust-production.up.railway.app` | Production |
| `NEXT_PUBLIC_DAZNO_API_URL` | `https://www.dazno.de/api` | Production |
| `NEXT_PUBLIC_DAZNO_USERS_API_URL` | `https://www.dazno.de/api` | Production |
| `NEXT_PUBLIC_DAZNO_VERIFY_URL` | `https://www.dazno.de/api/verify` | Production |

### Étape 5 : Redéployer

1. Allez dans **Deployments**
2. Sur le dernier déploiement en erreur, cliquez sur le menu **"..."**
3. Cliquez sur **"Redeploy"**
4. Attendez la fin du build (~1-2 minutes)

---

## 🎯 Résultat Attendu

Après ces changements, le déploiement devrait :

```
✓ Build completed successfully
✓ All pages generated
✓ Deployment Ready
```

**URLs de production :**
- https://t4g.dazno.de/
- https://t4g.dazno.de/landing
- https://t4g.dazno.de/login

---

## 📋 Vérification Post-Déploiement

Une fois le déploiement réussi, testez :

```bash
# Page d'accueil
curl -I https://t4g.dazno.de/
# Devrait retourner : HTTP/2 200

# Landing page
curl -I https://t4g.dazno.de/landing
# Devrait retourner : HTTP/2 200

# Login
curl -I https://t4g.dazno.de/login
# Devrait retourner : HTTP/2 200
```

---

## 🔍 Pourquoi Cette Solution ?

### Problème avec le Monorepo

Vercel essayait de builder depuis la racine du projet (`/`) mais :
- Les fichiers source sont dans `apps/dapp/`
- Les dépendances sont dans `apps/dapp/node_modules/`
- Le `next.config.js` est dans `apps/dapp/`

### La Solution : Root Directory

En configurant **Root Directory = `apps/dapp`**, Vercel :
- ✅ Build directement depuis `apps/dapp/`
- ✅ Trouve correctement `package.json`, `next.config.js`, etc.
- ✅ Installe les dépendances au bon endroit
- ✅ Exécute le build dans le bon contexte

---

## 🚨 Alternative : Déploiement Manuel (Si Dashboard Inaccessible)

Si vous ne pouvez pas accéder au Dashboard Vercel, vous pouvez déployer manuellement :

```bash
cd apps/dapp
vercel --prod
```

Mais cette solution nécessite de redéployer manuellement à chaque commit.

---

## 📝 Fichiers Modifiés dans le Repo

Les fichiers suivants ont été préparés pour le déploiement Vercel :

1. **`apps/dapp/next.config.js`**  
   - Rendu compatible sans @nrwl/next (fallback pour Vercel)

2. **`apps/dapp/vercel.json`**  
   - Configuration spécifique pour déploiement depuis apps/dapp

3. **`vercel.json` (racine)**  
   - Configuration monorepo avec buildCommand pointant vers apps/dapp

---

## ✅ Checklist de Déploiement

- [ ] Root Directory configuré : `apps/dapp`
- [ ] Build Command : `npm run build`
- [ ] Install Command : `npm install --legacy-peer-deps`
- [ ] Variables d'environnement configurées
- [ ] Redéploiement lancé
- [ ] Tests de production OK (/, /landing, /login)

---

## 💡 Note Importante

**Une fois le Root Directory configuré dans Vercel Dashboard, les déploiements automatiques depuis GitHub fonctionneront correctement !**

Chaque push vers `main` déclenchera automatiquement un déploiement et le site sera mis à jour.

---

**Créé le :** 18 janvier 2026  
**Dernière mise à jour :** 18 janvier 2026 19:20

---

**Besoin d'aide ?**  
- Dashboard Vercel : https://vercel.com/feusteys-projects/token4good
- Documentation Vercel Monorepo : https://vercel.com/docs/monorepos
