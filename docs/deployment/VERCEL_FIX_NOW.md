# ⚡ FIX VERCEL - ACTION IMMÉDIATE

## 🎯 1 Seule Chose à Faire

### Allez sur Vercel Dashboard

🔗 https://vercel.com/dashboard

```
1. Sélectionnez votre projet
2. Settings ⚙️ → General
3. Root Directory → Edit
4. Entrez : apps/dapp
5. Save
6. Deployments → Redeploy
```

**C'EST TOUT !** 🎉

---

## ⚠️ Si vous voyez une erreur Cypress après...

Si le build échoue avec une erreur de conflit Cypress :

```
npm error ERESOLVE could not resolve
npm error While resolving: @nrwl/cypress@15.4.5
```

✅ **C'est déjà corrigé** dans le code. Il suffit de :

```bash
git add .
git commit -m "fix(vercel): add legacy-peer-deps"
git push
```

Vercel redéploiera automatiquement avec la correction.

**Documentation détaillée** : `VERCEL_FIX_CYPRESS_DEPS.md`

---

## Pourquoi ?

Vous avez un monorepo Nx. Next.js est dans `apps/dapp`, pas à la racine.

## Fichiers Créés

✅ `/apps/dapp/vercel.json` - Configuration optimale  
✅ `/VERCEL_ACTION_PLAN.md` - Guide détaillé  
✅ `/VERCEL_FIX_MONOREPO.md` - Documentation complète

## Variables d'Environnement

Vérifiez dans Settings → Environment Variables :

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_DAZNO_API_URL`
- `NEXT_PUBLIC_DAZNO_USERS_API_URL`
- `NODE_ENV`
- `SKIP_ENV_VALIDATION`

Si manquantes, ajoutez-les avant de redéployer.

---

**Documentation complète** : `VERCEL_ACTION_PLAN.md`

