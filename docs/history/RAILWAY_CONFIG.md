# Configuration Backend Railway - Token4Good

## ✅ Statut Backend Railway

**URL Production** : `https://apirust-production.up.railway.app`

**Dernière vérification** : 19 janvier 2026 à 18:05 CET

```json
{
  "status": "ok",
  "timestamp": "2026-01-19T17:05:21Z",
  "version": "0.1.0",
  "services": {
    "database": { "status": "ok" },
    "rgb": { "status": "ok" },
    "dazno": { "status": "ok" }
  }
}
```

## 🔧 Configuration Automatique

Le backend Railway est **déjà configuré par défaut** dans le code :

### `apps/dapp/services/apiClient.ts` (ligne 12)

```typescript
constructor() {
  // En développement, utilise le backend Railway de production
  this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://apirust-production.up.railway.app';
}
```

**Résultat** :
- ✅ Pas besoin de démarrer un backend local
- ✅ Pas de configuration `.env.local` requise pour l'URL backend
- ✅ Fonctionne immédiatement après `npm run dev`

## 🌐 Endpoints Disponibles

| Endpoint | Description | Auth Requise |
|----------|-------------|--------------|
| `GET /health` | Health check | Non |
| `POST /api/auth/login` | Authentification | Non |
| `POST /api/auth/refresh` | Refresh token | Oui |
| `GET /api/users/me` | Profil utilisateur | Oui |
| `GET /api/users/:id` | Utilisateur par ID | Oui |
| `POST /api/users` | Créer un utilisateur | Admin |
| `GET /api/lightning/node/info` | Info nœud Lightning | Oui |
| `POST /api/lightning/invoice` | Créer une facture | Oui |

## 🧪 Tests de Connectivité

### Test 1 : Health Check

```bash
curl https://apirust-production.up.railway.app/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "services": {
    "database": { "status": "ok" },
    "rgb": { "status": "ok" },
    "dazno": { "status": "ok" }
  }
}
```

### Test 2 : Depuis le Frontend

```javascript
// Console navigateur
fetch('https://apirust-production.up.railway.app/health')
  .then(r => r.json())
  .then(console.log)
```

### Test 3 : Login OAuth

```bash
curl -X POST https://apirust-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "provider": "linkedin",
    "provider_user_data": {
      "email": "test@example.com",
      "name": "Test User"
    }
  }'
```

## 🔒 Authentification

### Flow OAuth LinkedIn

1. **Frontend** : Redirection vers LinkedIn
   ```typescript
   const authUrl = `https://www.linkedin.com/oauth/v2/authorization?...`;
   window.location.href = authUrl;
   ```

2. **Callback LinkedIn** : Échange du code
   ```typescript
   // apps/dapp/pages/api/auth/callback/linkedin.ts
   const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
     method: 'POST',
     body: { code, client_id, client_secret, ... }
   });
   ```

3. **Login Backend Railway** : Création session JWT
   ```typescript
   // useOAuth.ts
   await login('linkedin', {
     providerUserData: { email, name, ... }
   });
   // → POST https://apirust-production.up.railway.app/api/auth/login
   ```

4. **Token JWT** : Stocké dans `localStorage`
   ```typescript
   localStorage.setItem('token', response.token);
   ```

5. **Requêtes Authentifiées** : Header Authorization
   ```typescript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

## 🐛 Debugging

### Vérifier l'URL Backend Utilisée

**Console navigateur** :
```javascript
console.log('Backend URL:', process.env.NEXT_PUBLIC_API_URL || 'https://apirust-production.up.railway.app');
```

### Vérifier le Token JWT

**Console navigateur** :
```javascript
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('JWT payload:', payload);
  console.log('Expires:', new Date(payload.exp * 1000));
}
```

### Logs Backend (Railway Dashboard)

1. Aller sur https://railway.app
2. Sélectionner le projet `token4good-backend`
3. Onglet "Deployments" → "View Logs"

## ⚠️ Développement Local (Optionnel)

Si vous souhaitez développer avec un backend local :

### 1. Créer `.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 2. Démarrer le Backend

```bash
cd token4good-backend
cargo run
```

### 3. Vérifier

```bash
curl http://localhost:8080/health
```

### 4. Revenir à Railway

Supprimer la ligne dans `.env.local` ou commenter :
```bash
# NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 📊 Métriques

### Temps de Réponse

| Endpoint | Temps moyen |
|----------|-------------|
| `/health` | ~100ms |
| `/api/auth/login` | ~200-300ms |
| `/api/users/me` | ~150ms |
| `/api/lightning/*` | ~200-500ms |

### Disponibilité

- **Uptime** : 99.9% (Railway SLA)
- **Région** : Europe (Francfort)
- **Auto-scaling** : Activé

## 🔗 Liens Utiles

- **Dashboard Railway** : https://railway.app/project/token4good-backend
- **Logs en temps réel** : Railway Dashboard → Deployments → View Logs
- **Variables d'environnement** : Railway Dashboard → Variables
- **Documentation API** : [_SPECS/api-pour-t4g-daznode.md](./SPECS/api-pour-t4g-daznode.md)

## 🎯 Checklist Déploiement

- [x] Backend Rust déployé sur Railway
- [x] Health check accessible publiquement
- [x] Base de données PostgreSQL connectée
- [x] Service RGB fonctionnel
- [x] Service Dazno intégré
- [x] Frontend configuré pour Railway par défaut
- [x] OAuth LinkedIn fonctionnel
- [x] OAuth t4g fonctionnel
- [ ] Tests E2E validés
- [ ] Monitoring en place

## 🚀 Quick Start

```bash
# 1. Cloner le projet
git clone <repo>
cd T4G

# 2. Installer les dépendances
npm install

# 3. Configurer OAuth (si pas déjà fait)
# Créer .env.local avec LINKEDIN_CLIENT_ID, etc.

# 4. Démarrer le frontend
npm run dev

# 5. Tester
# Ouvrir http://localhost:4200
# Cliquer "Se connecter avec LinkedIn"
# ✅ Le backend Railway gère tout automatiquement
```

**C'est tout !** Aucun backend local à démarrer. 🎉
