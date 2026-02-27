# 🚀 Guide de Déploiement - Webhooks Dazno ↔ Token4Good

## 📦 Fichiers Modifiés/Créés

### Backend Rust (Token4Good)

```
token4good-backend/
├── src/
│   ├── routes/
│   │   ├── mod.rs                      [MODIFIÉ] Ajout module webhooks
│   │   └── webhooks.rs                 [NOUVEAU] Route webhook principale
│   ├── middleware/
│   │   ├── mod.rs                      [MODIFIÉ] Ajout webhook_auth
│   │   └── webhook_auth.rs             [NOUVEAU] Validation API Key
│   └── lib.rs                          [MODIFIÉ] Ajout route /api/webhooks
├── Cargo.toml                          [MODIFIÉ] Ajout dépendance hmac
└── scripts/
    └── test-webhook.sh                 [NOUVEAU] Script de test

```

### Configuration

```
├── SAMPLE.env                          [MODIFIÉ] Ajout T4G_API_KEY/SECRET
├── DAZNO_WEBHOOK_SETUP.md             [NOUVEAU] Documentation complète
├── DAZNO_WEBHOOK_QUICKSTART.md        [NOUVEAU] Guide rapide
├── WEBHOOK_IMPLEMENTATION_SUMMARY.md  [NOUVEAU] Résumé technique
└── WEBHOOK_DEPLOYMENT_GUIDE.md        [CE FICHIER] Guide de déploiement
```

---

## 🔧 Étape 1 : Génération des Clés

Sur votre machine locale ou serveur de production :

```bash
# Générer T4G_API_KEY (32 caractères)
T4G_API_KEY=$(openssl rand -hex 32)
echo "T4G_API_KEY=$T4G_API_KEY"

# Générer T4G_WEBHOOK_SECRET (64 caractères)
T4G_WEBHOOK_SECRET=$(openssl rand -hex 64)
echo "T4G_WEBHOOK_SECRET=$T4G_WEBHOOK_SECRET"

# Sauvegarder ces valeurs dans un endroit sécurisé !
```

**⚠️ Important** : Ne jamais commiter ces clés dans Git !

---

## 🔐 Étape 2 : Configuration Production

### A. Backend Token4Good

Ajouter dans le fichier `.env` de production (ou variables d'environnement Railway) :

```bash
# Webhooks Dazno
T4G_API_KEY=<la_clé_générée_étape_1>
T4G_WEBHOOK_SECRET=<le_secret_généré_étape_1>
```

### B. Vérifier le Fichier .env

```bash
cd token4good-backend
cat .env | grep T4G_
# Doit afficher :
# T4G_API_KEY=...
# T4G_WEBHOOK_SECRET=...
```

---

## 📤 Étape 3 : Partage Sécurisé avec Dazno

**Ne PAS envoyer par email/Slack non chiffré !**

### Méthodes Recommandées :

1. **1Password / Bitwarden** :
   - Créer une entrée "Token4Good Webhook Keys"
   - Partager via le système de partage sécurisé

2. **HashiCorp Vault** :
   - Stocker les clés dans Vault
   - Donner accès à l'équipe Dazno

3. **Signal / WhatsApp** :
   - Messages chiffrés de bout en bout
   - Envoyer les clés en 2 messages séparés

### Informations à Partager avec Dazno

```
URL Webhook : https://app.token-for-good.com/api/webhooks/dazno
T4G_API_KEY : <la_clé>
T4G_WEBHOOK_SECRET : <le_secret>

Headers requis :
- x-api-key: <T4G_API_KEY>
- x-t4g-signature: sha256=<HMAC_SHA256_HEX>
- Content-Type: application/json

Documentation : Voir DAZNO_WEBHOOK_SETUP.md
```

---

## 🏗️ Étape 4 : Build & Déploiement

### A. Test Local

```bash
cd token4good-backend

# Vérifier la compilation
cargo check

# Compiler en mode release
cargo build --release

# Lancer le serveur
export T4G_API_KEY="votre_clé"
export T4G_WEBHOOK_SECRET="votre_secret"
cargo run --release
```

### B. Tester le Webhook

Dans un autre terminal :

```bash
cd token4good-backend/scripts
export T4G_API_KEY="votre_clé"
export T4G_WEBHOOK_SECRET="votre_secret"
export T4G_WEBHOOK_URL="http://localhost:3000/api/webhooks/dazno"

./test-webhook.sh
```

Résultat attendu :
```
✅ Succès (HTTP 200)
Response: {"received":true,"webhook_id":"test_webhook_001","processed_at":"..."}
```

### C. Déploiement Railway (Production)

1. **Configurer les variables d'environnement sur Railway** :

   ```bash
   railway variables set T4G_API_KEY="<votre_clé>"
   railway variables set T4G_WEBHOOK_SECRET="<votre_secret>"
   ```

2. **Déployer** :

   ```bash
   cd token4good-backend
   git add .
   git commit -m "feat: Add Dazno webhook integration"
   git push origin main
   
   # Railway déploie automatiquement
   ```

3. **Vérifier le déploiement** :

   ```bash
   # Vérifier que le service est UP
   curl https://app.token-for-good.com/health
   
   # Devrait retourner :
   # {"status":"healthy"}
   ```

---

## ✅ Étape 5 : Tests de Production

### A. Test avec cURL

```bash
# Configuration
API_URL="https://app.token-for-good.com/api/webhooks/dazno"
API_KEY="<votre_T4G_API_KEY>"
WEBHOOK_SECRET="<votre_T4G_WEBHOOK_SECRET>"

# Payload de test
PAYLOAD='{"id":"prod_test_001","timestamp":"2025-10-15T15:00:00Z","source":"token-for-good.com","event_type":"user.created","user_id":"test_prod","email":"test@prod.com"}'

# Calculer signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.* //')

# Envoyer
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-t4g-signature: sha256=$SIGNATURE" \
  -d "$PAYLOAD" \
  -v
```

### B. Test avec le Script

```bash
export T4G_WEBHOOK_URL="https://app.token-for-good.com/api/webhooks/dazno"
export T4G_API_KEY="<votre_clé>"
export T4G_WEBHOOK_SECRET="<votre_secret>"

./token4good-backend/scripts/test-webhook.sh
```

### C. Vérifier les Logs Railway

```bash
railway logs

# Chercher :
# INFO Webhook signature vérifiée avec succès
# INFO Traitement webhook prod_test_001 depuis token-for-good.com
```

---

## 📊 Étape 6 : Monitoring

### A. Logs à Surveiller

```bash
# Railway logs en temps réel
railway logs --follow

# Filtrer les webhooks
railway logs | grep "webhook"

# Erreurs de signature
railway logs | grep "Signature webhook invalide"
```

### B. Métriques à Tracker

- **Webhooks reçus par heure**
- **Taux de succès / échec**
- **Latence de traitement**
- **Signatures invalides** (tentatives d'attaque)

### C. Alertes Recommandées

1. **Taux d'erreur > 5%** → Investiguer
2. **Aucun webhook reçu pendant 1h** → Vérifier la connexion Dazno
3. **Signatures invalides > 10/min** → Possible attaque

---

## 🔄 Étape 7 : Coordination avec Dazno

### Checklist Dazno

Envoyer cette checklist à l'équipe Dazno :

- [ ] Clés reçues : `T4G_API_KEY` et `T4G_WEBHOOK_SECRET`
- [ ] URL configurée : `https://app.token-for-good.com/api/webhooks/dazno`
- [ ] Code d'envoi implémenté (voir `DAZNO_WEBHOOK_SETUP.md`)
- [ ] Signature HMAC-SHA256 testée
- [ ] Headers `x-api-key` et `x-t4g-signature` envoyés
- [ ] Retry logic avec exponential backoff implémenté
- [ ] Test en staging validé
- [ ] Prêt pour production

### Validation Conjointe

1. **Test Staging** :
   - Dazno envoie un webhook de test depuis staging
   - Token4Good confirme la réception

2. **Test Production** :
   - Dazno envoie un webhook réel
   - Vérifier que l'événement est traité correctement

3. **Monitoring Initial** :
   - Surveiller les logs pendant 24h
   - Vérifier qu'il n'y a pas d'erreurs

---

## 🐛 Dépannage

### Erreur 401 - Unauthorized

**Symptômes** :
```json
{"error":"Unauthorized"}
```

**Causes** :
- API Key incorrecte ou manquante
- Signature HMAC invalide

**Solutions** :
```bash
# Vérifier que les variables d'env sont définies
railway variables

# Vérifier la signature côté Dazno
# Le JSON doit être identique entre calcul signature et envoi
```

### Erreur 500 - Internal Server Error

**Symptômes** :
```json
{"error":"Internal Server Error"}
```

**Causes** :
- Erreur de traitement backend
- Variable d'environnement manquante

**Solutions** :
```bash
# Vérifier les logs
railway logs | tail -50

# Vérifier les variables d'env
railway variables | grep T4G_
```

### Webhook non reçu

**Symptômes** :
- Aucun log dans Railway
- Timeout côté Dazno

**Solutions** :
```bash
# Vérifier que le service est UP
curl https://app.token-for-good.com/health

# Vérifier les règles firewall
# Vérifier que Railway autorise les IPs Dazno
```

---

## 📝 Post-Déploiement

### Actions Immédiates

- [ ] Tester tous les types d'événements
- [ ] Vérifier les logs pendant 1h
- [ ] Documenter les métriques de base
- [ ] Créer un dashboard de monitoring

### Actions à 7 Jours

- [ ] Revoir les logs d'erreur
- [ ] Optimiser si latence > 100ms
- [ ] Ajuster le rate limiting si nécessaire
- [ ] Documenter les patterns d'utilisation

### Actions à 30 Jours

- [ ] Analyse complète des métriques
- [ ] Optimisations de performance
- [ ] Amélioration de la documentation
- [ ] Feedback de l'équipe Dazno

---

## 📞 Support

### Contacts

- **Token4Good Backend** : [équipe technique]
- **Dazno** : [équipe technique]
- **DevOps** : [équipe infra]

### Documentation

- `DAZNO_WEBHOOK_SETUP.md` - Documentation complète
- `DAZNO_WEBHOOK_QUICKSTART.md` - Guide rapide
- `WEBHOOK_IMPLEMENTATION_SUMMARY.md` - Résumé technique

### Liens Utiles

- Railway Dashboard : https://railway.app/project/...
- Logs : `railway logs --follow`
- Monitoring : https://app.token-for-good.com/api/metrics

---

## ✅ Checklist Finale

### Avant Déploiement

- [x] Code compilé sans erreur
- [x] Tests locaux réussis
- [x] Documentation complète
- [x] Scripts de test créés
- [ ] Clés générées
- [ ] Variables d'env configurées sur Railway
- [ ] Clés partagées avec Dazno de manière sécurisée

### Après Déploiement

- [ ] Tests en production réussis
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Monitoring en place
- [ ] Coordination avec Dazno validée
- [ ] Documentation à jour

---

## 🎉 Félicitations !

Une fois toutes les étapes complétées, l'intégration webhook Dazno ↔ Token4Good est opérationnelle ! 🚀

**Prochaines étapes** : Implémenter la logique métier dans les handlers de webhooks (TODO dans `webhooks.rs`).

