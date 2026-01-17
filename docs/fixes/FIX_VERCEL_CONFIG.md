# 🔧 Correction Configuration Vercel - Root Directory

**Problème:** Vercel ne détecte pas Next.js car le Root Directory n'est pas correctement configuré.

**Solution:** Configurer le Root Directory dans le dashboard Vercel.

---

## 📋 Étapes pour Corriger

### 1. Aller sur le Dashboard Vercel

Ouvrir: https://vercel.com/feusteys-projects/t4-g/settings

### 2. Configurer le Root Directory

1. **Section "General"**
2. **Trouver "Root Directory"**
3. **Cliquer sur "Edit"**
4. **Entrer:** `apps/dapp`
5. **Sauvegarder**

### 3. Vérifier les Build Settings

Dans la même section "General", vérifier:

- **Framework Preset:** `Next.js`
- **Build Command:** `npm run build` (ou laisser vide pour auto-détection)
- **Output Directory:** `.next` (ou laisser vide pour auto-détection)
- **Install Command:** `npm install --legacy-peer-deps`

### 4. Redéployer

1. Aller dans **"Deployments"**
2. Trouver le dernier déploiement
3. Cliquer sur **"..."** (menu)
4. Sélectionner **"Redeploy"**
5. Cocher **"Use existing Build Cache: No"**
6. Cliquer sur **"Redeploy"**

---

## ✅ Vérification

Après le redéploiement, le build devrait:
- ✅ Détecter Next.js automatiquement
- ✅ Build depuis `apps/dapp`
- ✅ Trouver `.next` dans `apps/dapp/.next`
- ✅ Déployer avec succès

---

## 🔄 Alternative: Via CLI (si possible)

Si vous préférez la CLI, vous pouvez essayer de lier le projet depuis `apps/dapp`:

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G/apps/dapp
vercel link --yes
vercel --prod --yes
```

**Note:** Cela peut créer un nouveau projet. Il vaut mieux configurer le Root Directory dans le dashboard.

---

## 📊 État Actuel

✅ **Variables d'environnement:** Corrigées
- `NEXT_PUBLIC_API_URL` = `https://apirust-production.up.railway.app`
- Configurée pour Production, Preview et Development

✅ **vercel.json:** Mis à jour avec la bonne configuration

⚠️ **Root Directory:** À configurer dans le dashboard (5 min)

---

**Une fois le Root Directory configuré, le déploiement devrait fonctionner ! 🚀**

