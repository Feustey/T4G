# Token4Good - Documentation de Déploiement

Guide complet de la documentation de déploiement sur Hostinger VPS.

---

## 📚 Structure de la Documentation

### 🚀 Pour Commencer (Lecture Recommandée)

1. **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** ⭐
   - **À lire en premier**
   - Récapitulatif complet du déploiement
   - Informations serveur et accès
   - Checklist de production
   - Timeline et prochaines étapes

2. **[QUICKSTART_HOSTINGER.md](./QUICKSTART_HOSTINGER.md)** ⚡
   - Déploiement rapide en 5 minutes
   - Commandes essentielles
   - Dépannage rapide

3. **[HOSTINGER_CHEATSHEET.md](./HOSTINGER_CHEATSHEET.md)** 📋
   - Référence rapide de toutes les commandes
   - À garder sous la main pour l'administration quotidienne

### 📖 Documentation Détaillée

4. **[HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)** 📘
   - Guide complet en 12 phases
   - Configuration détaillée de tous les services
   - Monitoring, backups, sécurité
   - Troubleshooting approfondi

5. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** 📗
   - Guide général de déploiement
   - Section Hostinger + alternatives (Railway/Vercel)
   - Configurations multi-environnements

### 🛠️ Outils et Scripts

6. **[scripts/deploy-hostinger.sh](./scripts/deploy-hostinger.sh)** 🤖
   - Script de déploiement automatique
   - Mode interactif ou ligne de commande
   - Gère: serveur, backend, frontend, SSL, tests

### ⚙️ Configuration

7. **[.cursor/rules/deployment.mdc](./.cursor/rules/deployment.mdc)**
   - Standards de déploiement
   - Configuration IDE Cursor
   - Commandes courantes

---

## 🎯 Workflow Recommandé

### Première Installation (Nouveau Serveur)

```
1. DEPLOYMENT_SUMMARY.md
   ↓ Lire pour comprendre l'infrastructure
   
2. Configurer le DNS
   ↓ t4g.dazno.de → 147.79.101.32
   
3. QUICKSTART_HOSTINGER.md
   ↓ Suivre les étapes 1-4
   
4. ./scripts/deploy-hostinger.sh full
   ↓ Lancer le déploiement automatique
   
5. HOSTINGER_DEPLOYMENT.md (Section Post-Déploiement)
   ↓ Configurer Bitcoin, LND, migrations DB
   
6. HOSTINGER_CHEATSHEET.md
   ↓ Garder à portée de main pour l'administration
```

### Mise à Jour (Serveur Existant)

```
1. HOSTINGER_CHEATSHEET.md
   ↓ Vérifier les commandes nécessaires
   
2. ./scripts/deploy-hostinger.sh backend
   OU
   ./scripts/deploy-hostinger.sh frontend
   ↓ Déployer les modifications
   
3. Vérifier les logs
   ↓ journalctl -u token4good-backend -f
```

### Dépannage

```
1. HOSTINGER_CHEATSHEET.md (Section Debugging)
   ↓ Commandes de diagnostic rapides
   
2. HOSTINGER_DEPLOYMENT.md (Section Troubleshooting)
   ↓ Guide détaillé de résolution
   
3. Logs
   ↓ journalctl -u token4good-backend -n 100
```

---

## 📂 Organisation des Fichiers

```
T4G/
├── DEPLOYMENT_README.md          ← Vous êtes ici
├── DEPLOYMENT_SUMMARY.md          ← Récapitulatif (START HERE)
├── QUICKSTART_HOSTINGER.md        ← Guide rapide
├── HOSTINGER_CHEATSHEET.md        ← Commandes de référence
├── HOSTINGER_DEPLOYMENT.md        ← Guide complet
├── DEPLOYMENT_GUIDE.md            ← Guide général
│
├── scripts/
│   └── deploy-hostinger.sh        ← Script automatique
│
├── .cursor/rules/
│   └── deployment.mdc             ← Standards déploiement
│
└── token4good-backend/
    ├── Dockerfile
    ├── Cargo.toml
    └── src/
```

---

## 🔑 Informations Clés

### Serveur
- **Provider:** Hostinger VPS
- **IP:** 147.79.101.32
- **User:** root
- **Password:** Criteria0-Cadmium5-Attempt9-Exit2-Floss1
- **Domaine:** t4g.dazno.de

### Services & Ports
| Service | Port | Accès |
|---------|------|-------|
| Nginx | 80/443 | Public |
| Backend Rust | 3001 | Interne |
| PostgreSQL | 5432 | Interne |
| Bitcoin Core | 8332 | Interne |
| LND | 10009 | Interne |

### Chemins Importants
- **Backend:** `/var/www/token4good/token4good-backend/`
- **Frontend:** `/var/www/token4good/frontend/`
- **Data:** `/var/www/token4good/data/{rgb,lnd,bitcoin}/`
- **Logs:** `/var/log/nginx/` et `journalctl`
- **Backups:** `/var/backups/{postgresql,frontend}/`

---

## 🚀 Commandes Ultra-Rapides

### Connexion
```bash
ssh root@147.79.101.32
```

### Déploiement
```bash
./scripts/deploy-hostinger.sh full     # Tout
./scripts/deploy-hostinger.sh backend  # Backend seulement
./scripts/deploy-hostinger.sh frontend # Frontend seulement
./scripts/deploy-hostinger.sh status   # Voir le status
```

### Status
```bash
systemctl status token4good-backend postgresql nginx
```

### Logs
```bash
journalctl -u token4good-backend -f
tail -f /var/log/nginx/token4good-error.log
```

### Tests
```bash
curl https://t4g.dazno.de/health
curl -I https://t4g.dazno.de
```

---

## 📊 Diagramme de Décision

```
┌─────────────────────────────────────┐
│  Que voulez-vous faire ?            │
└─────────────┬───────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌─────────┐      ┌──────────────┐
│ Premier │      │  Maintenance │
│ Déploi. │      │  / Mise à    │
│         │      │   jour       │
└────┬────┘      └──────┬───────┘
     │                  │
     │                  ├─────────┬──────────┬──────────┐
     │                  │         │          │          │
     ▼                  ▼         ▼          ▼          ▼
DEPLOYMENT_      Backend   Frontend  Debug   Monitoring
SUMMARY.md       Update    Update
     ↓              ↓         ↓        ↓          ↓
QUICKSTART_    deploy-   deploy-  CHEAT-    CHEAT-
HOSTINGER.md   backend   frontend SHEET.md  SHEET.md
     ↓
deploy-
hostinger.sh
  full
```

---

## 🎓 Niveaux de Documentation

### Niveau 1: Débutant
- **DEPLOYMENT_SUMMARY.md** - Vue d'ensemble
- **QUICKSTART_HOSTINGER.md** - Guide pas-à-pas
- **deploy-hostinger.sh full** - Automatique

### Niveau 2: Intermédiaire
- **HOSTINGER_CHEATSHEET.md** - Commandes courantes
- **deploy-hostinger.sh** (options) - Déploiements partiels
- Logs et monitoring de base

### Niveau 3: Avancé
- **HOSTINGER_DEPLOYMENT.md** - Configuration manuelle
- **DEPLOYMENT_GUIDE.md** - Multi-environnements
- Debugging avancé, optimisations

---

## 📞 Support

### En Cas de Problème

1. **Consulter:**
   - [HOSTINGER_CHEATSHEET.md](./HOSTINGER_CHEATSHEET.md) (Section Debugging)
   - [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) (Section Troubleshooting)

2. **Vérifier:**
   ```bash
   ./scripts/deploy-hostinger.sh status
   journalctl -u token4good-backend -n 50
   ```

3. **Tester:**
   ```bash
   curl http://localhost:3001/health
   curl https://t4g.dazno.de/health
   ```

4. **Contacts:**
   - Admin: admin@dazno.de
   - Support Hostinger: https://www.hostinger.com/support

---

## ✅ Checklist Rapide

### Avant de Commencer
- [ ] J'ai lu [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)
- [ ] Le DNS `t4g.dazno.de` pointe vers `147.79.101.32`
- [ ] J'ai accès SSH au serveur
- [ ] `sshpass` est installé sur ma machine

### Pendant le Déploiement
- [ ] Le script `deploy-hostinger.sh` s'est exécuté sans erreur
- [ ] Tous les services sont `active` (systemctl status)
- [ ] Les health checks répondent 200

### Après le Déploiement
- [ ] HTTPS accessible: https://t4g.dazno.de
- [ ] Backend accessible: https://t4g.dazno.de/api/health
- [ ] Backups configurés
- [ ] Monitoring actif

---

## 🔄 Mises à Jour de cette Documentation

Cette documentation est vivante. Si vous apportez des modifications:

1. Mettre à jour ce README si nécessaire
2. Mettre à jour la date dans les fichiers modifiés
3. Ajouter une entrée dans le changelog ci-dessous

### Changelog

| Date | Fichier | Modification |
|------|---------|--------------|
| 2025-10-12 | Tous | Création initiale de la doc Hostinger |

---

## 📚 Documentation Complémentaire

### Projet Global
- [README.md](./README.md) - README principal du projet
- [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) - État complet du projet
- [QUICKSTART.md](./QUICKSTART.md) - Guide de démarrage développement

### Architecture & Migration
- [FRONTEND_MIGRATION_PLAN.md](./FRONTEND_MIGRATION_PLAN.md) - Plan de migration frontend
- [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) - Rapport de migration
- [POSTGRES_MIGRATION_GUIDE.md](./POSTGRES_MIGRATION_GUIDE.md) - Migration base de données

### Backend
- [token4good-backend/README.md](./token4good-backend/README.md) - Documentation backend
- [token4good-backend/API_SECURITY_AUDIT.md](./token4good-backend/API_SECURITY_AUDIT.md) - Audit sécurité

---

**Dernière mise à jour:** 2025-10-12  
**Mainteneur:** Stéphane Courant  
**Target Production:** 28 octobre 2025

---

> 💡 **Tip:** Gardez [HOSTINGER_CHEATSHEET.md](./HOSTINGER_CHEATSHEET.md) ouvert dans un onglet pendant que vous travaillez sur le serveur !

