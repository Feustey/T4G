# Token4Good Backend - Rust + RGB + Lightning

Backend Rust pour Token4Good v2 avec intégration RGB Bitcoin et Lightning Network.

## Architecture

```
token4good-backend/
├── src/
│   ├── main.rs              # Point d'entrée Axum
│   ├── middleware/          # Authentification JWT
│   ├── routes/              # API endpoints
│   │   ├── auth.rs          # Auth (Dazeno, t4g, LinkedIn)
│   │   ├── users.rs         # Gestion utilisateurs
│   │   ├── proofs.rs        # Preuves RGB
│   │   ├── lightning.rs     # Paiements Lightning
│   │   └── mentoring.rs     # Demandes de mentoring
│   ├── services/            # Services métier
│   │   ├── rgb.rs           # Intégration RGB
│   │   ├── lightning.rs     # Intégration LND
│   │   └── database.rs      # Base de données Supabase PostgreSQL
│   └── models/              # Structures de données
├── tests/                   # Tests unitaires et d'intégration
├── scripts/                 # Scripts de déploiement
├── monitoring/              # Configuration Prometheus/Grafana
└── Dockerfile              # Conteneurisation
```

## Services Intégrés

### 🔹 RGB Bitcoin
- **Création de contrats** : Preuves d'impact tokenisées
- **Transferts** : Via Lightning Network
- **Validation** : Client-side validation
- **Confidentialité** : Divulgation partielle

### ⚡ Lightning Network
- **Paiements** : Invoices et paiements automatiques
- **Node LND** : Intégration complète
- **Regtest** : Environnement de développement

### 🔐 Authentification
- **JWT Tokens** : Session management
- **Multi-providers** : Dazeno, t4g, LinkedIn
- **Auto-login** : Intégration Dazeno complète

### 📊 Monitoring
- **Prometheus** : Métriques système
- **Grafana** : Dashboards
- **Health checks** : Surveillance continue

## Démarrage Rapide

### 1. Prérequis
```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Docker & Docker Compose
# Installation selon votre OS

# Supabase PostgreSQL (ou PostgreSQL local)
# Bitcoin Core & LND (ou utiliser Docker)
```

### 2. Configuration
```bash
# Variables d'environnement
cp .env.example .env

# Modifier les valeurs dans .env :
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.glikbylflheewbonytev.supabase.co:5432/postgres
JWT_SECRET=your-secret-key
RGB_DATA_DIR=/tmp/rgb_data
LND_HOST=localhost
```

### 3. Développement Local
```bash
# Démarrer les services
cargo run

# Ou avec Docker
docker-compose up --build
```

### 4. Tests
```bash
# Tests unitaires
cargo test

# Tests d'intégration
cargo test --test integration_tests
```

## API Endpoints

### 🔐 Authentification
```
POST /api/auth/login              # Login multi-provider
POST /api/auth/dazeno/verify      # Vérification token Dazeno
POST /api/auth/refresh            # Refresh JWT
```

### 👥 Utilisateurs
```
GET    /api/users                 # Liste utilisateurs
POST   /api/users                 # Créer utilisateur
GET    /api/users/:id             # Détails utilisateur
PUT    /api/users/:id             # Modifier utilisateur
DELETE /api/users/:id             # Supprimer utilisateur
GET    /api/users/me              # Utilisateur connecté
```

### 🎓 Mentoring
```
GET  /api/mentoring/requests      # Liste demandes
POST /api/mentoring/requests      # Créer demande
GET  /api/mentoring/requests/:id  # Détails demande
POST /api/mentoring/requests/:id/assign  # Assigner mentor
```

### 🏆 Preuves RGB
```
GET  /api/proofs                  # Liste preuves
POST /api/proofs                  # Créer preuve RGB
GET  /api/proofs/:id              # Détails preuve
GET  /api/proofs/:id/verify       # Vérifier preuve
POST /api/proofs/:id/transfer     # Transférer preuve
GET  /api/proofs/:id/history      # Historique transferts
```

### ⚡ Lightning
```
GET  /api/lightning/node/info     # Info node LND
POST /api/lightning/invoice       # Créer invoice
POST /api/lightning/payment       # Payer invoice
GET  /api/lightning/payment/:hash/status  # Status paiement
```

## Intégration Dazno

### Frontend → Backend
```typescript
// 1. Vérification session Dazno
const response = await fetch('/api/auth/dazeno/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: daznoToken })
});

// 2. Login automatique
const authResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: user.email,
    provider: 'dazeno',
    token: daznoToken
  })
});

// 3. Utilisation JWT
const { token } = await authResponse.json();
// Stocker token et utiliser dans headers Authorization
```

### Dazno → Token4Good
```bash
# Redirection avec token
https://app.token-for-good.com/login?token=JWT_TOKEN

# APIs Dazno requises :

## 1. Gestion Users/Sessions (dazno.de/api)
POST https://dazno.de/api/auth/verify-session
Authorization: Bearer JWT_TOKEN
Response: {
  "authenticated": true,
  "user": { "id", "email", "name" }
}

GET https://dazno.de/api/users/:id/tokens/t4g
Authorization: Bearer JWT_TOKEN
Response: {
  "t4g_balance": 1000,
  "last_updated": "2023-..."
}

## 2. Lightning Network (api.dazno.de)
POST https://api.dazno.de/lightning/invoice
Authorization: Bearer JWT_TOKEN
Body: {
  "amount_msat": 1000,
  "description": "Payment for proof",
  "user_id": "user123"
}

POST https://api.dazno.de/lightning/pay
Authorization: Bearer JWT_TOKEN
Body: {
  "payment_request": "lnbc...",
  "user_id": "user123"
}
```

## Déploiement

### Docker Compose Production
```bash
# Production
docker-compose -f docker-compose.prod.yml up -d

# Monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

### Variables d'Environnement Production
```bash
RUST_LOG=info
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.glikbylflheewbonytev.supabase.co:5432/postgres
JWT_SECRET=secure-random-secret
BITCOIN_NETWORK=mainnet  # ou testnet
LND_HOST=lnd-node
RGB_DATA_DIR=/data/rgb
```

### Scaling
```bash
# Plusieurs instances backend
docker-compose up --scale token4good-backend=3

# Load balancer (nginx, traefik...)
# Base de données répliquée
# Monitoring distribué
```

## RGB + Lightning Workflow

```
1. User Request Mentoring
   ↓
2. Mentor Accepts
   ↓
3. Create RGB Proof Contract
   ├── rgb-cli contract create
   ├── Store in Supabase PostgreSQL
   └── Generate Lightning Invoice
   ↓
4. Payment Confirmation
   ├── lncli pay invoice
   └── Update proof status
   ↓
5. Transfer RGB Asset
   ├── rgb-cli transfer
   └── Update ownership
```

## Monitoring & Observabilité

### Métriques Collectées
- **API Performance** : Latence, throughput, erreurs
- **RGB Operations** : Contrats créés, transferts, validations
- **Lightning Payments** : Volume, succès/échecs
- **Database** : Connexions, requêtes, performances
- **System** : CPU, mémoire, stockage

### Alertes
- API down ou latence élevée
- Échecs paiements Lightning
- Erreurs RGB validation
- Base de données inaccessible
- Espace disque faible

## Sécurité

### Authentification
- JWT avec expiration courte
- Refresh tokens sécurisés
- Validation provider externe

### RGB Security
- Clés privées côté client uniquement
- Validation locale obligatoire
- Audit trail complet

### API Security
- Rate limiting
- CORS configuré
- Headers sécurité
- Validation input stricte

### Infrastructure
- TLS/HTTPS obligatoire
- Secrets management
- Network isolation
- Backup automatisé

## Développement

### Structure des Tests
```bash
# Tests unitaires
cargo test --lib

# Tests d'intégration
cargo test --test integration_tests

# Coverage
cargo tarpaulin --out Html
```

### Debugging
```bash
# Logs détaillés
RUST_LOG=debug cargo run

# Profiling
cargo flamegraph --bin token4good-backend
```

### Contributing
1. Fork le projet
2. Créer une branch feature
3. Tests passants
4. Pull request avec description

## Support

- **Documentation** : Ce README + code comments
- **Issues** : GitHub Issues
- **Monitoring** : Grafana dashboards
- **Logs** : Centralisés avec structured logging