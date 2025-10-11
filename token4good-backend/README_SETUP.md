# Token4Good Backend - Setup Guide

## 🚀 Quick Start avec Docker Compose

### Prérequis
- Docker & Docker Compose installés
- Minimum 4GB RAM disponible
- Ports libres: 3000, 5432, 8080, 9735, 10009, 18443

### Démarrage complet
```bash
# Depuis la racine du projet RGB
docker-compose -f docker-compose.dev.yml up -d

# Vérifier que tous les services sont démarrés
docker-compose -f docker-compose.dev.yml ps

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Services déployés

| Service | Port | Description |
|---------|------|-------------|
| backend | 3000 | API Rust Axum |
| postgres | 5432 | Base de données PostgreSQL |
| bitcoin | 18443 | Bitcoin Core (regtest) |
| lnd | 10009, 8080 | Lightning Network Daemon |

---

## 🔧 Configuration Lightning Network

### 1. Initialiser le wallet LND
```bash
# Créer un nouveau wallet
docker exec -it t4g-lnd lncli --network=regtest create

# Choisir un mot de passe (dev: "password123")
# Générer une nouvelle seed (24 mots)
```

### 2. Alimenter le wallet Bitcoin
```bash
# Générer une adresse Bitcoin
docker exec -it t4g-bitcoin bitcoin-cli -regtest \
  -rpcuser=bitcoin -rpcpassword=bitcoin123 getnewaddress

# Miner des blocs (regtest uniquement)
docker exec -it t4g-bitcoin bitcoin-cli -regtest \
  -rpcuser=bitcoin -rpcpassword=bitcoin123 \
  generatetoaddress 101 [VOTRE_ADRESSE]
```

### 3. Ouvrir un channel LND (optionnel pour dev)
```bash
# Obtenir l'info du node LND
docker exec -it t4g-lnd lncli --network=regtest getinfo

# Créer une invoice de test
docker exec -it t4g-lnd lncli --network=regtest addinvoice \
  --amt_msat 1000 --memo "Test invoice"
```

---

## 🗄️ Base de données PostgreSQL

### Connexion à la DB
```bash
# Via psql dans le conteneur
docker exec -it t4g-postgres psql -U postgres -d token4good

# Ou depuis l'hôte (si psql installé)
psql postgresql://postgres:postgres123@localhost:5432/token4good
```

### Migrations
Les migrations sont automatiquement exécutées au démarrage du conteneur PostgreSQL.

```bash
# Appliquer manuellement les migrations
docker exec -it t4g-backend sqlx migrate run
```

---

## 🧪 Tests API

### Health check
```bash
curl http://localhost:3000/health
```

### Créer un utilisateur
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "role": "STUDENT"
  }'
```

### Créer une invoice Lightning
```bash
curl -X POST http://localhost:3000/api/lightning/invoice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount_msat": 10000,
    "description": "Test payment",
    "expiry_seconds": 3600
  }'
```

---

## 🔍 Debugging

### Logs backend
```bash
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Logs LND
```bash
docker-compose -f docker-compose.dev.yml logs -f lnd
```

### Logs Bitcoin Core
```bash
docker-compose -f docker-compose.dev.yml logs -f bitcoin
```

### État du node Lightning
```bash
docker exec -it t4g-lnd lncli --network=regtest getinfo
docker exec -it t4g-lnd lncli --network=regtest walletbalance
docker exec -it t4g-lnd lncli --network=regtest listchannels
```

---

## 🛑 Arrêt et nettoyage

### Arrêter les services
```bash
docker-compose -f docker-compose.dev.yml down
```

### Supprimer les volumes (⚠️ perte de données)
```bash
docker-compose -f docker-compose.dev.yml down -v
```

---

## 📝 Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```bash
# Backend Rust
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/token4good
JWT_SECRET=dev-secret-key-change-in-production
RGB_DATA_DIR=/tmp/rgb_data

# Lightning Network
LND_HOST=localhost
LND_PORT=10009
LND_MACAROON_PATH=/path/to/.lnd/data/chain/bitcoin/regtest/admin.macaroon
LND_TLS_CERT_PATH=/path/to/.lnd/tls.cert

# Bitcoin
BITCOIN_RPC_URL=http://bitcoin:bitcoin123@localhost:18443
BITCOIN_NETWORK=regtest

# Logging
RUST_LOG=debug
```

---

## 🚨 Troubleshooting

### Le backend ne démarre pas
```bash
# Vérifier que PostgreSQL est accessible
docker exec -it t4g-postgres pg_isready

# Vérifier les logs
docker logs t4g-backend
```

### LND ne se connecte pas à Bitcoin
```bash
# Vérifier que Bitcoin Core est synchro
docker exec -it t4g-bitcoin bitcoin-cli -regtest \
  -rpcuser=bitcoin -rpcpassword=bitcoin123 getblockchaininfo

# Redémarrer LND
docker-compose -f docker-compose.dev.yml restart lnd
```

### Erreur de macaroon LND
```bash
# Copier le macaroon depuis le conteneur
docker cp t4g-lnd:/root/.lnd/data/chain/bitcoin/regtest/admin.macaroon ./lnd_admin.macaroon

# Mettre à jour LND_MACAROON_PATH dans .env
```

---

## 📚 Ressources

- [LND Documentation](https://docs.lightning.engineering/)
- [Bitcoin Core RPC](https://developer.bitcoin.org/reference/rpc/)
- [RGB Protocol](https://rgb.tech/)
- [Axum Web Framework](https://docs.rs/axum/)