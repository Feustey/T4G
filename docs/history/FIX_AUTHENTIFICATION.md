# 🔐 Fix Authentification - Token4Good

**Date**: 21 janvier 2026  
**Problème**: L'authentification ne fonctionne pas sur la page

## 🚨 Symptômes

- Les boutons de connexion ne fonctionnent pas
- Erreurs lors du clic sur "Login with LinkedIn" ou "Login with t4g"
- Redirection vers OAuth mais callback échoue
- Message "Configuration OAuth incomplète"

## 🔍 Causes Identifiées

### 1. Variables d'Environnement Manquantes ❌

Les routes API OAuth nécessitent des variables d'environnement :

**Pour LinkedIn** :
- `LINKEDIN_CLIENT_ID` (côté serveur)
- `LINKEDIN_CLIENT_SECRET` (côté serveur)
- `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` (côté client)

**Pour T4G** :
- `CLIENT_ID` (côté serveur)
- `CLIENT_SECRET` (côté serveur)
- `AUTH_URL` (côté serveur)
- `NEXT_PUBLIC_T4G_CLIENT_ID` (côté client)
- `NEXT_PUBLIC_T4G_AUTH_URL` (côté client)

### 2. Backend Non Accessible ❌

Si `NEXT_PUBLIC_API_URL` n'est pas configuré ou pointe vers un backend inaccessible.

### 3. Configuration OAuth Incomplète ❌

Les providers OAuth (LinkedIn, T4G) nécessitent :
- Client ID et Secret configurés
- URLs de callback correctes
- Scopes OAuth appropriés

## ✅ Solutions

### Étape 1 : Vérifier la Configuration

**Ouvrir la page de test** :
```
http://localhost:4200/test-auth-config
```

Cette page affiche :
- ✅ Variables d'environnement présentes
- ❌ Variables manquantes
- ⚠️ Variables optionnelles (OAuth)

### Étape 2 : Configurer les Variables Requises

**Créer/éditer `.env.local`** à la racine du projet :

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://apirust-production.up.railway.app

# Frontend
NEXT_PUBLIC_APP_URL=http://localhost:4200
NEXTAUTH_URL=http://localhost:4200

# OAuth LinkedIn (optionnel mais recommandé)
LINKEDIN_CLIENT_ID=votre_client_id_linkedin
LINKEDIN_CLIENT_SECRET=votre_client_secret_linkedin
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=votre_client_id_linkedin

# OAuth T4G (optionnel mais recommandé)
CLIENT_ID=votre_t4g_client_id
CLIENT_SECRET=votre_t4g_client_secret
NEXT_PUBLIC_T4G_CLIENT_ID=votre_t4g_client_id
NEXT_PUBLIC_T4G_AUTH_URL=https://oauth.t4g.com
```

### Étape 3 : Redémarrer le Serveur

**Important** : Après modification de `.env.local`, redémarrer le serveur :

```bash
# Arrêter (Ctrl+C)
# Puis relancer
cd apps/dapp
npm run dev
```

### Étape 4 : Tester l'Authentification

1. **Aller sur** : `http://localhost:4200/login`
2. **Cliquer sur un bouton de connexion** :
   - "Login with LinkedIn"
   - "Login with Daznode"
   - Ou utiliser les boutons de debug (si visibles)

3. **Vérifier dans la console** (F12) :
   - Pas d'erreurs "Configuration OAuth incomplète"
   - Redirection vers le provider OAuth
   - Callback réussi

## 🐛 Diagnostic Détaillé

### Erreur : "Configuration OAuth incomplète"

**Cause** : Variables d'environnement manquantes dans les routes API.

**Solution** :
1. Vérifier `/test-auth-config` pour voir quelles variables manquent
2. Ajouter les variables dans `.env.local`
3. Redémarrer le serveur

### Erreur : "Failed to fetch" lors du callback

**Cause** : Le backend n'est pas accessible ou l'URL est incorrecte.

**Solution** :
1. Vérifier `NEXT_PUBLIC_API_URL` dans `/test-auth-config`
2. Tester la connexion backend avec le bouton "Tester Backend"
3. Si erreur, vérifier que Railway est up :
   ```bash
   curl https://apirust-production.up.railway.app/health
   ```

### Erreur : "State invalide - possible attaque CSRF"

**Cause** : Le state OAuth ne correspond pas (en production).

**Solution** : En développement, cette vérification est assouplie. En production, vérifier que :
- Les cookies/sessionStorage fonctionnent
- Pas de problème de CORS
- Le state est bien stocké et récupéré

### Erreur : "Échec échange token LinkedIn/t4g"

**Cause** : Client ID ou Secret incorrect, ou URL de callback incorrecte.

**Solution** :
1. Vérifier les credentials OAuth dans le dashboard du provider
2. Vérifier que l'URL de callback correspond :
   - LinkedIn : `http://localhost:4200/auth/callback/linkedin`
   - T4G : `http://localhost:4200/auth/callback/t4g`
3. Vérifier les scopes OAuth demandés

## 📋 Checklist de Configuration

### Variables Requises (Minimum)
- [ ] `NEXT_PUBLIC_API_URL` défini
- [ ] `NEXT_PUBLIC_APP_URL` défini
- [ ] `NEXTAUTH_URL` défini
- [ ] Backend accessible (test sur `/test-auth-config`)

### Variables OAuth LinkedIn (Optionnel)
- [ ] `LINKEDIN_CLIENT_ID` défini
- [ ] `LINKEDIN_CLIENT_SECRET` défini
- [ ] `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` défini
- [ ] Application LinkedIn configurée avec callback URL

### Variables OAuth T4G (Optionnel)
- [ ] `CLIENT_ID` défini
- [ ] `CLIENT_SECRET` défini
- [ ] `AUTH_URL` défini
- [ ] `NEXT_PUBLIC_T4G_CLIENT_ID` défini
- [ ] `NEXT_PUBLIC_T4G_AUTH_URL` défini
- [ ] Application T4G configurée avec callback URL

## 🔧 Pages de Diagnostic

### 1. Test Configuration (`/test-auth-config`)
- Affiche toutes les variables d'environnement
- Teste la connexion backend
- Indique les variables manquantes

### 2. Debug Auth (`/debug-auth`)
- État de l'authentification
- Présence du token JWT
- Test des endpoints API

### 3. Page de Login (`/login`)
- Boutons de connexion OAuth
- Boutons de debug (en développement)
- Messages d'erreur

## 🎯 Flux d'Authentification

### 1. LinkedIn OAuth

```
1. Utilisateur clique "Login with LinkedIn"
   → useOAuth.loginWithLinkedIn()
   → Redirection vers LinkedIn OAuth

2. LinkedIn redirige vers /auth/callback/linkedin?code=...&state=...
   → LinkedInCallback.tsx
   → handleOAuthCallback('linkedin', code, state)

3. handleOAuthCallback appelle /api/auth/callback/linkedin
   → Échange code contre access token
   → Récupère userinfo
   → Retourne données utilisateur

4. AuthContext.login('linkedin', { providerUserData })
   → Appelle backend /api/auth/login
   → Reçoit token JWT
   → Stocke dans localStorage
   → Redirige vers dashboard
```

### 2. T4G OAuth

```
1. Utilisateur clique "Login with t4g"
   → useOAuth.loginWitht4g()
   → Redirection vers T4G OAuth

2. T4G redirige vers /auth/callback/t4g?code=...&state=...
   → T4gCallback.tsx
   → handleOAuthCallback('t4g', code, state)

3. handleOAuthCallback appelle /api/auth/callback/t4g
   → Échange code contre access token
   → Récupère userinfo
   → Retourne données utilisateur

4. AuthContext.login('t4g', { providerUserData })
   → Appelle backend /api/auth/login
   → Reçoit token JWT
   → Stocke dans localStorage
   → Redirige vers dashboard
```

### 3. Dazno

```
1. Utilisateur clique "Login with Daznode"
   → useOAuth.loginWithDazno()
   → Vérifie session Dazno existante
   → Sinon, ouvre popup Dazno

2. Dazno retourne token
   → AuthContext.login('dazeno', { token })
   → Appelle backend /api/auth/login
   → Reçoit token JWT
   → Stocke dans localStorage
   → Redirige vers dashboard
```

## 🆘 Dépannage Rapide

### Problème : "Aucun bouton ne fonctionne"

1. Ouvrir `/test-auth-config`
2. Vérifier que `NEXT_PUBLIC_API_URL` est défini
3. Tester la connexion backend
4. Si erreur, vérifier Railway

### Problème : "Configuration OAuth incomplète"

1. Ouvrir `/test-auth-config`
2. Voir quelles variables OAuth manquent
3. Ajouter dans `.env.local`
4. Redémarrer le serveur

### Problème : "Callback échoue"

1. Ouvrir la console (F12)
2. Vérifier les erreurs réseau dans l'onglet Network
3. Vérifier les logs serveur (terminal)
4. Vérifier que les routes API `/api/auth/callback/*` fonctionnent

### Problème : "Token non stocké"

1. Ouvrir `/debug-auth`
2. Vérifier "Token présent"
3. Si non, vérifier que `AuthContext.login()` est appelé
4. Vérifier que `apiClient.setToken()` fonctionne

## 📚 Documentation Associée

- **[DIAGNOSTIC_ERREURS_FETCH.md](./DIAGNOSTIC_ERREURS_FETCH.md)** - Diagnostic fetch API
- **[QUICKSTART_OAUTH_2026.md](./QUICKSTART_OAUTH_2026.md)** - Guide OAuth complet
- **[CONFIGURATION_DEV_LOCAL.md](./CONFIGURATION_DEV_LOCAL.md)** - Configuration locale

## ✅ Résolution

Après avoir suivi ces étapes :

1. ✅ Variables d'environnement configurées
2. ✅ Backend accessible
3. ✅ Routes OAuth fonctionnelles
4. ✅ Token JWT stocké
5. ✅ Redirection vers dashboard

**L'authentification devrait maintenant fonctionner ! 🎉**
