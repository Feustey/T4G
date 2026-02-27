# 🔧 Instructions pour Corriger l'Erreur 502 sur app.token-for-good.com

**Date:** 24 octobre 2025  
**Problème:** Erreur 502 Bad Gateway sur https://app.token-for-good.com/  
**Cause probable:** Configuration Nginx ou service frontend Next.js  

---

## 📋 Méthode Automatique (Recommandée)

### Étape 1 : Copier le script sur le serveur

Depuis votre machine locale :

```bash
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G

# Copier le script de correction
scp scripts/fix-t4g-502.sh root@147.79.101.32:/tmp/
```

### Étape 2 : Se connecter au serveur

```bash
ssh root@147.79.101.32
```

### Étape 3 : Exécuter le script de correction

```bash
# Sur le serveur
bash /tmp/fix-t4g-502.sh
```

Le script va :
1. ✅ Diagnostiquer le problème
2. ✅ Redémarrer le frontend si nécessaire
3. ✅ Créer une configuration Nginx optimisée
4. ✅ Sauvegarder l'ancienne configuration
5. ✅ Recharger Nginx
6. ✅ Tester le site

---

## 🔧 Méthode Manuelle (Alternative)

Si vous préférez comprendre et exécuter chaque étape manuellement :

### 1. Connexion au serveur

```bash
ssh root@147.79.101.32
```

### 2. Diagnostic rapide

```bash
# Vérifier les services
systemctl status token4good-frontend
systemctl status token4good-backend
systemctl status nginx

# Tester le frontend localement
curl http://localhost:3000/

# Tester le backend
curl http://localhost:3001/health
```

### 3. Redémarrer le frontend (si nécessaire)

```bash
systemctl restart token4good-frontend
sleep 5
curl http://localhost:3000/
```

### 4. Vérifier la configuration Nginx

```bash
# Voir la config actuelle
cat /etc/nginx/sites-available/app.token-for-good.com

# Tester la config
nginx -t
```

### 5. Appliquer la nouvelle configuration Nginx

```bash
# Backup de l'ancienne config
mkdir -p /var/backups/nginx
cp /etc/nginx/sites-available/app.token-for-good.com /var/backups/nginx/app.token-for-good.com.backup.$(date +%Y%m%d_%H%M%S)

# Créer la nouvelle configuration
cat > /etc/nginx/sites-available/app.token-for-good.com << 'EOF'
# Token4Good - Configuration Nginx
# Cohabitation avec MCP (api.token-for-good.com)

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name app.token-for-good.com;
    
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
    server_name app.token-for-good.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/app.token-for-good.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.token-for-good.com/privkey.pem;
    
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

    # Logs
    access_log /var/log/nginx/t4g-access.log;
    error_log /var/log/nginx/t4g-error.log warn;

    # Health Check (Backend)
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
    }

    # Frontend Next.js (Standalone)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # Headers essentiels
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # WebSocket support (pour Next.js)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts généreux
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Désactiver buffering
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Gestion des erreurs
        proxy_intercept_errors off;
    }
}
EOF

# Tester la nouvelle config
nginx -t

# Si OK, recharger Nginx
systemctl reload nginx
```

### 6. Tester le site

```bash
# Test depuis le serveur
curl -I https://app.token-for-good.com/
curl https://app.token-for-good.com/health

# Depuis votre navigateur
# Ouvrir: https://app.token-for-good.com/
```

---

## 🔍 Diagnostic des Problèmes Courants

### Problème 1 : Frontend ne démarre pas

**Symptôme :** `curl http://localhost:3000/` → Erreur de connexion

**Solution :**

```bash
# Voir les logs
journalctl -u token4good-frontend -n 50

# Vérifier que Node.js est installé
node --version

# Vérifier le fichier server.js
ls -la /var/www/token4good/frontend/server.js

# Redémarrer le service
systemctl restart token4good-frontend
```

### Problème 2 : Configuration Nginx invalide

**Symptôme :** `nginx -t` → Erreur

**Solution :**

```bash
# Restaurer la backup
cp /var/backups/nginx/app.token-for-good.com.backup.* /etc/nginx/sites-available/app.token-for-good.com

# Recharger Nginx
systemctl reload nginx
```

### Problème 3 : Conflit avec MCP

**Symptôme :** api.token-for-good.com ne fonctionne plus

**Solution :**

```bash
# Vérifier qu'il n'y a pas de duplication
ls -la /etc/nginx/sites-enabled/

# Chaque domaine doit avoir son propre fichier
# - api.token-for-good.com → MCP
# - app.token-for-good.com → Token4Good

# Vérifier qu'il n'y a pas de conflits de port
ss -tlnp | grep -E ':8000|:3001|:3000'
```

---

## 📊 Vérification Post-Correction

Une fois la correction appliquée :

### Tests depuis le serveur

```bash
# Frontend local
curl -I http://localhost:3000/

# Frontend public
curl -I https://app.token-for-good.com/

# Backend
curl https://app.token-for-good.com/health

# MCP (vérifier qu'il fonctionne toujours)
curl -I https://api.token-for-good.com/
```

### Tests depuis votre navigateur

1. Ouvrir : https://app.token-for-good.com/
2. Vérifier que la page se charge (pas de 502)
3. Tester l'authentification
4. Vérifier les appels API dans DevTools

---

## 🎯 Résultat Attendu

✅ **https://app.token-for-good.com/** → Page d'accueil (code 200 ou 307)  
✅ **https://app.token-for-good.com/health** → Status backend (code 200)  
✅ **https://app.token-for-good.com/api/users** → API backend accessible  
✅ **https://api.token-for-good.com/** → MCP toujours fonctionnel  

---

## 🆘 Si le Problème Persiste

### Logs à consulter

```bash
# Logs frontend
journalctl -u token4good-frontend -f

# Logs Nginx
tail -f /var/log/nginx/t4g-error.log

# Logs backend
journalctl -u token4good-backend -f
```

### Commandes de debug avancées

```bash
# Vérifier les processus Node.js
ps aux | grep node

# Vérifier les connexions réseau
netstat -tlnp | grep -E ':3000|:3001|:8000'

# Tester Nginx avec verbosité
curl -v https://app.token-for-good.com/ 2>&1 | grep -E "HTTP|502"
```

### Rollback complet

Si rien ne fonctionne :

```bash
# Restaurer l'ancienne config Nginx
cp /var/backups/nginx/app.token-for-good.com.backup.* /etc/nginx/sites-available/app.token-for-good.com

# Recharger
nginx -t && systemctl reload nginx
```

---

## 📞 Support

**Serveur :** 147.79.101.32  
**Services :**
- Frontend : port 3000 (systemd: token4good-frontend)
- Backend : port 3001 (systemd: token4good-backend)
- MCP : port 8000 (préservé)
- Nginx : ports 80/443

**Configuration :**
- Nginx : `/etc/nginx/sites-available/app.token-for-good.com`
- Service : `/etc/systemd/system/token4good-frontend.service`
- Frontend : `/var/www/token4good/frontend/`

---

**Créé le :** 24 octobre 2025  
**Objectif :** Corriger l'erreur 502 et rendre app.token-for-good.com opérationnel  
**Deadline :** 28 octobre 2025 (Go-Live)

