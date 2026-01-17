# Guide de Migration MongoDB → PostgreSQL

## 📋 Vue d'ensemble

Ce guide explique la migration du système Token4Good de MongoDB vers PostgreSQL pour synchroniser le frontend et le backend.

## ✅ Ce qui a été fait

### 1. Migration SQL (`token4good-backend/migrations/002_add_services_and_categories.sql`)

Nouvelles tables PostgreSQL :
- ✅ `service_categories` - Catégories de services
- ✅ `services` - Services proposés
- ✅ `blockchain_transactions` - Transactions blockchain
- ✅ `experiences` - Expériences utilisateur
- ✅ `notifications` - Notifications
- ✅ Extension de la table `users` avec les champs MongoDB manquants

### 2. Backend Rust

**Modèles créés :**
- `models/service.rs` - ServiceCategory, Service, requests/responses
- `models/transaction.rs` - BlockchainTransaction

**Services database :**
- `services/database_services.rs` - Toutes les opérations CRUD pour services, catégories, transactions

**Routes API :**
- `routes/services.rs` - API REST pour services et catégories
  - `GET /api/services/categories` - Liste des catégories
  - `GET /api/services/categories/:id` - Catégorie par ID
  - `POST /api/services/categories` - Créer catégorie
  - `GET /api/services` - Liste des services (avec filtres)
  - `POST /api/services` - Créer service
  - `PUT /api/services/:id` - Mettre à jour service

- `routes/transactions.rs` - API REST pour transactions
  - `GET /api/transactions/:hash` - Transaction par hash
  - `GET /api/transactions/address/:address` - Transactions d'une adresse
  - `POST /api/transactions` - Créer/mettre à jour transaction
  - `GET /api/transactions/stats/total-supply` - Supply totale
  - `GET /api/transactions/stats/last-block` - Dernier bloc

### 3. Frontend

**Client API PostgreSQL :**
- `apps/dapp/services/postgresApiClient.ts` - Client REST pour accéder au backend Rust
  - `categoriesAPI` - Opérations sur les catégories
  - `servicesAPI` - Opérations sur les services
  - `transactionsAPI` - Opérations sur les transactions
  - Couche de compatibilité MongoDB

**Nouveaux DAOs PostgreSQL :**
- `libs/service/data/src/lib/dao/categoriesDAO-pg.ts` - Remplacement de categoriesDAO
- `libs/service/data/src/lib/dao/servicesDAO-pg.ts` - Remplacement de servicesDAO
- `libs/service/data/src/lib/dao/transactionsDAO-pg.ts` - Remplacement de transactionsDAO

**Switch dynamique :**
- `libs/service/data/src/lib/dao/index.ts` - Switch entre MongoDB et PostgreSQL via variable d'environnement

## 🚀 Comment utiliser

### 1. Configuration

Ajouter dans `.env.local` :

```bash
# Backend Rust API (port 8080)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Activer PostgreSQL (sinon utilise MongoDB)
NEXT_PUBLIC_USE_POSTGRES=true
```

### 2. Démarrer le backend Rust

```bash
cd token4good-backend

# La migration SQL sera appliquée automatiquement au démarrage
cargo run
```

Le backend démarre sur `http://localhost:8080`

### 3. Démarrer le frontend

```bash
cd apps/dapp
npm run dev
```

Le frontend démarre sur `http://localhost:3001` et utilisera automatiquement PostgreSQL

### 4. Migrer les données existantes (optionnel)

Si vous avez des données dans MongoDB à migrer :

```bash
# Assurez-vous que le backend Rust tourne
cd scripts
npx ts-node migrate-mongo-to-postgres.ts
```

## 🔄 Basculer entre MongoDB et PostgreSQL

### Utiliser PostgreSQL (recommandé)

```bash
# .env.local
NEXT_PUBLIC_USE_POSTGRES=true
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Revenir à MongoDB (legacy)

```bash
# .env.local
NEXT_PUBLIC_USE_POSTGRES=false
NEXT_PUBLIC_API_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/token4good
```

## 📊 Compatibilité API

Les nouveaux DAOs PostgreSQL implémentent la **même interface** que les DAOs MongoDB :

```typescript
// Aucun changement de code nécessaire !
import { categoriesDAO, servicesDAO, transactionsDAO } from '@t4g/service/data';

// Fonctionne avec MongoDB ET PostgreSQL
const categories = await categoriesDAO.getAll();
const services = await servicesDAO.getByAudience('ALUMNI');
const txs = await transactionsDAO.getByAddress('0x123...');
```

## 🧪 Tests

### Vérifier que le backend fonctionne

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/services/categories
```

### Vérifier la migration SQL

```bash
cd token4good-backend
cargo sqlx database create
cargo sqlx migrate run
```

## 📝 Endpoints API disponibles

### Services & Catégories

```
GET    /api/services/categories              - Liste toutes les catégories
GET    /api/services/categories/:id          - Catégorie par ID
POST   /api/services/categories              - Créer catégorie
PUT    /api/services/categories/:id          - Modifier catégorie
DELETE /api/services/categories/:id          - Supprimer catégorie

GET    /api/services                         - Liste services (filtres: ?audience=X&provider=Y)
GET    /api/services/:id                     - Service par ID
POST   /api/services                         - Créer service
PUT    /api/services/:id                     - Modifier service
DELETE /api/services/:id                     - Supprimer service
GET    /api/services/category/:categoryId    - Services par catégorie
GET    /api/services/provider/:providerId    - Services par provider
GET    /api/services/audience/:audience      - Services par audience
```

### Transactions

```
GET    /api/transactions/:hash                   - Transaction par hash
GET    /api/transactions/address/:address        - Transactions d'une adresse
POST   /api/transactions                         - Créer transaction
GET    /api/transactions/stats/total-supply      - Supply totale
GET    /api/transactions/stats/last-block        - Dernier bloc indexé
```

## ⚠️ Notes importantes

1. **L'authentification OTP Supabase reste inchangée** - seules les données métier migrent vers PostgreSQL
2. **Les identités utilisateurs** restent gérées par Supabase (pas dans MongoDB)
3. **Migration progressive** - le système peut fonctionner en mode hybride pendant la transition
4. **Backward compatible** - l'ancienne architecture MongoDB reste fonctionnelle

## 🎯 Prochaines étapes

1. ✅ Migration des services, catégories, transactions → PostgreSQL
2. 🔄 Migration des expériences utilisateur
3. 🔄 Migration des notifications
4. 🔄 Désactiver complètement MongoDB une fois migration validée

## 🐛 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier la connexion PostgreSQL
cd token4good-backend
cargo sqlx database create
cargo sqlx migrate run
```

### Les données ne s'affichent pas

1. Vérifier que `NEXT_PUBLIC_USE_POSTGRES=true`
2. Vérifier que le backend Rust tourne sur port 8080
3. Vérifier les logs du backend : `RUST_LOG=debug cargo run`

### Erreur CORS

Le backend autorise toutes les origines en développement. En production, configurer `CORS_ALLOWED_ORIGINS`.

## 📚 Ressources

- [Migration SQL](./token4good-backend/migrations/002_add_services_and_categories.sql)
- [Client API PostgreSQL](./apps/dapp/services/postgresApiClient.ts)
- [Backend Rust - Services](./token4good-backend/src/routes/services.rs)
- [Backend Rust - Transactions](./token4good-backend/src/routes/transactions.rs)
