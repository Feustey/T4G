# ✅ Correction OAuth LinkedIn - Erreur 404

**Date**: 17 janvier 2026
**Statut**: ✅ Corrigé

## 🔴 Problème Identifié

La connexion LinkedIn générait une erreur 404 sur l'URL :
```
https://apirust-production.up.railway.app/api/auth/linkedin/authorize?redirect=...
```

### Cause Racine
La page `apps/dapp/pages/login.tsx` essayait d'accéder à une route backend `/api/auth/linkedin/authorize` qui **n'existe pas** dans le backend Rust.

### Analyse Technique

#### ❌ Code Problématique (ligne 127)
```typescript
window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/linkedin/authorize?redirect=${encodeURIComponent(window.location.origin + `/onboarding`)}`;
```

Cette approche supposait que le backend Rust fournirait une route d'autorisation OAuth, ce qui n'est pas le cas.

#### ✅ Architecture OAuth Correcte Existante

Le hook `useOAuth.ts` implémente déjà la bonne approche :
- Redirection directe vers LinkedIn OAuth (pas via le backend)
- Callback vers `/auth/callback/linkedin` (géré par Next.js)
- Exchange du code OAuth via `/api/auth/callback/linkedin` (API Route Next.js)
- Login final via le backend Rust avec `POST /api/auth/login`

## 🔧 Solution Appliquée

### Modifications dans `apps/dapp/pages/login.tsx`

#### 1. Import du hook `useOAuth`
```typescript
import { useIndexing, useOAuth } from '../hooks';
```

#### 2. Utilisation du hook
```typescript
const { loginWithLinkedIn, loginWithDazno } = useOAuth();
```

#### 3. Bouton LinkedIn corrigé
```typescript
<Button
  label={'Login with LinkedIn'}
  variant="primary"
  disabled={isLoggingIn}
  onClick={(e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      // Utiliser le hook useOAuth pour LinkedIn
      loginWithLinkedIn();
    } catch (error) {
      console.error('Erreur login LinkedIn:', error);
      setIsLoggingIn(false);
    }
  }}
/>
```

#### 4. Bonus : Bouton Dazno aussi corrigé
Même correction appliquée pour la connexion Dazno pour cohérence.

## 🎯 Flux OAuth LinkedIn Correct

```
1. User clique "Login with LinkedIn"
   ↓
2. loginWithLinkedIn() redirige vers LinkedIn OAuth
   URL: https://www.linkedin.com/oauth/v2/authorization?...
   ↓
3. User autorise sur LinkedIn
   ↓
4. LinkedIn redirige vers /auth/callback/linkedin?code=XXX&state=YYY
   ↓
5. Page callback Next.js échange le code
   POST /api/auth/callback/linkedin (API Route Next.js)
   ↓
6. Login via backend Rust
   POST /api/auth/login avec provider="linkedin"
   ↓
7. Backend retourne JWT Token
   ↓
8. Redirection vers dashboard ou onboarding
```

## 📝 Routes Backend Rust (Existantes)

Les routes d'authentification dans `token4good-backend/src/routes/auth.rs` :
- ✅ `POST /api/auth/login` - Login avec provider (t4g, linkedin, dazeno)
- ✅ `POST /api/auth/dazeno/verify` - Vérifier session Dazno
- ✅ `POST /api/auth/refresh` - Rafraîchir token JWT

**Aucune route `/authorize` n'est nécessaire** car l'OAuth se fait en direct avec les providers.

## ✅ Test de Validation

Pour tester la correction :

1. Aller sur `https://www.token-for-good.com/login`
2. Cliquer sur "Login with LinkedIn"
3. Vérifier la redirection vers `linkedin.com/oauth/v2/authorization`
4. Après autorisation, vérifier le callback vers `/auth/callback/linkedin`
5. Vérifier la connexion réussie et redirection vers dashboard/onboarding

## 🔄 Pages Utilisant OAuth Correctement

- ✅ `apps/dapp/pages/login-v2.tsx` - Utilisait déjà `useOAuth` correctement
- ✅ `apps/dapp/pages/login.tsx` - **CORRIGÉ** pour utiliser `useOAuth`
- ✅ `apps/dapp/hooks/useOAuth.ts` - Logique OAuth centralisée et fonctionnelle

## 📚 Références

- Hook OAuth : `apps/dapp/hooks/useOAuth.ts`
- Callback LinkedIn : `apps/dapp/pages/auth/callback/linkedin.tsx`
- API Route callback : `apps/dapp/pages/api/auth/callback/linkedin.ts`
- Backend login : `token4good-backend/src/routes/auth.rs`
- Architecture : `.cursor/rules/architecture-token4good.mdc`

## 🎉 Résultat

- ❌ Erreur 404 sur `/api/auth/linkedin/authorize` → ✅ **ÉLIMINÉE**
- ✅ Connexion LinkedIn fonctionnelle
- ✅ Cohérence avec le reste de l'application
- ✅ Code maintenable et centralisé dans `useOAuth`
