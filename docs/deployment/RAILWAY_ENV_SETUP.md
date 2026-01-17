# 🔧 Configuration Railway - Variables d'Environnement

**Guide rapide pour configurer les variables d'environnement dans Railway**

---

## 📍 Accès au Dashboard

1. Ouvrir Railway: https://railway.app
2. Sélectionner le projet **token4good-backend**
3. Sélectionner l'environnement **production**
4. Cliquer sur le service **APIrust**
5. Aller dans l'onglet **Variables**

---

## 🔐 Variables à Configurer

### 1. JWT & Security
```bash
JWT_SECRET=<généré par le script - copier-coller>
JWT_EXPIRATION_HOURS=24
```

### 2. Database
```bash
# DATABASE_URL est automatiquement créé par Railway PostgreSQL
# Vérifier qu'il existe
```

### 3. RGB Protocol
```bash
RGB_DATA_DIR=/app/data/rgb
RGB_NETWORK=mainnet
```
**Note:** Utilisez `testnet` pour les tests

### 4. Lightning Network
```bash
LND_REST_HOST=https://your-lnd-node.com:8080
LND_MACAROON_PATH=<votre-macaroon-en-base64>
LND_TLS_CERT_PATH=<votre-certificat-en-base64>
```

**Pour encoder en base64:**
```bash
# Macaroon
base64 -i /path/to/admin.macaroon

# Certificate
base64 -i /path/to/tls.cert
```

### 5. Dazno Integration
```bash
DAZNO_API_URL=https://api.dazno.de
```

### 6. Server Configuration
```bash
HOST=0.0.0.0
PORT=3000
RUST_LOG=info,token4good_backend=debug
```

### 7. CORS
```bash
ALLOWED_ORIGINS=https://t4g.dazno.de,https://dazno.de
```

**Note:** Ajoutez vos domaines séparés par des virgules

---

## ✅ Vérification

Une fois les variables configurées:

1. **Vérifier dans Railway:**
   - Toutes les variables sont présentes
   - Pas de typo dans les noms
   - DATABASE_URL existe (créé automatiquement)

2. **Sauvegarder:**
   - Railway sauvegarde automatiquement
   - Un redéploiement est déclenché automatiquement

3. **Vérifier les logs:**
   ```bash
   railway logs --follow
   ```

---

## 🚨 Variables Critiques

Ces variables DOIVENT être configurées pour que le backend démarre:

✅ **JWT_SECRET** - Généré par le script (32+ caractères)  
✅ **DATABASE_URL** - Créé automatiquement par PostgreSQL  
✅ **PORT** - Port d'écoute (3000)  
✅ **HOST** - Adresse d'écoute (0.0.0.0)

Les autres variables peuvent être ajoutées progressivement selon vos besoins.

---

## 📝 Template Complet

Copier-coller dans Railway (remplacer les valeurs):

```bash
# JWT & Security
JWT_SECRET=votre_secret_genere_par_le_script
JWT_EXPIRATION_HOURS=24

# RGB Protocol
RGB_DATA_DIR=/app/data/rgb
RGB_NETWORK=mainnet

# Lightning Network (optionnel au début)
LND_REST_HOST=https://your-lnd-node.com:8080
LND_MACAROON_PATH=your_base64_macaroon
LND_TLS_CERT_PATH=your_base64_cert

# Dazno
DAZNO_API_URL=https://api.dazno.de

# Server
HOST=0.0.0.0
PORT=3000
RUST_LOG=info,token4good_backend=debug

# CORS
ALLOWED_ORIGINS=https://t4g.dazno.de,https://dazno.de
```

---

## 🔄 Après Configuration

1. **Railway redéploie automatiquement**
2. **Attendre 2-3 minutes**
3. **Vérifier les logs:** `railway logs --follow`
4. **Tester le health check:** `curl https://votre-url-railway.up.railway.app/health`

---

## 💡 Conseils

- **Commencez minimal:** JWT_SECRET, PORT, HOST suffisent pour démarrer
- **Ajoutez progressivement:** LND et autres services selon vos besoins
- **Testez après chaque ajout:** Vérifiez que le backend redémarre correctement
- **Gardez une copie:** Sauvegardez vos variables dans un endroit sûr (1Password, etc.)

---

## 🆘 Problèmes Courants

### Backend ne démarre pas
- Vérifier que JWT_SECRET est défini
- Vérifier que PORT=3000
- Vérifier les logs: `railway logs`

### Database connection error
- Vérifier que DATABASE_URL existe
- Vérifier que le service PostgreSQL est démarré
- Vérifier dans Railway que les services sont liés

### Lightning errors
- Ces erreurs sont normales si LND n'est pas encore configuré
- Le backend démarre quand même
- Configurez LND plus tard selon vos besoins

---

**Prochaine étape:** Une fois les variables configurées, le déploiement continuera automatiquement.

**Documentation:** [DEPLOY_READY.md](DEPLOY_READY.md)

