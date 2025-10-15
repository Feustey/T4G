# 🚀 Frontend Next.js - Rapport de Déploiement

**Date:** 14 octobre 2025 19:46 UTC  
**Durée:** ~1h30  
**Status:** ✅ **DÉPLOYÉ ET OPÉRATIONNEL**

---

## ✅ Déploiement Réussi

Le frontend Next.js Token4Good est maintenant déployé et opérationnel sur le serveur Hostinger VPS.

### URLs Fonctionnelles

- **Frontend:** https://t4g.dazno.de/
- **API Backend:** https://t4g.dazno.de/api/*
- **Health Check:** https://t4g.dazno.de/health

---

## 📊 Configuration Déployée

### Frontend Next.js
- **Localisation:** `/var/www/token4good/frontend/`
- **Service:** `token4good-frontend.service` (systemd)
- **Port:** 3002 (interne)
- **Runtime:** Node.js v24.0.1
- **Mode:** Standalone production build
- **Status:** ✅ Active et stable

### Backend Rust
- **Service:** `token4good-backend.service`
- **Port:** 3001 (interne)  
- **Status:** ✅ Active

### Nginx
- **Configuration:** `/etc/nginx/sites-available/t4g.dazno.de`
- **SSL/TLS:** Let's Encrypt (existant)
- **Proxy:**
  - `/` → Frontend (port 3002)
  - `/api/*` → Backend (port 3001)
  - `/health` → Backend health check

---

## 🧪 Tests de Validation

### Résultats

| Test | Endpoint | Résultat | Status |
|------|----------|----------|--------|
| Frontend Local | http://localhost:3002 | HTTP 307 | ✅ OK |
| Backend Local | http://localhost:3001/health | HTTP 200 | ✅ OK |
| Frontend HTTPS | https://t4g.dazno.de/ | HTTP 307 | ✅ OK |
| API Health | https://t4g.dazno.de/health | HTTP 200 | ✅ OK |
| Service Frontend | systemd | active | ✅ OK |
| Service Backend | systemd | active | ✅ OK |
| Service Nginx | systemd | active | ✅ OK |

**Note:** HTTP 307 du frontend est normal - c'est une redirection Next.js vers `/fr` (internationalisation).

### Health Check Détaillé

```json
{
  "status": "degraded",
  "version": "0.1.0",
  "services": {
    "database": {"status": "ok"},
    "rgb": {"status": "ok"},
    "lightning": {"status": "error", "detail": "LND non configuré"},
    "dazno": {"status": "ok"}
  }
}
```

**Note:** Lightning en erreur est attendu - LND sera configuré dans la prochaine phase.

---

## 📋 Étapes Réalisées

### 1. Build Local ✅
- Création de `.env.production` avec tous les secrets
- `npm install --legacy-peer-deps`
- `npm run build` (Next.js 14.2.33)
- Package tarball créé (24MB)

### 2. Transfert Serveur ✅
- Upload via SCP vers `/tmp/`
- Extraction vers `/var/www/token4good/frontend/`

### 3. Configuration Serveur ✅
- Node.js v24.0.1 (déjà installé)
- Service systemd créé
- Variables d'environnement configurées
- Port : 3002 (pour éviter conflit avec port 3000)

### 4. Configuration Nginx ✅
- Proxy `/` → localhost:3002
- Proxy `/api/*` → localhost:3001
- SSL/TLS maintenu (Let's Encrypt)
- Headers de sécurité actifs

### 5. Validation ✅
- Tous les services actifs
- Frontend accessible en HTTPS
- API backend fonctionnelle
- Pas de conflits de ports

---

## 🔧 Configuration Technique

### Variables d'Environnement

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://t4g.dazno.de/api

# NextAuth
NEXTAUTH_URL=https://t4g.dazno.de
NEXTAUTH_SECRET=<SECRET_GENERATED>

# Dazno Integration
NEXT_PUBLIC_DAZNO_API_URL=https://api.dazno.de
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://dazno.de/api

# Node
NODE_ENV=production
PORT=3002
```

### Service Systemd

```ini
[Unit]
Description=Token4Good Frontend (Next.js)
After=network.target token4good-backend.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/token4good/frontend
Environment=PORT=3002
EnvironmentFile=/var/www/token4good/frontend/.env.production
ExecStart=/usr/bin/node /var/www/token4good/frontend/server.js
Restart=always
RestartSec=10
```

### Configuration Nginx

```nginx
# Frontend
location / {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Backend API
location /api/ {
    proxy_pass http://localhost:3001/api/;
    # ... headers similaires
}
```

---

## 🎯 Architecture Complète

```
Internet (HTTPS)
       ↓
   Nginx (:443)
       ↓
   ┌─────────┴─────────┐
   ↓                   ↓
Frontend (:3002)   Backend (:3001)
Next.js            Rust + Axum
   ↓                   ↓
   └───────┬───────────┘
           ↓
    PostgreSQL (:5433)
```

---

## 📊 Statistiques

### Build
- **Taille package:** 24MB
- **Temps de build:** ~3 minutes
- **Warnings:** Imports MongoDB legacy (non bloquants)

### Déploiement
- **Transfert SCP:** ~30 secondes
- **Extraction:** ~10 secondes
- **Démarrage service:** ~2 secondes
- **Temps total:** ~1h30 (incluant troubleshooting)

### Ressources Serveur
- **CPU:** ~5% (frontend + backend)
- **RAM Frontend:** 37.7MB
- **RAM Backend:** ~50MB
- **Disque:** ~24MB (frontend)

---

## 🔍 Problèmes Rencontrés et Résolus

### 1. Conflit de Port 3000
**Problème:** Port 3000 déjà utilisé par un processus existant  
**Solution:** Frontend configuré sur port 3002  
**Status:** ✅ Résolu

### 2. Build Incomplete
**Problème:** Fichiers `.next` manquants (BUILD_ID, routes-manifest.json)  
**Solution:** Recréation du package avec structure complète `.next/`  
**Status:** ✅ Résolu

### 3. Variables d'Environnement
**Problème:** MongoDB URI manquante pour le build  
**Solution:** Ajout de variables legacy (non utilisées en runtime)  
**Status:** ✅ Résolu

---

## 📝 Commandes Utiles

### Gestion du Service

```bash
# Status
systemctl status token4good-frontend

# Logs
journalctl -u token4good-frontend -f

# Restart
systemctl restart token4good-frontend

# Stop/Start
systemctl stop token4good-frontend
systemctl start token4good-frontend
```

### Monitoring

```bash
# Vérifier si le frontend répond
curl http://localhost:3002

# Health check complet
curl https://t4g.dazno.de/health | jq .

# Vérifier les ports
ss -tlnp | grep 3002
```

### Mise à Jour Frontend

```bash
# Sur machine locale
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G/apps/dapp
npm run build
tar -czf /tmp/frontend-update.tar.gz .next/standalone/ .next/static/ public/ .env.production

# Transfer et déploiement
scp /tmp/frontend-update.tar.gz root@147.79.101.32:/tmp/
ssh root@147.79.101.32 'systemctl stop token4good-frontend && \
  cd /var/www/token4good/frontend && \
  tar -xzf /tmp/frontend-update.tar.gz && \
  systemctl start token4good-frontend'
```

---

## ⏭️ Prochaines Étapes

### Immédiat
- [x] Frontend déployé ✅
- [x] Tests fonctionnels passés ✅

### Court Terme (Cette Semaine)
- [ ] Installer et configurer LND (Lightning Network)
- [ ] Configurer Bitcoin Core (testnet)
- [ ] Tests E2E complets

### Moyen Terme
- [ ] Migration complète des 52 routes API Next.js → Backend Rust
- [ ] Suppression de NextAuth (remplacé par JWT backend)
- [ ] Configuration monitoring avancé (Grafana)
- [ ] Backups automatiques

---

## ✅ Résumé Exécutif

### Ce qui Fonctionne
- ✅ Frontend Next.js déployé et accessible
- ✅ HTTPS actif avec Let's Encrypt
- ✅ Backend Rust API opérationnel
- ✅ PostgreSQL connecté
- ✅ Services systemd configurés (auto-restart)
- ✅ Nginx reverse proxy configuré
- ✅ Cohabitation avec MCP (api.dazno.de) préservée

### Ce qui Nécessite Attention
- ⚠️ Lightning Network (LND) à configurer
- ⚠️ Bitcoin Core à installer (testnet recommandé)
- ⚠️ Migration API complète à finaliser

### Verdict
**🎉 Déploiement Frontend Réussi !**  
Le frontend Next.js est maintenant en production et répond correctement. L'application Token4Good v2 est maintenant accessible à l'adresse https://t4g.dazno.de/

---

**Responsable:** Stéphane Courant  
**Assistant:** Claude (Anthropic)  
**Date:** 14 octobre 2025 19:46 UTC  
**Objectif Production:** 28 octobre 2025


