# 🚀 Déploiement Hostinger - 3 Étapes

## ✅ CE QUI EST FAIT

- ✅ Code webhook implémenté et pushé sur GitHub
- ✅ Clés générées
- ✅ Documentation créée

---

## ⚠️ ÉTAPE 1 : Copier .env sur Hostinger (2 min)

### Créer le fichier .env local

```bash
# Créer .env avec les variables webhook
cat > .env << 'EOF'
# Variables existantes (garder les vôtres)
DATABASE_URL=...
JWT_SECRET=...
# ... autres variables ...

# ============================================
# TOKEN4GOOD API KEYS (Pour Webhooks Dazno)
# ============================================

# Clé API pour que Dazno puisse appeler Token4Good
T4G_API_KEY=5f8d9a2fa2159bc248fb92925603e8681b82b1ba6c3d47e0795393861f56174f

# Secret partagé pour signer les webhooks Dazno → Token4Good
T4G_WEBHOOK_SECRET=9fdcefaf21786da407fd2d32b3e635c3e9d95dc61dcaa6e247648a14bd2ad503d056dbb29d1188c1eebd6163e19f68aa54ee3ff1633415496ec2d9c15f24caac
EOF
```

### Copier sur Hostinger

```bash
# Remplacer par vos vraies informations Hostinger
scp .env user@hostinger:/path/to/token4good-backend/.env
```

---

## 🔄 ÉTAPE 2 : Redémarrer le Service (1 min)

```bash
# Sur Hostinger
ssh user@hostinger

# Aller dans le répertoire backend
cd /path/to/token4good-backend

# Redémarrer selon votre setup
sudo systemctl restart token4good-backend
# OU
pm2 restart token4good-backend
# OU
docker-compose restart
```

---

## 🧪 ÉTAPE 3 : Tester (2 min)

### Vérifier que le service est UP

```bash
curl https://t4g.dazno.de/health
```

### Tester le webhook

```bash
# Depuis votre machine locale
cd token4good-backend/scripts

export T4G_WEBHOOK_URL="https://t4g.dazno.de/api/webhooks/dazno"
export T4G_API_KEY="5f8d9a2fa2159bc248fb92925603e8681b82b1ba6c3d47e0795393861f56174f"
export T4G_WEBHOOK_SECRET="9fdcefaf21786da407fd2d32b3e635c3e9d95dc61dcaa6e247648a14bd2ad503d056dbb29d1188c1eebd6163e19f68aa54ee3ff1633415496ec2d9c15f24caac"

./test-webhook.sh
```

**✅ Résultat attendu** : `✅ Succès (HTTP 200)`

---

## 📨 Partager avec Dazno

### Informations à envoyer (sécurisé)

```
URL Webhook Token4Good : https://t4g.dazno.de/api/webhooks/dazno

T4G_API_KEY : 5f8d9a2fa2159bc248fb92925603e8681b82b1ba6c3d47e0795393861f56174f

T4G_WEBHOOK_SECRET : 9fdcefaf21786da407fd2d32b3e635c3e9d95dc61dcaa6e247648a14bd2ad503d056dbb29d1188c1eebd6163e19f68aa54ee3ff1633415496ec2d9c15f24caac

URL Webhook Dazno : https://dazno.de/api/webhooks/t4g
```

### Fichier à envoyer

📄 **`DAZNO_TEAM_HANDOFF.md`** (package complet)

---

## 📋 Checklist

- [ ] Copier `.env` sur Hostinger
- [ ] Redémarrer le service
- [ ] Tester `/health`
- [ ] Tester le webhook
- [ ] Partager avec Dazno

---

## ⏱️ Temps Total : ~5 minutes

**C'est tout ! 3 étapes simples et l'intégration sera 100% opérationnelle.** 🚀

---

## 🆘 Dépannage

### Service ne démarre pas

```bash
# Vérifier les logs
sudo journalctl -u token4good-backend -n 50
```

### Webhook 401

- Vérifier `T4G_API_KEY` dans `.env`
- Vérifier le calcul HMAC côté Dazno

### Webhook 500

- Vérifier `T4G_WEBHOOK_SECRET` dans `.env`
- Vérifier les logs du service

---

**Prochaine étape** : Copier le `.env` sur Hostinger ! 🎯
