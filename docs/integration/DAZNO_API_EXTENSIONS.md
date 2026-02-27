# 🚀 Extensions API Dazno - Webhooks, LNURL & Multi-Wallets

**Date:** 13 novembre 2025  
**Version:** 2.0  
**Status:** ✅ Implémenté

---

## 📊 Vue d'Ensemble

Ce document décrit les nouvelles fonctionnalités ajoutées à l'intégration API Dazno pour Token4Good, incluant :

- **Webhooks** - Notifications temps réel pour les événements Lightning
- **LNURL** - Support complet LNURL-pay, LNURL-withdraw et LNURL-auth
- **Multi-Wallets** - Gestion de plusieurs portefeuilles Lightning par utilisateur

**Total nouveaux endpoints:** 15

---

## 🔔 Webhooks

### Configuration d'un Webhook

Configurez des webhooks pour recevoir des notifications temps réel sur les événements Lightning.

**Endpoint:** `POST /api/dazno/v1/webhook`

**Headers:**
```
Authorization: Bearer <jwt_token>
X-Dazno-Token: <dazno_token>
```

**Body:**
```json
{
  "webhook_url": "https://your-app.com/webhook",
  "events": [
    "payment.received",
    "payment.sent",
    "invoice.created",
    "invoice.paid",
    "invoice.expired"
  ]
}
```

**Response:**
```json
{
  "id": "webhook_abc123",
  "user_id": "user_001",
  "url": "https://your-app.com/webhook",
  "events": ["payment.received", "payment.sent"],
  "active": true,
  "created_at": "2025-11-13T10:00:00Z",
  "last_triggered": null
}
```

**Événements disponibles:**
- `payment.received` - Paiement reçu
- `payment.sent` - Paiement envoyé
- `invoice.created` - Facture créée
- `invoice.paid` - Facture payée
- `invoice.expired` - Facture expirée
- `channel.opened` - Canal ouvert
- `channel.closed` - Canal fermé

---

### Liste des Webhooks

**Endpoint:** `GET /api/dazno/v1/webhook/:user_id`

**Response:**
```json
[
  {
    "id": "webhook_abc123",
    "user_id": "user_001",
    "url": "https://your-app.com/webhook",
    "events": ["payment.received"],
    "active": true,
    "created_at": "2025-11-13T10:00:00Z",
    "last_triggered": "2025-11-13T12:30:00Z"
  }
]
```

---

### Supprimer un Webhook

**Endpoint:** `DELETE /api/dazno/v1/webhook/:webhook_id`

**Response:** `200 OK`

---

### Format des Événements Webhook

Lorsqu'un événement se produit, votre endpoint recevra un POST avec ce format :

```json
{
  "event_type": "payment.received",
  "timestamp": "2025-11-13T12:30:00Z",
  "data": {
    "payment_hash": "abc123...",
    "amount_msat": 50000,
    "description": "Paiement service T4G",
    "status": "paid"
  }
}
```

---

## 🔗 LNURL

### LNURL-pay (Paiements Simplifiés)

Créez des liens de paiement Lightning simplifiés avec QR code.

**Endpoint:** `POST /api/dazno/v1/lnurl/pay`

**Body:**
```json
{
  "min_sendable": 1000,
  "max_sendable": 100000,
  "metadata": "Paiement service Token4Good",
  "comment_allowed": 150
}
```

**Response:**
```json
{
  "lnurl": "LNURL1DP68GURN8GHJ7MRWW4EXCTNXD9SHG6NPVCHXXMMD9AKXUATJDSKHW6T5DPJ8YCTH8AEK2UMND9HKU0FHXGCNJV3JRQCNPVEMPJCMPWFSKVATZV3JRQCNPVEMPJCMPWFSKVATZV3JRQCNPVEMPJCMPWFSKVATZV3JRQCNPVEMPJCMPWFSKVATZV3JR5CT8",
  "callback": "https://api.token-for-good.com/lnurl/pay/callback/abc123",
  "min_sendable": 1000,
  "max_sendable": 100000,
  "metadata": "Paiement service Token4Good",
  "comment_allowed": 150,
  "tag": "payRequest"
}
```

**Usage:**
1. Générer le QR code depuis le champ `lnurl`
2. L'utilisateur scanne avec son wallet Lightning
3. Le wallet appelle automatiquement le `callback` pour générer la facture
4. Paiement effectué

---

### LNURL-withdraw (Retraits Simplifiés)

Créez des liens de retrait Lightning pour permettre aux utilisateurs de retirer des fonds facilement.

**Endpoint:** `POST /api/dazno/v1/lnurl/withdraw`

**Body:**
```json
{
  "min_withdrawable": 10000,
  "max_withdrawable": 500000,
  "default_description": "Retrait gains Token4Good"
}
```

**Response:**
```json
{
  "lnurl": "LNURL1DP68GURN8GHJ7MRWW4EXCTNXD9SHG6NPVCHXXMMD9AKXUATJDSKHW...",
  "callback": "https://api.token-for-good.com/lnurl/withdraw/callback/xyz789",
  "k1": "secret_key_k1",
  "min_withdrawable": 10000,
  "max_withdrawable": 500000,
  "default_description": "Retrait gains Token4Good",
  "tag": "withdrawRequest"
}
```

**Usage:**
1. Afficher le QR code LNURL
2. L'utilisateur scanne avec son wallet
3. Le wallet demande une facture à l'utilisateur
4. Paiement automatique depuis votre wallet vers l'utilisateur

---

### LNURL-auth (Authentification Lightning)

Permettez aux utilisateurs de s'authentifier avec leur wallet Lightning.

**Endpoint:** `POST /api/dazno/v1/lnurl/auth`

**Body:**
```json
{
  "k1": "challenge_key",
  "sig": "signature_from_wallet",
  "key": "public_key_from_wallet"
}
```

**Response:**
```json
{
  "status": "OK",
  "reason": null,
  "event": "AUTHENTICATED"
}
```

**Flux d'authentification:**
1. Générer un challenge k1
2. Créer un QR code LNURL-auth
3. L'utilisateur scanne avec son wallet
4. Le wallet signe le challenge avec sa clé privée
5. Vérifier la signature avec cet endpoint
6. Authentifier l'utilisateur

---

## 💼 Multi-Wallets

### Créer un Wallet

**Endpoint:** `POST /api/dazno/v1/wallet`

**Body:**
```json
{
  "name": "Mon Wallet Principal"
}
```

**Response:**
```json
{
  "id": "wallet_abc123",
  "user_id": "user_001",
  "name": "Mon Wallet Principal",
  "balance_msat": 0,
  "created_at": "2025-11-13T10:00:00Z",
  "is_default": true
}
```

---

### Liste des Wallets

**Endpoint:** `GET /api/dazno/v1/wallet/list/:user_id`

**Response:**
```json
[
  {
    "id": "wallet_abc123",
    "user_id": "user_001",
    "name": "Wallet Principal",
    "balance_msat": 250000000,
    "created_at": "2025-11-01T10:00:00Z",
    "is_default": true
  },
  {
    "id": "wallet_def456",
    "user_id": "user_001",
    "name": "Wallet Services",
    "balance_msat": 100000000,
    "created_at": "2025-11-05T14:30:00Z",
    "is_default": false
  }
]
```

---

### Détails d'un Wallet

**Endpoint:** `GET /api/dazno/v1/wallet/:wallet_id`

**Response:**
```json
{
  "id": "wallet_abc123",
  "user_id": "user_001",
  "name": "Wallet Principal",
  "balance_msat": 250000000,
  "pending_msat": 50000000,
  "reserved_msat": 10000000,
  "total_received_msat": 1000000000,
  "total_sent_msat": 750000000,
  "total_invoices": 150,
  "total_payments": 87,
  "created_at": "2025-11-01T10:00:00Z",
  "updated_at": "2025-11-13T12:00:00Z",
  "is_default": true
}
```

---

### Supprimer un Wallet

**Endpoint:** `DELETE /api/dazno/v1/wallet/:wallet_id`

**Response:** `200 OK`

**Note:** Impossible de supprimer le wallet par défaut s'il contient des fonds.

---

### Invoices d'un Wallet

**Endpoint:** `GET /api/dazno/v1/wallet/:wallet_id/invoices?limit=50`

**Response:**
```json
[
  {
    "payment_request": "lnbc500u1p...",
    "payment_hash": "abc123...",
    "amount_msat": 50000,
    "description": "Paiement service",
    "expires_at": "2025-11-13T13:00:00Z",
    "status": "paid"
  }
]
```

---

### Paiements d'un Wallet

**Endpoint:** `GET /api/dazno/v1/wallet/:wallet_id/payments?limit=50`

**Response:**
```json
[
  {
    "payment_hash": "def456...",
    "payment_preimage": "xyz789...",
    "amount_msat": 30000,
    "fee_msat": 100,
    "status": "succeeded",
    "created_at": "2025-11-13T11:30:00Z"
  }
]
```

---

## 🔐 Authentification

Tous les endpoints nécessitent **deux tokens** :

1. **JWT Token** - Token Token4Good standard
   ```
   Authorization: Bearer <jwt_token>
   ```

2. **Dazno Token** - Token API Dazno
   ```
   X-Dazno-Token: <dazno_token>
   ```

---

## 📊 Exemples d'Utilisation

### Exemple 1: Notifications Temps Réel

```typescript
import { daznoAPI } from './services/daznoAPI';

// Configurer un webhook
const webhook = await daznoAPI.configureWebhook(
  'https://myapp.com/webhook',
  ['payment.received', 'invoice.paid']
);

console.log('Webhook configuré:', webhook.id);

// Handler du webhook côté serveur
app.post('/webhook', (req, res) => {
  const { event_type, data } = req.body;
  
  if (event_type === 'payment.received') {
    console.log('Paiement reçu:', data.amount_msat, 'msats');
    // Mettre à jour la base de données, envoyer notification, etc.
  }
  
  res.status(200).send('OK');
});
```

---

### Exemple 2: LNURL-pay pour Donations

```typescript
import { daznoAPI } from './services/daznoAPI';
import QRCode from 'qrcode';

// Créer un lien de paiement LNURL
const lnurl = await daznoAPI.createLnurlPay(
  1000,      // min: 1 sat
  1000000,   // max: 1000 sats
  'Donation pour Token4Good',
  150        // Commentaire jusqu'à 150 caractères
);

// Générer le QR code
const qrCodeUrl = await QRCode.toDataURL(lnurl.lnurl);

// Afficher dans l'UI
<img src={qrCodeUrl} alt="Scan pour payer" />
```

---

### Exemple 3: Multi-Wallets

```typescript
import { daznoAPI } from './services/daznoAPI';

// Créer des wallets séparés
const mainWallet = await daznoAPI.createWallet('Principal');
const savingsWallet = await daznoAPI.createWallet('Épargne');
const servicesWallet = await daznoAPI.createWallet('Services');

// Lister tous les wallets
const wallets = await daznoAPI.listWallets('user_001');

console.log(`Total wallets: ${wallets.length}`);
console.log(`Balance totale: ${wallets.reduce((sum, w) => sum + w.balance_msat, 0)} msats`);

// Obtenir détails d'un wallet
const details = await daznoAPI.getWalletDetails(mainWallet.id);

console.log(`Reçu: ${details.total_received_msat} msats`);
console.log(`Envoyé: ${details.total_sent_msat} msats`);
console.log(`Invoices: ${details.total_invoices}`);
```

---

## 🚨 Gestion d'Erreurs

### Codes d'Erreur HTTP

| Code | Signification | Action |
|------|---------------|--------|
| 200 | Succès | Continuer |
| 400 | Requête invalide | Vérifier les paramètres |
| 401 | Non authentifié | Vérifier les tokens |
| 403 | Accès interdit | Vérifier les permissions |
| 404 | Non trouvé | Vérifier les IDs |
| 500 | Erreur serveur | Réessayer plus tard |

### Exemple de Gestion d'Erreur

```typescript
try {
  const webhook = await daznoAPI.configureWebhook(url, events);
  console.log('Webhook créé:', webhook.id);
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Token expiré, reconnexion nécessaire');
  } else if (error.message.includes('400')) {
    console.error('URL webhook invalide');
  } else {
    console.error('Erreur:', error.message);
  }
}
```

---

## ✅ Best Practices

### Webhooks

✅ **DO:**
- Valider la signature des webhooks (si implémenté)
- Répondre rapidement (< 5s) avec 200 OK
- Traiter les événements de manière asynchrone
- Gérer les événements dupliqués (idempotence)
- Logger tous les événements reçus

❌ **DON'T:**
- Faire des traitements longs dans le handler
- Ignorer les erreurs de webhook
- Exposer votre endpoint sans validation

### LNURL

✅ **DO:**
- Vérifier les montants min/max
- Gérer les expirations de liens
- Afficher clairement les QR codes
- Tester avec plusieurs wallets

❌ **DON'T:**
- Réutiliser les mêmes LNURL
- Oublier les descriptions
- Ignorer les commentaires utilisateur

### Multi-Wallets

✅ **DO:**
- Afficher clairement quel wallet est utilisé
- Permettre la sélection du wallet
- Montrer les balances séparément
- Sauvegarder le wallet par défaut

❌ **DON'T:**
- Supprimer un wallet avec des fonds
- Confondre les wallets dans les transactions
- Oublier de vérifier les balances

---

## 📈 Métriques & Monitoring

### Endpoints à Monitorer

1. **Webhooks**
   - Taux de livraison (> 95%)
   - Temps de réponse (< 1s)
   - Erreurs de livraison

2. **LNURL**
   - Taux de conversion (scans → paiements)
   - Temps d'expiration moyen
   - Erreurs de callback

3. **Multi-Wallets**
   - Nombre moyen de wallets par utilisateur
   - Distribution des balances
   - Fréquence de création/suppression

---

## 🔗 Ressources Additionnelles

### Documentation Technique

- [API Dazno Principale](/_SPECS/api-pour-t4g-daznode.md)
- [Backend Rust](token4good-backend/README.md)
- [Frontend Next.js](apps/dapp/README.md)

### Spécifications LNURL

- [LNURL-pay Spec](https://github.com/lnurl/luds/blob/luds/06.md)
- [LNURL-withdraw Spec](https://github.com/lnurl/luds/blob/luds/03.md)
- [LNURL-auth Spec](https://github.com/lnurl/luds/blob/luds/04.md)

### Outils de Test

- [LNURL Playground](https://lnurl.fiatjaf.com/)
- [Lightning Network Explorer](https://1ml.com/)
- [Webhook Testing](https://webhook.site/)

---

## 🎉 Conclusion

Les nouvelles fonctionnalités Webhooks, LNURL et Multi-Wallets complètent l'intégration API Dazno pour offrir une expérience utilisateur optimale avec :

✅ **Notifications temps réel** - Réactivité maximale  
✅ **Paiements simplifiés** - Meilleure UX avec QR codes  
✅ **Gestion flexible** - Plusieurs wallets par utilisateur  

**Total endpoints implémentés:** 25 (10 MCP + 15 nouveaux)

**Status:** ✅ **PRODUCTION READY**

---

**Dernière mise à jour:** 13 novembre 2025  
**Maintenu par:** Token4Good Team  
**Questions:** support@token4good.com

