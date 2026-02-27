# 📨 Package pour l'Équipe Dazno - Configuration Webhook

**Date** : 15 octobre 2025  
**De** : Équipe Token4Good  
**À** : Équipe Technique Dazno

---

## 🎯 Objectif

Mettre en place l'intégration webhook permettant à **Dazno.de** d'envoyer des événements en temps réel à **Token4Good** (app.token-for-good.com).

---

## 🔑 1. Vos Clés d'Authentification

**⚠️ À recevoir de manière sécurisée (1Password / Vault / Signal)**

```bash
# Clé API pour authentifier vos requêtes
T4G_API_KEY=<sera_fourni_séparément>

# Secret partagé pour signer les webhooks
T4G_WEBHOOK_SECRET=<sera_fourni_séparément>
```

**Stockage** :
- Variables d'environnement sécurisées
- Ne JAMAIS commiter dans Git
- Accès restreint à l'équipe technique

---

## 📍 2. URL du Webhook

### Token4Good → Dazno

```
URL : https://token-for-good.com/api/webhooks/t4g
Méthode : POST
Content-Type : application/json
```

### Dazno → Token4Good

```
URL : https://app.token-for-good.com/api/webhooks/dazno
Méthode : POST
Content-Type : application/json
```

---

## 🔐 3. Headers Requis

Chaque requête webhook doit inclure :

```http
Content-Type: application/json
x-api-key: <T4G_API_KEY>
x-t4g-signature: sha256=<HMAC_SHA256_SIGNATURE>
```

### Calcul de la Signature HMAC-SHA256

La signature doit être calculée sur le **corps JSON complet** du webhook.

#### Exemple Node.js

```javascript
const crypto = require('crypto');

function signWebhook(payload, secret) {
  const payloadString = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadString);
  return 'sha256=' + hmac.digest('hex');
}

// Utilisation
const signature = signWebhook(payload, process.env.T4G_WEBHOOK_SECRET);
// Header : x-t4g-signature: sha256=abc123...
```

#### Exemple Python

```python
import hmac
import hashlib
import json

def sign_webhook(payload: dict, secret: str) -> str:
    payload_str = json.dumps(payload, separators=(',', ':'))
    signature = hmac.new(
        secret.encode(),
        payload_str.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"sha256={signature}"
```

---

## 📦 4. Format du Payload

### Structure de Base

Tous les webhooks doivent inclure :

```json
{
  "id": "webhook_unique_id",
  "timestamp": "2025-10-15T10:30:00Z",
  "source": "token-for-good.com",
  "event_type": "<TYPE>",
  ...
}
```

### Types d'Événements Supportés

#### 4.1. Création d'Utilisateur

```json
{
  "id": "webhook_001",
  "timestamp": "2025-10-15T10:30:00Z",
  "source": "token-for-good.com",
  "event_type": "user.created",
  "user_id": "user_123",
  "email": "user@example.com"
}
```

#### 4.2. Mise à Jour Utilisateur

```json
{
  "id": "webhook_002",
  "timestamp": "2025-10-15T10:35:00Z",
  "source": "token-for-good.com",
  "event_type": "user.updated",
  "user_id": "user_123"
}
```

#### 4.3. Paiement Lightning Reçu

```json
{
  "id": "webhook_003",
  "timestamp": "2025-10-15T10:40:00Z",
  "source": "token-for-good.com",
  "event_type": "lightning.payment_received",
  "user_id": "user_123",
  "amount_msat": 10000,
  "payment_hash": "abc123def456"
}
```

#### 4.4. Paiement Lightning Envoyé

```json
{
  "id": "webhook_004",
  "timestamp": "2025-10-15T10:45:00Z",
  "source": "token-for-good.com",
  "event_type": "lightning.payment_sent",
  "user_id": "user_123",
  "amount_msat": 5000,
  "payment_hash": "def456abc789"
}
```

#### 4.5. Solde T4G Mis à Jour

```json
{
  "id": "webhook_005",
  "timestamp": "2025-10-15T10:50:00Z",
  "source": "token-for-good.com",
  "event_type": "t4g.balance_updated",
  "user_id": "user_123",
  "new_balance": 3000
}
```

#### 4.6. Level Up Gamification

```json
{
  "id": "webhook_006",
  "timestamp": "2025-10-15T10:55:00Z",
  "source": "token-for-good.com",
  "event_type": "gamification.level_up",
  "user_id": "user_123",
  "new_level": 7,
  "points": 850
}
```

---

## ✅ 5. Réponses Attendues

### Succès (200 OK)

```json
{
  "received": true,
  "webhook_id": "webhook_123",
  "processed_at": "2025-10-15T10:30:05Z"
}
```

### Erreurs

| Code | Signification | Action |
|------|---------------|--------|
| **401** | API Key invalide ou signature incorrecte | Vérifier clés et calcul HMAC |
| **400** | Format JSON invalide | Vérifier structure du payload |
| **500** | Erreur serveur Token4Good | Réessayer avec backoff |

---

## 🔄 6. Retry Logic Recommandé

En cas d'erreur `5xx`, réessayer avec exponential backoff :

```
Tentative 1 : Immédiat
Tentative 2 : 5 secondes
Tentative 3 : 30 secondes
Tentative 4 : 5 minutes
Tentative 5 : 30 minutes
```

---

## 🧪 7. Tests

### Commande cURL de Test

```bash
# Configuration
API_URL="https://app.token-for-good.com/api/webhooks/dazno"
API_KEY="<votre_T4G_API_KEY>"
WEBHOOK_SECRET="<votre_T4G_WEBHOOK_SECRET>"

# Payload
PAYLOAD='{"id":"test_001","timestamp":"2025-10-15T10:00:00Z","source":"token-for-good.com","event_type":"user.created","user_id":"test","email":"test@test.com"}'

# Signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.* //')

# Envoi
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-t4g-signature: sha256=$SIGNATURE" \
  -d "$PAYLOAD" \
  -v
```

### Résultat Attendu

```
< HTTP/2 200
< content-type: application/json
{
  "received": true,
  "webhook_id": "test_001",
  "processed_at": "2025-10-15T10:00:05Z"
}
```

---

## 🔒 8. Sécurité

### Points Critiques

1. **Ne jamais exposer** les clés dans les logs ou le code client
2. **Toujours calculer** la signature HMAC côté serveur
3. **Utiliser HTTPS** uniquement
4. **Rate limiting** : Maximum 100 webhooks/minute

### Bonnes Pratiques

- Stocker les clés dans un vault sécurisé (Vault, AWS Secrets Manager, etc.)
- Monitorer les tentatives d'envoi échouées
- Logger les webhooks envoyés pour audit

---

## 📊 9. Monitoring

### Métriques à Tracker

- Nombre de webhooks envoyés par type
- Taux de succès / échec
- Latence de réponse Token4Good
- Retry nécessaires

### Logs Recommandés

```javascript
// Exemple
console.log({
  timestamp: new Date().toISOString(),
  webhook_id: payload.id,
  event_type: payload.event_type,
  status: response.status,
  latency_ms: responseTime
});
```

---

## ✅ 10. Checklist d'Implémentation

### Phase 1 : Configuration

- [ ] Recevoir `T4G_API_KEY` et `T4G_WEBHOOK_SECRET` de manière sécurisée
- [ ] Stocker les clés dans votre système de gestion de secrets
- [ ] Configurer l'URL : `https://app.token-for-good.com/api/webhooks/dazno`

### Phase 2 : Développement

- [ ] Implémenter le calcul de signature HMAC-SHA256
- [ ] Implémenter l'envoi de webhooks avec headers requis
- [ ] Implémenter le retry logic avec exponential backoff
- [ ] Ajouter des logs détaillés

### Phase 3 : Tests

- [ ] Tester avec la commande cURL fournie
- [ ] Tester tous les types d'événements
- [ ] Tester les scénarios d'erreur (401, 500)
- [ ] Valider le retry logic

### Phase 4 : Staging

- [ ] Déployer sur staging
- [ ] Envoyer un webhook de test depuis staging
- [ ] Coordonner avec Token4Good pour validation
- [ ] Monitorer les logs pendant 24h

### Phase 5 : Production

- [ ] Déployer en production
- [ ] Envoyer un webhook de test en production
- [ ] Activer le monitoring
- [ ] Valider avec Token4Good

---

## 📞 11. Support & Contacts

### Contacts Token4Good

- **Technique** : [équipe backend Token4Good]
- **DevOps** : [équipe infra Token4Good]

### Documentation Complète

Nous vous fournissons également :

- `DAZNO_WEBHOOK_SETUP.md` - Documentation technique détaillée
- `DAZNO_WEBHOOK_QUICKSTART.md` - Guide de démarrage rapide
- Exemples de code dans 3 langages (Node.js, Python, Rust)

### Questions Fréquentes

**Q: Comment tester localement avant la production ?**  
R: Utilisez ngrok ou un tunnel similaire pour exposer votre localhost, puis testez avec notre script.

**Q: Que faire si notre rate dépasse 100 webhooks/minute ?**  
R: Contactez-nous pour augmenter la limite ou implémentez un système de queue.

**Q: Les webhooks sont-ils idempotents ?**  
R: Oui, vous pouvez renvoyer le même webhook (même `id`) sans effet de bord.

---

## 📅 12. Timeline Suggérée

| Jour | Action |
|------|--------|
| **J+0** | Réception des clés et début de l'implémentation |
| **J+2** | Tests locaux complétés |
| **J+3** | Déploiement staging + tests conjoints |
| **J+5** | Validation finale et go/no-go |
| **J+7** | Déploiement production |
| **J+8-14** | Monitoring intensif |

---

## 🎯 13. Critères de Succès

L'intégration est considérée réussie quand :

- ✅ Tous les types d'événements sont envoyés correctement
- ✅ Le taux de succès est > 99%
- ✅ La latence moyenne est < 500ms
- ✅ Le retry logic fonctionne correctement
- ✅ Aucune signature invalide détectée

---

## 🚀 On est prêts !

L'infrastructure côté Token4Good est **100% opérationnelle**. Nous attendons votre implémentation pour activer l'intégration complète !

**N'hésitez pas à nous contacter** pour toute question ou pour coordonner les tests.

---

**Équipe Token4Good** 🎉

