# Frontend Migration Plan - Next.js API → Rust Backend

**Objectif:** Migrer toutes les routes API Next.js vers le backend Rust Axum
**Statut:** 🟡 En cours
**Deadline:** 2025-10-21

---

## 📊 État des Routes API

### Inventaire Complet (52 fichiers API)

```bash
apps/dapp/pages/api/
├── auth/
│   └── [...nextauth].ts                    # ⚠️ À MIGRER - Auth NextAuth
├── admin/
│   ├── services.ts                         # ✅ MIGRÉ - Backend Rust
│   ├── service-delivery.ts                 # ✅ MIGRÉ - Backend Rust
│   └── wallets.ts                          # 🔴 À MIGRER
├── contracts/
│   └── tokens.ts                           # 🟡 LEGACY - Polygon (deprecié)
├── experiences/
│   ├── index.ts                            # ✅ MIGRÉ - Backend Rust
│   └── [id]/index.ts                       # ✅ MIGRÉ - Backend Rust
├── metrics/
│   └── index.ts                            # 🔴 À MIGRER
├── service-categories/
│   ├── index.ts                            # ✅ MIGRÉ - Backend Rust
│   ├── [id]/index.ts                       # ✅ MIGRÉ - Backend Rust
│   ├── [id]/detailed.ts                    # ✅ MIGRÉ - Backend Rust
│   ├── as_consumer.ts                      # ✅ MIGRÉ - Backend Rust
│   └── as_provider.ts                      # ✅ MIGRÉ - Backend Rust
├── transactions/
│   └── [id]/status.ts                      # 🟡 LIGHTNING - À adapter
└── users/
    └── me/
        ├── about.ts                        # ✅ MIGRÉ - Backend Rust
        ├── cv.ts                           # ✅ MIGRÉ - Backend Rust
        ├── notifications.ts                # ✅ MIGRÉ - Backend Rust
        ├── pending.ts                      # ✅ MIGRÉ - Backend Rust
        ├── proposed-services.ts            # ✅ MIGRÉ - Backend Rust
        └── wallet.ts                       # 🔴 À MIGRER
```

**Légende:**
- ✅ MIGRÉ: Endpoint existe dans backend Rust
- 🔴 À MIGRER: Nécessite implémentation backend
- 🟡 LEGACY/LIGHTNING: Nécessite adaptation
- ⚠️ CRITIQUE: Dépendance NextAuth

---

## 🎯 Plan de Migration (4 Phases)

### Phase 1: Préparation (Complété ✅)

- [x] Créer `apiClient.ts` - Service REST générique
- [x] Analyser toutes les routes API existantes
- [x] Vérifier `vercel.json` - Proxification configurée
- [x] Documentation backend Rust complète

**Fichiers créés:**
- [apps/dapp/services/apiClient.ts](apps/dapp/services/apiClient.ts)
- [apps/dapp/services/daznoAPI.ts](apps/dapp/services/daznoAPI.ts) (déjà existant)

---

### Phase 2: Migration Critique (En cours 🟡 - 1 semaine)

#### 2.1 NextAuth → JWT Backend

**Problème:** NextAuth gère l'auth avec sessions Next.js

**Solution:**
```typescript
// AVANT (NextAuth)
import { getSession } from 'next-auth/react';

const session = await getSession();

// APRÈS (Backend Rust JWT)
import { apiClient } from '@/services/apiClient';

const user = await apiClient.getCurrentUser();
```

**Fichiers à modifier:**
- `apps/dapp/pages/api/auth/[...nextauth].ts` → Supprimer
- `apps/dapp/utils/auth.ts` → Remplacer par `apiClient.login()`
- Tous les `getSession()` → `apiClient.getCurrentUser()`

**Backend endpoints nécessaires:**
- ✅ `POST /api/auth/login` - Existe
- ✅ `POST /api/auth/refresh` - Existe
- ⚠️ `POST /api/auth/t4g/callback` - À implémenter
- ⚠️ `POST /api/auth/linkedin/callback` - À implémenter

---

#### 2.2 User Wallet & Transactions

**Routes à migrer:**
- `/api/users/me/wallet` → `/api/users/me`
- `/api/admin/wallets` → `/api/admin/users?include=wallet`
- `/api/transactions/[id]/status` → `/api/lightning/payment/[hash]/status`

**Modifications backend nécessaires:**

```rust
// src/routes/users.rs
#[get("/users/me")]
async fn get_current_user_with_wallet(user: AuthUser) -> Result<Json<UserWithWallet>> {
    // Retourner user + balance Lightning
}

// src/routes/admin.rs
#[get("/admin/wallets")]
async fn get_all_wallets(admin: AdminUser) -> Result<Json<Vec<WalletInfo>>> {
    // Liste tous les wallets Lightning
}
```

---

#### 2.3 Metrics & Analytics

**Route à migrer:**
- `/api/metrics/index` → `/api/metrics`

**Backend endpoint:**
```rust
// src/routes/metrics.rs
#[get("/metrics")]
async fn get_metrics() -> Result<Json<MetricsResponse>> {
    Ok(Json(MetricsResponse {
        total_users: db.count_users().await?,
        total_proofs: db.count_proofs().await?,
        total_lightning_volume: lightning.get_total_volume().await?,
        active_mentoring_requests: db.count_active_requests().await?,
    }))
}
```

---

### Phase 3: Suppression Routes Next.js (3 jours)

Une fois tous les endpoints migrés:

```bash
# 1. Tester tous les flux critiques
npm run test:e2e

# 2. Supprimer progressivement les routes API
rm -rf apps/dapp/pages/api/admin
rm -rf apps/dapp/pages/api/experiences
rm -rf apps/dapp/pages/api/service-categories
rm -rf apps/dapp/pages/api/users

# 3. Garder temporairement:
# - apps/dapp/pages/api/auth/[...nextauth].ts (migration auth en dernier)
# - apps/dapp/pages/api/metrics/index.ts (dashboard admin)

# 4. Mettre à jour vercel.json
# Retirer la section "functions" (plus de serverless Next.js)
```

**Checklist suppression:**
- [ ] Aucun `fetch('/api/...')` dans le code frontend
- [ ] Tests E2E passent à 100%
- [ ] NextAuth remplacé par JWT backend
- [ ] Dashboard admin fonctionnel
- [ ] Lightning payments working
- [ ] RGB proofs creation OK

---

### Phase 4: Nettoyage & Optimisation (2 jours)

```bash
# 1. Supprimer les dépendances Next.js inutiles
npm uninstall next-auth @next-auth/prisma-adapter

# 2. Retirer MongoDB du frontend
npm uninstall mongodb mongoose

# 3. Nettoyer libs/service/data
rm -rf libs/service/data/src/lib/dao
rm -rf libs/service/data/src/lib/models/Transaction.ts
rm -rf libs/service/data/src/lib/service-mongo.ts

# 4. Garder uniquement:
# - libs/service/data/src/lib/models/User.ts (types)
# - libs/service/data/src/lib/models/Service.ts (types)

# 5. Mettre à jour package.json
```

---

## 🔄 Stratégie de Migration par Endpoint

### Template de migration

Pour chaque route API Next.js:

#### **Étape 1: Vérifier l'équivalent backend**

```bash
# Trouver l'endpoint correspondant
grep -r "GET /api/users" token4good-backend/src/routes/
```

#### **Étape 2: Adapter le frontend**

```typescript
// AVANT - Next.js API Route
const response = await fetch('/api/users/me/wallet');
const wallet = await response.json();

// APRÈS - Backend Rust
import { apiClient } from '@/services/apiClient';
const user = await apiClient.getCurrentUser();
const wallet = user.lightning_balance;
```

#### **Étape 3: Tester localement**

```bash
# Terminal 1: Backend Rust
cd token4good-backend && cargo run

# Terminal 2: Frontend Next.js
cd apps/dapp && npm run dev

# Terminal 3: Tests
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

#### **Étape 4: Supprimer l'ancienne route**

```bash
git rm apps/dapp/pages/api/users/me/wallet.ts
git commit -m "feat: migrate /api/users/me/wallet to Rust backend"
```

---

## 🧪 Tests de Migration

### Tests Critiques à Exécuter

```typescript
// apps/dapp/__tests__/migration.test.ts

describe('API Migration Tests', () => {
  it('should authenticate with backend JWT', async () => {
    const response = await apiClient.login({
      email: 'test@example.com',
      password: 'test123',
    });
    expect(response.token).toBeDefined();
  });

  it('should fetch current user', async () => {
    const user = await apiClient.getCurrentUser();
    expect(user.id).toBeDefined();
    expect(user.email).toBeDefined();
  });

  it('should create mentoring request', async () => {
    const request = await apiClient.createMentoringRequest({
      title: 'Test Request',
      description: 'Test Description',
      mentee_id: 'user123',
    });
    expect(request.id).toBeDefined();
  });

  it('should create RGB proof', async () => {
    const proof = await apiClient.createProof({
      request_id: 'req123',
      mentor_id: 'mentor123',
      mentee_id: 'mentee123',
      rating: 5,
    });
    expect(proof.contract_id).toBeDefined();
  });

  it('should create Lightning invoice', async () => {
    const invoice = await apiClient.createLightningInvoice({
      amount_msat: 10000,
      description: 'Test payment',
    });
    expect(invoice.payment_request).toBeDefined();
  });
});
```

**Exécuter les tests:**
```bash
npm run test apps/dapp/__tests__/migration.test.ts
```

---

## 📋 Checklist de Migration Complète

### Backend Rust
- [x] Endpoints users CRUD
- [x] Endpoints mentoring requests
- [x] Endpoints RGB proofs
- [x] Endpoints Lightning Network
- [ ] Endpoint metrics/analytics
- [ ] Endpoint wallets admin
- [ ] Callbacks OAuth (t4g, LinkedIn)

### Frontend Next.js
- [x] Service `apiClient.ts` créé
- [x] Service `daznoAPI.ts` mis à jour
- [ ] Remplacer tous les `fetch('/api/...')`
- [ ] Tests E2E migration
- [ ] Supprimer routes API Next.js
- [ ] Supprimer dépendances MongoDB
- [ ] Mettre à jour variables d'environnement

### Infrastructure
- [x] `vercel.json` proxification configurée
- [ ] Variables d'environnement Vercel
- [ ] Backend déployé sur Railway
- [ ] Tests production

---

## 🚨 Risques & Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Session loss pendant migration | Moyen | Élevé | Feature flag, rollback rapide |
| Endpoints manquants backend | Faible | Élevé | Inventaire complet fait |
| Performance dégradée | Faible | Moyen | Backend Rust plus rapide que Node.js |
| Bugs authentification | Moyen | Critique | Tests E2E complets avant déploiement |

---

## 📅 Timeline Détaillé

```
Semaine 1 (2025-10-07 → 2025-10-13):
  Lundi-Mardi: Implémenter endpoints manquants backend
  Mercredi-Jeudi: Migration NextAuth → JWT
  Vendredi: Migration wallets & transactions

Semaine 2 (2025-10-14 → 2025-10-20):
  Lundi-Mardi: Migration metrics & analytics
  Mercredi: Remplacer tous les fetch('/api/...')
  Jeudi-Vendredi: Tests E2E complets

Semaine 3 (2025-10-21 → 2025-10-27):
  Lundi: Suppression routes API Next.js
  Mardi: Nettoyage dépendances
  Mercredi: Tests production
  Jeudi: Déploiement staging
  Vendredi: Validation finale

2025-10-28: 🚀 DÉPLOIEMENT PRODUCTION
```

---

## 🔗 Ressources

- [API Client Service](apps/dapp/services/apiClient.ts)
- [Dazno API Service](apps/dapp/services/daznoAPI.ts)
- [Backend API Documentation](token4good-backend/README.md)
- [Vercel Configuration](vercel.json)
- [Progress Report](PROGRESS_REPORT.md)

---

**Dernière mise à jour:** 2025-09-30
**Responsable:** Claude Code
**Prochaine revue:** 2025-10-07