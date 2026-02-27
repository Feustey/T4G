# Migration OAuth → Supabase OTP + Session Dazno partagée

## Vue d'ensemble

Le système d'authentification a été migré de OAuth (t4g/LinkedIn) vers **Supabase OTP** avec support de la **session Dazno partagée**. Les utilisateurs de app.token-for-good.com et token4good.com partagent maintenant la même base d'utilisateurs Supabase.

## Fonctionnalités

### 1. Authentification par email (Supabase OTP)
- L'utilisateur entre son email
- Supabase envoie un "magic link" par email
- L'utilisateur clique sur le lien et est authentifié
- Redirection vers `/onboarding` (nouveau) ou `/dashboard` (existant)

### 2. Session partagée avec Dazno
- Si l'utilisateur est déjà connecté sur `app.token-for-good.com`, sa session est automatiquement détectée
- Le token Dazno est stocké dans `localStorage` avec la clé `dazno_token`
- À chaque chargement de page, le système vérifie si une session Dazno existe
- Si oui, l'utilisateur est automatiquement connecté sans redemander d'authentification

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Auth                            │
│  (Base d'utilisateurs partagée entre Dazno et Token4Good)   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│  app.token-for-good.com    │                  │  token4good.com  │
│                  │                  │                  │
│  Session Dazno   │ ◄──────────────► │  Session T4G     │
│  (localStorage)  │   Token partagé  │  (localStorage)  │
└──────────────────┘                  └──────────────────┘
```

## Flux d'authentification

### Nouvel utilisateur
```
1. Utilisateur clique sur "Inscription" → Landing page
2. Entre son email
3. Reçoit le magic link
4. Clique sur le lien → Callback Supabase
5. Vérifie si onboardé → NON
6. Redirection → /onboarding
7. Complète le formulaire
8. Redirection → /dashboard
```

### Utilisateur existant
```
1. Utilisateur clique sur "Connexion"
2. Entre son email
3. Reçoit le magic link
4. Clique sur le lien → Callback Supabase
5. Vérifie si onboardé → OUI
6. Redirection → /dashboard
```

### Utilisateur avec session Dazno
```
1. Utilisateur déjà connecté sur app.token-for-good.com
2. Visite token4good.com
3. Le système détecte le token Dazno dans localStorage
4. Vérifie que le token est valide
5. Authentifie automatiquement l'utilisateur
6. Redirection → /onboarding ou /dashboard
```

## Configuration

### Variables d'environnement requises

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_ID>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>

# Dazno (session partagée)
NEXT_PUBLIC_DAZNO_VERIFY_URL=https://token-for-good.com/api/auth/verify-session
```

### Configuration Supabase

1. **Créer un projet Supabase** (ou utiliser celui de Dazno)
2. **Activer l'authentification par email** dans Authentication > Providers
3. **Configurer les URL de redirection** :
   - `http://localhost:3001/auth/callback` (développement)
   - `https://token4good.com/auth/callback` (production)
4. **Récupérer les clés** dans Project Settings > API

## Utilisation dans le code

### Hook `useOAuth`

```typescript
import { useOAuth } from '../hooks/useOAuth';

function LoginPage() {
  const { loginWithOTP, loginWithDazno, initAuth } = useOAuth();

  // Vérifier les sessions existantes au chargement
  useEffect(() => {
    initAuth();
  }, []);

  // Envoyer un OTP par email
  const handleEmailLogin = async (email: string) => {
    const result = await loginWithOTP(email);
    console.log(result.message); // "Email de connexion envoyé !"
  };

  // Se connecter avec un token Dazno
  const handleDaznoLogin = async (token: string) => {
    await loginWithDazno(token);
  };
}
```

### Fonctions disponibles

| Fonction | Description |
|----------|-------------|
| `loginWithOTP(email)` | Envoie un magic link par email |
| `loginWithDazno(token?)` | Authentifie avec Dazno (détecte auto la session si pas de token) |
| `verifySupabaseSession()` | Vérifie et authentifie une session Supabase |
| `checkExistingDaznoSession()` | Vérifie si une session Dazno existe dans localStorage |
| `initAuth()` | Initialise l'auth (vérifie Dazno puis Supabase) |

## Gestion du onboarding

Le système vérifie automatiquement si l'utilisateur a complété son onboarding via l'endpoint `/api/user/onboarding-status`.

- **Nouvel utilisateur** (`is_onboarded: false`) → Redirection vers `/onboarding`
- **Utilisateur existant** (`is_onboarded: true`) → Redirection vers `/dashboard`

## Migration depuis l'ancien système

### Fichiers supprimés
- ❌ `pages/auth/callback/t4g.tsx`
- ❌ `pages/auth/callback/linkedin.tsx`
- ❌ `pages/api/auth/callback/t4g.ts`
- ❌ `pages/api/auth/callback/linkedin.ts`

### Fichiers ajoutés
- ✅ `pages/auth/callback.tsx` (callback Supabase)
- ✅ `pages/api/user/onboarding-status.ts` (vérification onboarding)

### Fichiers modifiés
- 📝 `hooks/useOAuth.ts` (remplace OAuth par Supabase + Dazno)
- 📝 `contexts/AuthContext.tsx` (support session partagée)
- 📝 `SAMPLE.env` (nouvelles variables)

## Avantages de cette approche

1. **Session unique** : L'utilisateur n'a plus besoin de se reconnecter entre Dazno et Token4Good
2. **Moins de friction** : Magic link plus simple que OAuth
3. **Base d'utilisateurs partagée** : Supabase centralise tous les utilisateurs
4. **Sécurisé** : Pas de mots de passe à gérer, tokens courts expirables
5. **Expérience fluide** : Détection automatique des sessions existantes

## Notes importantes

⚠️ **Cookies et localStorage** : Le token Dazno est stocké dans `localStorage` avec la clé `dazno_token`. Assurez-vous que les deux applications partagent le même domaine principal (ex: `*.token4good.com` et `*.token-for-good.com`) ou utilisez un domaine commun.

⚠️ **CORS** : Si les domaines sont différents, configurez correctement les CORS sur le backend Dazno pour autoriser les requêtes depuis token4good.com.

⚠️ **Synchronisation** : La base Supabase doit être partagée entre les deux applications. Ne créez pas deux projets Supabase séparés.
