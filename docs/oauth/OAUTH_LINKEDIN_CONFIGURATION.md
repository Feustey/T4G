# 🔐 Configuration OAuth LinkedIn et t4g - Guide Complet

## ✅ Implémentation Terminée

L'authentification OAuth pour LinkedIn et t4g a été complètement implémentée avec :

- ✅ Fonctions `loginWithLinkedIn()` et `loginWitht4g()` dans `useOAuth.ts`
- ✅ Pages de callback OAuth : `/auth/callback/linkedin` et `/auth/callback/t4g`
- ✅ API routes pour l'échange de tokens : `/api/auth/callback/linkedin` et `/api/auth/callback/t4g`
- ✅ Gestion des erreurs et validation CSRF avec state

---

## 📋 Configuration Requise

### 1. Variables d'Environnement Vercel (Frontend)

Allez sur le dashboard Vercel et ajoutez ces variables d'environnement :

```bash
# URL de l'application (utilisée pour les redirects OAuth)
NEXT_PUBLIC_APP_URL=https://app.token-for-good.com

# URL du backend Rust
NEXT_PUBLIC_API_URL=https://votre-backend.railway.app

# LinkedIn OAuth Credentials
LINKEDIN_CLIENT_ID=votre_linkedin_client_id
LINKEDIN_CLIENT_SECRET=votre_linkedin_client_secret
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=votre_linkedin_client_id

# t4g OAuth Credentials (si utilisé)
CLIENT_ID=votre_t4g_client_id
CLIENT_SECRET=votre_t4g_client_secret
AUTH_URL=https://oauth.t4g.com
NEXT_PUBLIC_T4G_CLIENT_ID=votre_t4g_client_id
NEXT_PUBLIC_T4G_AUTH_URL=https://oauth.t4g.com

# Dazno
NEXT_PUBLIC_DAZNO_VERIFY_URL=https://token-for-good.com/api/auth/verify-session
```

### 2. Obtenir les Credentials LinkedIn OAuth

#### Étape 1 : Créer une Application LinkedIn

1. Allez sur [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Cliquez sur "Create app"
3. Remplissez les informations :
   - **App name:** Token4Good
   - **LinkedIn Page:** Votre page entreprise
   - **Privacy policy URL:** https://app.token-for-good.com/privacy
   - **App logo:** Votre logo

#### Étape 2 : Configurer les Produits OAuth

1. Dans l'onglet "Products", activez **"Sign In with LinkedIn using OpenID Connect"**
2. Attendez la validation (généralement instantanée)

#### Étape 3 : Configurer les Redirect URIs

1. Allez dans l'onglet "Auth"
2. Dans "Authorized redirect URLs for your app", ajoutez :
   ```
   https://app.token-for-good.com/auth/callback/linkedin
   http://localhost:4200/auth/callback/linkedin (pour développement)
   ```

#### Étape 4 : Récupérer les Credentials

1. Dans l'onglet "Auth", copiez :
   - **Client ID**
   - **Client Secret**
2. Ajoutez-les dans les variables d'environnement Vercel

#### Étape 5 : Configurer les Scopes

Les scopes suivants sont automatiquement inclus avec OpenID Connect :
- `openid` - Authentification de base
- `profile` - Nom complet de l'utilisateur
- `email` - Adresse email de l'utilisateur

---

## 🧪 Tester l'Authentification LinkedIn

### En Développement (local)

```bash
# 1. Créer un fichier .env.local à la racine du projet
cd apps/dapp

# 2. Ajouter les variables
cat > .env.local << EOF
NEXT_PUBLIC_APP_URL=http://localhost:4200
NEXT_PUBLIC_API_URL=http://localhost:8080
LINKEDIN_CLIENT_ID=votre_client_id
LINKEDIN_CLIENT_SECRET=votre_client_secret
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=votre_client_id
EOF

# 3. Démarrer l'application
npm run dev

# 4. Ouvrir http://localhost:4200/login
# 5. Cliquer sur "Login with LinkedIn"
```

### En Production

1. **Déployer sur Vercel** avec les variables d'environnement configurées
2. **Tester le flow complet** :
   - Aller sur https://app.token-for-good.com/login
   - Cliquer sur "Login with LinkedIn"
   - Autoriser l'application LinkedIn
   - Vérifier la redirection vers le dashboard

---

## 🔍 Débogage

### Erreur : "Configuration LinkedIn manquante"

**Cause :** Les variables `LINKEDIN_CLIENT_ID` ou `LINKEDIN_CLIENT_SECRET` ne sont pas définies.

**Solution :**
```bash
# Vérifier les variables sur Vercel
vercel env ls

# Ajouter si manquantes
vercel env add LINKEDIN_CLIENT_ID
vercel env add LINKEDIN_CLIENT_SECRET

# Redéployer
vercel --prod
```

### Erreur : "State invalide - possible attaque CSRF"

**Cause :** Le state OAuth ne correspond pas (peut arriver si l'utilisateur rafraîchit la page).

**Solution :** Recommencer le flow d'authentification en cliquant à nouveau sur le bouton.

### Erreur : "Échec échange token LinkedIn"

**Causes possibles :**
1. Client Secret incorrect
2. Redirect URI non autorisée dans LinkedIn
3. Code d'autorisation expiré (10 minutes)

**Solutions :**
1. Vérifier le Client Secret dans Vercel
2. Ajouter l'URL de redirect dans LinkedIn Developers
3. Recommencer le flow si le code a expiré

### Erreur : "Échec récupération profil LinkedIn"

**Cause :** L'access token est invalide ou les scopes sont insuffisants.

**Solution :** Vérifier que "Sign In with LinkedIn using OpenID Connect" est activé dans LinkedIn Developers.

---

## 📊 Flow d'Authentification LinkedIn

```
1. USER clique sur "Login with LinkedIn"
   ↓
2. FRONTEND → Redirect vers LinkedIn OAuth
   URL: https://www.linkedin.com/oauth/v2/authorization
   Params: client_id, redirect_uri, scope=openid profile email, state
   ↓
3. LINKEDIN → User authentifie et autorise
   ↓
4. LINKEDIN → Redirect vers /auth/callback/linkedin?code=XXX&state=YYY
   ↓
5. FRONTEND → Vérifie le state (CSRF protection)
   ↓
6. FRONTEND → POST /api/auth/callback/linkedin { code }
   ↓
7. API ROUTE → POST https://www.linkedin.com/oauth/v2/accessToken
   Échange code → access_token
   ↓
8. API ROUTE → GET https://api.linkedin.com/v2/userinfo
   Récupère: email, given_name, family_name, sub (ID)
   ↓
9. FRONTEND → apiClient.login({
     provider: 'linkedin',
     provider_user_data: { email, given_name, family_name, sub }
   })
   ↓
10. BACKEND RUST → /api/auth/login
    - Crée/récupère user en DB
    - Génère JWT token
    - Retourne { token, user }
    ↓
11. FRONTEND → Store JWT → Set user → Redirect /dashboard
```

---

## 🚀 Déploiement

### 1. Configurer les variables Vercel

```bash
# Via CLI
vercel env add LINKEDIN_CLIENT_ID production
vercel env add LINKEDIN_CLIENT_SECRET production
vercel env add NEXT_PUBLIC_LINKEDIN_CLIENT_ID production
vercel env add NEXT_PUBLIC_APP_URL production

# Ou via Dashboard
# https://vercel.com/votre-projet/settings/environment-variables
```

### 2. Déployer

```bash
# À la racine du projet
git add .
git commit -m "feat: Implémentation OAuth LinkedIn et t4g"
git push origin main

# Ou déploiement manuel
vercel --prod
```

### 3. Vérifier

```bash
# Health check
curl https://app.token-for-good.com/api/health

# Test login
open https://app.token-for-good.com/login
```

---

## 📝 Checklist de Déploiement

- [ ] Application LinkedIn créée
- [ ] Produit "Sign In with LinkedIn using OpenID Connect" activé
- [ ] Redirect URIs configurées dans LinkedIn
- [ ] Variables `LINKEDIN_CLIENT_ID` et `LINKEDIN_CLIENT_SECRET` ajoutées sur Vercel
- [ ] Variable `NEXT_PUBLIC_APP_URL` correcte sur Vercel
- [ ] Code déployé sur Vercel
- [ ] Test du flow complet en production
- [ ] Vérification des logs Vercel en cas d'erreur

---

## 📚 Ressources

- [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn OpenID Connect](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
- [LinkedIn API v2](https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

## 🎉 Fonctionnalités Implémentées

✅ **Authentification Multi-Providers**
- LinkedIn OAuth 2.0 avec OpenID Connect
- t4g OAuth 2.0
- Dazno Token Authentication

✅ **Sécurité**
- Protection CSRF avec state
- Validation des tokens
- Gestion des erreurs

✅ **UX**
- Pages de callback avec loading states
- Messages d'erreur clairs
- Redirections automatiques

✅ **Backend**
- Intégration avec backend Rust
- JWT token generation
- User creation/retrieval

---

**Date de mise à jour :** 16 janvier 2026
**Version :** 2.0
**Statut :** ✅ Prêt pour production
