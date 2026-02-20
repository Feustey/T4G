# 🔍 Diagnostic des Erreurs de Fetch sur le Dashboard

**Date**: 21 janvier 2026  
**Problème**: Erreurs de fetch persistantes sur `services/config.ts`

## 🚨 Symptôme

```
services/config.ts (43:28) @ fetch

  41 |
  42 |   try {
> 43 |     const response = await fetch(url, {
     |                            ^
  44 |       credentials: credentials ?? 'include',
  45 |       headers: authHeaders,
  46 |       ...rest,
```

## ✅ Étape 1 : Vérifier l'Authentification

### Ouvrir la Page de Diagnostic

1. **Démarrez le frontend** :
```bash
cd apps/dapp
npm run dev
```

2. **Allez sur la page de diagnostic** :
```
http://localhost:4200/debug-auth
```

### Interpréter les Résultats

#### ❌ Cas 1 : Token présent = NON

**Cause**: Vous n'êtes pas connecté.

**Solution**:
```bash
1. Allez sur http://localhost:4200/landing
2. Cliquez sur "Se connecter"
3. Choisissez un provider OAuth :
   - Token4Good (T4G)
   - LinkedIn
   - Dazno
4. Complétez le flux de connexion
5. Retournez sur /debug-auth pour vérifier
```

#### ⚠️ Cas 2 : Token présent = OUI, mais Authentifié = NON

**Cause**: Le token est expiré ou invalide.

**Solution**:
```bash
1. Sur /debug-auth, cliquez sur "🗑️ Effacer Token"
2. Reconnectez-vous via /landing
3. Vérifiez à nouveau sur /debug-auth
```

#### ✅ Cas 3 : Token présent = OUI et Authentifié = OUI

**Cause**: L'authentification fonctionne, mais il peut y avoir un autre problème.

**Action**: Passez à l'Étape 2.

## 🔧 Étape 2 : Tester le Backend

### Sur la Page de Diagnostic

1. Cliquez sur **"🔄 Tester Backend"**

2. Vérifiez les résultats :

#### Backend Health

**Attendu** :
```json
200 OK - {"status":"ok","timestamp":"...","version":"0.1.0"}
```

**Si erreur** :
- Le backend Railway est peut-être down
- Problème réseau
- URL incorrecte dans `.env.local`

#### Test /api/metrics

**Attendu** (si connecté) :
```
200 OK - Data: {"usersCount":{"alumnis":...},...}
```

**Si 401 Unauthorized** :
- Le token est présent mais invalide
- Le token n'est pas correctement envoyé
- Le backend rejette le token

**Si 404 Not Found** :
- L'endpoint n'existe pas
- URL incorrecte

## 🐛 Étape 3 : Vérifier la Console du Navigateur

### Ouvrir les Developer Tools

1. Appuyez sur **F12** (ou Cmd+Option+I sur Mac)
2. Allez dans l'onglet **Console**

### Logs à Rechercher

#### ✅ Logs Normaux

```javascript
🔵 config.ts - NEXT_PUBLIC_API_URL: https://apirust-production.up.railway.app
🔵 config.ts - API_BASE_URL: https://apirust-production.up.railway.app
🔵 apiFetch - URL: https://apirust-production.up.railway.app/api/metrics
🔵 apiFetch - Has token: true
🔵 apiFetch - Response: 200
```

#### ❌ Erreurs Possibles

**1. Pas de token**
```javascript
🔵 apiFetch - Has token: false
🔴 apiFetch - Failed to fetch: ... 401 Unauthorized
```
→ **Solution**: Se connecter

**2. Erreur CORS**
```javascript
🔴 Access to fetch at '...' from origin 'http://localhost:4200' 
   has been blocked by CORS policy
```
→ **Solution**: Vérifier la configuration CORS du backend

**3. Erreur réseau**
```javascript
🔴 apiFetch - Failed to fetch: ... TypeError: Failed to fetch
```
→ **Solution**: Vérifier que le backend est accessible

**4. Erreur 401**
```javascript
🔵 apiFetch - Response: 401
⚠️ API request failed for /api/metrics: 401
```
→ **Solution**: Token expiré ou invalide, se reconnecter

### Onglet Network

1. Allez dans l'onglet **Network** (Réseau)
2. Rechargez la page
3. Filtrez par "Fetch/XHR"
4. Trouvez la requête vers `/api/metrics`

**Vérifiez** :
- **Request Headers** :
  - `Authorization: Bearer eyJ...` (présent ?)
  - `Content-Type: application/json`
- **Response** :
  - Status Code (200, 401, 404, 500 ?)
  - Response body

## 🔍 Étape 4 : Vérifications Approfondies

### 1. Vérifier le Fichier .env.local

```bash
cat .env.local | grep NEXT_PUBLIC_API_URL
```

**Attendu** :
```bash
NEXT_PUBLIC_API_URL=https://apirust-production.up.railway.app
```

**Si différent ou vide** :
```bash
# Créer/éditer .env.local
echo "NEXT_PUBLIC_API_URL=https://apirust-production.up.railway.app" >> .env.local
```

**Important**: Après modification, redémarrer le serveur Next.js :
```bash
# Arrêter (Ctrl+C) et relancer
npm run dev
```

### 2. Vérifier le Token dans localStorage

**Console du navigateur** :
```javascript
// Vérifier présence du token
localStorage.getItem('token')

// Afficher le token (attention, sensible!)
console.log(localStorage.getItem('token'))

// Effacer le token si problème
localStorage.removeItem('token')
```

### 3. Vérifier les Endpoints Backend

**Test direct avec curl** :
```bash
# Health check (pas d'auth)
curl https://apirust-production.up.railway.app/health

# Metrics avec token (remplacer YOUR_TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://apirust-production.up.railway.app/api/metrics
```

## 🛠️ Solutions par Scénario

### Scénario A : "Je ne suis pas connecté"

```bash
1. ✅ Vérifier que le backend répond:
   curl https://apirust-production.up.railway.app/health

2. ✅ Aller sur http://localhost:4200/landing

3. ✅ Cliquer sur un bouton de connexion (T4G, LinkedIn, Dazno)

4. ✅ Suivre le flux OAuth

5. ✅ Vérifier sur /debug-auth que Token présent = OUI
```

### Scénario B : "Je suis connecté mais le dashboard ne charge pas"

```bash
1. ✅ Ouvrir /debug-auth et cliquer "Tester Backend"

2. ✅ Si Backend Health = erreur:
   - Vérifier NEXT_PUBLIC_API_URL dans .env.local
   - Redémarrer le serveur Next.js
   
3. ✅ Si Test /api/metrics = 401:
   - Effacer le token sur /debug-auth
   - Se reconnecter
   
4. ✅ Si Test /api/metrics = 200:
   - Le problème est ailleurs
   - Vérifier la console pour d'autres erreurs
```

### Scénario C : "Erreur CORS"

**Le backend doit accepter l'origine du frontend.**

Vérifier dans `token4good-backend/src/lib.rs` :
```rust
let allowed_origins = vec![
    "http://localhost:4200".parse().unwrap(),  // ✅ Doit inclure votre port
    "http://localhost:3000".parse().unwrap(),
    // ...
];
```

**Si le port est différent** (ex: 3001), ajouter :
```rust
"http://localhost:3001".parse().unwrap(),
```

### Scénario D : "Le backend Railway est down"

**Vérifier le statut** :
```bash
curl https://apirust-production.up.railway.app/health
```

**Si pas de réponse** :
1. Aller sur Railway.app
2. Vérifier les logs du service `token4good-backend`
3. Redéployer si nécessaire

**Alternative temporaire** - Utiliser le backend local :
```bash
# Terminal 1 - Backend local
cd token4good-backend
cargo run

# Terminal 2 - Frontend avec backend local
cd apps/dapp
# Modifier .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
npm run dev
```

## 📋 Checklist de Diagnostic

Cochez au fur et à mesure :

- [ ] Backend Railway répond (`curl .../health`)
- [ ] `.env.local` contient `NEXT_PUBLIC_API_URL`
- [ ] Serveur Next.js redémarré après modif `.env.local`
- [ ] Page `/debug-auth` accessible
- [ ] Token présent = OUI
- [ ] Authentifié = OUI
- [ ] Backend Health = 200 OK
- [ ] Test /api/metrics = 200 OK
- [ ] Console navigateur : pas d'erreurs CORS
- [ ] Console navigateur : `🔵 apiFetch - Response: 200`

## 🎯 Résolution Rapide (TL;DR)

**Si vous n'êtes pas connecté** :
```bash
1. http://localhost:4200/landing → Se connecter
2. http://localhost:4200/debug-auth → Vérifier Token présent = OUI
3. http://localhost:4200/dashboard → Devrait fonctionner
```

**Si connecté mais erreurs** :
```bash
1. http://localhost:4200/debug-auth
2. Cliquer "Tester Backend"
3. Si 401 → "Effacer Token" → Se reconnecter
4. Si 200 → Vérifier console (F12) pour autres erreurs
```

## 🆘 Besoin d'Aide ?

Si après toutes ces étapes le problème persiste :

1. **Capture d'écran de** :
   - Page `/debug-auth` complète
   - Console du navigateur (F12 → Console)
   - Onglet Network montrant la requête `/api/metrics`

2. **Logs du backend** (si local) :
```bash
cd token4good-backend
cargo run 2>&1 | tee backend.log
```

3. **Informations système** :
```bash
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "Port frontend: $(lsof -ti:4200)"
```

## 📚 Documentation Associée

- [FIX_DASHBOARD_FETCH_ERRORS.md](./FIX_DASHBOARD_FETCH_ERRORS.md) - Détails techniques des corrections
- [QUICKSTART_OAUTH_2026.md](./QUICKSTART_OAUTH_2026.md) - Guide OAuth
- [START_BACKEND_LOCAL.md](./START_BACKEND_LOCAL.md) - Démarrage backend local
