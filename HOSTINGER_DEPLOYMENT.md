# Token4Good v2 - Déploiement Hostinger VPS

**Date:** 2025-10-12
**Target Date:** 2025-10-28
**Serveur:** Hostinger VPS (147.79.101.32)

---

## 🎯 Architecture Déploiement VPS

```
┌──────────────────────────────────────────────────────────┐
│            Serveur Hostinger VPS (147.79.101.32)         │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────┐    ┌──────────────┐   ┌──────────────┐ │
│  │   Nginx     │───▶│ Backend Rust │──▶│ PostgreSQL   │ │
│  │   (80/443)  │    │   (3001)     │   │   (5432)     │ │
│  └─────────────┘    └──────────────┘   └──────────────┘ │
│         │                    │                            │
│         │                    ▼                            │
│         │           ┌──────────────┐                      │
│         │           │     LND      │                      │
│         │           │  (10009)     │                      │
│         │           └──────────────┘                      │
│         │                    │                            │
│         │                    ▼                            │
│         │           ┌──────────────┐                      │
│         │           │ Bitcoin Core │                      │
│         │           │   (18443)    │                      │
│         │           └──────────────┘                      │
│         │                                                 │
│         ▼                                                 │
│  ┌─────────────┐                                         │
│  │ Frontend    │                                         │
│  │ Next.js     │                                         │
│  │ (static)    │                                         │
│  └─────────────┘                                         │
│                                                            │
└──────────────────────────────────────────────────────────┘

Domaine: t4g.dazno.de → 147.79.101.32
```

---

## 📋 Informations de Connexion

```bash
# SSH
Host: 147.79.101.32
User: root
Password: Criteria0-Cadmium5-Attempt9-Exit2-Floss1

# Connexion
ssh root@147.79.101.32
```

---

## 🚀 Phase 1: Configuration Initiale du Serveur

### 1.1 Connexion et Mise à Jour

```bash
# Connexion SSH
ssh root@147.79.101.32

# Mise à jour du système
apt update -y && apt upgrade -y

# Installation des outils de base
apt install -y \
  curl \
  wget \
  git \
  vim \
  htop \
  ufw \
  fail2ban \
  certbot \
  python3-certbot-nginx
```

### 1.2 Configuration du Firewall

```bash
# Configurer UFW
ufw default deny incoming
ufw default allow outgoing

# Autoriser SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Autoriser les ports blockchain (optionnel pour accès externe)
# ufw allow 18443/tcp  # Bitcoin RPC
# ufw allow 10009/tcp  # LND gRPC

# Activer le firewall
ufw enable

# Vérifier
ufw status verbose
```

### 1.3 Configuration Fail2Ban

```bash
# Démarrer Fail2Ban
systemctl enable fail2ban
systemctl start fail2ban

# Vérifier
fail2ban-client status
```

---

## 🗄️ Phase 2: Installation PostgreSQL

### 2.1 Installation

```bash
# Installer PostgreSQL 15
apt install -y postgresql postgresql-contrib

# Démarrer le service
systemctl enable postgresql
systemctl start postgresql

# Vérifier
systemctl status postgresql
```

### 2.2 Configuration de la Base de Données

```bash
# Se connecter en tant que postgres
sudo -u postgres psql

# Dans psql:
CREATE DATABASE token4good;
CREATE USER t4g_user WITH ENCRYPTED PASSWORD 'T4G_Production_2025!';
GRANT ALL PRIVILEGES ON DATABASE token4good TO t4g_user;

# Autoriser les connexions locales
\q

# Éditer pg_hba.conf
vim /etc/postgresql/15/main/pg_hba.conf
```

Ajouter cette ligne:
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   token4good      t4g_user                                md5
host    token4good      t4g_user        127.0.0.1/32            md5
```

```bash
# Redémarrer PostgreSQL
systemctl restart postgresql

# Tester la connexion
psql -U t4g_user -d token4good -h localhost
```

### 2.3 Exécuter les Migrations

```bash
# Depuis votre machine locale, copier le schéma
scp /Users/stephanecourant/Documents/DAZ/_T4G/T4G/supabase-final-schema.sql root@147.79.101.32:/tmp/

# Sur le serveur
psql -U t4g_user -d token4good -h localhost -f /tmp/supabase-final-schema.sql
```

---

## 🦀 Phase 3: Installation Rust et Build Backend

### 3.1 Installation Rust

```bash
# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Charger l'environnement
source ~/.cargo/env

# Vérifier
rustc --version
cargo --version

# Installer les dépendances de build
apt install -y \
  build-essential \
  pkg-config \
  libssl-dev \
  libpq-dev
```

### 3.2 Cloner et Build le Backend

```bash
# Créer le répertoire de travail
mkdir -p /var/www/token4good
cd /var/www/token4good

# Cloner le projet (depuis votre dépôt)
git clone https://github.com/votre-org/T4G.git .

# Ou copier depuis votre machine locale
# scp -r /Users/stephanecourant/Documents/DAZ/_T4G/T4G root@147.79.101.32:/var/www/token4good/

# Aller dans le backend
cd token4good-backend

# Build en mode release
cargo build --release

# Vérifier le binaire
ls -lh target/release/token4good-backend
```

### 3.3 Configuration du Backend

```bash
# Créer le fichier .env
cat > /var/www/token4good/token4good-backend/.env << 'EOF'
# Server
PORT=3001
HOST=0.0.0.0
RUST_LOG=info,token4good_backend=debug

# Database
DATABASE_URL=postgresql://t4g_user:T4G_Production_2025!@localhost:5432/token4good

# JWT
JWT_SECRET=Criteria0-Cadmium5-Attempt9-Exit2-Floss1-Production-JWT-2025
JWT_EXPIRATION_HOURS=24

# Bitcoin & RGB
BITCOIN_NETWORK=mainnet
RGB_DATA_DIR=/var/www/token4good/data/rgb
RGB_NETWORK=mainnet

# Lightning Network
LND_HOST=localhost
LND_PORT=10009
LND_MACAROON_PATH=/var/www/token4good/data/lnd/admin.macaroon
LND_TLS_CERT_PATH=/var/www/token4good/data/lnd/tls.cert

# Dazno Integration
DAZNO_API_URL=https://dazno.de/api
DAZNO_LIGHTNING_API_URL=https://api.dazno.de
DAZNO_USERS_API_URL=https://dazno.de/api

# CORS
ALLOWED_ORIGINS=https://t4g.dazno.de,https://dazno.de

# Logging
LOG_LEVEL=info
EOF

# Créer les répertoires de données
mkdir -p /var/www/token4good/data/{rgb,lnd,bitcoin}
```

---

## ⚡ Phase 4: Installation Bitcoin Core & LND

### 4.1 Bitcoin Core

```bash
# Télécharger Bitcoin Core 27.0
cd /tmp
wget https://bitcoincore.org/bin/bitcoin-core-27.0/bitcoin-27.0-x86_64-linux-gnu.tar.gz

# Extraire et installer
tar -xzf bitcoin-27.0-x86_64-linux-gnu.tar.gz
install -m 0755 -o root -g root -t /usr/local/bin bitcoin-27.0/bin/*

# Vérifier
bitcoin-cli --version

# Créer la configuration
mkdir -p ~/.bitcoin
cat > ~/.bitcoin/bitcoin.conf << 'EOF'
# Bitcoin Core Configuration for Token4Good

# Network (utiliser mainnet en production)
chain=main
# testnet=1  # Pour les tests

# RPC
server=1
rpcuser=bitcoinrpc
rpcpassword=T4G_Bitcoin_RPC_2025_Secure!
rpcallowip=127.0.0.1
rpcbind=127.0.0.1
rpcport=8332

# ZMQ pour Lightning
zmqpubrawblock=tcp://127.0.0.1:28332
zmqpubrawtx=tcp://127.0.0.1:28333

# Performance
txindex=1
dbcache=1024

# Logging
debug=0
EOF

# Créer le service systemd
cat > /etc/systemd/system/bitcoind.service << 'EOF'
[Unit]
Description=Bitcoin Core Daemon
After=network.target

[Service]
Type=forking
User=root
ExecStart=/usr/local/bin/bitcoind -daemon
ExecStop=/usr/local/bin/bitcoin-cli stop
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

# Démarrer Bitcoin Core
systemctl enable bitcoind
systemctl start bitcoind

# Vérifier (synchronisation peut prendre du temps)
bitcoin-cli getblockchaininfo
```

### 4.2 Lightning Network (LND)

```bash
# Télécharger LND
cd /tmp
wget https://github.com/lightningnetwork/lnd/releases/download/v0.17.4-beta/lnd-linux-amd64-v0.17.4-beta.tar.gz

# Extraire et installer
tar -xzf lnd-linux-amd64-v0.17.4-beta.tar.gz
install -m 0755 -o root -g root -t /usr/local/bin lnd-linux-amd64-v0.17.4-beta/*

# Vérifier
lnd --version

# Créer la configuration
mkdir -p ~/.lnd
cat > ~/.lnd/lnd.conf << 'EOF'
[Application Options]
alias=Token4Good-LND-Production
listen=localhost:9735
rpclisten=localhost:10009
restlisten=localhost:8080
debuglevel=info

[Bitcoin]
bitcoin.active=1
bitcoin.mainnet=1
bitcoin.node=bitcoind

[Bitcoind]
bitcoind.rpchost=localhost:8332
bitcoind.rpcuser=bitcoinrpc
bitcoind.rpcpass=T4G_Bitcoin_RPC_2025_Secure!
bitcoind.zmqpubrawblock=tcp://127.0.0.1:28332
bitcoind.zmqpubrawtx=tcp://127.0.0.1:28333
EOF

# Créer le service systemd
cat > /etc/systemd/system/lnd.service << 'EOF'
[Unit]
Description=Lightning Network Daemon
After=bitcoind.service
Requires=bitcoind.service

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/lnd
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

# Démarrer LND
systemctl enable lnd
systemctl start lnd

# Créer un wallet (première fois seulement)
lncli create

# Copier les credentials
cp ~/.lnd/data/chain/bitcoin/mainnet/admin.macaroon /var/www/token4good/data/lnd/
cp ~/.lnd/tls.cert /var/www/token4good/data/lnd/

# Vérifier
lncli getinfo
```

---

## 🔧 Phase 5: Systemd Service Backend

### 5.1 Créer le Service

```bash
cat > /etc/systemd/system/token4good-backend.service << 'EOF'
[Unit]
Description=Token4Good Backend (Rust + Axum)
After=network.target postgresql.service lnd.service
Requires=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/token4good/token4good-backend
Environment=PATH=/root/.cargo/bin:/usr/local/bin:/usr/bin:/bin
EnvironmentFile=/var/www/token4good/token4good-backend/.env
ExecStart=/var/www/token4good/token4good-backend/target/release/token4good-backend
Restart=always
RestartSec=10

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=token4good-backend

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Recharger systemd
systemctl daemon-reload

# Démarrer le service
systemctl enable token4good-backend
systemctl start token4good-backend

# Vérifier
systemctl status token4good-backend

# Suivre les logs
journalctl -u token4good-backend -f
```

### 5.2 Test du Backend

```bash
# Health check
curl http://localhost:3001/health

# Test API
curl http://localhost:3001/api/users

# Vérifier les logs
journalctl -u token4good-backend --since "5 minutes ago"
```

---

## 🌐 Phase 6: Nginx Configuration

### 6.1 Installation Nginx

```bash
# Installer Nginx
apt install -y nginx

# Démarrer le service
systemctl enable nginx
systemctl start nginx
```

### 6.2 Configuration Frontend + Backend

```bash
# Créer la configuration
cat > /etc/nginx/sites-available/token4good << 'EOF'
# Token4Good - Production Configuration

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name t4g.dazno.de;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name t4g.dazno.de;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/t4g.dazno.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/t4g.dazno.de/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/t4g.dazno.de/chain.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/token4good-access.log;
    error_log /var/log/nginx/token4good-error.log warn;

    # Backend API Proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Frontend (Next.js Static Export)
    location / {
        root /var/www/token4good/frontend;
        try_files $uri $uri/ $uri.html /index.html =404;
        
        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF

# Activer le site
ln -s /etc/nginx/sites-available/token4good /etc/nginx/sites-enabled/

# Désactiver le site par défaut
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
nginx -t

# Recharger Nginx
systemctl reload nginx
```

---

## 🔒 Phase 7: SSL/TLS avec Let's Encrypt

### 7.1 Obtenir le Certificat SSL

```bash
# Créer le répertoire pour le challenge
mkdir -p /var/www/certbot

# Obtenir le certificat
certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@dazno.de \
  --agree-tos \
  --no-eff-email \
  -d t4g.dazno.de

# Vérifier
ls -la /etc/letsencrypt/live/t4g.dazno.de/

# Recharger Nginx
systemctl reload nginx
```

### 7.2 Auto-renouvellement

```bash
# Test du renouvellement
certbot renew --dry-run

# Créer un cron job pour le renouvellement automatique
cat > /etc/cron.d/certbot << 'EOF'
# Renouvellement automatique des certificats Let's Encrypt
0 0,12 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF
```

---

## 🎨 Phase 8: Déploiement Frontend

### 8.1 Build du Frontend

```bash
# Sur votre machine locale
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G/apps/dapp

# Installer les dépendances
npm install

# Configurer les variables d'environnement pour le build
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://t4g.dazno.de/api
NEXT_PUBLIC_DAZNO_API_URL=https://api.dazno.de
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://dazno.de/api
EOF

# Build en mode production (export statique)
npm run build
npm run export

# Le contenu statique est dans le dossier out/
```

### 8.2 Déployer sur le Serveur

```bash
# Copier le build vers le serveur
scp -r out/* root@147.79.101.32:/var/www/token4good/frontend/

# Sur le serveur, vérifier
ls -la /var/www/token4good/frontend/

# Recharger Nginx
systemctl reload nginx
```

---

## 🧪 Phase 9: Tests de Déploiement

### 9.1 Tests Backend

```bash
# Health check
curl https://t4g.dazno.de/health

# Test authentification
curl -X POST https://t4g.dazno.de/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test Lightning
curl https://t4g.dazno.de/api/lightning/node/info
```

### 9.2 Tests Frontend

```bash
# Page d'accueil
curl -I https://t4g.dazno.de

# Vérifier les assets
curl -I https://t4g.dazno.de/_next/static/...
```

### 9.3 Vérification des Services

```bash
# Sur le serveur
systemctl status token4good-backend
systemctl status postgresql
systemctl status nginx
systemctl status bitcoind
systemctl status lnd

# Vérifier les logs
journalctl -u token4good-backend --since "1 hour ago"
journalctl -u nginx --since "1 hour ago"
```

---

## 📊 Phase 10: Monitoring & Logs

### 10.1 Logs Centralisés

```bash
# Backend
journalctl -u token4good-backend -f

# Nginx Access
tail -f /var/log/nginx/token4good-access.log

# Nginx Errors
tail -f /var/log/nginx/token4good-error.log

# PostgreSQL
tail -f /var/log/postgresql/postgresql-15-main.log

# LND
journalctl -u lnd -f
```

### 10.2 Monitoring des Ressources

```bash
# Installer monitoring tools
apt install -y htop iotop nethogs

# Vérifier l'utilisation
htop               # CPU + RAM
iotop              # I/O disque
nethogs            # Bande passante réseau
df -h              # Espace disque
free -h            # Mémoire

# Créer un script de monitoring
cat > /root/check-services.sh << 'EOF'
#!/bin/bash
echo "=== Token4Good Services Status ==="
echo ""
echo "Backend:"
systemctl is-active token4good-backend
echo "PostgreSQL:"
systemctl is-active postgresql
echo "Nginx:"
systemctl is-active nginx
echo "Bitcoin:"
systemctl is-active bitcoind
echo "LND:"
systemctl is-active lnd
echo ""
echo "=== Resource Usage ==="
echo "CPU:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}'
echo "Memory:"
free -h | grep Mem | awk '{print $3 "/" $2}'
echo "Disk:"
df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}'
EOF

chmod +x /root/check-services.sh

# Exécuter
/root/check-services.sh
```

### 10.3 Alerting avec Email

```bash
# Installer sendmail
apt install -y sendmail mailutils

# Script d'alerte
cat > /root/alert-services.sh << 'EOF'
#!/bin/bash

ALERT_EMAIL="admin@dazno.de"

check_service() {
    if ! systemctl is-active --quiet $1; then
        echo "⚠️ Service $1 is DOWN!" | mail -s "ALERT: $1 down on Token4Good" $ALERT_EMAIL
    fi
}

check_service token4good-backend
check_service postgresql
check_service nginx
check_service bitcoind
check_service lnd
EOF

chmod +x /root/alert-services.sh

# Cron job toutes les 5 minutes
cat >> /etc/crontab << 'EOF'
*/5 * * * * root /root/alert-services.sh
EOF
```

---

## 🔄 Phase 11: Procédures de Mise à Jour

### 11.1 Mise à Jour Backend

```bash
# Sur votre machine locale, pousser les changements
git push origin main

# Sur le serveur
cd /var/www/token4good
git pull origin main

cd token4good-backend
cargo build --release

# Redémarrer le service
systemctl restart token4good-backend

# Vérifier
systemctl status token4good-backend
curl https://t4g.dazno.de/health
```

### 11.2 Mise à Jour Frontend

```bash
# Sur votre machine locale
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G/apps/dapp
npm run build
npm run export

# Copier vers le serveur
scp -r out/* root@147.79.101.32:/var/www/token4good/frontend/

# Sur le serveur, recharger Nginx
systemctl reload nginx
```

### 11.3 Rollback

```bash
# Backend: revenir à la version précédente
cd /var/www/token4good
git log --oneline -10
git checkout <COMMIT_HASH>

cd token4good-backend
cargo build --release
systemctl restart token4good-backend

# Frontend: restaurer depuis backup
cd /var/www/token4good/frontend
cp -r /var/backups/frontend-YYYY-MM-DD/* .
systemctl reload nginx
```

---

## 💾 Phase 12: Backups

### 12.1 Backup PostgreSQL

```bash
# Script de backup
cat > /root/backup-database.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup
pg_dump -U t4g_user -d token4good -h localhost | gzip > $BACKUP_DIR/token4good_$DATE.sql.gz

# Garder seulement les 30 derniers jours
find $BACKUP_DIR -name "token4good_*.sql.gz" -mtime +30 -delete

echo "Backup completed: token4good_$DATE.sql.gz"
EOF

chmod +x /root/backup-database.sh

# Cron job quotidien à 2h du matin
cat >> /etc/crontab << 'EOF'
0 2 * * * root /root/backup-database.sh
EOF
```

### 12.2 Backup Frontend

```bash
# Script de backup
cat > /root/backup-frontend.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/frontend"
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR

# Backup
tar -czf $BACKUP_DIR/frontend_$DATE.tar.gz -C /var/www/token4good frontend/

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "frontend_*.tar.gz" -mtime +7 -delete

echo "Backup completed: frontend_$DATE.tar.gz"
EOF

chmod +x /root/backup-frontend.sh

# Cron job hebdomadaire (dimanche 3h)
cat >> /etc/crontab << 'EOF'
0 3 * * 0 root /root/backup-frontend.sh
EOF
```

---

## 🚨 Troubleshooting

### Backend ne démarre pas

```bash
# Vérifier les logs
journalctl -u token4good-backend -n 100

# Vérifier la config
cat /var/www/token4good/token4good-backend/.env

# Tester manuellement
cd /var/www/token4good/token4good-backend
./target/release/token4good-backend
```

### Base de données inaccessible

```bash
# Vérifier PostgreSQL
systemctl status postgresql
psql -U t4g_user -d token4good -h localhost

# Vérifier les connexions
ss -tlnp | grep 5432

# Vérifier les logs
tail -f /var/log/postgresql/postgresql-15-main.log
```

### Nginx erreurs

```bash
# Tester la config
nginx -t

# Vérifier les logs
tail -f /var/log/nginx/token4good-error.log

# Vérifier les permissions
ls -la /var/www/token4good/frontend/

# Recharger la config
systemctl reload nginx
```

### SSL certificat expiré

```bash
# Vérifier l'expiration
certbot certificates

# Renouveler manuellement
certbot renew

# Recharger Nginx
systemctl reload nginx
```

---

## 📋 Checklist de Production

### Avant le déploiement
- [x] Serveur VPS accessible
- [x] Domaine t4g.dazno.de configuré (DNS)
- [ ] Toutes les variables d'environnement configurées
- [ ] Base de données PostgreSQL créée
- [ ] Backend build sans erreurs
- [ ] Frontend build sans erreurs

### Après le déploiement
- [ ] Health checks répondent 200
- [ ] SSL/TLS actif (HTTPS)
- [ ] Backend accessible via /api/*
- [ ] Frontend accessible via /
- [ ] Bitcoin Core synchronisé
- [ ] LND opérationnel
- [ ] Logs sans erreurs critiques
- [ ] Backups configurés
- [ ] Monitoring actif
- [ ] Alertes configurées

### Sécurité
- [ ] Firewall actif (UFW)
- [ ] Fail2Ban configuré
- [ ] SSH sécurisé (clés, pas de root password)
- [ ] HTTPS obligatoire
- [ ] Headers de sécurité actifs
- [ ] Secrets rotés
- [ ] Backups testés

---

## 📞 Support

**Serveur:** Hostinger VPS
**IP:** 147.79.101.32
**Domaine:** t4g.dazno.de

**Contacts:**
- Admin: admin@dazno.de
- Support Hostinger: https://www.hostinger.com/support

---

**Dernière mise à jour:** 2025-10-12
**Responsable:** Stéphane Courant
**Go-Live Target:** 2025-10-28

