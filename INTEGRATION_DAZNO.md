# Guide d'Intégration Token4Good ↔ Dazno

## Vue d'ensemble

L'intégration entre Token4Good et Dazno utilise **deux APIs distinctes** :

- **`dazno.de/api`** : Gestion utilisateurs, sessions, CRM, gamification, tokens T4G
- **`api.dazno.de`** : Lightning Network, paiements, invoices

## 🔗 Architecture d'Intégration

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Dazno.de      │    │   Token4Good     │    │  api.dazno.de   │
│   (Users/CRM)   │◄──►│   (RGB/Proofs)   │◄──►│  (Lightning)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 1. APIs Requises côté Dazno

### 🔐 Gestion Users/Sessions (`dazno.de/api`)

#### Vérification de Session
```http
POST https://dazno.de/api/auth/verify-session
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

Response:
{
  "authenticated": true,
  "user": {
    "id": "user123",
    "email": "user@dazno.de",
    "name": "John Doe",
    "role": "member"
  }
}
```

#### Profil Utilisateur Étendu
```http
GET https://dazno.de/api/users/{user_id}
Authorization: Bearer JWT_TOKEN

Response:
{
  "id": "user123",
  "email": "user@dazno.de",
  "name": "John Doe",
  "avatar": "https://...",
  "bio": "Software engineer",
  "reputation_score": 850,
  "total_t4g_earned": 5000,
  "total_t4g_spent": 2000,
  "gamification_level": 7
}
```

#### Balance T4G Tokens
```http
GET https://dazno.de/api/users/{user_id}/tokens/t4g
Authorization: Bearer JWT_TOKEN

Response:
{
  "t4g_balance": 3000,
  "last_updated": "2023-12-15T10:30:00Z"
}
```

#### Mise à jour Gamification
```http
POST https://dazno.de/api/users/{user_id}/gamification
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

Body:
{
  "points": 50,
  "action": "mentoring_completed",
  "timestamp": "2023-12-15T10:30:00Z"
}
```

### ⚡ Lightning Network (`api.dazno.de`)

#### Créer Invoice
```http
POST https://api.dazno.de/lightning/invoice
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

Body:
{
  "amount_msat": 10000,
  "description": "Payment for proof transfer",
  "user_id": "user123",
  "expires_in": 3600
}

Response:
{
  "payment_request": "lnbc100n1...",
  "payment_hash": "abc123...",
  "amount_msat": 10000,
  "description": "Payment for proof transfer",
  "expires_at": "2023-12-15T11:30:00Z",
  "status": "pending"
}
```

#### Payer Invoice
```http
POST https://api.dazno.de/lightning/pay
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

Body:
{
  "payment_request": "lnbc100n1...",
  "user_id": "user123"
}

Response:
{
  "payment_hash": "abc123...",
  "payment_preimage": "def456...",
  "amount_msat": 10000,
  "fee_msat": 100,
  "status": "succeeded",
  "created_at": "2023-12-15T10:30:00Z"
}
```

#### Balance Lightning
```http
GET https://api.dazno.de/lightning/balance/{user_id}
Authorization: Bearer JWT_TOKEN

Response:
{
  "balance_msat": 50000,
  "pending_msat": 5000,
  "reserved_msat": 1000,
  "last_updated": "2023-12-15T10:30:00Z"
}
```

#### Historique Transactions
```http
GET https://api.dazno.de/lightning/transactions/{user_id}?limit=50
Authorization: Bearer JWT_TOKEN

Response:
[
  {
    "id": "tx123",
    "transaction_type": "payment",
    "amount_msat": 10000,
    "fee_msat": 100,
    "status": "succeeded",
    "payment_hash": "abc123...",
    "description": "Payment for proof",
    "created_at": "2023-12-15T10:30:00Z",
    "settled_at": "2023-12-15T10:30:05Z"
  }
]
```

## 2. Flux d'Authentification

### Redirection Dazno → Token4Good
```
1. Utilisateur connecté sur dazno.de
2. Redirection: https://app.token-for-good.com/login?token=JWT_TOKEN
3. Token4Good vérifie le token via dazno.de/api/auth/verify-session
4. Création automatique utilisateur si nouveau
5. Génération JWT Token4Good pour session locale
```

### Code Frontend Token4Good
```typescript
// utils/dazno-auth.ts
export async function checkDaznoSession(): Promise<{
  authenticated: boolean;
  user?: any;
  token?: string;
}> {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      const response = await fetch('https://dazno.de/api/auth/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return {
          authenticated: data.authenticated,
          user: data.user,
          token,
        };
      }
    }

    return { authenticated: false };
  } catch (error) {
    console.error('Erreur vérification session Dazno:', error);
    return { authenticated: false };
  }
}
```

## 3. Workflow Complet : Proof Transfer

```
1. Utilisateur demande transfert de preuve RGB
   ↓
2. Token4Good → api.dazno.de/lightning/invoice
   ├── Montant: coût du transfert
   ├── Description: "Transfer proof ABC123"
   └── User ID: utilisateur payeur
   ↓
3. Affichage invoice à l'utilisateur
   ↓
4. Token4Good → api.dazno.de/lightning/pay
   ├── Payment request de l'invoice
   └── Confirmation paiement
   ↓
5. Si paiement réussi:
   ├── Transfert RGB effectué
   ├── Mise à jour ownership
   └── dazno.de/api/users/{id}/gamification (+points)
```

## 4. Variables d'Environnement

### Token4Good Backend
```bash
# .env
DAZNO_LIGHTNING_API_URL=https://api.dazno.de
DAZNO_USERS_API_URL=https://dazno.de/api
JWT_SECRET=your-jwt-secret
```

### Headers CORS Requis (côté Dazno)
```
Access-Control-Allow-Origin: https://app.token-for-good.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

## 5. Endpoints Token4Good pour Dazno

Si Dazno a besoin d'interroger Token4Good :

```http
# Preuves d'un utilisateur
GET https://app.token-for-good.com/api/proofs?mentee_id=user123
Authorization: Bearer TOKEN

# Détails d'une preuve RGB
GET https://app.token-for-good.com/api/proofs/{proof_id}
Authorization: Bearer TOKEN

# Historique transferts
GET https://app.token-for-good.com/api/proofs/{proof_id}/history
Authorization: Bearer TOKEN
```

## 6. Monitoring & Logs

### Côté Token4Good
- Logs des appels API Dazno
- Métriques Lightning payments
- Erreurs d'authentification

### Côté Dazno
- Logs vérifications Token4Good
- Métriques paiements Lightning
- Balance tracking

## 7. Tests d'Intégration

### Tests à implémenter (côté Dazno)
```bash
# Authentification
curl -X POST https://dazno.de/api/auth/verify-session \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json"

# Lightning Invoice
curl -X POST https://api.dazno.de/lightning/invoice \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{"amount_msat": 1000, "description": "Test", "user_id": "test_user"}'
```

### Tests côté Token4Good
```bash
# Auto-login Dazno
curl "http://localhost:3001/login?token=test_dazno_token"

# API proxy vers Dazno
curl -X GET http://localhost:3000/api/dazno/users/test_user/tokens/t4g \
  -H "Authorization: Bearer jwt_token"
```

## 8. Sécurité

### Token Management
- JWT tokens avec expiration courte (1h)
- Refresh tokens pour sessions longues
- Validation côté serveur obligatoire

### API Security
- Rate limiting sur les endpoints
- Validation input stricte
- Logs d'audit complets
- HTTPS obligatoire en production

### Lightning Security
- Validation montants maximum
- Vérification signatures payments
- Monitoring transactions suspectes

Cette intégration permet une expérience utilisateur seamless entre Dazno et Token4Good tout en maintenant la séparation des responsabilités : Dazno pour la gestion utilisateur/Lightning, Token4Good pour les preuves RGB.