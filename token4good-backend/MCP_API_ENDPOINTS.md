# MCP API v1 Endpoints - Token4Good Backend

## Vue d'ensemble

Ce document décrit les nouveaux endpoints MCP API v1 implémentés dans le backend Token4Good pour l'intégration avec l'API Dazno Lightning sur `api.dazno.de/api/v1/`.

**Date d'implémentation**: 2025-01-27  
**Base URL**: `https://api.dazno.de/api/v1/`

## Architecture

Les endpoints MCP sont exposés via le routeur `/api/dazno/v1/` du backend Token4Good, qui fait office de proxy vers l'API MCP de Dazno.

### Authentification

Tous les endpoints MCP requièrent :
- **JWT Token** (via middleware `auth_middleware`)
- **Dazno Token** (via header `x-dazno-token`)
- **API Key** (via variable d'environnement `DAZNO_API_KEY`)

### Structure des routes

```
/api/dazno/v1/wallet/*      - Opérations wallet
/api/dazno/v1/channels/*    - Gestion des canaux Lightning
/api/dazno/v1/nodes/*       - Informations sur les nœuds
/api/dazno/v1/lightning/*   - Analyse réseau Lightning
```

## 1. Wallet Operations (`/api/dazno/v1/wallet`)

### GET `/api/dazno/v1/wallet/balance/:user_id`

Récupère le solde wallet Lightning d'un utilisateur.

**Headers**:
- `Authorization: Bearer <jwt_token>`
- `x-dazno-token: <dazno_token>`

**Response** (200 OK):
```json
{
  "balance_msat": 10000000,
  "pending_msat": 0,
  "reserved_msat": 0,
  "last_updated": "2025-01-27T12:00:00Z"
}
```

### GET `/api/dazno/v1/wallet/payments/:user_id`

Récupère l'historique des paiements d'un utilisateur.

**Headers**: Idem ci-dessus

**Query Parameters**:
- `limit` (optionnel): Nombre maximum de résultats (défaut: illimité)

**Response** (200 OK):
```json
[
  {
    "id": "tx_123",
    "transaction_type": "payment",
    "amount_msat": 5000000,
    "fee_msat": 1000,
    "status": "settled",
    "payment_hash": "abc123...",
    "description": "Payment to Alice",
    "created_at": "2025-01-27T10:00:00Z",
    "settled_at": "2025-01-27T10:00:05Z"
  }
]
```

## 2. Channel Management (`/api/dazno/v1/channels`)

### GET `/api/dazno/v1/channels/:user_id`

Liste tous les canaux Lightning d'un utilisateur.

**Headers**: Idem ci-dessus

**Response** (200 OK):
```json
[
  {
    "channel_id": "ch_123",
    "channel_point": "point_123",
    "capacity_msat": 100000000,
    "local_balance_msat": 50000000,
    "remote_balance_msat": 50000000,
    "state": "OPEN",
    "node_pubkey": "02abc...",
    "node_alias": "Alice Node",
    "created_at": "2025-01-27T08:00:00Z",
    "updated_at": "2025-01-27T12:00:00Z"
  }
]
```

### GET `/api/dazno/v1/channels/detail/:channel_id`

Récupère les détails d'un canal spécifique.

**Headers**: Idem ci-dessus

**Response** (200 OK):
```json
{
  "channel_id": "ch_123",
  "channel_point": "point_123",
  "capacity_msat": 100000000,
  "local_balance_msat": 50000000,
  "remote_balance_msat": 50000000,
  "state": "OPEN",
  "node_pubkey": "02abc...",
  "node_alias": "Alice Node",
  "created_at": "2025-01-27T08:00:00Z",
  "updated_at": "2025-01-27T12:00:00Z"
}
```

### POST `/api/dazno/v1/channels/open`

Ouvre un nouveau canal Lightning.

**Headers**: Idem ci-dessus

**Request Body**:
```json
{
  "node_pubkey": "02abc...",
  "amount_msat": 10000000
}
```

**Response** (200 OK):
```json
{
  "channel_id": "ch_456",
  "channel_point": "point_456",
  "capacity_msat": 10000000,
  "local_balance_msat": 10000000,
  "remote_balance_msat": 0,
  "state": "OPENING",
  "node_pubkey": "02abc...",
  "node_alias": "Bob Node",
  "created_at": "2025-01-27T12:00:00Z",
  "updated_at": null
}
```

### POST `/api/dazno/v1/channels/:channel_id/close`

Ferme un canal Lightning.

**Headers**: Idem ci-dessus

**Query Parameters**:
- `force` (optionnel): Force la fermeture immédiate (défaut: false)

**Response** (200 OK):
```json
{
  "channel_id": "ch_123",
  "closing_txid": "tx_close_123",
  "status": "CLOSED",
  "closed_at": "2025-01-27T12:00:00Z"
}
```

## 3. Node Information (`/api/dazno/v1/nodes`)

### GET `/api/dazno/v1/nodes`

Liste les nœuds Lightning disponibles.

**Headers**: Idem ci-dessus

**Query Parameters**:
- `q` (optionnel): Recherche par alias ou pubkey

**Response** (200 OK):
```json
[
  {
    "pubkey": "02abc...",
    "alias": "Alice Lightning Node",
    "color": "#FF0000",
    "num_channels": 150,
    "total_capacity_msat": 5000000000,
    "addresses": [
      {
        "network": "ipv4",
        "addr": "34.123.45.67:9735"
      }
    ],
    "last_update": "2025-01-27T11:00:00Z"
  }
]
```

### GET `/api/dazno/v1/nodes/:pubkey`

Récupère les informations d'un nœud spécifique.

**Headers**: Idem ci-dessus

**Response** (200 OK):
```json
{
  "pubkey": "02abc...",
  "alias": "Alice Lightning Node",
  "color": "#FF0000",
  "num_channels": 150,
  "total_capacity_msat": 5000000000,
  "addresses": [
    {
      "network": "ipv4",
      "addr": "34.123.45.67:9735"
    }
  ],
  "last_update": "2025-01-27T11:00:00Z"
}
```

## 4. Lightning Network Analysis (`/api/dazno/v1/lightning`)

### GET `/api/dazno/v1/lightning/stats`

Récupère les statistiques globales du réseau Lightning.

**Headers**: Idem ci-dessus

**Response** (200 OK):
```json
{
  "total_nodes": 15000,
  "total_channels": 75000,
  "total_capacity_msat": 5000000000000,
  "avg_channel_capacity_msat": 66666666,
  "network_growth_24h": 2.5,
  "timestamp": "2025-01-27T12:00:00Z"
}
```

### POST `/api/dazno/v1/lightning/routing`

Analyse une route de paiement entre deux nœuds.

**Headers**: Idem ci-dessus

**Request Body**:
```json
{
  "from_node": "02abc...",
  "to_node": "03def...",
  "amount_msat": 1000000
}
```

**Response** (200 OK):
```json
{
  "route_found": true,
  "hops": [
    {
      "node_pubkey": "02abc...",
      "node_alias": "Alice Node",
      "channel_id": "ch_123",
      "fee_msat": 100
    },
    {
      "node_pubkey": "03def...",
      "node_alias": "Bob Node",
      "channel_id": "ch_456",
      "fee_msat": 150
    }
  ],
  "total_fee_msat": 250,
  "estimated_time_seconds": 5
}
```

**Response si route non trouvée** (200 OK):
```json
{
  "route_found": false,
  "hops": [],
  "total_fee_msat": 0,
  "estimated_time_seconds": null
}
```

## Codes d'erreur

### 401 Unauthorized
- JWT token manquant ou invalide
- Dazno token manquant dans le header `x-dazno-token`

### 403 Forbidden
- L'utilisateur n'a pas accès à la ressource demandée

### 502 Bad Gateway
- Erreur de communication avec l'API Dazno
- Token Dazno invalide ou expiré

## Migration depuis les endpoints Legacy

Les anciens endpoints Lightning (`/api/dazno/lightning/*`) restent disponibles pour compatibilité arrière, mais il est recommandé de migrer vers les nouveaux endpoints MCP v1.

### Mapping des endpoints

| Ancien Endpoint | Nouveau Endpoint MCP v1 |
|-----------------|-------------------------|
| `GET /api/dazno/lightning/balance/:user_id` | `GET /api/dazno/v1/wallet/balance/:user_id` |
| `GET /api/dazno/lightning/transactions/:user_id` | `GET /api/dazno/v1/wallet/payments/:user_id` |
| N/A (nouveau) | `GET /api/dazno/v1/channels/:user_id` |
| N/A (nouveau) | `POST /api/dazno/v1/channels/open` |
| N/A (nouveau) | `POST /api/dazno/v1/channels/:channel_id/close` |
| N/A (nouveau) | `GET /api/dazno/v1/nodes` |
| N/A (nouveau) | `GET /api/dazno/v1/nodes/:pubkey` |
| N/A (nouveau) | `GET /api/dazno/v1/lightning/stats` |
| N/A (nouveau) | `POST /api/dazno/v1/lightning/routing` |

## Configuration

Les endpoints MCP utilisent les variables d'environnement suivantes :

```bash
DAZNO_LIGHTNING_API_URL=https://api.dazno.de  # Par défaut
DAZNO_API_KEY=your_api_key_here               # Optionnel
```

## Tests

Pour tester les endpoints MCP localement :

```bash
# 1. Démarrer le backend
cd token4good-backend
cargo run

# 2. Exemple de requête
curl -X GET http://localhost:3000/api/dazno/v1/nodes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "x-dazno-token: YOUR_DAZNO_TOKEN" \
  -H "Content-Type: application/json"
```

## Implémentation

### Fichiers modifiés

1. **`src/services/dazno.rs`**
   - Ajout de 10 nouvelles méthodes pour les endpoints MCP
   - Ajout de 8 nouveaux types pour les structures de données MCP

2. **`src/routes/dazno.rs`**
   - Ajout de 10 nouveaux handlers pour les routes MCP
   - Mise à jour des imports avec les nouveaux types

### Architecture de proxy

Le backend Token4Good agit comme un proxy intelligent :
1. Validation de l'authentification JWT
2. Vérification des permissions utilisateur
3. Proxy des requêtes vers l'API MCP de Dazno
4. Retour des réponses avec gestion d'erreurs unifiée

## Notes de sécurité

1. **Authentification en couches** : JWT + Dazno Token + API Key
2. **Validation des ressources** : Les utilisateurs ne peuvent accéder qu'à leurs propres données
3. **Rate limiting** : Les endpoints héritent du middleware de rate limiting global
4. **Headers de sécurité** : CORS et headers de sécurité appliqués globalement

## Prochaines étapes

- [ ] Ajouter des tests unitaires pour chaque endpoint
- [ ] Implémenter la mise en cache des réponses fréquentes (stats, nodes)
- [ ] Ajouter des métriques de monitoring pour les appels MCP
- [ ] Créer une documentation OpenAPI/Swagger complète

