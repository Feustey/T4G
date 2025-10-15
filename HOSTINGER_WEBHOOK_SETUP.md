# 🚀 Configuration Webhook - Hostinger

## 📍 URL Webhook Dazno

```
URL : https://dazno.de/api/webhooks/t4g
Méthode : POST
Content-Type : application/json
```

---

## 🔑 Variables d'Environnement

Ajouter dans votre fichier `.env` sur Hostinger :

```bash
# ============================================
# TOKEN4GOOD API KEYS (Pour Webhooks Dazno)
# ============================================

# Clé API pour que Dazno puisse appeler Token4Good
T4G_API_KEY=5f8d9a2fa2159bc248fb92925603e8681b82b1ba6c3d47e0795393861f56174f

# Secret partagé pour signer les webhooks Dazno → Token4Good
T4G_WEBHOOK_SECRET=9fdcefaf21786da407fd2d32b3e635c3e9d95dc61dcaa6e247648a14bd2ad503d056dbb29d1188c1eebd6163e19f68aa54ee3ff1633415496ec2d9c15f24caac
```

---

## 📤 Déploiement sur Hostinger

### 1. Copier le .env sur Hostinger

```bash
# Depuis votre machine locale
scp .env user@hostinger:/path/to/token4good-backend/.env
```

### 2. Redémarrer le service

```bash
# Sur Hostinger
cd /path/to/token4good-backend
# Redémarrer le service (selon votre setup)
sudo systemctl restart token4good-backend
# ou
pm2 restart token4good-backend
# ou
docker-compose restart
```

### 3. Vérifier les logs

```bash
# Vérifier que le service démarre correctement
sudo journalctl -u token4good-backend -f
# ou
pm2 logs token4good-backend
# ou
docker-compose logs -f
```

---

## 🧪 Test du Webhook

### 1. Vérifier que le service est UP

```bash
curl https://t4g.dazno.de/health
```

**Réponse attendue** :
```json
{"status":"healthy"}
```

### 2. Tester le webhook

```bash
cd token4good-backend/scripts

export T4G_WEBHOOK_URL="https://t4g.dazno.de/api/webhooks/dazno"
export T4G_API_KEY="5f8d9a2fa2159bc248fb92925603e8681b82b1ba6c3d47e0795393861f56174f"
export T4G_WEBHOOK_SECRET="9fdcefaf21786da407fd2d32b3e635c3e9d95dc61dcaa6e247648a14bd2ad503d056dbb29d1188c1eebd6163e19f68aa54ee3ff1633415496ec2d9c15f24caac"

./test-webhook.sh
```

**Résultat attendu** :
```
✅ Succès (HTTP 200)
Response: {"received":true,"webhook_id":"test_webhook_001","processed_at":"..."}
```

---

## 📨 Informations pour Dazno

### URL du Webhook (à donner à Dazno)

```
https://t4g.dazno.de/api/webhooks/dazno
```

### Clés à partager (sécurisé)

```
T4G_API_KEY : 5f8d9a2fa2159bc248fb92925603e8681b82b1ba6c3d47e0795393861f56174f

T4G_WEBHOOK_SECRET : 9fdcefaf21786da407fd2d32b3e635c3e9d95dc61dcaa6e247648a14bd2ad503d056dbb29d1188c1eebd6163e19f68aa54ee3ff1633415496ec2d9c15f24caac
```

### URL Webhook Dazno (pour Token4Good)

```
https://dazno.de/api/webhooks/t4g
```

---

## 🔄 Configuration Bidirectionnelle

### Token4Good → Dazno

- **URL** : `https://dazno.de/api/webhooks/t4g`
- **Headers** : À définir avec l'équipe Dazno
- **Payload** : Format à définir avec l'équipe Dazno

### Dazno → Token4Good

- **URL** : `https://t4g.dazno.de/api/webhooks/dazno`
- **Headers** : `x-api-key` + `x-t4g-signature`
- **Payload** : Voir `DAZNO_WEBHOOK_SETUP.md`

---

## 📋 Checklist Déploiement

- [ ] Copier `.env` sur Hostinger avec les nouvelles variables
- [ ] Redémarrer le service backend
- [ ] Vérifier que `/health` répond
- [ ] Tester le webhook avec `test-webhook.sh`
- [ ] Partager les clés avec Dazno (sécurisé)
- [ ] Coordonner les tests bidirectionnels

---

## 🆘 Dépannage

### Service ne démarre pas

```bash
# Vérifier les logs
sudo journalctl -u token4good-backend -n 50

# Vérifier la syntaxe du .env
cat .env | grep T4G_
```

### Webhook retourne 401

- Vérifier que `T4G_API_KEY` est correcte
- Vérifier le calcul de la signature HMAC

### Webhook retourne 500

- Vérifier les logs du service
- Vérifier que `T4G_WEBHOOK_SECRET` est défini

---

## 📞 Support

- **Documentation** : `WEBHOOK_README.md`
- **Tests** : `token4good-backend/scripts/test-webhook.sh`
- **Logs** : Voir section "Vérifier les logs" ci-dessus

---

**✅ Une fois déployé, l'intégration webhook sera opérationnelle !**
