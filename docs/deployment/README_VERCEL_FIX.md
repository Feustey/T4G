# ⚡ README - Fix Déploiement Vercel

**Date** : 3 novembre 2025  
**Status** : ✅ Corrections appliquées dans le code  
**Action** : Suivre les 3 étapes ci-dessous

---

## 🎯 3 Étapes pour Corriger le Build

### 1️⃣ Commit les Changements (1 min)

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G
git add .
git commit -m "fix(vercel): monorepo Nx config + Cypress deps"
git push
```

### 2️⃣ Configuration Vercel Dashboard (2 min)

🔗 https://vercel.com/dashboard

```
Votre Projet → Settings → General → Root Directory
│
├─ Cliquez "Edit"
├─ Entrez : apps/dapp
└─ Cliquez "Save"
```

### 3️⃣ Attendre le Build Automatique (5 min)

Vercel redéploie automatiquement après le push. Surveillez :

```
Deployments → Building... → ✅ Ready
```

**C'EST TOUT !** 🎉

---

## 📋 Corrections Appliquées

### ✅ Fichiers Créés

1. `/apps/dapp/.npmrc` - Résout conflit Cypress
2. `/apps/dapp/vercel.json` - Config Next.js optimale
3. 7 documents de documentation

### ✅ Fichiers Modifiés

1. `/vercel.json` - Config framework + legacy-peer-deps
2. `/scripts/deploy-vercel.sh` - Validations améliorées

---

## 🔍 Vérification Rapide

Une fois "Ready", testez :

```bash
curl -I https://votre-url.vercel.app
# ✅ Attendu : HTTP/2 200
```

---

## 📚 Documentation Détaillée

| Besoin | Document |
|--------|----------|
| **Action immédiate** | `VERCEL_FIX_NOW.md` |
| **Détails Cypress** | `VERCEL_FIX_CYPRESS_DEPS.md` |
| **Tout comprendre** | `VERCEL_COMPLETE_FIX.md` |

---

## ⚠️ Important

**Root Directory DOIT être `apps/dapp` dans Vercel Dashboard**

Sans cette config, le build échouera encore avec "No Next.js version detected".

---

## 🆘 Problème ?

1. Vérifiez Root Directory = `apps/dapp` ✅
2. Vérifiez que le commit est push ✅
3. Clear Build Cache dans Vercel ✅
4. Consultez `VERCEL_COMPLETE_FIX.md`

---

**🚀 Temps total : ~8 minutes**

