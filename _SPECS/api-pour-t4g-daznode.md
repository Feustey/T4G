# 📘 Guide Technique - API Token4Good (T4G) pour t4g.dazno.de
> Documentation pour les équipes dazno.de
> Dernière mise à jour: 7 janvier 2025

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Authentification](#authentification)
3. [Configuration & Connexion](#configuration--connexion)
4. [Endpoints Token4Good](#endpoints-token4good)
5. [Endpoints Lightning/Bitcoin](#endpoints-lightningbitcoin)
6. [Exemples de Code](#exemples-de-code)
7. [Cas d'Usage Pratiques](#cas-dusage-pratiques)
8. [Gestion d'Erreurs](#gestion-derreurs)
9. [Best Practices](#best-practices)
10. [FAQ](#faq)

---

## 🎯 Introduction

### Qu'est-ce que Token4Good (T4G) ?

Token4Good (T4G) est le système de tokens d'entraide et de mentoring de l'écosystème DazNode. Il transforme l'expertise et l'entraide communautaire en valeur tangible, créant un écosystème où **"Gagnez en aidant, dépensez en apprenant"**.

### Concept Clé
- **1 T4G ≈ 15 minutes d'expertise qualifiée**
- Économie circulaire fermée : tokens uniquement échangeables dans la communauté
- Impact mesurable et reconnaissance sociale
- Système auto-régulé par l'offre et la demande
- Intégration complète avec Lightning Network pour paiements Bitcoin

### Base URL

```
Production:  https://t4g.dazno.de
API Base:    https://api.dazno.de/api/v1/token4good
Alternative: https://t4g.dazno.de/api/v1/token4good
```

**Note**: `t4g.dazno.de` est un proxy vers l'API MCP principale qui expose les endpoints Token4Good.

### Format des Réponses

Toutes les réponses sont au format **JSON** :

```json
{
  "status": "success|error",
  "data": { ... },
  "message": "Description optionnelle"
}
```

---

## 🔐 Authentification

### Vue d'ensemble

Token4Good utilise la **même authentification JWT** que l'API MCP principale. Le token doit être inclus dans le header `Authorization` au format Bearer.

### Format du Token

```
Authorization: Bearer <votre_jwt_token>
```

### Structure du JWT

Le token JWT doit contenir au minimum :

```json
{
  "tenant_id": "votre_tenant_id",
  "sub": "user_id_ou_tenant_id",
  "iss": "app.dazno.de",
  "aud": "api.dazno.de",
  "exp": 1234567890
}
```

### Obtenir un Token

Utilisez le même script que pour l'API MCP principale :

```bash
python3 generate_dazno_token.py --user-id t4g_user_001 --tenant-id t4g_tenant_001
```

---

## ⚙️ Configuration & Connexion

### Endpoints Publics (Pas d'authentification)

Ces endpoints peuvent être appelés sans JWT :

- `GET /health` - Health check (via t4g.dazno.de ou api.dazno.de)
- `GET /api/v1/token4good/marketplace/stats` - Statistiques publiques de la marketplace

### Test de Connexion Rapide

```bash
# Test de santé
curl https://t4g.dazno.de/health

# Test avec authentification
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://t4g.dazno.de/api/v1/token4good/admin/system/status
```

### CORS Configuration

Les origines autorisées pour `t4g.dazno.de` :
- `https://t4g.dazno.de`
- `https://app.dazno.de`
- `https://dazno.de`

---

## 📚 Endpoints Token4Good

### 👥 Gestion des Utilisateurs

#### Créer un Profil Utilisateur

```bash
curl -X POST "https://t4g.dazno.de/api/v1/token4good/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "t4g_user_001",
    "username": "john_doe",
    "email": "john@example.com",
    "skills": ["lightning-network", "bitcoin", "dazbox"]
  }'
```

**Réponse :**
```json
{
  "user_id": "t4g_user_001",
  "username": "john_doe",
  "email": "john@example.com",
  "total_tokens_earned": 50,
  "total_tokens_spent": 0,
  "available_balance": 50,
  "user_level": "contributeur",
  "skills": ["lightning-network", "bitcoin", "dazbox"],
  "reputation_score": 0.5,
  "created_at": "2025-01-10T10:00:00Z"
}
```

#### Obtenir un Profil

```bash
curl "https://t4g.dazno.de/api/v1/token4good/users/t4g_user_001" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Statistiques Utilisateur

```bash
curl "https://t4g.dazno.de/api/v1/token4good/users/t4g_user_001/statistics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse inclut :**
- Profil complet
- Total transactions
- Sessions de mentoring données/reçues
- Tokens par action
- Note moyenne des sessions
- Rang communautaire
- Progression vers le niveau suivant

#### Opportunités de Gains

```bash
curl "https://t4g.dazno.de/api/v1/token4good/users/t4g_user_001/opportunities" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Leaderboard Communautaire

```bash
curl "https://t4g.dazno.de/api/v1/token4good/leaderboard?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 💰 Gestion des Tokens

#### Attribuer des Tokens

```bash
curl -X POST "https://t4g.dazno.de/api/v1/token4good/tokens/award" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "t4g_user_001",
    "action_type": "mentoring",
    "tokens": 50,
    "description": "Session Lightning Network complétée",
    "metadata": {"session_id": "session_123"},
    "impact_score": 1.3
  }'
```

**Types d'actions disponibles :**
- `mentoring` - Session de mentoring
- `code_review` - Review de code
- `documentation` - Création de documentation
- `support_technique` - Support technique
- `parrainage` - Parrainage de nouveaux membres

**Réponse :**
```json
{
  "id": "txn_123",
  "user_id": "t4g_user_001",
  "action_type": "mentoring",
  "tokens_earned": 65,
  "description": "Session Lightning Network complétée",
  "timestamp": "2025-01-10T16:00:00Z",
  "impact_score": 1.3
}
```

#### Solde de Tokens

```bash
curl "https://t4g.dazno.de/api/v1/token4good/tokens/t4g_user_001/balance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse :**
```json
{
  "user_id": "t4g_user_001",
  "total_earned": 500,
  "total_spent": 150,
  "available_balance": 350,
  "user_level": "mentor"
}
```

#### Historique des Transactions

```bash
curl "https://t4g.dazno.de/api/v1/token4good/tokens/t4g_user_001/transactions?limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 🎓 Sessions de Mentoring

#### Créer une Session

```bash
curl -X POST "https://t4g.dazno.de/api/v1/token4good/mentoring/sessions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mentor_id": "mentor_001",
    "mentee_id": "mentee_001",
    "topic": "Configuration nœud Lightning",
    "category": "lightning_network",
    "duration_minutes": 60
  }'
```

**Catégories disponibles :**
- `lightning_network` - Lightning Network Mastery
- `dazbox_setup` - DazBox Setup Pro
- `business_dev` - Bitcoin Business Development
- `dazpay_integration` - DazPay Integration

#### Compléter une Session

```bash
curl -X POST "https://t4g.dazno.de/api/v1/token4good/mentoring/sessions/complete" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session_123",
    "feedback": {
      "rating": 5,
      "comments": "Excellent mentoring, très utile!",
      "learned_skills": ["node-configuration", "channel-management"]
    }
  }'
```

#### Sessions d'un Utilisateur

```bash
# En tant que mentor
curl "https://t4g.dazno.de/api/v1/token4good/mentoring/sessions/user_001?as_mentor=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# En tant que mentee
curl "https://t4g.dazno.de/api/v1/token4good/mentoring/sessions/user_001?as_mentor=false" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 🛍️ Marketplace de Services

#### Créer un Service

```bash
curl -X POST "https://t4g.dazno.de/api/v1/token4good/marketplace/services" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": "provider_001",
    "name": "Migration Nœud Lightning",
    "description": "Migration complète et sécurisée d'un nœud Lightning",
    "category": "technical_excellence",
    "token_cost": 300,
    "estimated_duration": "4-6h",
    "requirements": ["nœud Lightning existant", "backup disponible"],
    "tags": ["lightning", "migration", "expert"]
  }'
```

**Catégories de services :**
- `technical_excellence` - Services techniques
- `business_growth` - Développement business
- `knowledge_transfer` - Transfert de connaissances
- `community_services` - Services communautaires

#### Rechercher des Services

```bash
curl -X POST "https://t4g.dazno.de/api/v1/token4good/marketplace/search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "technical_excellence",
    "max_cost": 200,
    "tags": ["lightning", "optimization"],
    "provider_level": "expert"
  }'
```

#### Réserver un Service

```bash
curl -X POST "https://t4g.dazno.de/api/v1/token4good/marketplace/book" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "client_001",
    "service_id": "service_123",
    "scheduled_at": "2025-01-15T14:00:00Z",
    "notes": "Besoin urgent de migration"
  }'
```

#### Compléter une Réservation

```bash
curl -X POST "https://t4g.dazno.de/api/v1/token4good/marketplace/bookings/complete" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "booking_123",
    "feedback": {
      "rating": 5,
      "comments": "Service excellent, très professionnel",
      "would_recommend": true
    }
  }'
```

#### Recommandations Personnalisées

```bash
curl "https://t4g.dazno.de/api/v1/token4good/marketplace/recommendations/user_001?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Statistiques Marketplace

```bash
curl "https://t4g.dazno.de/api/v1/token4good/marketplace/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 🏆 Administration

#### Bonus Hebdomadaires

```bash
curl -X POST "https://t4g.dazno.de/api/v1/token4good/admin/rewards/weekly-bonuses" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Note**: Requiert des permissions administrateur.

#### Statut Système T4G

```bash
curl "https://t4g.dazno.de/api/v1/token4good/admin/system/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse inclut :**
- Santé du système
- Nombre total d'utilisateurs
- Nombre de transactions
- Services actifs
- Distribution des niveaux
- Économie des tokens

---

## ⚡ Endpoints Lightning/Bitcoin pour Token4Good

Token4Good inclut une intégration complète avec Lightning Network pour permettre les paiements Bitcoin dans l'écosystème T4G.

### 💳 Créer une Facture Lightning

```bash
curl -X POST "https://t4g.dazno.de/api/v1/token4good/lightning/invoice/create" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "memo": "Paiement service Token4Good",
    "expiry": 3600
  }'
```

**Réponse :**
```json
{
  "status": "success",
  "payment_request": "lnbc500u1p...",
  "payment_hash": "abc123...",
  "checking_id": "check_xyz",
  "amount": 50000,
  "memo": "Paiement service Token4Good",
  "expiry": 3600
}
```

### 💰 Solde Lightning

```bash
curl "https://t4g.dazno.de/api/v1/token4good/lightning/balance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse :**
```json
{
  "status": "success",
  "balance_sats": 125000,
  "balance_msats": 125000000,
  "wallet_id": "wallet_t4g_001",
  "wallet_name": "Token4Good Wallet"
}
```

### 💸 Payer une Facture Lightning

```bash
curl -X POST "https://t4g.dazno.de/api/v1/token4good/lightning/invoice/pay" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bolt11": "lnbc500u1p..."
  }'
```

### ✅ Vérifier un Paiement

```bash
curl "https://t4g.dazno.de/api/v1/token4good/lightning/invoice/check/abc123..." \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse :**
```json
{
  "status": "success",
  "payment_hash": "abc123...",
  "paid": true,
  "details": {
    "amount": 50000,
    "status": "paid",
    "timestamp": "2025-01-10T16:00:00Z"
  }
}
```

### 🌐 Informations Nœud Lightning

```bash
curl "https://t4g.dazno.de/api/v1/token4good/lightning/node/info" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 🔗 Canaux Lightning

```bash
curl "https://t4g.dazno.de/api/v1/token4good/lightning/channels" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 📊 Statut Lightning

```bash
curl "https://t4g.dazno.de/api/v1/token4good/lightning/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💻 Exemples de Code

### Python - Client T4G

```python
import requests
from typing import Optional, Dict, List

class T4GClient:
    """Client Python pour l'API Token4Good"""
    
    def __init__(self, base_url: str = "https://t4g.dazno.de", token: str = None):
        self.base_url = base_url
        self.token = token
        self.headers = {
            "Content-Type": "application/json"
        }
        if token:
            self.headers["Authorization"] = f"Bearer {token}"
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Méthode générique pour les requêtes"""
        url = f"{self.base_url}{endpoint}"
        response = requests.request(method, url, headers=self.headers, **kwargs)
        response.raise_for_status()
        return response.json()
    
    # Utilisateurs
    def create_user(self, user_id: str, username: str, email: str, skills: List[str] = None):
        return self._request("POST", "/api/v1/token4good/users", json={
            "user_id": user_id,
            "username": username,
            "email": email,
            "skills": skills or []
        })
    
    def get_user(self, user_id: str):
        return self._request("GET", f"/api/v1/token4good/users/{user_id}")
    
    def get_user_balance(self, user_id: str):
        return self._request("GET", f"/api/v1/token4good/tokens/{user_id}/balance")
    
    # Tokens
    def award_tokens(self, user_id: str, action_type: str, tokens: int, description: str):
        return self._request("POST", "/api/v1/token4good/tokens/award", json={
            "user_id": user_id,
            "action_type": action_type,
            "tokens": tokens,
            "description": description
        })
    
    # Mentoring
    def create_mentoring_session(self, mentor_id: str, mentee_id: str, topic: str, category: str, duration: int):
        return self._request("POST", "/api/v1/token4good/mentoring/sessions", json={
            "mentor_id": mentor_id,
            "mentee_id": mentee_id,
            "topic": topic,
            "category": category,
            "duration_minutes": duration
        })
    
    # Marketplace
    def search_services(self, category: str = None, max_cost: int = None, tags: List[str] = None):
        return self._request("POST", "/api/v1/token4good/marketplace/search", json={
            "category": category,
            "max_cost": max_cost,
            "tags": tags
        })
    
    # Lightning
    def create_lightning_invoice(self, amount: int, memo: str = ""):
        return self._request("POST", "/api/v1/token4good/lightning/invoice/create", json={
            "amount": amount,
            "memo": memo
        })
    
    def get_lightning_balance(self):
        return self._request("GET", "/api/v1/token4good/lightning/balance")

# Utilisation
client = T4GClient(token="votre_jwt_token")

# Créer un utilisateur
user = client.create_user("user_001", "john_doe", "john@example.com", ["lightning"])

# Attribuer des tokens
transaction = client.award_tokens("user_001", "mentoring", 50, "Session Lightning")

# Créer une facture Lightning
invoice = client.create_lightning_invoice(50000, "Paiement service T4G")
```

### JavaScript/TypeScript

```typescript
class T4GClient {
  private baseUrl: string;
  private token: string | null;
  
  constructor(baseUrl: string = "https://t4g.dazno.de", token?: string) {
    this.baseUrl = baseUrl;
    this.token = token || null;
  }
  
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Utilisateurs
  async createUser(userId: string, username: string, email: string, skills: string[] = []) {
    return this.request("/api/v1/token4good/users", {
      method: "POST",
      body: { user_id: userId, username, email, skills },
    });
  }
  
  async getUser(userId: string) {
    return this.request(`/api/v1/token4good/users/${userId}`);
  }
  
  async getUserBalance(userId: string) {
    return this.request(`/api/v1/token4good/tokens/${userId}/balance`);
  }
  
  // Tokens
  async awardTokens(userId: string, actionType: string, tokens: number, description: string) {
    return this.request("/api/v1/token4good/tokens/award", {
      method: "POST",
      body: {
        user_id: userId,
        action_type: actionType,
        tokens,
        description,
      },
    });
  }
  
  // Lightning
  async createLightningInvoice(amount: number, memo: string = "") {
    return this.request("/api/v1/token4good/lightning/invoice/create", {
      method: "POST",
      body: { amount, memo },
    });
  }
  
  async getLightningBalance() {
    return this.request("/api/v1/token4good/lightning/balance");
  }
}

// Utilisation
const client = new T4GClient("https://t4g.dazno.de", "votre_jwt_token");
const user = await client.createUser("user_001", "john_doe", "john@example.com");
const balance = await client.getUserBalance("user_001");
```

---

## 📖 Cas d'Usage Pratiques

### Cas 1 : Parcours Utilisateur Complet

```python
client = T4GClient(token="YOUR_TOKEN")

# 1. Créer un profil utilisateur
user = client.create_user(
    user_id="new_user_001",
    username="alice_bitcoin",
    email="alice@example.com",
    skills=["lightning-network"]
)

# 2. Consulter le solde initial
balance = client.get_user_balance("new_user_001")
print(f"Solde initial: {balance['available_balance']} T4G")

# 3. Attribuer des tokens pour première action
transaction = client.award_tokens(
    user_id="new_user_001",
    action_type="parrainage",
    tokens=30,
    description="Parrainage d'un nouveau membre"
)

# 4. Rechercher des opportunités
opportunities = client._request(
    "GET",
    "/api/v1/token4good/users/new_user_001/opportunities"
)

# 5. Créer une session de mentoring
session = client.create_mentoring_session(
    mentor_id="mentor_001",
    mentee_id="new_user_001",
    topic="Introduction à Lightning Network",
    category="lightning_network",
    duration=60
)

# 6. Compléter la session
client._request(
    "POST",
    "/api/v1/token4good/mentoring/sessions/complete",
    json={
        "session_id": session["id"],
        "feedback": {
            "rating": 5,
            "comments": "Excellente introduction!"
        }
    }
)
```

### Cas 2 : Marketplace de Services

```python
client = T4GClient(token="YOUR_TOKEN")

# 1. Créer un service en tant que provider
service = client._request(
    "POST",
    "/api/v1/token4good/marketplace/services",
    json={
        "provider_id": "provider_001",
        "name": "Audit Lightning Node",
        "description": "Analyse complète et recommandations",
        "category": "technical_excellence",
        "token_cost": 280,
        "estimated_duration": "3h",
        "tags": ["lightning", "audit", "expert"]
    }
)

# 2. Rechercher des services
services = client.search_services(
    category="technical_excellence",
    max_cost=300,
    tags=["lightning"]
)

# 3. Réserver un service en tant que client
booking = client._request(
    "POST",
    "/api/v1/token4good/marketplace/book",
    json={
        "client_id": "client_001",
        "service_id": service["id"],
        "scheduled_at": "2025-01-15T14:00:00Z"
    }
)

# 4. Compléter la réservation
client._request(
    "POST",
    "/api/v1/token4good/marketplace/bookings/complete",
    json={
        "booking_id": booking["id"],
        "feedback": {
            "rating": 5,
            "comments": "Service excellent!"
        }
    }
)
```

### Cas 3 : Intégration Lightning Network

```python
client = T4GClient(token="YOUR_TOKEN")

# 1. Créer une facture Lightning pour recevoir des paiements
invoice = client.create_lightning_invoice(
    amount=50000,  # 50000 sats
    memo="Paiement service Token4Good - Audit Lightning"
)

print(f"Facture: {invoice['payment_request']}")

# 2. Vérifier le statut du paiement
status = client._request(
    "GET",
    f"/api/v1/token4good/lightning/invoice/check/{invoice['payment_hash']}"
)

if status["paid"]:
    print("Paiement reçu avec succès!")
    
    # 3. Vérifier le nouveau solde
    balance = client.get_lightning_balance()
    print(f"Solde Lightning: {balance['balance_sats']} sats")
```

### Cas 4 : Système de Récompenses Automatisé

```python
import schedule
import time

def process_weekly_rewards():
    """Traite les récompenses hebdomadaires"""
    client = T4GClient(token="YOUR_TOKEN")
    
    # Déclencher les bonus hebdomadaires
    result = client._request(
        "POST",
        "/api/v1/token4good/admin/rewards/weekly-bonuses"
    )
    
    print(f"Bonus attribués: {len(result.get('bonuses_awarded', []))}")
    
    # Obtenir le statut système
    status = client._request(
        "GET",
        "/api/v1/token4good/admin/system/status"
    )
    
    print(f"Utilisateurs: {status['total_users']}")
    print(f"Tokens en circulation: {status['token_economy']['in_circulation']}")

# Exécuter tous les lundis à 2h du matin
schedule.every().monday.at("02:00").do(process_weekly_rewards)

while True:
    schedule.run_pending()
    time.sleep(60)
```

---

## 🚨 Gestion d'Erreurs

### Codes de Statut HTTP

| Code | Signification | Action Recommandée |
|------|---------------|-------------------|
| `200` | Succès | Traiter la réponse normalement |
| `201` | Créé | Ressource créée avec succès |
| `400` | Requête invalide | Vérifier les paramètres |
| `401` | Non authentifié | Vérifier le token JWT |
| `403` | Interdit | Vérifier les permissions |
| `404` | Non trouvé | Vérifier l'ID de la ressource |
| `429` | Trop de requêtes | Réduire la fréquence |
| `500` | Erreur serveur | Contacter le support |

### Format des Erreurs

```json
{
  "detail": "Message d'erreur descriptif",
  "error": {
    "type": "ValidationError",
    "field": "user_id",
    "message": "User ID requis"
  }
}
```

### Gestion d'Erreurs en Python

```python
from requests.exceptions import HTTPError

try:
    response = client.get_user("invalid_user")
except HTTPError as e:
    if e.response.status_code == 401:
        print("Token expiré, renouveler l'authentification")
    elif e.response.status_code == 404:
        print("Utilisateur non trouvé")
    elif e.response.status_code == 429:
        print("Rate limit atteint, attendre avant de réessayer")
        time.sleep(60)
    else:
        error_data = e.response.json()
        print(f"Erreur: {error_data.get('detail', 'Erreur inconnue')}")
```

---

## ✅ Best Practices

### 1. Authentification

✅ **DO**
- Utiliser le même token JWT que pour l'API MCP principale
- Renouveler le token avant expiration
- Utiliser HTTPS uniquement en production

❌ **DON'T**
- Exposer le token dans le code source
- Partager le token entre environnements

### 2. Gestion des Tokens T4G

✅ **DO**
- Vérifier le solde avant d'effectuer des transactions
- Implémenter une logique de retry pour les paiements
- Logger toutes les transactions importantes

❌ **DON'T**
- Faire confiance aux balances côté client uniquement
- Ignorer les confirmations de transactions

### 3. Marketplace

✅ **DO**
- Vérifier la disponibilité avant de réserver
- Gérer les annulations proprement
- Collecter et analyser les feedbacks

❌ **DON'T**
- Réserver sans vérifier le solde
- Ignorer les notes et avis des services

### 4. Lightning Network

✅ **DO**
- Vérifier le statut des paiements régulièrement
- Gérer les timeouts de factures
- Monitorer les canaux Lightning

❌ **DON'T**
- Supposer qu'un paiement est instantané
- Ignorer les erreurs de routage

---

## ❓ FAQ

### Q: Quelle est la différence entre t4g.dazno.de et api.dazno.de ?

**R:** `t4g.dazno.de` est un proxy/alias spécifique pour Token4Good qui redirige vers `api.dazno.de`. Les deux URLs fonctionnent pour accéder aux endpoints T4G, mais `t4g.dazno.de` est optimisé pour l'application Token4Good frontend.

### Q: Comment obtenir des tokens T4G ?

**R:** Les tokens T4G sont gagnés en :
- Complétant des sessions de mentoring
- Faisant du code review
- Créant de la documentation
- Proposant du support technique
- Parrainant de nouveaux membres

### Q: Les tokens T4G peuvent-ils être échangés contre de l'argent ?

**R:** Non, les tokens T4G sont une économie fermée communautaire. Ils ne peuvent être échangés que contre des services dans la marketplace Token4Good.

### Q: Comment fonctionne l'intégration Lightning Network ?

**R:** Token4Good peut créer des factures Lightning pour recevoir des paiements Bitcoin, permettant des transactions hybrides : tokens T4G + Bitcoin Lightning.

### Q: Quelle est la durée de vie d'un token JWT ?

**R:** Les tokens JWT ont une durée de vie de 24 heures par défaut. Vérifiez le champ `exp` dans le payload JWT.

### Q: Comment gérer les niveaux d'utilisateurs ?

**R:** Les niveaux sont automatiques basés sur les tokens gagnés :
- **Contributeur**: 0-500 T4G
- **Mentor**: 500-1500 T4G
- **Expert**: 1500+ T4G

### Q: Y a-t-il des limites de taux pour l'API T4G ?

**R:** Oui, les mêmes limites que l'API MCP principale. En cas de dépassement (code 429), implémentez un backoff exponentiel.

---

## 🏆 Système de Niveaux T4G

### 🎯 Contributeur (0-500 T4G)
- Accès aux services de base
- Peut participer aux sessions de mentoring
- Peut recevoir des tokens

### 🎓 Mentor (500-1500 T4G)
- Accès marketplace complète
- Bonus 10% sur tous les gains
- Peut créer des services personnalisés
- Priorité sur les réservations

### ⭐ Expert (1500+ T4G)
- Services premium exclusifs
- Priorité support
- Influence sur les décisions communautaires
- Leadership et reconnaissance

---

## 📞 Support & Contact

- **Email Support**: support@dazno.de
- **Website**: https://dazno.de
- **Documentation Technique**: Cette documentation
- **T4G Dashboard**: https://t4g.dazno.de
- **Issues Techniques**: Contactez l'équipe DevOps dazno.de

---

**Document Version**: 1.0  
**Last Updated**: 7 janvier 2025  
**Maintained by**: Équipe Token4Good dazno.de

---

## 🔗 Références

- **Documentation API MCP principale**: [_SPECS/api-pour-daznode.md](mdc:_SPECS/api-pour-daznode.md)
- **Documentation utilisateur T4G**: [docs/token4good/README.md](mdc:docs/token4good/README.md)
- **Référence API complète**: [docs/token4good/api-reference.md](mdc:docs/token4good/api-reference.md)
- **Endpoints production**: [.cursor/rules/api-endpoints-production.mdc](mdc:.cursor/rules/api-endpoints-production.mdc)

