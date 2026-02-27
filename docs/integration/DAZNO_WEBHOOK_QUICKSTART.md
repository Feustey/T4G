# 🚀 Quick Start - Webhooks Dazno ↔ Token4Good

## Pour l'équipe Token4Good

### 1. Générer les clés

```bash
# Générer T4G_API_KEY
openssl rand -hex 32

# Générer T4G_WEBHOOK_SECRET
openssl rand -hex 64
```

### 2. Configurer l'environnement

Ajoutez dans votre `.env` (backend) :

```bash
T4G_API_KEY=<votre_clé_générée>
T4G_WEBHOOK_SECRET=<votre_secret_généré>
```

### 3. Partager les clés avec Dazno

**De manière sécurisée** (pas par email non chiffré !) :
- Utiliser un gestionnaire de secrets (1Password, Vault, etc.)
- Ou via Signal/WhatsApp chiffré

Partager :
- `T4G_API_KEY`
- `T4G_WEBHOOK_SECRET`
- URL webhook : `https://app.token-for-good.com/api/webhooks/dazno`

### 4. Tester localement

```bash
# Démarrer le backend
cd token4good-backend
cargo run

# Dans un autre terminal, tester le webhook
cd token4good-backend/scripts
./test-webhook.sh
```

### 5. Vérifier les logs

Les webhooks apparaîtront dans les logs du backend :

```
INFO Webhook signature vérifiée avec succès
INFO Traitement webhook test_webhook_001 depuis token-for-good.com
INFO Utilisateur Dazno créé: test_user_123 (test@example.com)
```

---

## Pour l'équipe Dazno

### 1. Recevoir les clés de Token4Good

Vous recevrez :
- `T4G_API_KEY`
- `T4G_WEBHOOK_SECRET`

### 2. Configurer votre environnement

```bash
T4G_API_KEY=<reçu_de_token4good>
T4G_WEBHOOK_SECRET=<reçu_de_token4good>
T4G_WEBHOOK_URL=https://app.token-for-good.com/api/webhooks/dazno
```

### 3. Implémenter l'envoi de webhook

Exemple Node.js :

```javascript
const crypto = require('crypto');
const axios = require('axios');

async function sendWebhook(event) {
  const payload = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    source: "token-for-good.com",
    ...event
  };
  
  // Signature HMAC
  const payloadString = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', process.env.T4G_WEBHOOK_SECRET);
  hmac.update(payloadString);
  const signature = 'sha256=' + hmac.digest('hex');
  
  // Envoi
  await axios.post(process.env.T4G_WEBHOOK_URL, payload, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.T4G_API_KEY,
      'x-t4g-signature': signature
    }
  });
}

// Exemple d'utilisation
sendWebhook({
  event_type: "lightning.payment_received",
  user_id: "user_123",
  amount_msat: 50000,
  payment_hash: "abc123"
});
```

### 4. Tester

```bash
# Test avec curl
curl -X POST https://app.token-for-good.com/api/webhooks/dazno \
  -H "Content-Type: application/json" \
  -H "x-api-key: $T4G_API_KEY" \
  -H "x-t4g-signature: sha256=<calculer_signature>" \
  -d '{"id":"test","timestamp":"2025-10-15T10:00:00Z","source":"token-for-good.com","event_type":"user.created","user_id":"test","email":"test@test.com"}'
```

---

## 📚 Documentation Complète

Voir [DAZNO_WEBHOOK_SETUP.md](./DAZNO_WEBHOOK_SETUP.md) pour :
- Tous les types d'événements supportés
- Exemples détaillés dans différents langages
- Gestion des erreurs et retry logic
- Monitoring et sécurité

---

## ✅ Checklist Rapide

**Token4Good** :
- [ ] Générer les clés
- [ ] Configurer `.env`
- [ ] Partager les clés avec Dazno de manière sécurisée
- [ ] Tester localement
- [ ] Déployer en production

**Dazno** :
- [ ] Recevoir les clés
- [ ] Configurer l'environnement
- [ ] Implémenter l'envoi de webhooks
- [ ] Tester en local/staging
- [ ] Valider avec Token4Good
- [ ] Déployer en production

---

## 🆘 Problèmes Courants

### Erreur 401 Unauthorized

**Causes** :
- API Key incorrecte
- Signature HMAC invalide
- Format de signature incorrect (doit être `sha256=<hex>`)

**Solutions** :
- Vérifier que `T4G_API_KEY` est correcte
- Vérifier le calcul de la signature HMAC
- Tester avec le script fourni : `test-webhook.sh`

### Erreur 400 Bad Request

**Causes** :
- Format JSON invalide
- Champs requis manquants

**Solutions** :
- Valider le JSON avec un linter
- Vérifier que tous les champs requis sont présents

---

## 📞 Support

- Documentation : [DAZNO_WEBHOOK_SETUP.md](./DAZNO_WEBHOOK_SETUP.md)
- Contact : [équipe technique Token4Good]

