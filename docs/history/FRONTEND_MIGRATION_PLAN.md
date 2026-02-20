# 🔄 Plan de Migration Frontend - Next.js API Routes → Backend Rust

**Date**: 16 février 2026  
**Version**: 2.0.0  
**Objectif**: Migrer 52 routes API Next.js vers le backend Rust pour performance et cohérence

---

## 🎯 Contexte

Le frontend Next.js contient actuellement des routes API (`pages/api/*`) qui devraient être migrées vers le backend Rust pour :
- **Performance** : Backend Rust ~10x plus rapide
- **Cohérence** : Une seule API centralisée
- **Maintenance** : Code backend unifié
- **Scaling** : Backend Railway scalable indépendamment

---

## 📊 État Actuel

### Routes Next.js à Migrer

```bash
apps/dapp/pages/api/
├── auth/
│   ├── callback/
│   │   ├── linkedin.ts         # ✅ Déjà migré (hooks OAuth frontend)
│   │   ├── t4g.ts             # ✅ Déjà migré
│   │   └── dazno.ts           # ✅ Déjà migré
│   ├── login.ts               # ⚠️ À migrer
│   ├── logout.ts              # ⚠️ À migrer
│   └── refresh.ts             # ⚠️ À migrer
├── users/
│   ├── [id].ts                # ⚠️ À migrer
│   ├── me.ts                  # ✅ Backend: /api/users/me
│   ├── profile.ts             # ⚠️ À migrer
│   └── wallet.ts              # ✅ Backend: /api/users/me/wallet
├── mentoring/
│   ├── requests.ts            # ✅ Backend: /api/mentoring/requests
│   ├── sessions.ts            # ⚠️ À migrer
│   └── feedback.ts            # ⚠️ À migrer
├── marketplace/
│   ├── services.ts            # ✅ Backend: /api/token4good/marketplace/services
│   ├── bookings.ts            # ✅ Backend: /api/token4good/marketplace/book
│   └── search.ts              # ✅ Backend: /api/token4good/marketplace/search
├── lightning/
│   ├── invoice.ts             # ✅ Backend: /api/token4good/lightning/invoice/create
│   ├── payment.ts             # ✅ Backend: /api/token4good/lightning/invoice/pay
│   └── balance.ts             # ✅ Backend: /api/token4good/lightning/balance
└── admin/
    ├── users.ts               # ✅ Backend: /api/admin/users
    ├── metrics.ts             # ✅ Backend: /api/metrics
    └── system.ts              # ⚠️ À migrer
```

**Estimation** :
- ✅ **Déjà migrés** : ~35 routes (67%)
- ⚠️ **À migrer** : ~17 routes (33%)

---

## 🔄 Stratégie de Migration

### Phase 1 : Routes Authentification (Priorité HAUTE)

**Routes à migrer** :
1. `/api/auth/login` → Backend Rust `/api/auth/login`
2. `/api/auth/logout` → Backend Rust `/api/auth/logout`
3. `/api/auth/refresh` → Backend Rust `/api/auth/refresh`

**Effort** : 4 heures  
**Impact** : Critique - Authentification centralisée

---

### Phase 2 : Routes Utilisateurs (Priorité HAUTE)

**Routes à migrer** :
1. `/api/users/[id]` → Backend `/api/users/:id`
2. `/api/users/profile` → Backend `/api/users/me/profile`

**Effort** : 2 heures  
**Impact** : Important - Gestion utilisateurs

---

### Phase 3 : Routes Mentoring (Priorité MOYENNE)

**Routes à migrer** :
1. `/api/mentoring/sessions` → Backend `/api/mentoring/sessions`
2. `/api/mentoring/feedback` → Backend `/api/mentoring/feedback`

**Effort** : 3 heures  
**Impact** : Moyen - Fonctionnalité clé

---

### Phase 4 : Routes Admin (Priorité BASSE)

**Routes à migrer** :
1. `/api/admin/system` → Backend `/api/admin/system`

**Effort** : 2 heures  
**Impact** : Faible - Usage interne

---

## 🛠️ Procédure de Migration (Template)

### Pour Chaque Route

#### 1. Identifier la Route Next.js

```typescript
// apps/dapp/pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Logique actuelle...
}
```

#### 2. Créer l'Endpoint Backend Rust

```rust
// token4good-backend/src/routes/auth.rs

#[post("/login")]
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, StatusCode> {
    // Migrer la logique ici
}
```

#### 3. Mettre à Jour le Frontend

```typescript
// apps/dapp/services/apiClient.ts

// Avant:
const login = async (credentials) => {
  return fetch('/api/auth/login', { ... })
}

// Après:
const login = async (credentials) => {
  return fetch(`${API_URL}/api/auth/login`, { ... })
}
```

#### 4. Tester

```bash
# Test backend
curl -X POST https://apirust-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Test frontend
npm run dev
# Tester le flow complet dans l'UI
```

#### 5. Déployer

```bash
# Backend
git add token4good-backend/
git commit -m "feat: migrate /api/auth/login to backend"
git push origin main

# Frontend
git add apps/dapp/
git commit -m "feat: update login to use backend API"
git push origin main
```

#### 6. Supprimer l'Ancienne Route

```bash
# Après validation en production
git rm apps/dapp/pages/api/auth/login.ts
git commit -m "chore: remove deprecated Next.js API route /api/auth/login"
git push origin main
```

---

## 📝 Script de Migration Automatique

```bash
#!/bin/bash
# scripts/migrate-api-route.sh

API_ROUTE=$1  # Ex: auth/login
BACKEND_DIR="token4good-backend/src/routes"
FRONTEND_DIR="apps/dapp/pages/api"

if [ -z "$API_ROUTE" ]; then
  echo "Usage: ./scripts/migrate-api-route.sh <route>"
  echo "Example: ./scripts/migrate-api-route.sh auth/login"
  exit 1
fi

echo "🔄 Migrating API route: $API_ROUTE"

# 1. Vérifier que la route Next.js existe
NEXTJS_FILE="$FRONTEND_DIR/$API_ROUTE.ts"
if [ ! -f "$NEXTJS_FILE" ]; then
  echo "❌ Next.js route not found: $NEXTJS_FILE"
  exit 1
fi

echo "✅ Found Next.js route: $NEXTJS_FILE"

# 2. Extraire le module backend (première partie du chemin)
MODULE=$(echo $API_ROUTE | cut -d'/' -f1)
BACKEND_FILE="$BACKEND_DIR/$MODULE.rs"

echo "📝 Backend module: $BACKEND_FILE"

# 3. Afficher un template pour le backend
cat <<EOF

📋 Backend Template (add to $BACKEND_FILE):

#[post("/$API_ROUTE")]
pub async fn handler_name(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<RequestPayload>,
) -> Result<Json<ResponseData>, StatusCode> {
    // TODO: Migrate logic from $NEXTJS_FILE
    todo!()
}

EOF

# 4. Proposer la mise à jour du frontend
cat <<EOF

📋 Frontend Update (in apps/dapp/services/apiClient.ts):

// Change:
fetch('/api/$API_ROUTE', ...)

// To:
fetch(\`\${config.apiUrl}/api/$API_ROUTE\`, ...)

EOF

echo "✅ Migration plan ready!"
echo "👉 Next steps:"
echo "   1. Implement backend handler in $BACKEND_FILE"
echo "   2. Update frontend API calls"
echo "   3. Test locally"
echo "   4. Deploy and validate"
echo "   5. Remove old Next.js route: git rm $NEXTJS_FILE"
```

**Usage** :

```bash
chmod +x scripts/migrate-api-route.sh
./scripts/migrate-api-route.sh auth/login
```

---

## 🧪 Checklist de Migration

### Pour Chaque Route

- [ ] Route identifiée et analysée
- [ ] Endpoint backend créé
- [ ] Logique migrée et testée
- [ ] Frontend mis à jour
- [ ] Tests locaux passent
- [ ] Déployé en production
- [ ] Tests production OK
- [ ] Monitoring 24h (pas d'erreurs)
- [ ] Ancienne route Next.js supprimée
- [ ] Documentation mise à jour

---

## 📊 Tracking des Migrations

### Routes Auth (4/7 routes) - 57%

| Route | Status | Backend Endpoint | Notes |
|-------|--------|------------------|-------|
| `/api/auth/callback/linkedin` | ✅ Complété | Frontend hook | OAuth callback |
| `/api/auth/callback/t4g` | ✅ Complété | Frontend hook | OAuth callback |
| `/api/auth/callback/dazno` | ✅ Complété | Frontend hook | OAuth callback |
| `/api/auth/login` | ⚠️ À migrer | `/api/auth/login` | Phase 1 |
| `/api/auth/logout` | ⚠️ À migrer | `/api/auth/logout` | Phase 1 |
| `/api/auth/refresh` | ⚠️ À migrer | `/api/auth/refresh` | Phase 1 |
| `/api/auth/verify` | ✅ Complété | `/api/auth/verify` | - |

### Routes Users (6/8 routes) - 75%

| Route | Status | Backend Endpoint | Notes |
|-------|--------|------------------|-------|
| `/api/users/me` | ✅ Complété | `/api/users/me` | - |
| `/api/users/me/wallet` | ✅ Complété | `/api/users/me/wallet` | - |
| `/api/users/me/transactions` | ✅ Complété | `/api/users/me/transactions` | - |
| `/api/users/me/profile` | ✅ Complété | `/api/users/me/profile` | - |
| `/api/users/me/cv` | ✅ Complété | `/api/users/me/cv` | - |
| `/api/users/me/metrics` | ✅ Complété | `/api/users/me/metrics` | - |
| `/api/users/[id]` | ⚠️ À migrer | `/api/users/:id` | Phase 2 |
| `/api/users/profile` | ⚠️ À migrer | `/api/users/me/profile` | Doublon? |

### Routes Mentoring (5/8 routes) - 62%

| Route | Status | Backend Endpoint | Notes |
|-------|--------|------------------|-------|
| `/api/mentoring/requests` | ✅ Complété | `/api/mentoring/requests` | - |
| `/api/mentoring/requests/[id]` | ✅ Complété | `/api/mentoring/requests/:id` | - |
| `/api/mentoring/requests/[id]/assign` | ✅ Complété | `/api/mentoring/requests/:id/assign` | - |
| `/api/mentoring/requests/[id]/complete` | ✅ Complété | `/api/mentoring/requests/:id/complete` | - |
| `/api/mentoring/requests/stats` | ✅ Complété | `/api/mentoring/stats` | - |
| `/api/mentoring/sessions` | ⚠️ À migrer | `/api/mentoring/sessions` | Phase 3 |
| `/api/mentoring/sessions/[id]` | ⚠️ À migrer | `/api/mentoring/sessions/:id` | Phase 3 |
| `/api/mentoring/feedback` | ⚠️ À migrer | `/api/mentoring/feedback` | Phase 3 |

### Routes Marketplace (10/10 routes) - 100% ✅

| Route | Status | Backend Endpoint | Notes |
|-------|--------|------------------|-------|
| `/api/marketplace/services` | ✅ Complété | `/api/token4good/marketplace/services` | - |
| `/api/marketplace/services/[id]` | ✅ Complété | `/api/token4good/marketplace/services/:id` | - |
| `/api/marketplace/search` | ✅ Complété | `/api/token4good/marketplace/search` | - |
| `/api/marketplace/book` | ✅ Complété | `/api/token4good/marketplace/book` | - |
| `/api/marketplace/bookings` | ✅ Complété | `/api/token4good/marketplace/bookings` | - |
| `/api/marketplace/bookings/[id]` | ✅ Complété | `/api/token4good/marketplace/bookings/:id` | - |
| `/api/marketplace/bookings/[id]/complete` | ✅ Complété | `/api/token4good/marketplace/bookings/:id/complete` | - |
| `/api/marketplace/recommendations` | ✅ Complété | `/api/token4good/marketplace/recommendations/:user_id` | - |
| `/api/marketplace/stats` | ✅ Complété | `/api/token4good/marketplace/stats` | - |
| `/api/marketplace/categories` | ✅ Complété | `/api/token4good/marketplace/categories` | - |

### Routes Lightning (10/10 routes) - 100% ✅

| Route | Status | Backend Endpoint | Notes |
|-------|--------|------------------|-------|
| `/api/lightning/invoice/create` | ✅ Complété | `/api/token4good/lightning/invoice/create` | - |
| `/api/lightning/invoice/pay` | ✅ Complété | `/api/token4good/lightning/invoice/pay` | - |
| `/api/lightning/invoice/check` | ✅ Complété | `/api/token4good/lightning/invoice/check/:hash` | - |
| `/api/lightning/balance` | ✅ Complété | `/api/token4good/lightning/balance` | - |
| `/api/lightning/node/info` | ✅ Complété | `/api/token4good/lightning/node/info` | - |
| `/api/lightning/channels` | ✅ Complété | `/api/token4good/lightning/channels` | - |
| `/api/lightning/status` | ✅ Complété | `/api/token4good/lightning/status` | - |
| `/api/lightning/transactions` | ✅ Complété | `/api/token4good/transactions` | - |
| `/api/lightning/payment/[hash]` | ✅ Complété | `/api/token4good/lightning/invoice/check/:hash` | Alias |
| `/api/lightning/history` | ✅ Complété | `/api/token4good/transactions` | Alias |

### Routes Admin (6/7 routes) - 86%

| Route | Status | Backend Endpoint | Notes |
|-------|--------|------------------|-------|
| `/api/admin/users` | ✅ Complété | `/api/admin/users` | - |
| `/api/admin/users/[id]` | ✅ Complété | `/api/admin/users/:id` | - |
| `/api/admin/metrics` | ✅ Complété | `/api/metrics` | - |
| `/api/admin/services` | ✅ Complété | `/api/admin/services` | - |
| `/api/admin/rewards` | ✅ Complété | `/api/admin/rewards/weekly-bonuses` | - |
| `/api/admin/system` | ⚠️ À migrer | `/api/admin/system` | Phase 4 |
| `/api/admin/stats` | ✅ Complété | `/api/token4good/system/status` | - |

---

## 📈 Résumé Global

**Total routes** : ~52 routes  
**✅ Migrées** : ~35 routes (67%)  
**⚠️ À migrer** : ~17 routes (33%)

**Effort total estimé** : 2-3 jours de développement

---

## 🚀 Plan d'Exécution Recommandé

### Semaine 1 : Phase 1 + Phase 2
- Lundi-Mardi : Routes Auth (3 routes)
- Mercredi-Jeudi : Routes Users (2 routes)
- Vendredi : Tests et validation

### Semaine 2 : Phase 3 + Phase 4
- Lundi-Mardi : Routes Mentoring (3 routes)
- Mercredi : Routes Admin (1 route)
- Jeudi-Vendredi : Tests complets et nettoyage

**Go-Live** : Fin semaine 2 (toutes les routes migrées)

---

## ✅ Avantages Post-Migration

1. **Performance** : Backend Rust 10x plus rapide que Next.js API
2. **Cohérence** : Une seule source de vérité pour l'API
3. **Maintenance** : Code backend unifié en Rust
4. **Scaling** : Backend Railway scale indépendamment
5. **Sécurité** : Logique métier côté backend uniquement
6. **Monitoring** : Centralisation des logs et métriques

---

**Créé le**: 16 février 2026  
**Version**: 2.0.0  
**Status**: 📋 Plan Prêt - Migration en cours (67% complété)
