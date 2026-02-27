# 🔐 Configuration OAuth Production - Token4Good

**Date**: 16 février 2026  
**Version**: 2.0.0  
**Status**: ✅ Guide Complet

---

## 📋 Vue d'Ensemble

Ce document décrit la configuration complète des providers OAuth pour l'environnement de production de Token4Good.

### Providers OAuth Supportés

1. **LinkedIn OAuth** - Authentification professionnelle
2. **t4g OAuth** - Authentification interne Token4Good
3. **Dazno OAuth** - Intégration avec l'écosystème Dazno

---

## 🔧 Configuration LinkedIn OAuth

### 1. Créer une Application LinkedIn

1. Accéder à [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Cliquer sur "Create app"
3. Remplir les informations :
   - **App name**: Token4Good Production
   - **LinkedIn Page**: Votre page entreprise
   - **Privacy policy URL**: https://app.token-for-good.com/privacy
   - **App logo**: Logo Token4Good

### 2. Configurer les Redirect URLs

Dans l'onglet "Auth" de votre application LinkedIn :

```
Production:
https://app.token-for-good.com/api/auth/callback/linkedin
https://app.token-for-good.com/auth/callback/linkedin

Staging (optionnel):
https://staging.token-for-good.com/api/auth/callback/linkedin
```

### 3. Activer les Permissions

Dans l'onglet "Products", activer :
- ✅ Sign In with LinkedIn
- ✅ Share on LinkedIn (optionnel)
- ✅ OpenID Connect

### 4. Récupérer les Credentials

Copier depuis l'onglet "Auth" :
- **Client ID**: `LINKEDIN_CLIENT_ID`
- **Client Secret**: `LINKEDIN_CLIENT_SECRET`

---

## 🔧 Configuration t4g OAuth

### 1. Serveur d'Authentification t4g

Le serveur OAuth t4g doit être configuré pour accepter les redirections depuis :

```
Production:
https://app.token-for-good.com/api/auth/callback/t4g
https://app.token-for-good.com/auth/callback/t4g

Staging:
https://staging.token-for-good.com/api/auth/callback/t4g
```

### 2. Credentials

Obtenir les credentials depuis l'équipe t4g :
- **Client ID**: `T4G_CLIENT_ID`
- **Client Secret**: `T4G_CLIENT_SECRET`
- **Auth URL**: `https://auth.token4good.com`

### 3. Scopes Requis

```
openid
profile
email
t4g:tokens
t4g:wallet
```

---

## 🔧 Configuration Dazno OAuth

### 1. Configuration Dazno

Coordonner avec l'équipe Dazno pour configurer :

```
Redirect URLs Production:
https://app.token-for-good.com/api/auth/callback/dazno
https://app.token-for-good.com/auth/callback/dazno
```

### 2. Credentials Dazno

- **DAZNO_API_KEY**: Clé API Dazno
- **DAZNO_LIGHTNING_API_URL**: https://api.token-for-good.com
- **DAZNO_USERS_API_URL**: https://token-for-good.com/api

---

## 📝 Variables d'Environnement Vercel

### Configuration Complète

Configurer ces variables dans Vercel Dashboard → Settings → Environment Variables :

```bash
# === LinkedIn OAuth ===
LINKEDIN_CLIENT_ID=<votre_client_id_linkedin>
LINKEDIN_CLIENT_SECRET=<votre_client_secret_linkedin>

# === t4g OAuth ===
T4G_CLIENT_ID=<votre_client_id_t4g>
T4G_CLIENT_SECRET=<votre_client_secret_t4g>
T4G_AUTH_URL=https://auth.token4good.com

# === Dazno Integration ===
NEXT_PUBLIC_DAZNO_API_URL=https://api.token-for-good.com
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://token-for-good.com/api
NEXT_PUBLIC_DAZNO_VERIFY_URL=https://token-for-good.com/api/auth/verify-session

# === Application URLs ===
NEXT_PUBLIC_APP_URL=https://app.token-for-good.com
NEXT_PUBLIC_API_URL=https://apirust-production.up.railway.app
NEXTAUTH_URL=https://app.token-for-good.com

# === JWT ===
NEXTAUTH_SECRET=<générer_avec_openssl_rand_base64_32>

# === Environment ===
NODE_ENV=production
```

### Générer NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## 📝 Variables d'Environnement Railway (Backend)

Configurer ces variables dans Railway Dashboard :

```bash
# === JWT Authentication ===
JWT_SECRET=<même_secret_que_NEXTAUTH_SECRET>
JWT_EXPIRATION_HOURS=24

# === Dazno API ===
DAZNO_API_KEY=<votre_api_key_dazno>
DAZNO_LIGHTNING_API_URL=https://api.token-for-good.com
DAZNO_USERS_API_URL=https://token-for-good.com/api

# === CORS ===
ALLOWED_ORIGINS=https://app.token-for-good.com,https://token4good.vercel.app

# === Database ===
# DATABASE_URL est auto-configuré par Railway PostgreSQL

# === Server ===
HOST=0.0.0.0
PORT=3000
RUST_LOG=info,token4good_backend=debug
```

---

## 🧪 Tests de Configuration

### 1. Test LinkedIn OAuth

```bash
# Démarrer le frontend
cd apps/dapp
npm run dev

# Naviguer vers http://localhost:4200/login
# Cliquer sur "Se connecter avec LinkedIn"
# Vérifier la redirection et l'authentification
```

### 2. Test t4g OAuth

```bash
# Même processus que LinkedIn
# Cliquer sur "Se connecter avec t4g"
```

### 3. Test Dazno Auto-Login

```bash
# Naviguer depuis Dazno vers Token4Good avec token
# URL: https://app.token-for-good.com?token=JWT_TOKEN
# Vérifier l'authentification automatique
```

---

## 📊 Checklist de Configuration

### LinkedIn OAuth

- [ ] Application LinkedIn créée
- [ ] Redirect URLs configurées
- [ ] Permissions activées (Sign In with LinkedIn)
- [ ] Client ID et Secret récupérés
- [ ] Variables ajoutées à Vercel
- [ ] Tests locaux réussis
- [ ] Tests production réussis

### t4g OAuth

- [ ] Serveur OAuth t4g configuré
- [ ] Redirect URLs enregistrées
- [ ] Credentials obtenus
- [ ] Variables ajoutées à Vercel
- [ ] Tests locaux réussis
- [ ] Tests production réussis

### Dazno OAuth

- [ ] Configuration coordonnée avec équipe Dazno
- [ ] API Key obtenue
- [ ] URLs configurées
- [ ] Variables ajoutées à Vercel et Railway
- [ ] Tests auto-login réussis
- [ ] Tests production réussis

---

## 🔒 Sécurité

### Best Practices

1. **Secrets Management**
   - ❌ Ne JAMAIS commiter les secrets dans Git
   - ✅ Utiliser les variables d'environnement Vercel/Railway
   - ✅ Rotation régulière des secrets (tous les 90 jours)
   - ✅ Secrets différents dev/staging/production

2. **Redirect URLs**
   - ✅ Utiliser HTTPS uniquement en production
   - ✅ Whitelist stricte des URLs autorisées
   - ❌ Pas de wildcards en production

3. **CORS**
   - ✅ Liste blanche explicite des origines
   - ❌ Pas de `allow_origin: *` en production

4. **Tokens JWT**
   - ✅ Expiration courte (24h)
   - ✅ Refresh tokens avec rotation
   - ✅ Validation stricte côté backend

---

## 🐛 Troubleshooting

### Erreur "redirect_uri_mismatch"

**Cause**: URL de redirection non configurée dans le provider OAuth

**Solution**:
1. Vérifier l'URL exacte dans les logs
2. Ajouter l'URL dans la configuration du provider
3. Attendre 5-10 minutes pour propagation
4. Réessayer

### Erreur "invalid_client"

**Cause**: Client ID ou Secret incorrect

**Solution**:
1. Vérifier les variables d'environnement Vercel
2. Régénérer les secrets si nécessaire
3. Mettre à jour dans Vercel
4. Redéployer l'application

### Boucle de Redirection Infinie

**Cause**: Problème de state OAuth ou cookies

**Solution**:
1. Vérifier que le code OAuth (19 janvier 2026) est déployé
2. Effacer les cookies du navigateur
3. Vérifier les logs backend pour erreurs
4. Tester en navigation privée

### Erreur CORS

**Cause**: Origine non autorisée

**Solution**:
1. Vérifier `ALLOWED_ORIGINS` dans Railway
2. Ajouter l'origine manquante
3. Redémarrer le backend Railway
4. Vérifier avec `curl -I`

---

## 📞 Support

### Contacts

- **LinkedIn Support**: https://www.linkedin.com/help/linkedin/answer/a1340928
- **t4g Team**: auth@token4good.com
- **Dazno Team**: api@token-for-good.com

### Documentation

- [LinkedIn OAuth 2.0](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [OAuth 2.0 RFC](https://oauth.net/2/)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

---

## 🚀 Déploiement

### Ordre de Configuration

1. **Backend Railway** (JWT_SECRET, DAZNO_API_KEY)
2. **Vercel Frontend** (toutes les variables OAuth)
3. **Providers OAuth** (redirect URLs)
4. **Tests** (vérification end-to-end)

### Commandes de Déploiement

```bash
# 1. Vérifier les variables Railway
railway variables --environment production

# 2. Vérifier les variables Vercel
vercel env ls --environment production

# 3. Déployer frontend
vercel --prod

# 4. Tester les flows OAuth
curl -I https://app.token-for-good.com/login
```

---

## ✅ Configuration Complète

Une fois tous les éléments ci-dessus configurés :

✅ LinkedIn OAuth fonctionnel  
✅ t4g OAuth fonctionnel  
✅ Dazno Auto-Login fonctionnel  
✅ JWT Tokens sécurisés  
✅ Backend Railway opérationnel  
✅ Frontend Vercel opérationnel  

**Prêt pour la production ! 🚀**

---

**Créé le**: 16 février 2026  
**Dernière mise à jour**: 16 février 2026  
**Version**: 2.0.0
