# Configuration Développement - OAuth LinkedIn & T4G

## ✅ Corrections Appliquées (19 janvier 2026)

### Problèmes Résolus
1. ✅ **Boucle infinie dans `linkedin.tsx`** - Ajout de `useRef` pour éviter les appels multiples
2. ✅ **`handleOAuthCallback` non mémorisé** - Utilisation de `useCallback` dans `useOAuth.ts`
3. ✅ **State OAuth supprimé trop tôt** - Déplacement après succès complet du login
4. ✅ **Backend Rust sur Railway** - Configuration par défaut
5. ⚠️ **Variables d'environnement** - À configurer dans `.env.local`

## 🌐 Backend Par Défaut : Railway

**Le backend Rust est déjà configuré pour utiliser Railway** :
- URL de production : `https://apirust-production.up.railway.app`
- Pas besoin de démarrer un backend local pour développer
- Configuration dans `apps/dapp/services/apiClient.ts:12`

## 🔧 Configuration `.env.local` Requise

Créer/modifier le fichier `.env.local` à la racine du projet avec :

```bash
# ============= BACKEND RUST =============
# Par défaut : Railway (https://apirust-production.up.railway.app)
# Pour développement local, décommenter :
# NEXT_PUBLIC_API_URL=http://localhost:3000

# ============= LINKEDIN OAUTH =============
LINKEDIN_CLIENT_ID=votre_client_id_linkedin
LINKEDIN_CLIENT_SECRET=votre_client_secret_linkedin

# ============= T4G OAUTH =============
CLIENT_ID=votre_client_id_t4g
CLIENT_SECRET=votre_client_secret_t4g
AUTH_URL=https://auth.token4good.com
NEXT_PUBLIC_T4G_CLIENT_ID=votre_client_id_t4g
NEXT_PUBLIC_T4G_AUTH_URL=https://auth.token4good.com

# ============= DAZNO =============
NEXT_PUBLIC_DAZNO_VERIFY_URL=https://token-for-good.com/api/auth/verify-session

# ============= URLS =============
NEXT_PUBLIC_APP_URL=http://localhost:4200
NEXTAUTH_URL=http://localhost:4200

# ============= FRONTEND (Next.js) =============
# Port du serveur de dev Next.js
PORT=4200
```

## 🚀 Démarrage (Railway par Défaut)

### Option 1 : Utiliser Railway (Recommandé)

**Rien à faire !** Le backend Railway est déjà configuré.

Vérifier que Railway est accessible :
```bash
curl https://apirust-production.up.railway.app/health
```

### Option 2 : Développement Local (Optionnel)

Si vous voulez développer avec un backend local :

1. Décommenter dans `.env.local` :
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

2. Démarrer le backend Rust :
   ```bash
   cd token4good-backend
   cargo run
   ```

3. Vérifier l'accès local :
   ```bash
   curl http://localhost:8080/health
   ```

## 🧪 Test du Flow OAuth LinkedIn

1. **Démarrer le frontend Next.js** :
   ```bash
   npm run dev
   # ou
   nx serve dapp
   ```

2. **Tester l'authentification** :
   - Ouvrir http://localhost:4200/login
   - Cliquer sur "Se connecter avec LinkedIn"
   - Après redirection LinkedIn → callback devrait fonctionner **1 seule fois**
   - Pas de boucle infinie, pas d'erreurs 401

## 🔍 Debugging

### Vérifier les Logs Console

**Logs attendus (succès)** :
```
[OAuth Debug] Provider: linkedin, State reçu: abc123, State sauvegardé: abc123
✅ Redirection vers /dashboard
```

**Logs d'erreur (échec)** :
```
❌ POST https://apirust-production.up.railway.app/api/auth/login 500
   → Backend Railway indisponible ou erreur serveur

❌ POST http://localhost:4200/api/auth/callback/linkedin/ 401 (Unauthorized)
   → Code OAuth réutilisé (boucle corrigée maintenant)

❌ State reçu: abc123, State sauvegardé: null
   → State supprimé trop tôt (corrigé maintenant)
```

### Vérifier les Variables d'Environnement

Côté serveur (API routes Next.js) :
```typescript
console.log('LINKEDIN_CLIENT_SECRET:', process.env.LINKEDIN_CLIENT_SECRET ? '✓ Défini' : '✗ Manquant');
```

Côté client (browser) :
```javascript
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
```

## 📝 Changements de Code Appliqués

### 1. `apps/dapp/pages/auth/callback/linkedin.tsx`
- ✅ Ajout de `useRef` pour `hasProcessedRef`
- ✅ Vérification `hasProcessedRef.current` avant traitement
- ✅ Verrouillage immédiat après premier appel
- ✅ Suppression de `router` des dépendances `useEffect`

### 2. `apps/dapp/hooks/useOAuth.ts`
- ✅ Import de `useCallback` depuis React
- ✅ Mémorisation de `handleOAuthCallback` avec `useCallback`
- ✅ Déplacement de `sessionStorage.removeItem()` après succès complet
- ✅ Ajout de dépendances `[login, router]` au `useCallback`

## 🎯 Prochaines Étapes

1. ✅ **Configurer `.env.local`** avec les credentials OAuth
2. ✅ **Backend Railway déjà configuré** (par défaut)
3. ✅ **Tester le flow OAuth LinkedIn** sur Railway
4. ✅ **Callback t4g déjà corrigé** (même pattern que LinkedIn)
5. ⏳ **Ajouter tests E2E** pour valider les flows OAuth

## 🌐 URLs Backend

| Environnement | URL | Statut |
|---------------|-----|--------|
| **Production** | `https://apirust-production.up.railway.app` | ✅ Par défaut |
| **Local (dev)** | `http://localhost:8080` | ⚠️ Optionnel |

### Vérifier le Statut Railway

```bash
# Health check
curl https://apirust-production.up.railway.app/health

# Réponse attendue
{"status":"ok","database":true,"lightning":true,"rgb":true,"timestamp":"2026-01-19T..."}
```

## 📚 Références

- [Documentation OAuth LinkedIn](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Backend Rust Token4Good](./token4good-backend/README.md)
- [Architecture OAuth](./_SPECS/api-pour-t4g-daznode.md)
