# 🚀 Test Rapide du Dashboard - Token4Good

**Date**: 21 janvier 2026  
**Objectif**: Vérifier que le dashboard charge correctement après les corrections

## ⚡ Démarrage Rapide (5 minutes)

### 1. Démarrer le Frontend

```bash
cd apps/dapp
npm run dev
```

**Attendu**: Serveur démarre sur `http://localhost:4200`

### 2. Page de Diagnostic

Ouvrez votre navigateur :
```
http://localhost:4200/debug-auth
```

**Cette page vous montre** :
- ✅ Si vous avez un token JWT
- ✅ Si vous êtes authentifié
- ✅ L'état du backend
- ✅ Un test de l'endpoint `/api/metrics`

### 3. Interprétation

#### Cas A : Token présent = ❌ NON

**Vous devez vous connecter !**

1. Allez sur : `http://localhost:4200/landing`
2. Cliquez sur un bouton de connexion (T4G, LinkedIn, ou Dazno)
3. Suivez le flux OAuth
4. Retournez sur `/debug-auth` → Token présent devrait être ✅ OUI

#### Cas B : Token présent = ✅ OUI

**Parfait ! Testez le dashboard :**

1. Cliquez sur "🔄 Tester Backend" sur `/debug-auth`
2. Vérifiez que :
   - Backend Health = `200 OK`
   - Test /api/metrics = `200 OK`
3. Allez sur : `http://localhost:4200/dashboard`

## 🔍 Console du Navigateur

Ouvrez la console (F12 ou Cmd+Option+I) :

### Logs Attendus (Succès)

```javascript
🔵 config.ts - NEXT_PUBLIC_API_URL: https://apirust-production.up.railway.app
🔵 config.ts - API_BASE_URL: https://apirust-production.up.railway.app
🔵 apiFetch - URL: https://apirust-production.up.railway.app/api/metrics
🔵 apiFetch - Has token: true
🔵 apiFetch - Headers: {Content-Type: 'application/json', Authorization: 'Bearer eyJ...'}
🔵 apiFetch - Response: 200 OK
```

### Erreurs Possibles

#### 1. Pas de token
```javascript
🔵 apiFetch - Has token: false
🔴 apiFetch - Error response: {status: 401, statusText: 'Unauthorized'}
```
→ **Solution**: Se connecter via `/landing`

#### 2. Token invalide
```javascript
🔵 apiFetch - Has token: true
🔴 apiFetch - Error response: {status: 401, statusText: 'Unauthorized'}
```
→ **Solution**: 
```javascript
// Dans la console du navigateur
localStorage.removeItem('token');
// Puis se reconnecter via /landing
```

#### 3. Backend inaccessible
```javascript
🔴 apiFetch - Failed to fetch: ... TypeError: Failed to fetch
```
→ **Solution**: Vérifier que Railway est up
```bash
curl https://apirust-production.up.railway.app/health
```

#### 4. Erreur CORS
```javascript
🔴 Access to fetch at '...' from origin 'http://localhost:4200' 
   has been blocked by CORS policy
```
→ **Solution**: Le backend doit accepter `http://localhost:4200` dans sa configuration CORS

## 📊 Dashboard Fonctionnel

Si tout fonctionne, le dashboard devrait afficher :

### Métriques Globales (en haut à droite)
```
👥 Utilisateurs: X (Y alumnis, Z étudiants)
🤝 Interactions: X
🪙 Tokens Supply: 100,000
💱 Tokens Exchanged: X
📊 Transactions: X
```

### Section Principale
- Actions en attente (si applicable)
- Bouton "Compléter mon profil" (si bio vide)
- Notifications récentes (3 dernières)
- Cartes "Découvrir les avantages" et "Découvrir les services"
- Top services (4 meilleurs services par notation)

### Si Rien Ne S'Affiche

1. **Ouvrez la console (F12)**
2. **Cherchez les erreurs rouges** 🔴
3. **Vérifiez les logs** 🔵 pour voir où ça bloque

## 🐛 Nouveaux Logs de Debug

Les corrections incluent des logs détaillés :

### apiFetch - Logs détaillés
```javascript
🔵 apiFetch - URL: https://...
🔵 apiFetch - Has token: true/false
🔵 apiFetch - Headers: {...}
🔵 apiFetch - Response: 200 OK / 401 Unauthorized / etc.
```

### En cas d'erreur
```javascript
🔴 apiFetch - Error response: {
  status: 401,
  statusText: 'Unauthorized',
  body: '...'
}
🔴 apiFetch - Error details: {
  name: 'TypeError',
  message: 'Failed to fetch',
  stack: '...'
}
```

### Dashboard - Logs par endpoint
```javascript
🔴 Dashboard - Metrics error: Error: API request failed for /api/metrics: 401
🔴 Dashboard - User metrics error: ...
🔴 Dashboard - Services error: ...
```

## 🛠️ Corrections Appliquées

### 1. Protection SSR
Le code ne fait plus de fetch côté serveur :
```typescript
if (typeof window === 'undefined') {
  throw new Error('API calls are not supported during SSR');
}
```

### 2. Fetch Conditionnel
Le dashboard ne fait les appels API que si l'utilisateur est connecté :
```typescript
const shouldFetch = typeof window !== 'undefined' && user && user.id;
useSwr(shouldFetch ? '/api/metrics' : null, apiFetcher);
```

### 3. Logs Détaillés
Chaque appel API logue :
- URL appelée
- Présence du token
- Headers envoyés
- Réponse reçue (status + body)
- Erreurs détaillées

### 4. Gestion d'Erreurs
Les erreurs SWR sont capturées et loguées :
```typescript
const { data, error } = useSwr(...);
useEffect(() => {
  if (error) console.error('🔴 Dashboard - Error:', error);
}, [error]);
```

## ✅ Checklist de Test

Cochez au fur et à mesure :

### Authentification
- [ ] Page `/debug-auth` accessible
- [ ] Connexion via `/landing` fonctionne
- [ ] Token présent = ✅ OUI après connexion
- [ ] Authentifié = ✅ OUI

### Backend
- [ ] Backend Health = `200 OK`
- [ ] Test `/api/metrics` = `200 OK` (sur `/debug-auth`)
- [ ] `curl https://apirust-production.up.railway.app/health` retourne OK

### Dashboard
- [ ] Page `/dashboard` se charge sans erreur
- [ ] Métriques globales s'affichent
- [ ] Aucune erreur 🔴 dans la console
- [ ] Tous les logs 🔵 montrent `Response: 200 OK`

### Logs Console
- [ ] `🔵 apiFetch - Has token: true`
- [ ] `🔵 apiFetch - Response: 200 OK` (pour tous les endpoints)
- [ ] Pas d'erreurs CORS
- [ ] Pas d'erreurs réseau

## 🆘 Si Ça Ne Marche Toujours Pas

### 1. Capturer les Informations

**Console du navigateur** :
```javascript
// Copier toute la sortie de la console
// Chercher spécifiquement les 🔴 et 🔵
```

**Page /debug-auth** :
- Prendre une capture d'écran complète
- Noter le résultat de "Tester Backend"

**Onglet Network** :
- Filtrer par "Fetch/XHR"
- Trouver la requête `/api/metrics`
- Noter le status code et la réponse

### 2. Vérifier Configuration

```bash
# .env.local existe ?
cat .env.local | grep NEXT_PUBLIC_API_URL

# Backend Railway est up ?
curl https://apirust-production.up.railway.app/health

# Port frontend correct ?
lsof -ti:4200
```

### 3. Reset Complet

```bash
# 1. Effacer le token
# Dans la console du navigateur :
localStorage.clear()

# 2. Redémarrer le frontend
# Dans le terminal :
# Ctrl+C pour arrêter
npm run dev

# 3. Se reconnecter
# http://localhost:4200/landing
```

## 📚 Documentation

- **[DIAGNOSTIC_ERREURS_FETCH.md](./DIAGNOSTIC_ERREURS_FETCH.md)** - Guide diagnostic complet
- **[FIX_DASHBOARD_FETCH_ERRORS.md](./FIX_DASHBOARD_FETCH_ERRORS.md)** - Détails techniques des corrections
- **[QUICKSTART_OAUTH_2026.md](./QUICKSTART_OAUTH_2026.md)** - Guide OAuth

## 🎯 Résumé des Changements

### Fichiers Modifiés

1. **`apps/dapp/services/config.ts`**
   - ✅ Ajout authentification JWT
   - ✅ Protection SSR
   - ✅ Logs détaillés
   - ✅ Gestion d'erreurs améliorée

2. **`apps/dapp/pages/dashboard.tsx`**
   - ✅ Correction chemins API (`/api/*`)
   - ✅ Fetch conditionnel (uniquement si connecté)
   - ✅ Logs d'erreurs par endpoint

3. **`token4good-backend/src/routes/metrics.rs`**
   - ✅ Structure `MetricsResponse` alignée avec frontend

4. **`token4good-backend/src/routes/users.rs`**
   - ✅ `get_current_user_about` retourne string
   - ✅ `disable_first_access` retourne `DashboardAccessResponse`

### Nouveaux Fichiers

1. **`apps/dapp/pages/debug-auth.tsx`**
   - Page de diagnostic complète
   - Test backend en un clic
   - Affichage état authentification

2. **`DIAGNOSTIC_ERREURS_FETCH.md`**
   - Guide diagnostic étape par étape
   - Solutions par scénario
   - Checklist complète

3. **`QUICK_TEST_DASHBOARD.md`** (ce fichier)
   - Guide de test rapide
   - Checklist de validation
   - Logs attendus vs erreurs

## 🎉 Succès !

Si vous voyez sur `/dashboard` :
- Métriques qui s'affichent
- Pas d'erreurs dans la console
- Logs 🔵 avec `Response: 200 OK`

**→ Tout fonctionne correctement ! 🚀**

Vous pouvez maintenant naviguer dans l'application et utiliser toutes les fonctionnalités du dashboard.
