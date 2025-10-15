# 🚀 Token4Good v2 - Déploiement Hostinger

## ⚡ Démarrage Ultra-Rapide

### Vous êtes nouveau ? Commencez ici ! 👇

```bash
# 1. Lire l'index complet
cat HOSTINGER_INDEX.md

# 2. Lire le récapitulatif
cat DEPLOYMENT_SUMMARY.md

# 3. Déployer !
./scripts/deploy-hostinger.sh full
```

---

## 📚 Documentation

### 🌟 Fichiers Essentiels

| Fichier | Description | Temps de lecture |
|---------|-------------|------------------|
| **[HOSTINGER_INDEX.md](./HOSTINGER_INDEX.md)** | 📑 Vue d'ensemble + liens rapides | 5 min |
| **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** | 📋 Récapitulatif complet | 10 min |
| **[QUICKSTART_HOSTINGER.md](./QUICKSTART_HOSTINGER.md)** | ⚡ Guide rapide | 5 min |
| **[HOSTINGER_CHEATSHEET.md](./HOSTINGER_CHEATSHEET.md)** | 📖 Référence commandes | Référence |

### 📖 Documentation Complète

| Fichier | Description | Niveau |
|---------|-------------|--------|
| **[HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)** | Guide complet (12 phases) | Avancé |
| **[DEPLOYMENT_README.md](./DEPLOYMENT_README.md)** | Index documentation | Tous |
| **[SESSION_2025-10-12.md](./SESSION_2025-10-12.md)** | Rapport de session | Info |

---

## 🎯 Guide Visuel

```
                    Vous êtes ici
                         ↓
┌────────────────────────────────────────────┐
│           START_HERE.md                    │
└───────────────┬────────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌──────────────┐  ┌─────────────────┐
│ HOSTINGER_   │  │ DEPLOYMENT_     │
│ INDEX.md     │  │ SUMMARY.md      │
│              │  │                 │
│ Vue globale  │  │ Récapitulatif   │
└──────┬───────┘  └────────┬────────┘
       │                   │
       └─────────┬─────────┘
                 │
         ┌───────┴────────┬────────────┐
         │                │            │
         ▼                ▼            ▼
  ┌─────────────┐  ┌──────────┐  ┌─────────────┐
  │ QUICKSTART_ │  │ CHEAT-   │  │ HOSTINGER_  │
  │ HOSTINGER   │  │ SHEET    │  │ DEPLOYMENT  │
  │             │  │          │  │             │
  │ Démarrage   │  │ Référence│  │ Complet     │
  └──────┬──────┘  └────┬─────┘  └──────┬──────┘
         │              │               │
         └──────┬───────┴───────┬───────┘
                │               │
                ▼               ▼
         ┌──────────────┐  ┌──────────────┐
         │ deploy-      │  │ test-        │
         │ hostinger.sh │  │ deployment.sh│
         │              │  │              │
         │ Automatique  │  │ Validation   │
         └──────────────┘  └──────────────┘
```

---

## 🔑 Informations Clés

**Serveur Hostinger VPS:**
- IP: 147.79.101.32
- User: root
- Password: Criteria0-Cadmium5-Attempt9-Exit2-Floss1

**Domaine:**
- t4g.dazno.de

**Architecture:**
```
Nginx (443) → Backend Rust (3001) → PostgreSQL (5432)
                  ↓
              LND + Bitcoin
```

---

## ⚡ Commandes Rapides

### Connexion
```bash
ssh root@147.79.101.32
```

### Déploiement
```bash
# Tout
./scripts/deploy-hostinger.sh full

# Backend seulement
./scripts/deploy-hostinger.sh backend

# Frontend seulement
./scripts/deploy-hostinger.sh frontend

# Status
./scripts/deploy-hostinger.sh status
```

### Tests
```bash
./scripts/test-deployment.sh production
```

### Monitoring
```bash
# Status
ssh root@147.79.101.32 "systemctl status token4good-backend"

# Logs
ssh root@147.79.101.32 "journalctl -u token4good-backend -f"

# Health check
curl https://t4g.dazno.de/health
```

---

## 📋 Checklist Avant de Commencer

- [ ] J'ai lu [HOSTINGER_INDEX.md](./HOSTINGER_INDEX.md)
- [ ] Le DNS `t4g.dazno.de` pointe vers `147.79.101.32`
- [ ] `sshpass` est installé: `brew install hudochenkov/sshpass/sshpass`
- [ ] J'ai accès SSH au serveur

---

## 🎯 Prochaines Étapes

1. **Configurer DNS** (si pas fait)
2. **Déployer:** `./scripts/deploy-hostinger.sh full`
3. **Tester:** `./scripts/test-deployment.sh production`
4. **Valider:** `curl https://t4g.dazno.de/health`

---

## 📞 Besoin d'Aide ?

- **Démarrage:** [QUICKSTART_HOSTINGER.md](./QUICKSTART_HOSTINGER.md)
- **Commandes:** [HOSTINGER_CHEATSHEET.md](./HOSTINGER_CHEATSHEET.md)
- **Problème:** [HOSTINGER_CHEATSHEET.md](./HOSTINGER_CHEATSHEET.md) (section Debugging)
- **Détails:** [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)

---

<div align="center">

## 🚀 Prêt à Déployer !

**Commencez par lire:** [HOSTINGER_INDEX.md](./HOSTINGER_INDEX.md)

*Bonne chance ! 🎉*

</div>

---

**Créé le:** 12 octobre 2025  
**Target:** 28 octobre 2025

