# 🔧 Correction Erreur React "Cannot read properties of null (reading 'useState')"

**Date:** 27 décembre 2025  
**Problème:** Erreur React en production - React est null lors de l'utilisation de useState

---

## 🐛 Erreur Rencontrée

```
TypeError: Cannot read properties of null (reading 'useState')
    at t.useState (_app-6bdd29454a05ed54.js:23:215105)
```

**Cause:** Conflit de versions React ou duplication de React dans le bundle webpack

---

## ✅ Corrections Appliquées

### 1. Alias React dans Webpack Config

**Fichier:** `apps/dapp/next.config.js`

Ajout d'aliases pour forcer l'utilisation d'une seule instance de React :

```javascript
if (!isServer) {
  config.resolve.alias = {
    ...config.resolve.alias,
    react: require('path').resolve(__dirname, '../../node_modules/react'),
    'react-dom': require('path').resolve(__dirname, '../../node_modules/react-dom'),
  };
}
```

**Objectif:** Éviter les duplications de React qui causent l'erreur "React is null"

### 2. Protection localStorage côté Serveur

**Fichier:** `apps/dapp/contexts/AuthContext.tsx`

Ajout de vérifications `typeof window !== 'undefined'` avant d'utiliser `localStorage` :

```typescript
// Avant
const token = localStorage.getItem('token');

// Après
if (typeof window === 'undefined') {
  setLoading(false);
  return;
}
const token = localStorage.getItem('token');
```

**Objectif:** Éviter les erreurs SSR/hydratation

### 3. Protection window.location

**Fichier:** `apps/dapp/contexts/AuthContext.tsx`

Toutes les utilisations de `window.location.href` sont maintenant protégées :

```typescript
if (typeof window !== 'undefined') {
  window.location.href = '/login';
}
```

---

## 🧪 Tests Effectués

### Build Local
```bash
cd apps/dapp && npm run build
```
✅ **Résultat:** Build réussi, aucune erreur

### Déploiement Vercel
```bash
vercel --prod --yes
```
✅ **Résultat:** Déploiement réussi

---

## 📋 Checklist de Vérification

Après le déploiement, vérifier dans le navigateur :

- [ ] Console du navigateur : Aucune erreur React
- [ ] Page principale se charge correctement
- [ ] Authentification fonctionne
- [ ] Navigation entre pages fonctionne
- [ ] Pas d'erreurs "Cannot read properties of null"

---

## 🔍 Si l'Erreur Persiste

### Vérifier les Versions React

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G
npm list react react-dom
```

**Attendu:**
- `react@18.2.0` (ou ^18.2.0)
- `react-dom@18.2.0` (ou ^18.2.0)

### Vérifier les Duplications

```bash
cd apps/dapp
npm run build 2>&1 | grep -i "react.*duplicate\|multiple.*react"
```

### Vérifier le Bundle

Ouvrir les DevTools du navigateur :
1. Network tab
2. Filtrer par "JS"
3. Vérifier qu'il n'y a qu'une seule instance de React chargée

---

## 📊 État Actuel

- ✅ Build local : Fonctionne
- ✅ Déploiement Vercel : Réussi
- ⏳ Test production : À vérifier dans le navigateur

---

## 🎯 Prochaines Étapes

1. **Tester l'application en production**
   - Ouvrir https://t4-n9hvl06q6-feusteys-projects.vercel.app
   - Vérifier la console du navigateur
   - Tester les fonctionnalités principales

2. **Si l'erreur persiste:**
   - Vérifier les logs Vercel : `vercel logs`
   - Vérifier les versions React dans node_modules
   - Considérer l'utilisation de `react@18.3.1` (dernière version stable)

3. **Monitoring:**
   - Configurer Sentry pour capturer les erreurs React
   - Surveiller les erreurs console en production

---

**Dernière mise à jour:** 27 décembre 2025  
**Status:** ✅ Corrections appliquées et déployées
