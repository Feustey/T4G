# Token4Good - Hostinger Cheat Sheet

Référence rapide des commandes pour le déploiement et la maintenance sur Hostinger VPS.

---

## 🔐 Connexion

```bash
# SSH
ssh root@147.79.101.32
# Password: Criteria0-Cadmium5-Attempt9-Exit2-Floss1

# Depuis macOS (avec sshpass)
brew install hudochenkov/sshpass/sshpass
sshpass -p 'Criteria0-Cadmium5-Attempt9-Exit2-Floss1' ssh root@147.79.101.32
```

---

## 🚀 Déploiement

```bash
# Déploiement complet (première fois)
./scripts/deploy-hostinger.sh full

# Backend seulement
./scripts/deploy-hostinger.sh backend

# Frontend seulement
./scripts/deploy-hostinger.sh frontend

# Voir le status
./scripts/deploy-hostinger.sh status

# Mode interactif
./scripts/deploy-hostinger.sh
```

---

## 🔧 Services systemd

### Backend

```bash
# Démarrer
systemctl start token4good-backend

# Arrêter
systemctl stop token4good-backend

# Redémarrer
systemctl restart token4good-backend

# Status
systemctl status token4good-backend

# Activer au démarrage
systemctl enable token4good-backend

# Logs temps réel
journalctl -u token4good-backend -f

# Dernières 100 lignes
journalctl -u token4good-backend -n 100 --no-pager
```

### PostgreSQL

```bash
systemctl status postgresql
systemctl restart postgresql
journalctl -u postgresql -f
```

### Nginx

```bash
# Tester la config
nginx -t

# Recharger (sans downtime)
systemctl reload nginx

# Redémarrer
systemctl restart nginx

# Status
systemctl status nginx

# Logs
tail -f /var/log/nginx/token4good-error.log
tail -f /var/log/nginx/token4good-access.log
```

### Bitcoin Core

```bash
systemctl status bitcoind
systemctl restart bitcoind
journalctl -u bitcoind -f

# Commandes bitcoin-cli
bitcoin-cli getblockchaininfo
bitcoin-cli getnetworkinfo
bitcoin-cli getwalletinfo
```

### LND

```bash
systemctl status lnd
systemctl restart lnd
journalctl -u lnd -f

# Commandes lncli
lncli getinfo
lncli walletbalance
lncli channelbalance
lncli listchannels
lncli listpeers
```

---

## 🗄️ Base de Données

### Connexion

```bash
# Connexion psql
psql -U t4g_user -d token4good -h localhost

# Depuis le serveur
sudo -u postgres psql

# Test rapide
psql -U t4g_user -d token4good -h localhost -c "SELECT version();"
```

### Requêtes Utiles

```sql
-- Liste des tables
\dt

-- Taille de la base
SELECT pg_size_pretty(pg_database_size('token4good'));

-- Nombre d'utilisateurs
SELECT COUNT(*) FROM users;

-- Connexions actives
SELECT * FROM pg_stat_activity;

-- Quitter
\q
```

### Backup & Restore

```bash
# Backup manuel
pg_dump -U t4g_user -d token4good -h localhost | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
gunzip < backup_20251012.sql.gz | psql -U t4g_user -d token4good -h localhost

# Lister les backups automatiques
ls -lh /var/backups/postgresql/
```

---

## 📝 Logs

### Backend

```bash
# Temps réel
journalctl -u token4good-backend -f

# Dernières 50 lignes
journalctl -u token4good-backend -n 50

# Dernière heure
journalctl -u token4good-backend --since "1 hour ago"

# Erreurs seulement
journalctl -u token4good-backend -p err

# Exporter en JSON
journalctl -u token4good-backend -o json > logs.json
```

### Nginx

```bash
# Access logs
tail -f /var/log/nginx/token4good-access.log

# Error logs
tail -f /var/log/nginx/token4good-error.log

# Filtrer les erreurs 5xx
grep " 5[0-9][0-9] " /var/log/nginx/token4good-access.log

# Dernières 100 lignes
tail -100 /var/log/nginx/token4good-error.log
```

### Tous les logs système

```bash
# Logs système temps réel
journalctl -f

# Logs kernel
dmesg -T

# Logs authentification
tail -f /var/log/auth.log
```

---

## 🧪 Tests & Health Checks

### Backend

```bash
# Health check local
curl http://localhost:3001/health

# Health check public
curl https://t4g.dazno.de/health

# Test API (avec auth)
curl -X POST https://t4g.dazno.de/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Test Lightning
curl https://t4g.dazno.de/api/lightning/node/info
```

### Frontend

```bash
# Page d'accueil
curl -I https://t4g.dazno.de

# Vérifier un asset
curl -I https://t4g.dazno.de/favicon.ico
```

### Services

```bash
# Vérifier que tous les services tournent
systemctl is-active token4good-backend postgresql nginx bitcoind lnd

# Ports ouverts
ss -tlnp | grep -E "3001|5432|80|443|8332|10009"

# Connexions actives
ss -tanp | grep ESTABLISHED
```

---

## 🔒 SSL / Certificats

### Vérifier

```bash
# Liste des certificats
certbot certificates

# Test renouvellement
certbot renew --dry-run

# Vérifier expiration
openssl x509 -in /etc/letsencrypt/live/t4g.dazno.de/fullchain.pem -noout -dates
```

### Renouveler

```bash
# Renouvellement manuel
certbot renew

# Renouveler et recharger Nginx
certbot renew --post-hook "systemctl reload nginx"

# Forcer le renouvellement
certbot renew --force-renewal
```

---

## 🛡️ Firewall & Sécurité

### UFW (Firewall)

```bash
# Status
ufw status verbose

# Autoriser un port
ufw allow 8080/tcp

# Bloquer un port
ufw deny 8080/tcp

# Supprimer une règle
ufw delete allow 8080/tcp

# Réinitialiser
ufw reset
```

### Fail2Ban

```bash
# Status
fail2ban-client status

# Status d'une jail
fail2ban-client status sshd

# Débloquer une IP
fail2ban-client set sshd unbanip 1.2.3.4

# Bannir une IP manuellement
fail2ban-client set sshd banip 1.2.3.4
```

---

## 📊 Monitoring Ressources

### CPU & Mémoire

```bash
# Processus en temps réel
htop

# Top simple
top

# CPU usage
mpstat 1 5

# Mémoire
free -h

# Swap
swapon --show
```

### Disque

```bash
# Espace disque
df -h

# Inodes
df -i

# Usage par répertoire
du -sh /var/www/token4good/*

# Plus gros fichiers
find /var -type f -size +100M -exec ls -lh {} \;
```

### Réseau

```bash
# Bande passante par processus
nethogs

# I/O par processus
iotop

# Statistiques réseau
ifconfig
ip addr show

# Ping test
ping -c 5 google.com
```

### Tous ensemble

```bash
# Script rapide
cat << 'EOF' > /root/system-check.sh
#!/bin/bash
echo "=== System Status ==="
echo "CPU: $(top -bn1 | grep Cpu | awk '{print $2}')%"
echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"
echo ""
echo "=== Services ==="
for service in token4good-backend postgresql nginx bitcoind lnd; do
  status=$(systemctl is-active $service)
  echo "$service: $status"
done
EOF

chmod +x /root/system-check.sh
/root/system-check.sh
```

---

## 🔄 Git & Déploiement

### Sur le Serveur

```bash
cd /var/www/token4good

# Pull dernières modifications
git pull origin main

# Voir les commits
git log --oneline -10

# Voir les modifications
git status
git diff

# Rollback à un commit
git checkout <commit-hash>
```

### Build Backend

```bash
cd /var/www/token4good/token4good-backend

# Build release
source ~/.cargo/env
cargo build --release

# Vérifier le binaire
ls -lh target/release/token4good-backend

# Redémarrer
systemctl restart token4good-backend
```

---

## 💾 Backups

### PostgreSQL

```bash
# Backup manuel
/root/backup-database.sh

# Lister les backups
ls -lh /var/backups/postgresql/

# Restore
gunzip < /var/backups/postgresql/token4good_20251012.sql.gz | \
  psql -U t4g_user -d token4good -h localhost
```

### Frontend

```bash
# Backup manuel
/root/backup-frontend.sh

# Lister les backups
ls -lh /var/backups/frontend/

# Restore
tar -xzf /var/backups/frontend/frontend_20251012.tar.gz -C /var/www/token4good/
systemctl reload nginx
```

---

## 🔍 Debugging

### Backend ne démarre pas

```bash
# 1. Voir les logs
journalctl -u token4good-backend -n 100 --no-pager

# 2. Vérifier la config
cat /var/www/token4good/token4good-backend/.env

# 3. Tester le binaire manuellement
cd /var/www/token4good/token4good-backend
source ~/.cargo/env
./target/release/token4good-backend

# 4. Vérifier les permissions
ls -la /var/www/token4good/token4good-backend/
```

### Erreur 502 Bad Gateway

```bash
# 1. Backend tourne ?
systemctl status token4good-backend
curl http://localhost:3001/health

# 2. Nginx config OK ?
nginx -t

# 3. Logs Nginx
tail -f /var/log/nginx/token4good-error.log

# 4. Redémarrer tout
systemctl restart token4good-backend
sleep 3
systemctl reload nginx
```

### Base de données lente

```bash
# 1. Connexions actives
psql -U t4g_user -d token4good -h localhost -c \
  "SELECT COUNT(*) FROM pg_stat_activity;"

# 2. Requêtes lentes
psql -U t4g_user -d token4good -h localhost -c \
  "SELECT query, state, query_start FROM pg_stat_activity WHERE state != 'idle';"

# 3. Locks
psql -U t4g_user -d token4good -h localhost -c \
  "SELECT * FROM pg_locks;"

# 4. Vacuum
psql -U t4g_user -d token4good -h localhost -c "VACUUM ANALYZE;"
```

---

## 📞 Contacts & Liens

- **Serveur:** 147.79.101.32
- **Domaine:** https://t4g.dazno.de
- **Support Hostinger:** https://www.hostinger.com/support
- **Doc Complète:** [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)
- **Quick Start:** [QUICKSTART_HOSTINGER.md](./QUICKSTART_HOSTINGER.md)
- **Résumé:** [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)

---

**Dernière mise à jour:** 2025-10-12

