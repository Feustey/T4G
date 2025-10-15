# Token4Good - Déploiement Rapide Hostinger

## 🚀 Déploiement en 5 Minutes

### Prérequis
- macOS avec Homebrew installé
- Accès au serveur Hostinger (déjà fourni)
- DNS `t4g.dazno.de` pointant vers `147.79.101.32`

### Étape 1: Installer les dépendances locales

```bash
# Installer sshpass (si pas déjà fait)
brew install hudochenkov/sshpass/sshpass

# Vérifier
sshpass -V
```

### Étape 2: Lancer le déploiement automatique

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G

# Déploiement complet (recommandé pour la première fois)
./scripts/deploy-hostinger.sh full

# Ou mode interactif
./scripts/deploy-hostinger.sh
```

Le script va automatiquement:
1. ✅ Configurer le serveur (firewall, fail2ban, etc.)
2. ✅ Installer PostgreSQL et créer la base de données
3. ✅ Installer Rust
4. ✅ Build et déployer le backend Rust
5. ✅ Configurer Nginx
6. ✅ Configurer SSL (Let's Encrypt)
7. ✅ Build et déployer le frontend Next.js
8. ✅ Exécuter les tests

### Étape 3: Vérifier le déploiement

```bash
# Vérifier le statut des services
./scripts/deploy-hostinger.sh status

# Ou manuellement
ssh root@147.79.101.32

# Une fois connecté:
systemctl status token4good-backend
systemctl status postgresql
systemctl status nginx

# Tester l'API
curl http://localhost:3001/health
```

### Étape 4: Tester en production

```bash
# Health check
curl https://t4g.dazno.de/health

# Page d'accueil
curl -I https://t4g.dazno.de
```

---

## 🔧 Déploiements Ultérieurs

### Mettre à jour le Backend

```bash
# Depuis votre machine locale
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G
./scripts/deploy-hostinger.sh backend
```

### Mettre à jour le Frontend

```bash
./scripts/deploy-hostinger.sh frontend
```

---

## 📊 Monitoring

### Voir les logs

```bash
# SSH vers le serveur
ssh root@147.79.101.32

# Logs backend
journalctl -u token4good-backend -f

# Logs Nginx
tail -f /var/log/nginx/token4good-error.log

# Logs PostgreSQL
tail -f /var/log/postgresql/postgresql-15-main.log
```

### Vérifier les ressources

```bash
# Sur le serveur
htop              # CPU + RAM
df -h             # Espace disque
ss -tlnp          # Ports ouverts
```

---

## 🚨 Dépannage Rapide

### Le backend ne démarre pas

```bash
ssh root@147.79.101.32
journalctl -u token4good-backend -n 50
systemctl restart token4good-backend
```

### Erreur 502 Bad Gateway (Nginx)

```bash
ssh root@147.79.101.32
systemctl status token4good-backend
curl http://localhost:3001/health
nginx -t
systemctl reload nginx
```

### Base de données inaccessible

```bash
ssh root@147.79.101.32
systemctl status postgresql
psql -U t4g_user -d token4good -h localhost -c "SELECT 1;"
```

---

## 📞 Informations Importantes

**Serveur:** Hostinger VPS
- **IP:** 147.79.101.32
- **User:** root
- **Domaine:** t4g.dazno.de

**Services:**
- **Backend:** Port 3001 (interne)
- **Nginx:** Ports 80/443 (externe)
- **PostgreSQL:** Port 5432 (interne)
- **API:** https://t4g.dazno.de/api/*
- **Frontend:** https://t4g.dazno.de/

**Base de données:**
- **Nom:** token4good
- **User:** t4g_user
- **Host:** localhost

---

## 📖 Documentation Complète

Pour plus de détails, consultez:
- [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) - Guide complet de déploiement
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guide général de déploiement

---

**Date:** 2025-10-12
**Target:** 28 octobre 2025

