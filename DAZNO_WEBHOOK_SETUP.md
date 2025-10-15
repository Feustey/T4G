# Configuration Webhook Dazno → Token4Good

## 📋 Vue d'ensemble

Cette documentation explique comment configurer les webhooks entre **Dazno** et **Token4Good** pour synchroniser les événements en temps réel.

---

## 1. 🔑 Clés à Obtenir

L'équipe Token4Good doit fournir à Dazno :

- **`T4G_API_KEY`** : Clé API pour authentifier les requêtes Dazno
- **`T4G_WEBHOOK_SECRET`** : Secret partagé pour signer les webhooks (HMAC-SHA256)

### Génération des Clés

```bash
# Générer T4G_API_KEY (32 caractères aléatoires)
openssl rand -hex 32

# Générer T4G_WEBHOOK_SECRET (64 caractères)
openssl rand -hex 64
```

---

## 2. 📍 Configuration du Webhook

### URL du Webhook

```
URL: https://t4g.dazno.de/api/webhooks/dazno
Méthode: POST
Content-Type: application/json
```

### Headers Requis

```http
x-api-key: <T4G_API_KEY>
x-t4g-signature: sha256=<HMAC_SHA256_SIGNATURE>
Content-Type: application/json
```

---

## 3. 🔐 Calcul de la Signature HMAC

La signature doit être calculée avec **HMAC-SHA256** sur le corps JSON du webhook.

### Exemple Node.js

```javascript
const crypto = require('crypto');

function signWebhook(payload, secret) {
  const payloadString = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadString);
  return 'sha256=' + hmac.digest('hex');
}

// Exemple d'utilisation
const payload = {
  id: "webhook_123",
  timestamp: "2025-10-15T10:30:00Z",
  source: "dazno.de",
  event_type: "lightning.payment_received",
  user_id: "user_abc",
  amount_msat: 10000,
  payment_hash: "abc123..."
};

const signature = signWebhook(payload, process.env.T4G_WEBHOOK_SECRET);
// Envoyer avec header: x-t4g-signature: sha256=<signature>
```

### Exemple Python

```python
import hmac
import hashlib
import json

def sign_webhook(payload: dict, secret: str) -> str:
    payload_string = json.dumps(payload, separators=(',', ':'))
    signature = hmac.new(
        secret.encode('utf-8'),
        payload_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return f"sha256={signature}"
```

### Exemple Rust

```rust
use hmac::{Hmac, Mac};
use sha2::Sha256;
type HmacSha256 = Hmac<Sha256>;

fn sign_webhook(payload: &str, secret: &str) -> String {
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
        .expect("HMAC can take key of any size");
    mac.update(payload.as_bytes());
    let result = mac.finalize();
    format!("sha256={}", hex::encode(result.into_bytes()))
}
```

---

## 4. 📦 Format du Payload

Tous les webhooks incluent ces champs de base :

```json
{
  "id": "webhook_unique_id",
  "timestamp": "2025-10-15T10:30:00Z",
  "source": "dazno.de",
  "event_type": "<TYPE>",
  ...
}
```

### Types d'Événements Supportés

#### 4.1. `user.created` - Création d'utilisateur

```json
{
  "id": "webhook_001",
  "timestamp": "2025-10-15T10:30:00Z",
  "source": "dazno.de",
  "event_type": "user.created",
  "user_id": "user_123",
  "email": "user@example.com"
}
```

**Utilisation** : Synchroniser un nouvel utilisateur Dazno dans Token4Good.

---

#### 4.2. `user.updated` - Mise à jour utilisateur

```json
{
  "id": "webhook_002",
  "timestamp": "2025-10-15T10:35:00Z",
  "source": "dazno.de",
  "event_type": "user.updated",
  "user_id": "user_123"
}
```

**Utilisation** : Rafraîchir les données utilisateur côté Token4Good.

---

#### 4.3. `lightning.payment_received` - Paiement Lightning reçu

```json
{
  "id": "webhook_003",
  "timestamp": "2025-10-15T10:40:00Z",
  "source": "dazno.de",
  "event_type": "lightning.payment_received",
  "user_id": "user_123",
  "amount_msat": 10000,
  "payment_hash": "abc123def456..."
}
```

**Utilisation** : Enregistrer un paiement entrant Lightning pour un utilisateur.

---

#### 4.4. `lightning.payment_sent` - Paiement Lightning envoyé

```json
{
  "id": "webhook_004",
  "timestamp": "2025-10-15T10:45:00Z",
  "source": "dazno.de",
  "event_type": "lightning.payment_sent",
  "user_id": "user_123",
  "amount_msat": 5000,
  "payment_hash": "def456abc789..."
}
```

**Utilisation** : Enregistrer un paiement sortant Lightning.

---

#### 4.5. `t4g.balance_updated` - Solde T4G mis à jour

```json
{
  "id": "webhook_005",
  "timestamp": "2025-10-15T10:50:00Z",
  "source": "dazno.de",
  "event_type": "t4g.balance_updated",
  "user_id": "user_123",
  "new_balance": 3000
}
```

**Utilisation** : Synchroniser le solde de tokens T4G d'un utilisateur.

---

#### 4.6. `gamification.level_up` - Level up gamification

```json
{
  "id": "webhook_006",
  "timestamp": "2025-10-15T10:55:00Z",
  "source": "dazno.de",
  "event_type": "gamification.level_up",
  "user_id": "user_123",
  "new_level": 7,
  "points": 850
}
```

**Utilisation** : Enregistrer un changement de niveau de gamification.

---

## 5. ✅ Réponse Attendue

Token4Good répondra avec un JSON :

```json
{
  "received": true,
  "webhook_id": "webhook_123",
  "processed_at": "2025-10-15T10:30:05Z"
}
```

### Codes de Statut HTTP

| Code | Signification |
|------|---------------|
| **200 OK** | Webhook traité avec succès |
| **401 Unauthorized** | Signature invalide ou clé API manquante/incorrecte |
| **400 Bad Request** | Format du payload invalide |
| **500 Internal Server Error** | Erreur de traitement côté Token4Good |

---

## 6. 🧪 Tests

### Test avec cURL

```bash
# Configuration
API_URL="https://t4g.dazno.de/api/webhooks/dazno"
API_KEY="votre_api_key"
WEBHOOK_SECRET="votre_secret"

# Payload de test
PAYLOAD='{
  "id": "test_webhook_001",
  "timestamp": "2025-10-15T10:00:00Z",
  "source": "dazno.de",
  "event_type": "user.created",
  "user_id": "test_user_123",
  "email": "test@example.com"
}'

# Calculer la signature HMAC
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.* //')

# Envoyer le webhook
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-t4g-signature: sha256=$SIGNATURE" \
  -d "$PAYLOAD" \
  -v
```

### Test avec Postman

1. **URL** : `POST https://t4g.dazno.de/api/webhooks/dazno`
2. **Headers** :
   - `Content-Type: application/json`
   - `x-api-key: <T4G_API_KEY>`
   - `x-t4g-signature: sha256=<calculer_avec_script>`
3. **Body (raw JSON)** : Copier un payload d'exemple ci-dessus

---

## 7. 🔒 Sécurité

### Mesures de Sécurité Implémentées

- ✅ **Vérification HMAC obligatoire** : Chaque webhook doit être signé
- ✅ **API Key** : Header `x-api-key` requis pour authentifier Dazno
- ✅ **HTTPS uniquement** : Pas de webhooks en HTTP
- ✅ **Rate limiting** : 100 webhooks/minute maximum
- ✅ **Logs d'audit** : Tous les webhooks sont enregistrés

### Bonnes Pratiques

1. **Ne jamais exposer** `T4G_WEBHOOK_SECRET` dans les logs ou le code client
2. **Stocker les secrets** dans des variables d'environnement sécurisées
3. **Utiliser HTTPS** pour toutes les communications
4. **Implémenter un retry logic** avec exponential backoff

---

## 8. 🔄 Retry Logic Recommandé

En cas d'erreur `5xx` (serveur Token4Good indisponible), réessayer avec :

```
Tentative 1 : Immédiat
Tentative 2 : Après 5 secondes
Tentative 3 : Après 30 secondes
Tentative 4 : Après 5 minutes
Tentative 5 : Après 30 minutes
```

Si toutes les tentatives échouent, envoyer une alerte à l'équipe technique.

---

## 9. 📊 Monitoring

### Logs côté Dazno

- Enregistrer chaque webhook envoyé (ID, timestamp, event_type)
- Logger les erreurs de signature ou d'envoi
- Métriques : taux de succès, latence, erreurs

### Logs côté Token4Good

- Tous les webhooks reçus sont enregistrés
- Détails disponibles dans les logs du backend Rust : `tracing::info!`
- Métriques accessibles via `/api/metrics` (auth requise)

---

## 10. 📞 Support

### Contact Technique

- **Équipe Token4Good** : [contact technique]
- **Documentation API** : https://t4g.dazno.de/docs
- **Status Page** : https://status.token-for-good.com

### Variables d'Environnement à Partager

```bash
# À configurer côté Dazno
T4G_API_KEY=<fourni_par_token4good>
T4G_WEBHOOK_SECRET=<fourni_par_token4good>
T4G_WEBHOOK_URL=https://t4g.dazno.de/api/webhooks/dazno
```

---

## 11. ✅ Checklist de Mise en Production

**Côté Dazno** :

- [ ] Recevoir `T4G_API_KEY` de l'équipe Token4Good
- [ ] Recevoir `T4G_WEBHOOK_SECRET` de l'équipe Token4Good
- [ ] Stocker les secrets de manière sécurisée (vault, secrets manager)
- [ ] Implémenter le calcul de signature HMAC-SHA256
- [ ] Configurer l'URL webhook : `https://t4g.dazno.de/api/webhooks/dazno`
- [ ] Tester l'envoi d'un webhook de test
- [ ] Implémenter le retry logic avec exponential backoff
- [ ] Configurer le monitoring et les alertes
- [ ] Valider avec l'équipe Token4Good en staging
- [ ] Déployer en production

**Côté Token4Good** :

- [ ] Générer `T4G_API_KEY` et `T4G_WEBHOOK_SECRET`
- [ ] Partager les clés de manière sécurisée avec Dazno
- [ ] Déployer le backend avec le module webhook
- [ ] Tester la réception des webhooks en staging
- [ ] Configurer le monitoring des webhooks
- [ ] Valider en production

---

## 12. 📝 Exemples Complets

### Envoi d'un Webhook Complet (Node.js)

```javascript
const axios = require('axios');
const crypto = require('crypto');

async function sendWebhookToToken4Good(event) {
  const webhookUrl = process.env.T4G_WEBHOOK_URL;
  const apiKey = process.env.T4G_API_KEY;
  const webhookSecret = process.env.T4G_WEBHOOK_SECRET;

  // Construire le payload
  const payload = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    source: "dazno.de",
    ...event
  };

  // Calculer la signature
  const payloadString = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(payloadString);
  const signature = 'sha256=' + hmac.digest('hex');

  try {
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-t4g-signature': signature
      },
      timeout: 10000 // 10 secondes
    });

    console.log(`Webhook envoyé avec succès: ${response.data.webhook_id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur envoi webhook:', error.message);
    throw error;
  }
}

// Exemple d'utilisation
const event = {
  event_type: "lightning.payment_received",
  user_id: "user_123",
  amount_msat: 50000,
  payment_hash: "abc123def456"
};

sendWebhookToToken4Good(event);
```

---

Cette documentation couvre tous les aspects de l'intégration webhook. Pour toute question, contactez l'équipe technique Token4Good. 🚀

