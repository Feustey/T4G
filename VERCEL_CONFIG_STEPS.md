# 🔧 Configuration Vercel - Instructions Détaillées

**Problème:** Le Root Directory n'est pas configuré sur `apps/dapp`  
**Solution:** Configuration manuelle dans le dashboard Vercel

---

## 📝 Étapes Précises

### 1. Ouvrir le Projet Vercel

**Lien direct:** https://vercel.com/feusteys-projects/t4-g/settings

Ou manuellement:
1. Aller sur https://vercel.com/dashboard
2. Cliquer sur le projet **"t4-g"**
3. Cliquer sur l'onglet **"Settings"**

### 2. Configurer le Root Directory

1. Dans la section **"General"**
2. Scroller jusqu'à trouver **"Root Directory"**
3. Cliquer sur **"Edit"** (à droite)
4. **Changer la valeur:**
   - ❌ Actuellement: `.` (racine)
   - ✅ Changer en: `apps/dapp`
5. Cliquer sur **"Save"**

### 3. Configurer Build & Development Settings

Dans la même page **"Settings" > "General"**:

**Framework Preset:**
- Sélectionner: `Next.js`

**Build Command:** (Optionnel - devrait être auto-détecté)
```
npm run build
```

**Install Command:**
```
npm install --legacy-peer-deps
```

**Output Directory:** (Optionnel)
```
.next
```

**Node.js Version:**
- Sélectionner: `20.x` (recommandé)

### 4. Vérifier et Sauvegarder

1. S'assurer que toutes les modifications sont sauvegardées
2. Vérifier que **Root Directory = `apps/dapp`**

---

## 🚀 Après Configuration

Une fois le Root Directory configuré, retourner dans le terminal et exécuter:

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G
vercel --prod --yes
```

Ou depuis le dashboard Vercel:
1. Aller dans **"Deployments"**
2. Cliquer sur **"Redeploy"** sur le dernier déploiement
3. Décocher **"Use existing Build Cache"**
4. Cliquer sur **"Redeploy"**

---

## ✅ Vérification

Après le déploiement, vérifier que:
- ✅ Le build détecte Next.js correctement
- ✅ `npm install` s'exécute dans `apps/dapp`
- ✅ Le build Next.js se termine avec succès
- ✅ L'application est accessible

---

## 📸 Capture d'Écran de Configuration Attendue

Dans **Settings > General > Root Directory**, vous devriez voir:

```
Root Directory: apps/dapp
□ Include source files outside of the Root Directory in the Build Step
```

**Important:** Ne PAS cocher la case "Include source files..."

---

## 🔍 Diagnostic

Si le problème persiste, vérifier dans les logs de déploiement:

**❌ Mauvaise configuration:**
```
Running "install" command: `yarn install`...
# (Installe depuis la racine avec yarn.lock)
```

**✅ Bonne configuration:**
```
Running "install" command: `npm install --legacy-peer-deps`...
Detected Next.js version: 14.2.33
```

---

## 🆘 Alternative: Créer un Nouveau Projet

Si la configuration ne fonctionne pas, vous pouvez créer un nouveau projet Vercel:

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G/apps/dapp
vercel --prod
```

Lors de la configuration initiale:
- **Set up and deploy?** → Yes
- **Which scope?** → feusteys-projects
- **Link to existing project?** → No
- **What's your project's name?** → token4good-frontend
- **In which directory is your code located?** → `.`
- **Want to modify these settings?** → Yes
  - **Build Command:** `npm run build`
  - **Output Directory:** `.next`
  - **Development Command:** `npm run dev`

---

**Une fois configuré, retournez dans le terminal et tapez "c'est fait" pour que je relance le déploiement.**
