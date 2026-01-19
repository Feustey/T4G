# Corrections Login Local OAuth - 19 janvier 2026

## 🎯 Objectif
Résoudre les erreurs de boucle infinie et les échecs d'authentification OAuth (LinkedIn et t4g) en développement local.

## 🐛 Problèmes Identifiés

### 1. Boucle Infinie dans les Callbacks OAuth
**Symptômes** :
- La fonction `processCallback()` s'exécutait 4 fois consécutivement
- Erreurs répétées : `POST http://localhost:4200/api/auth/callback/linkedin/ 401 (Unauthorized)`
- Logs multiples : `[OAuth Debug] Provider: linkedin, State reçu: hv5afm, State sauvegardé: null`

**Cause** :
- `handleOAuthCallback` dans `useOAuth.ts` n'était pas mémorisé (pas de `useCallback`)
- Nouvelle référence fonction à chaque render → déclenchement du `useEffect`
- Pas de garde `useRef` pour empêcher les appels multiples

### 2. State OAuth Perdu
**Symptômes** :
- `State sauvegardé: null` après le premier appel
- Warning : `State mismatch détecté mais ignoré en développement`

**Cause** :
- Le `sessionStorage.removeItem()` était appelé **avant** le succès complet du login
- Les re-renders multiples perdaient le state

### 3. Erreur 401 sur l'API LinkedIn
**Symptômes** :
- `POST http://localhost:4200/api/auth/callback/linkedin/ 401 (Unauthorized)`

**Cause** :
- Le code OAuth LinkedIn était réutilisé lors des appels multiples
- LinkedIn rejette un code OAuth déjà échangé (usage unique)

### 4. Backend Rust Non Accessible
**Symptômes** :
- `POST http://localhost:8080/api/auth/login net::ERR_CONNECTION_REFUSED`

**Cause** :
- Le backend Rust n'était pas démarré
- Variable `NEXT_PUBLIC_API_URL=http://localhost:8080` pointait vers un serveur éteint

## ✅ Corrections Appliquées

### Fichiers Modifiés

#### 1. `apps/dapp/pages/auth/callback/linkedin.tsx`

**Ajouts** :
```typescript
import { useEffect, useState, useRef } from 'react'; // +useRef
const hasProcessedRef = useRef(false); // Garde contre appels multiples
const [mounted, setMounted] = useState(false); // Gestion hydratation SSR
```

**Changements** :
```typescript
useEffect(() => {
  if (!mounted || !router.isReady || hasProcessedRef.current) return;
  
  const processCallback = async () => {
    hasProcessedRef.current = true; // 🔒 Verrouiller immédiatement
    // ... code callback ...
  };
  
  processCallback();
}, [mounted, router.isReady, router.query, handleOAuthCallback]); // Suppression de 'router'
```

**Impact** :
- ✅ Callback exécuté **1 seule fois**
- ✅ Pas de réutilisation du code OAuth
- ✅ Hydratation SSR gérée correctement

#### 2. `apps/dapp/hooks/useOAuth.ts`

**Ajouts** :
```typescript
import { useCallback } from 'react'; // Import de useCallback
```

**Changements** :
```typescript
// Avant
const handleOAuthCallback = async (provider, code, state) => { ... };

// Après
const handleOAuthCallback = useCallback(async (provider, code, state) => {
  // ... code ...
  
  // Déplacement du nettoyage du state APRÈS succès
  await login(provider, { ... });
  
  // ✅ Nettoyer seulement après succès complet
  sessionStorage.removeItem(`${provider}_oauth_state`);
  
  router.push('/dashboard');
}, [login, router]);
```

**Impact** :
- ✅ Fonction mémorisée (référence stable)
- ✅ State OAuth préservé jusqu'au succès complet
- ✅ Pas de re-déclenchement du `useEffect`

#### 3. `apps/dapp/pages/auth/callback/t4g.tsx`

**Mêmes corrections que LinkedIn** :
- Ajout de `useRef` pour `hasProcessedRef`
- Ajout de gestion de l'état `mounted`
- Optimisation des dépendances `useEffect`

**Impact** :
- ✅ Cohérence entre tous les callbacks OAuth
- ✅ Prévention des mêmes problèmes pour t4g

## 📊 Résultats Attendus

### Avant
```
❌ 4 appels successifs à processCallback()
❌ Erreurs 401 répétées
❌ State OAuth perdu après premier appel
❌ Backend inaccessible
```

### Après
```
✅ 1 seul appel à processCallback()
✅ Pas d'erreur 401 (code OAuth utilisé une seule fois)
✅ State OAuth préservé jusqu'au succès
✅ Message clair si backend inaccessible
```

## 🧪 Tests à Effectuer

### 1. Test Flow LinkedIn

```bash
# Terminal 1 - Backend Rust
cd token4good-backend
cargo run

# Terminal 2 - Frontend
npm run dev
```

**Étapes** :
1. Ouvrir http://localhost:4200/login
2. Cliquer "Se connecter avec LinkedIn"
3. Autoriser l'application sur LinkedIn
4. Vérifier la redirection vers `/auth/callback/linkedin`
5. **Vérifier console** : 1 seul log `[OAuth Debug]`
6. Redirection automatique vers `/dashboard`

**Résultats attendus** :
- ✅ Aucune boucle infinie
- ✅ Aucune erreur 401
- ✅ State OAuth valide
- ✅ Connexion réussie

### 2. Test Flow t4g

Mêmes étapes avec "Se connecter avec Token4Good"

### 3. Test Sans Backend Rust

**Étapes** :
1. Arrêter le backend Rust
2. Tenter une connexion OAuth

**Résultats attendus** :
- ✅ Message clair : `⚠️ Backend non accessible (http://localhost:8080)`
- ✅ Pas de boucle infinie d'erreurs

## 📝 Configuration Requise

### `.env.local` (à la racine)

```bash
# Backend
NEXT_PUBLIC_API_URL=http://localhost:8080

# LinkedIn
LINKEDIN_CLIENT_ID=xxxxx
LINKEDIN_CLIENT_SECRET=xxxxx

# t4g
CLIENT_ID=xxxxx
CLIENT_SECRET=xxxxx
AUTH_URL=https://auth.token4good.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:4200
```

### Démarrage

```bash
# 1. Backend Rust
cd token4good-backend && cargo run

# 2. Frontend Next.js
npm run dev
```

## 🔍 Debug

### Logs Console Normaux

```javascript
[OAuth Debug] Provider: linkedin, State reçu: abc123, State sauvegardé: abc123
// ... 1 seul appel API ...
✅ Redirection vers /dashboard
```

### Logs d'Erreur (si backend éteint)

```javascript
❌ POST http://localhost:8080/api/auth/login net::ERR_CONNECTION_REFUSED
⚠️ Backend non accessible (http://localhost:8080). Vérifiez que Railway est en ligne.
```

## 📚 Références

- [CONFIGURATION_DEV_LOCAL.md](../../CONFIGURATION_DEV_LOCAL.md) - Configuration complète
- [useOAuth.ts](../../apps/dapp/hooks/useOAuth.ts) - Hook OAuth corrigé
- [Architecture OAuth](./../_SPECS/api-pour-t4g-daznode.md)

## 🎉 Statut

- ✅ **Corrections appliquées** le 19 janvier 2026
- ✅ **Linter** : Aucune erreur
- ✅ **TypeScript** : Compilation réussie
- ⏳ **Tests E2E** : À valider avec backend Rust démarré
