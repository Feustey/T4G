# Token4Good v2 - Index de la Documentation
**Guide de navigation** 📚

---

## 🚀 Pour Démarrer

| Document | Description | Temps | Public |
|----------|-------------|-------|--------|
| [QUICKSTART.md](QUICKSTART.md) | Déploiement rapide (5 min) | ⏱️ 5 min | DevOps |
| [FINAL_DELIVERY.md](FINAL_DELIVERY.md) | Livraison complète | 📖 15 min | Tous |

---

## 📦 Documentation Technique

### Déploiement
| Document | Description |
|----------|-------------|
| [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) | Guide complet Railway + Vercel |
| [token4good-backend/railway-deploy.sh](token4good-backend/railway-deploy.sh) | Script déploiement backend |
| [deploy-vercel-v2.sh](deploy-vercel-v2.sh) | Script déploiement frontend |
| [vercel.json](vercel.json) | Configuration Vercel |
| [token4good-backend/railway.json](token4good-backend/railway.json) | Configuration Railway |

### Configuration
| Document | Description |
|----------|-------------|
| [token4good-backend/.env.example](token4good-backend/.env.example) | Variables backend |
| [apps/dapp/.env.example](apps/dapp/.env.example) | Variables frontend |

### Migration
| Document | Description |
|----------|-------------|
| [MIGRATION_PROGRESS.md](MIGRATION_PROGRESS.md) | État détaillé de la migration |
| [FRONTEND_MIGRATION_PLAN.md](FRONTEND_MIGRATION_PLAN.md) | Plan migration frontend |

---

## 🔧 Backend Rust

### Documentation
| Fichier | Description |
|---------|-------------|
| [token4good-backend/README.md](token4good-backend/README.md) | Setup développement |
| [token4good-backend/API_SECURITY_AUDIT.md](token4good-backend/API_SECURITY_AUDIT.md) | Audit sécurité |
| [token4good-backend/SECURITY_FIXES.md](token4good-backend/SECURITY_FIXES.md) | Correctifs sécurité |
| [token4good-backend/BUILD_SUCCESS.md](token4good-backend/BUILD_SUCCESS.md) | Build info |

### Code Principal
| Fichier | Description |
|---------|-------------|
| [token4good-backend/src/lib.rs](token4good-backend/src/lib.rs) | Router principal |
| [token4good-backend/src/routes/auth.rs](token4good-backend/src/routes/auth.rs) | OAuth (t4g, LinkedIn, Dazno) |
| [token4good-backend/src/routes/admin.rs](token4good-backend/src/routes/admin.rs) | Endpoints admin |
| [token4good-backend/src/routes/metrics.rs](token4good-backend/src/routes/metrics.rs) | Métriques système |
| [token4good-backend/src/routes/users.rs](token4good-backend/src/routes/users.rs) | User wallet |

### Services
| Fichier | Description |
|---------|-------------|
| [token4good-backend/src/services/database_simplified.rs](token4good-backend/src/services/database_simplified.rs) | PostgreSQL |
| [token4good-backend/src/services/rgb.rs](token4good-backend/src/services/rgb.rs) | RGB Protocol |
| [token4good-backend/src/services/lightning.rs](token4good-backend/src/services/lightning.rs) | Lightning Network |
| [token4good-backend/src/services/dazno.rs](token4good-backend/src/services/dazno.rs) | Dazno API |

### Scripts
| Script | Description |
|--------|-------------|
| [token4good-backend/railway-deploy.sh](token4good-backend/railway-deploy.sh) | Déploiement Railway |
| [token4good-backend/test-health.sh](token4good-backend/test-health.sh) | Health check |

---

## 🎨 Frontend Next.js

### Code Principal
| Fichier | Description |
|---------|-------------|
| [apps/dapp/pages/_app.tsx](apps/dapp/pages/_app.tsx) | App config + AuthProvider |
| [apps/dapp/pages/login-v2.tsx](apps/dapp/pages/login-v2.tsx) | Page login moderne |
| [apps/dapp/contexts/AuthContext.tsx](apps/dapp/contexts/AuthContext.tsx) | Context JWT |
| [apps/dapp/hooks/useOAuth.ts](apps/dapp/hooks/useOAuth.ts) | Hooks OAuth |
| [apps/dapp/services/apiClient.ts](apps/dapp/services/apiClient.ts) | REST client |

### OAuth Callbacks
| Fichier | Description |
|---------|-------------|
| [apps/dapp/pages/auth/callback/t4g.tsx](apps/dapp/pages/auth/callback/t4g.tsx) | Callback t4g |
| [apps/dapp/pages/auth/callback/linkedin.tsx](apps/dapp/pages/auth/callback/linkedin.tsx) | Callback LinkedIn |
| [apps/dapp/pages/api/auth/callback/t4g.ts](apps/dapp/pages/api/auth/callback/t4g.ts) | API t4g |
| [apps/dapp/pages/api/auth/callback/linkedin.ts](apps/dapp/pages/api/auth/callback/linkedin.ts) | API LinkedIn |

### Styles
| Fichier | Description |
|---------|-------------|
| [apps/dapp/styles/Login.module.css](apps/dapp/styles/Login.module.css) | Login styles |

---

## 🔐 Blockchain & Crypto

| Document | Description |
|----------|-------------|
| [BLOCKCHAIN.md](BLOCKCHAIN.md) | RGB Protocol overview |
| [FRONTEND_DAZNO_INTEGRATION.md](FRONTEND_DAZNO_INTEGRATION.md) | Intégration Dazno |

---

## 🛠️ Maintenance & Operations

### Gestion de l'Espace Disque
| Document | Description | Usage |
|----------|-------------|-------|
| [DISK_CLEANUP_GUIDE.md](DISK_CLEANUP_GUIDE.md) | Guide complet nettoyage disque | 📖 Guide |
| [scripts/cleanup-disk.sh](scripts/cleanup-disk.sh) | Script nettoyage automatique | 🔧 Script |
| [scripts/check-disk-space.sh](scripts/check-disk-space.sh) | Monitoring + alertes | 📊 Monitoring |

### Déploiement Cloud
| Document | Description |
|----------|-------------|
| [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) | Architecture Railway + Vercel |
| [RAILWAY_WEBHOOK_SETUP.md](RAILWAY_WEBHOOK_SETUP.md) | Intégration CI/CD Railway |
| [deploy-vercel-v2.sh](deploy-vercel-v2.sh) | Déploiement frontend Vercel |
| [RAILWAY_SETUP.md](RAILWAY_SETUP.md) | Procédure pas-à-pas Railway |

---

## 📊 État du Projet

### Métriques
- **Backend:** ~2500 lignes Rust
- **Frontend:** ~1200 lignes TypeScript
- **Tests:** 15/15 ✅
- **Endpoints:** 15+
- **Documentation:** 12 fichiers

### Statut
| Composant | Statut |
|-----------|--------|
| Backend Rust | ✅ Production Ready |
| Frontend Next.js | ✅ Production Ready |
| OAuth (3 providers) | ✅ Implémenté |
| Déploiement Railway | ✅ Scripts prêts |
| Déploiement Vercel | ✅ Scripts prêts |
| Documentation | ✅ Complète |
| Tests | ✅ 100% |

---

## 🎯 Parcours Recommandés

### Pour un Nouveau Développeur
1. [FINAL_DELIVERY.md](FINAL_DELIVERY.md) - Vue d'ensemble
2. [MIGRATION_PROGRESS.md](MIGRATION_PROGRESS.md) - Comprendre l'architecture
3. [token4good-backend/README.md](token4good-backend/README.md) - Setup dev
4. Explorer le code: `src/routes/auth.rs` → `src/lib.rs`

### Pour un DevOps
1. [QUICKSTART.md](QUICKSTART.md) - Démarrage rapide
2. [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Guide complet
3. Variables: `.env.example` (backend + frontend)
4. Scripts: `railway-deploy.sh` + `deploy-vercel-v2.sh`

### Pour un Chef de Projet
1. [FINAL_DELIVERY.md](FINAL_DELIVERY.md) - Livraison complète
2. [MIGRATION_PROGRESS.md](MIGRATION_PROGRESS.md) - État migration
3. Métriques et KPIs dans ces documents

---

## 📞 Support & Contact

### Liens Utiles
- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub:** https://github.com/token4good
- **Email:** support@token4good.com

### Commandes Rapides
```bash
# Logs backend
railway logs --follow

# Logs frontend
vercel logs --follow

# Health check
curl https://your-backend.railway.app/health

# Redéployer backend
cd token4good-backend && railway up

# Redéployer frontend
vercel --prod
```

---

## 📅 Dernières Mises à Jour

| Date | Document | Changement |
|------|----------|------------|
| 2025-10-21 | DISK_CLEANUP_GUIDE.md | Guide nettoyage espace disque |
| 2025-10-21 | scripts/cleanup-disk.sh | Script de nettoyage automatique |
| 2025-10-21 | scripts/check-disk-space.sh | Script de monitoring disque |
| 2025-10-01 | Tous | Création initiale v2.0.0 |
| 2025-10-01 | FINAL_DELIVERY.md | Livraison complète |
| 2025-10-01 | QUICKSTART.md | Guide rapide |

---

**Version:** 2.0.1
**Dernière MAJ:** 2025-10-21
**Maintenu par:** Token4Good Team

🎯 **Navigation facilitée - Trouvez rapidement ce dont vous avez besoin!** 🎯
