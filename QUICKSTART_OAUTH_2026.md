# 🚀 Quick Start OAuth - Token4Good

**Mise à jour** : 19 janvier 2026  
**Statut** : ✅ Corrections appliquées, prêt pour configuration OAuth

## ⚡ Démarrage Rapide (5 minutes)

### 1. Créer `.env.local` à la racine

```bash
# LinkedIn OAuth (requis)
LINKEDIN_CLIENT_ID=votre_client_id
LINKEDIN_CLIENT_SECRET=votre_client_secret

# t4g OAuth (requis)
CLIENT_ID=votre_t4g_client_id
CLIENT_SECRET=votre_t4g_client_secret
AUTH_URL=https://auth.token4good.com

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:4200

# Backend (optionnel, Railway déjà configuré par défaut)
# NEXT_PUBLIC_API_URL=https://apirust-production.up.railway.app
```

### 2. Démarrer le Frontend

```bash
npm install   # Si première fois
npm run dev   # ou: nx serve dapp
```

### 3. Tester

Ouvrir http://localhost:4200/login et cliquer sur :
- 🔵 "Se connecter avec LinkedIn"
- 🟢 "Se connecter avec Token4Good"

**C'est tout !** Le backend Railway est déjà configuré. ✅

---

## 🔑 Obtenir les Credentials LinkedIn

1. **Aller sur** https://www.linkedin.com/developers/apps
2. **Créer une app** ou sélectionner une existante
3. **Configurer les Redirect URLs** :
   ```
   http://localhost:4200/auth/callback/linkedin
   https://votre-domaine.vercel.app/auth/callback/linkedin
   ```
4. **Activer les scopes** :
   - ✅ `openid`
   - ✅ `profile`
   - ✅ `email`
5. **Copier** `Client ID` et `Client Secret` dans `.env.local`

---

## ✅ Vérifications

### Backend Railway Accessible ?

```bash
curl https://apirust-production.up.railway.app/health
```

**Attendu** : `{"status":"ok",...}`  
**Statut actuel** : ✅ Opérationnel

### Frontend Démarre ?

```bash
npm run dev
```

**Attendu** : `ready - started server on 0.0.0.0:4200`

### OAuth Fonctionne ?

Console navigateur après authentification :
```javascript
✅ [OAuth Debug] Provider: linkedin, State reçu: abc123, State sauvegardé: abc123
✅ Redirection vers /dashboard (pas d'erreur 401)
```

---

## 🐛 Problèmes Courants

### Erreur 401 sur `/api/auth/callback/linkedin`

**Cause** : Credentials OAuth manquants ou invalides

**Solution** :
```bash
# Vérifier .env.local
cat .env.local | grep LINKEDIN

# Doit afficher :
LINKEDIN_CLIENT_ID=xxxxx
LINKEDIN_CLIENT_SECRET=xxxxx
```

### Boucle Infinie / Appels Multiples

**Cause** : Code pas à jour (corrections déjà appliquées)

**Solution** :
```bash
git pull origin main
npm install
```

### Backend Railway Inaccessible

**Vérifier** :
```bash
curl https://apirust-production.up.railway.app/health
```

**Si erreur** : Vérifier Railway Dashboard ou contacter admin

---

## 📚 Documentation Complète

| Document | Description |
|----------|-------------|
| [FIXES_OAUTH_SUMMARY_2026-01-19.md](./FIXES_OAUTH_SUMMARY_2026-01-19.md) | Résumé complet des corrections |
| [CONFIGURATION_DEV_LOCAL.md](./CONFIGURATION_DEV_LOCAL.md) | Configuration détaillée |
| [RAILWAY_CONFIG.md](./RAILWAY_CONFIG.md) | Backend Railway |
| [docs/fixes/LOGIN_LOCAL_FIXES_2026-01-19.md](./docs/fixes/LOGIN_LOCAL_FIXES_2026-01-19.md) | Détails techniques |

---

## 🎯 Checklist

- [ ] Créer `.env.local` avec credentials OAuth
- [ ] Lancer `npm run dev`
- [ ] Tester login LinkedIn
- [ ] Tester login t4g
- [ ] Vérifier aucune erreur 401
- [ ] Vérifier redirection vers `/dashboard`

**Tout fonctionne ?** 🎉 Vous êtes prêt à développer !

**Problème ?** Voir les documents de debug ci-dessus.
