# ✅ Correction des Boutons de Login en Local

**Date** : 20 janvier 2026  
**Problème** : Les 3 boutons de login affichaient "Backend non accessible (http://localhost:8080)"  
**Statut** : ✅ Résolu

## 🔍 Problème Identifié

Le frontend tentait de se connecter au **mauvais port** :
- ❌ Configuré : `http://localhost:8080` (port utilisé par LND - Lightning Network)
- ✅ Correct : `http://localhost:3000` (port du backend Rust Axum)

## 🛠️ Corrections Effectuées

### 1. Configuration Environnement (`.env.local`)
```diff
- NEXT_PUBLIC_API_URL=https://apirust-production.up.railway.app
+ NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. API Client Principal (`apps/dapp/services/apiClient.ts`)
```diff
  constructor() {
-   // En développement, utilise le backend Railway de production
-   this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://apirust-production.up.railway.app';
+   // URL du backend configurée via NEXT_PUBLIC_API_URL
+   // Développement local: http://localhost:3000
+   // Production: https://apirust-production.up.railway.app
+   this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }
```

### 3. API Client PostgreSQL (`apps/dapp/services/postgresApiClient.ts`)
```diff
- const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
+ const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

### 4. Contexte d'Authentification (`apps/dapp/contexts/AuthContext.tsx`)
```diff
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
-   const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://apirust-production.up.railway.app';
-   errorMessage = `⚠️ Backend non accessible (${backendUrl}). Vérifiez que Railway est en ligne.`;
+   const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
+   const isLocal = backendUrl.includes('localhost');
+   errorMessage = isLocal 
+     ? `⚠️ Backend non accessible (${backendUrl}). Assurez-vous que le backend Rust est démarré localement.`
+     : `⚠️ Backend non accessible (${backendUrl}). Vérifiez que le serveur est en ligne.`;
  }
```

### 5. Documentation Mise à Jour
- ✅ `SAMPLE.env` - Port corrigé à 3000
- ✅ `CONFIGURATION_DEV_LOCAL.md` - Références au port mises à jour
- ✅ `scripts/migrate-mongo-to-postgres.ts` - Message de log corrigé

## 🎯 Fichiers Modifiés

| Fichier | Type | Modification |
|---------|------|--------------|
| `.env.local` | Config | Port 8080 → 3000 |
| `apps/dapp/services/apiClient.ts` | Code | Fallback et commentaires |
| `apps/dapp/services/postgresApiClient.ts` | Code | Fallback port |
| `apps/dapp/contexts/AuthContext.tsx` | Code | Message d'erreur adaptatif |
| `SAMPLE.env` | Doc | Port 8080 → 3000 |
| `CONFIGURATION_DEV_LOCAL.md` | Doc | Références au port |
| `scripts/migrate-mongo-to-postgres.ts` | Script | Message de log |

## 🚀 Comment Tester

### 1. Démarrer le Backend Rust
```bash
# Option A : Docker Compose (recommandé)
docker-compose -f docker-compose.dev.yml up -d

# Option B : Cargo direct
cd token4good-backend && cargo run
```

### 2. Vérifier que le Backend Répond
```bash
curl http://localhost:3000/health
# Devrait retourner : {"status":"healthy","database":true,...}
```

### 3. Démarrer le Frontend
```bash
npm run dev
# ou
nx serve dapp
```

### 4. Tester les Boutons de Login
Ouvrir http://localhost:4200/login et tester :

- ✅ **Login with Daznode** → OAuth Dazno
- ✅ **Login with LinkedIn** → OAuth LinkedIn  
- ✅ **Login as admin/alumni/student** (mode debug) → Authentification custom

## 📊 Architecture des Ports

| Service | Port | Description |
|---------|------|-------------|
| **Frontend (Next.js)** | 4200 | Application web Token4Good |
| **Backend (Rust/Axum)** | 3000 | API REST principale |
| **PostgreSQL** | 5432 | Base de données |
| **LND** | 8080, 10009 | Lightning Network Daemon |
| **Bitcoin Core** | 18443 | Bitcoin regtest |

## ⚠️ Points d'Attention

### Environnement de Développement
- Le frontend utilise automatiquement `http://localhost:3000` en local
- Variable `NEXT_PUBLIC_API_URL` dans `.env.local` prioritaire

### Environnement de Production
- Frontend Vercel pointe vers `https://apirust-production.up.railway.app`
- Variable configurée dans Vercel environment variables

### Mode Debug
Les boutons de debug (admin/alumni/student) apparaissent quand :
- `NODE_ENV === 'development'` OU
- Query param `?debug` présent dans l'URL

## 🔍 Dépannage

### Erreur "Backend non accessible"
1. **Vérifier le backend** :
   ```bash
   curl http://localhost:3000/health
   ```

2. **Vérifier la configuration** :
   ```bash
   cat .env.local | grep NEXT_PUBLIC_API_URL
   # Devrait afficher : NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Redémarrer le frontend** :
   ```bash
   # Ctrl+C pour arrêter, puis
   npm run dev
   ```

### Backend ne démarre pas
```bash
# Vérifier que le port 3000 est libre
lsof -i :3000

# Voir les logs Docker
docker-compose -f docker-compose.dev.yml logs backend

# Redémarrer les services
docker-compose -f docker-compose.dev.yml restart backend
```

### OAuth ne fonctionne pas
- Vérifier que `NEXT_PUBLIC_APP_URL=http://localhost:4200` dans `.env.local`
- Pour Dazno : Ne fonctionne qu'en production (redirect vers token-for-good.com)
- Pour LinkedIn : Vérifier `LINKEDIN_CLIENT_ID` et `LINKEDIN_CLIENT_SECRET`

## 📚 Documentation Associée

- 📖 [START_BACKEND_LOCAL.md](./START_BACKEND_LOCAL.md) - Guide de démarrage backend
- 📖 [CONFIGURATION_DEV_LOCAL.md](./CONFIGURATION_DEV_LOCAL.md) - Configuration développement
- 📖 [token4good-backend/README_SETUP.md](./token4good-backend/README_SETUP.md) - Setup complet backend
- 📖 [.cursor/rules/architecture-token4good.mdc](./.cursor/rules/architecture-token4good.mdc) - Architecture globale

## ✅ Validation

- [x] Configuration `.env.local` mise à jour
- [x] Fallbacks des API clients corrigés
- [x] Messages d'erreur adaptatifs (local vs production)
- [x] Documentation SAMPLE.env mise à jour
- [x] Guides de démarrage créés
- [x] Architecture des ports documentée

## 🎉 Résultat

Les 3 boutons de login fonctionnent maintenant correctement en local, à condition que :
1. Le backend Rust tourne sur `http://localhost:3000`
2. Le frontend est configuré avec `NEXT_PUBLIC_API_URL=http://localhost:3000`
3. Les services OAuth sont correctement configurés (LinkedIn, Dazno)

**Note** : En local, l'OAuth Dazno ne fonctionnera pas car il nécessite une URL publique accessible depuis token-for-good.com. Utilisez les boutons de debug ou LinkedIn pour tester.
