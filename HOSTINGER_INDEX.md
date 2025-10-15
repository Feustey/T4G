# 🚀 Token4Good - Index Déploiement Hostinger

**Infrastructure:** Hostinger VPS (147.79.101.32)  
**Domaine:** t4g.dazno.de  
**Target:** 28 octobre 2025

---

## 🎯 Démarrage Rapide (3 étapes)

### 1️⃣ Lire le Récapitulatif
```bash
cat DEPLOYMENT_SUMMARY.md
```
📖 Vue d'ensemble complète du déploiement

### 2️⃣ Configurer le DNS
```
Type: A
Name: t4g
Value: 147.79.101.32
```
⏱️ Attendre la propagation (5-30 min)

### 3️⃣ Déployer
```bash
./scripts/deploy-hostinger.sh full
```
⏱️ Durée: 15-30 minutes

---

## 📚 Documentation Complète

### 🌟 Essentiels (À lire dans l'ordre)

| Fichier | Description | Quand l'utiliser |
|---------|-------------|------------------|
| **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** | Récapitulatif complet | ⭐ Commencer ici |
| **[QUICKSTART_HOSTINGER.md](./QUICKSTART_HOSTINGER.md)** | Guide de démarrage rapide | Premier déploiement |
| **[HOSTINGER_CHEATSHEET.md](./HOSTINGER_CHEATSHEET.md)** | Référence des commandes | Administration quotidienne |

### 📖 Documentation Détaillée

| Fichier | Description | Niveau |
|---------|-------------|--------|
| **[HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)** | Guide complet (12 phases) | Avancé |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Guide général (Railway/Vercel) | Avancé |
| **[DEPLOYMENT_README.md](./DEPLOYMENT_README.md)** | Index de la documentation | Tous |

### 🛠️ Scripts & Outils

| Fichier | Description | Usage |
|---------|-------------|-------|
| **[scripts/deploy-hostinger.sh](./scripts/deploy-hostinger.sh)** | Déploiement automatique | `./scripts/deploy-hostinger.sh full` |
| **[scripts/test-deployment.sh](./scripts/test-deployment.sh)** | Tests de validation | `./scripts/test-deployment.sh` |
| **[.cursor/rules/deployment.mdc](./.cursor/rules/deployment.mdc)** | Standards déploiement | Auto (IDE) |

---

## 🎨 Diagramme Architectural

```
┌──────────────────────────────────────────────────────┐
│         Hostinger VPS (147.79.101.32)                │
│                  t4g.dazno.de                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │            Nginx (80/443)                   │    │
│  │         - Reverse Proxy                     │    │
│  │         - SSL/TLS (Let's Encrypt)           │    │
│  └────────┬────────────────────┬────────────────┘    │
│           │                    │                     │
│           ▼                    ▼                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ Frontend Static  │  │ Backend Rust     │        │
│  │ Next.js Build    │  │ Axum (3001)      │        │
│  │ /var/www/.../    │  │ /var/www/.../    │        │
│  │ frontend/        │  │ backend/         │        │
│  └──────────────────┘  └────────┬─────────┘        │
│                                  │                   │
│                                  ▼                   │
│                         ┌──────────────────┐        │
│                         │   PostgreSQL     │        │
│                         │     (5432)       │        │
│                         │   token4good DB  │        │
│                         └──────────────────┘        │
│                                  │                   │
│                    ┌─────────────┴──────────────┐   │
│                    ▼                            ▼   │
│           ┌──────────────────┐      ┌──────────────────┐
│           │   Bitcoin Core   │      │       LND        │
│           │     (8332)       │      │     (10009)      │
│           │   Mainnet/Testnet│      │ Lightning Network│
│           └──────────────────┘      └──────────────────┘
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔑 Informations de Connexion

### SSH
```bash
ssh root@147.79.101.32
# Password: Criteria0-Cadmium5-Attempt9-Exit2-Floss1
```

### Services & Ports
| Service | Port | Interne/Public | URL |
|---------|------|----------------|-----|
| Nginx | 80, 443 | Public | https://t4g.dazno.de |
| Backend | 3001 | Interne | http://localhost:3001 |
| PostgreSQL | 5432 | Interne | localhost:5432 |
| Bitcoin | 8332 | Interne | localhost:8332 |
| LND | 10009 | Interne | localhost:10009 |

### Chemins Importants
```
/var/www/token4good/
├── token4good-backend/
│   ├── token4good-backend     # Binaire
│   ├── .env                   # Configuration
│   └── target/release/
├── frontend/                  # Static Next.js
└── data/
    ├── rgb/                   # RGB Protocol data
    ├── lnd/                   # Lightning certs/macaroons
    └── bitcoin/               # Bitcoin data (optionnel)
```

---

## ⚡ Commandes Ultra-Rapides

### Connexion & Déploiement
```bash
# Connexion SSH
ssh root@147.79.101.32

# Déploiement complet
./scripts/deploy-hostinger.sh full

# Tests
./scripts/test-deployment.sh production
```

### Status & Monitoring
```bash
# Status des services
./scripts/deploy-hostinger.sh status

# Logs backend temps réel
ssh root@147.79.101.32 "journalctl -u token4good-backend -f"

# Health check
curl https://t4g.dazno.de/health
```

### Mise à Jour
```bash
# Backend
./scripts/deploy-hostinger.sh backend

# Frontend
./scripts/deploy-hostinger.sh frontend
```

---

## 📋 Checklist de Déploiement

### Pré-déploiement
- [ ] Serveur accessible: `ssh root@147.79.101.32`
- [ ] DNS configuré: `t4g.dazno.de → 147.79.101.32`
- [ ] DNS propagé: `dig t4g.dazno.de +short`
- [ ] `sshpass` installé: `brew install hudochenkov/sshpass/sshpass`

### Déploiement
- [ ] Script exécuté: `./scripts/deploy-hostinger.sh full`
- [ ] Aucune erreur dans le script
- [ ] Tous les services démarrés

### Post-déploiement
- [ ] Tests passés: `./scripts/test-deployment.sh production`
- [ ] Backend accessible: `curl https://t4g.dazno.de/health`
- [ ] Frontend accessible: `curl https://t4g.dazno.de`
- [ ] SSL actif (HTTPS)
- [ ] Logs sans erreurs critiques

### Configuration Additionnelle
- [ ] Bitcoin Core synchronisé (ou service managé)
- [ ] LND wallet créé et financé
- [ ] Channels Lightning ouverts
- [ ] Données migrées (PostgreSQL)
- [ ] Secrets Dazno configurés
- [ ] OAuth configuré (t4g, LinkedIn)

---

## 🔥 Troubleshooting Rapide

### Backend ne répond pas
```bash
# 1. Vérifier le service
ssh root@147.79.101.32
systemctl status token4good-backend

# 2. Voir les logs
journalctl -u token4good-backend -n 50

# 3. Redémarrer
systemctl restart token4good-backend

# 4. Tester
curl http://localhost:3001/health
```

### Erreur 502 (Nginx)
```bash
# Backend tourne ?
systemctl status token4good-backend

# Nginx config OK ?
nginx -t

# Recharger
systemctl reload nginx
```

### SSL/HTTPS erreur
```bash
# Certificats présents ?
certbot certificates

# Renouveler
certbot renew

# Recharger Nginx
systemctl reload nginx
```

### Plus de détails
📖 **[HOSTINGER_CHEATSHEET.md](./HOSTINGER_CHEATSHEET.md)** (Section Debugging)

---

## 🎓 Parcours d'Apprentissage

### Niveau 1: Débutant (1 heure)
1. Lire [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) (10 min)
2. Suivre [QUICKSTART_HOSTINGER.md](./QUICKSTART_HOSTINGER.md) (20 min)
3. Exécuter `./scripts/deploy-hostinger.sh full` (30 min)

### Niveau 2: Intermédiaire (2 heures)
1. Explorer [HOSTINGER_CHEATSHEET.md](./HOSTINGER_CHEATSHEET.md) (30 min)
2. Tester les commandes SSH (30 min)
3. Monitoring et logs (30 min)
4. Déploiement backend/frontend séparés (30 min)

### Niveau 3: Avancé (1 jour)
1. Lire [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) complet (2h)
2. Configuration Bitcoin/LND (2h)
3. Migration base de données (2h)
4. Optimisations et sécurité (2h)

---

## 📊 État du Projet

### Complété ✅
- [x] Architecture Hostinger documentée
- [x] Script de déploiement automatique
- [x] Script de tests
- [x] Documentation complète
- [x] Cheat sheet des commandes
- [x] Configuration Nginx
- [x] Configuration SSL
- [x] Services systemd

### À Faire ⏳
- [ ] Configurer DNS (vous)
- [ ] Premier déploiement
- [ ] Synchronisation Bitcoin Core
- [ ] Configuration LND
- [ ] Migration données production
- [ ] Tests E2E complets

### Timeline
| Date | Étape |
|------|-------|
| 12 Oct | Documentation créée ✅ |
| 13-14 Oct | Configuration DNS + Déploiement |
| 15-20 Oct | Bitcoin sync + LND setup |
| 21-25 Oct | Tests + Migration données |
| 26-27 Oct | Validation finale |
| **28 Oct** | **🚀 Go Live** |

---

## 📞 Support

### Documentation
- **Ce fichier:** Vue d'ensemble et liens rapides
- **[DEPLOYMENT_README.md](./DEPLOYMENT_README.md):** Index complet de la doc
- **[HOSTINGER_CHEATSHEET.md](./HOSTINGER_CHEATSHEET.md):** Référence des commandes

### En cas de problème
1. Consulter [HOSTINGER_CHEATSHEET.md](./HOSTINGER_CHEATSHEET.md) (section Debugging)
2. Vérifier les logs: `journalctl -u token4good-backend -f`
3. Exécuter les tests: `./scripts/test-deployment.sh production`
4. Consulter [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) (section Troubleshooting)

### Contacts
- **Admin:** admin@dazno.de
- **Support Hostinger:** https://www.hostinger.com/support
- **Issues GitHub:** https://github.com/votre-org/T4G/issues

---

## 🎯 Prochaine Étape

**Vous êtes prêt !** Commencez par:

```bash
# 1. Lire le récapitulatif
cat DEPLOYMENT_SUMMARY.md

# 2. Vérifier le DNS (doit être configuré en premier)
dig t4g.dazno.de +short

# 3. Lancer le déploiement
./scripts/deploy-hostinger.sh full

# 4. Tester
./scripts/test-deployment.sh production
```

---

<div align="center">

**🚀 Bon déploiement !**

*Dernière mise à jour: 2025-10-12*  
*Maintenu par: Stéphane Courant*

</div>

