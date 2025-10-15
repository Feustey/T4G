# Token4Good v2 - Récapitulatif du Déploiement Hostinger

**Date:** 2025-10-12  
**Target Production:** 28 octobre 2025  
**Infrastructure:** Hostinger VPS

---

## ✅ Configuration Complète

### 🖥️ Serveur
- **Provider:** Hostinger VPS
- **IP:** 147.79.101.32
- **Accès SSH:** root@147.79.101.32
- **Password:** Criteria0-Cadmium5-Attempt9-Exit2-Floss1
- **Domaine:** t4g.dazno.de

### 📂 Fichiers Créés

1. **HOSTINGER_DEPLOYMENT.md**
   - Guide complet de déploiement (12 phases)
   - Configuration détaillée de tous les services
   - Procédures de monitoring et backup
   - Troubleshooting

2. **QUICKSTART_HOSTINGER.md**
   - Guide de démarrage rapide
   - Déploiement en 5 minutes
   - Commandes essentielles

3. **scripts/deploy-hostinger.sh**
   - Script de déploiement automatique
   - Menu interactif
   - Options: full, backend, frontend, status

4. **DEPLOYMENT_GUIDE.md** (mis à jour)
   - Section Hostinger ajoutée en priorité
   - Alternatives Railway/Vercel conservées

5. **.cursor/rules/deployment.mdc** (mis à jour)
   - Règles de déploiement Hostinger
   - Commandes courantes

---

## 🚀 Prochaines Étapes

### 1. Avant le Déploiement

```bash
# 1.1 Vérifier la connexion SSH
ssh root@147.79.101.32

# 1.2 Vérifier le DNS (doit pointer vers 147.79.101.32)
dig t4g.dazno.de +short
# ou
nslookup t4g.dazno.de
```

**⚠️ Important:** Le DNS `t4g.dazno.de` DOIT pointer vers `147.79.101.32` avant de lancer le déploiement (surtout pour SSL).

### 2. Configuration DNS

Si ce n'est pas déjà fait, configurer chez votre registrar (Cloudflare, OVH, etc.):

```
Type: A
Name: t4g
Value: 147.79.101.32
TTL: 3600
```

### 3. Lancer le Déploiement

```bash
# Depuis votre machine locale
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G

# Installer sshpass (première fois)
brew install hudochenkov/sshpass/sshpass

# Déploiement complet automatique
./scripts/deploy-hostinger.sh full
```

Le script va exécuter automatiquement:
1. ✅ Configuration serveur (firewall, fail2ban)
2. ✅ Installation PostgreSQL
3. ✅ Installation Rust
4. ✅ Build et déploiement backend
5. ✅ Configuration Nginx
6. ✅ SSL Let's Encrypt (nécessite DNS configuré)
7. ✅ Build et déploiement frontend
8. ✅ Tests de santé

**Durée estimée:** 15-30 minutes (selon synchronisation Bitcoin Core)

### 4. Vérifier le Déploiement

```bash
# Test local (sur le serveur)
ssh root@147.79.101.32
curl http://localhost:3001/health

# Test public (depuis votre machine)
curl https://t4g.dazno.de/health
curl -I https://t4g.dazno.de
```

### 5. Configuration Post-Déploiement

#### 5.1 Migrer les Données PostgreSQL

```bash
# Depuis votre machine locale, copier le dump
scp supabase-final-schema.sql root@147.79.101.32:/tmp/

# Sur le serveur
ssh root@147.79.101.32
psql -U t4g_user -d token4good -h localhost -f /tmp/supabase-final-schema.sql
```

#### 5.2 Configurer Bitcoin Core (Synchronisation)

```bash
ssh root@147.79.101.32

# Vérifier la synchronisation (peut prendre plusieurs heures/jours)
bitcoin-cli getblockchaininfo

# Voir la progression
watch -n 30 'bitcoin-cli getblockchaininfo | grep -E "blocks|verificationprogress"'
```

Pour production immédiate, considérer:
- Utiliser un service Bitcoin managé (Blockstream, Alchemy)
- Ou démarrer en mode testnet pendant la synchronisation

#### 5.3 Configurer LND

```bash
ssh root@147.79.101.32

# Créer le wallet (première fois)
lncli create

# Financer le wallet
lncli newaddress p2wkh

# Envoyer des BTC à cette adresse

# Ouvrir des channels Lightning
lncli openchannel <NODE_PUBKEY> <AMOUNT_SATS>

# Vérifier
lncli getinfo
lncli listchannels
```

#### 5.4 Configurer les Secrets Dazno

```bash
ssh root@147.79.101.32
vim /var/www/token4good/token4good-backend/.env

# Mettre à jour:
DAZNO_API_KEY=<VOTRE_CLE_API_DAZNO>
DAZNO_CLIENT_ID=<CLIENT_ID>
DAZNO_CLIENT_SECRET=<CLIENT_SECRET>

# Redémarrer le backend
systemctl restart token4good-backend
```

---

## 📊 Monitoring et Maintenance

### Logs en Temps Réel

```bash
# Backend
journalctl -u token4good-backend -f

# Nginx
tail -f /var/log/nginx/token4good-error.log

# PostgreSQL
tail -f /var/log/postgresql/postgresql-15-main.log

# Bitcoin
journalctl -u bitcoind -f

# LND
journalctl -u lnd -f
```

### Status des Services

```bash
# Depuis votre machine locale
./scripts/deploy-hostinger.sh status

# Ou sur le serveur
ssh root@147.79.101.32
systemctl status token4good-backend
systemctl status postgresql
systemctl status nginx
systemctl status bitcoind
systemctl status lnd
```

### Backups Automatiques

Les backups sont configurés automatiquement:
- **PostgreSQL:** Quotidien à 2h00 (conservé 30 jours)
- **Frontend:** Hebdomadaire dimanche 3h00 (conservé 7 jours)
- **Localisation:** `/var/backups/`

Vérifier les backups:
```bash
ssh root@147.79.101.32
ls -lh /var/backups/postgresql/
ls -lh /var/backups/frontend/
```

---

## 🔄 Mises à Jour

### Backend

```bash
# Depuis votre machine locale
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G

# Modifier le code...
# git commit...

# Déployer
./scripts/deploy-hostinger.sh backend
```

### Frontend

```bash
# Depuis votre machine locale
cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G

# Modifier le code...

# Déployer
./scripts/deploy-hostinger.sh frontend
```

---

## 🚨 Troubleshooting Rapide

### Backend ne démarre pas
```bash
ssh root@147.79.101.32
journalctl -u token4good-backend -n 100 --no-pager
systemctl restart token4good-backend
```

### Erreur 502 Nginx
```bash
ssh root@147.79.101.32
curl http://localhost:3001/health  # Tester backend
systemctl status token4good-backend
nginx -t
systemctl reload nginx
```

### Base de données inaccessible
```bash
ssh root@147.79.101.32
systemctl status postgresql
psql -U t4g_user -d token4good -h localhost -c "SELECT version();"
```

### SSL expiré ou erreur
```bash
ssh root@147.79.101.32
certbot certificates
certbot renew
systemctl reload nginx
```

---

## 📋 Checklist Production

### Configuration Initiale
- [x] Serveur Hostinger accessible
- [ ] DNS t4g.dazno.de configuré (A record → 147.79.101.32)
- [ ] Script de déploiement exécuté
- [ ] SSL/HTTPS actif
- [ ] Backend répond sur /health
- [ ] Frontend accessible

### Services Blockchain
- [ ] Bitcoin Core installé
- [ ] Bitcoin Core synchronisé (ou service managé configuré)
- [ ] LND installé
- [ ] LND wallet créé
- [ ] LND channels ouverts
- [ ] RGB Protocol configuré

### Base de Données
- [ ] PostgreSQL installé et démarré
- [ ] Base de données `token4good` créée
- [ ] Schéma migré (supabase-final-schema.sql)
- [ ] Données migrées depuis Supabase/MongoDB

### Intégrations
- [ ] Dazno API key configurée
- [ ] OAuth t4g configuré
- [ ] OAuth LinkedIn configuré
- [ ] Emails SMTP configurés

### Sécurité
- [ ] Firewall (UFW) actif
- [ ] Fail2Ban configuré
- [ ] HTTPS obligatoire
- [ ] Secrets sécurisés (pas de hardcode)
- [ ] SSH avec clés (désactiver password après test)

### Monitoring
- [ ] Backups automatiques configurés
- [ ] Logs accessibles
- [ ] Alerting configuré (email)
- [ ] Health checks fonctionnels

---

## 📞 Support et Documentation

### Documentation
- **Guide Complet:** [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)
- **Démarrage Rapide:** [QUICKSTART_HOSTINGER.md](./QUICKSTART_HOSTINGER.md)
- **Architecture Globale:** [FINAL_SUMMARY.md](./FINAL_SUMMARY.md)
- **Migration Frontend:** [FRONTEND_MIGRATION_PLAN.md](./FRONTEND_MIGRATION_PLAN.md)

### Commandes Essentielles

```bash
# Déploiement
./scripts/deploy-hostinger.sh full

# Status
./scripts/deploy-hostinger.sh status

# Connexion SSH
ssh root@147.79.101.32

# Logs backend
ssh root@147.79.101.32 "journalctl -u token4good-backend -f"

# Redémarrer backend
ssh root@147.79.101.32 "systemctl restart token4good-backend"

# Health check
curl https://t4g.dazno.de/health
```

### Contacts
- **Admin:** admin@dazno.de
- **Support Hostinger:** https://www.hostinger.com/support
- **Issues GitHub:** https://github.com/votre-org/T4G/issues

---

## 🎯 Timeline

| Date | Étape | Status |
|------|-------|--------|
| 12 Oct 2025 | Documentation créée | ✅ Fait |
| 13 Oct 2025 | Configuration DNS | ⏳ À faire |
| 14 Oct 2025 | Déploiement initial | ⏳ À faire |
| 15-20 Oct 2025 | Sync Bitcoin Core | ⏳ À faire |
| 21 Oct 2025 | Configuration LND | ⏳ À faire |
| 22-25 Oct 2025 | Tests E2E | ⏳ À faire |
| 26-27 Oct 2025 | Migration données | ⏳ À faire |
| **28 Oct 2025** | **🚀 Go Live Production** | 🎯 Objectif |

---

**Dernière mise à jour:** 2025-10-12  
**Responsable:** Stéphane Courant  
**Status:** Prêt pour déploiement

