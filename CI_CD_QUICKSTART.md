# CI/CD Quick Start Guide 🚀

## Configuration en 5 Minutes

### ⚡ Étape 1: Générer les clés SSH (2 min)

```bash
# Exécuter le script
./scripts/generate-ci-ssh-key.sh

# Suivre les instructions à l'écran
# Le script va:
# ✅ Générer les clés SSH
# ✅ Vous montrer ce qu'il faut copier
# ✅ (Optionnel) Installer automatiquement sur le serveur
```

### 🔐 Étape 2: Configurer GitHub Secrets (1 min)

Aller sur GitHub:
```
Votre Repo → Settings → Secrets and variables → Actions → New repository secret
```

Créer **3 secrets**:

1. **HOSTINGER_HOST**
   ```
   147.79.101.32
   ```

2. **HOSTINGER_USER**
   ```
   root
   ```

3. **HOSTINGER_SSH_KEY**
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   [Copier TOUT le contenu de ci-deploy-key]
   -----END OPENSSH PRIVATE KEY-----
   ```

### 🎯 Étape 3: Premier déploiement (2 min)

```bash
# Commit et push
git add .
git commit -m "feat: CI/CD configured"
git push origin main

# 🎉 C'est tout! Le déploiement se lance automatiquement
```

### ✅ Étape 4: Vérifier

Aller dans **Actions** sur GitHub et voir le workflow en cours.

Une fois terminé:
- 🌐 Frontend: https://t4g.dazno.de
- 🔧 API: https://t4g.dazno.de/api
- ❤️ Health: https://t4g.dazno.de/health

---

## 📋 Commandes Utiles

### Déploiement Manuel

Sur GitHub:
```
Actions → Deploy to Hostinger Production → Run workflow
```

### Vérifier le déploiement

```bash
# Health check
curl https://t4g.dazno.de/health

# Frontend
curl -I https://t4g.dazno.de/

# API
curl -I https://t4g.dazno.de/api/users
```

### Voir les logs sur le serveur

```bash
# Se connecter
ssh root@147.79.101.32

# Logs backend
journalctl -u token4good-backend -f

# Status
systemctl status token4good-backend
```

---

## 🐛 Problèmes Courants

### ❌ Permission denied (publickey)

**Solution:**
```bash
# Vérifier que la clé publique est sur le serveur
ssh root@147.79.101.32 "cat ~/.ssh/authorized_keys"

# Si manquante, installer:
ssh-copy-id -i ci-deploy-key.pub root@147.79.101.32
```

### ❌ Build failed

**Solution:**
```bash
# Tester localement d'abord
cd token4good-backend
cargo build --release

cd apps/dapp
npm run build
```

### ❌ Health check failed

**Solution:**
```bash
# Se connecter au serveur
ssh root@147.79.101.32

# Voir les logs
journalctl -u token4good-backend -n 50

# Redémarrer
systemctl restart token4good-backend
```

---

## 📚 Documentation Complète

- 📖 [Guide Complet CI/CD](CI_CD_SETUP.md)
- 🔧 [README GitHub Actions](.github/README.md)
- 🚀 [Déploiement Production](PRODUCTION_DEPLOYMENT.md)

---

## ✨ C'est Prêt!

Désormais, chaque push sur `main` va automatiquement:

1. ✅ Builder le backend Rust
2. ✅ Builder le frontend Next.js
3. ✅ Faire un backup
4. ✅ Déployer sur Hostinger
5. ✅ Tester le déploiement
6. ✅ Rollback si échec

**Temps total:** 7-11 minutes (3-6 min avec cache)

---

**Besoin d'aide?** Consultez [CI_CD_SETUP.md](CI_CD_SETUP.md)

