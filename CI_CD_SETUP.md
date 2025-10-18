# CI/CD Setup - GitHub Actions → Hostinger

## 📋 Vue d'ensemble

Ce guide explique comment configurer le déploiement automatique de Token4Good v2 depuis GitHub vers le serveur Hostinger VPS.

**Architecture:**
```
GitHub (push) → GitHub Actions → Build → Deploy → Hostinger VPS
                                              ↓
                                     Tests + Rollback si erreur
```

## 🚀 Déploiement Automatique

### Déclencheurs
- ✅ Push sur la branche `main`
- ✅ Push sur la branche `production`
- ✅ Déclenchement manuel via GitHub UI

### Workflow Complet

```
1. Build Backend (Rust)    →  Build Frontend (Next.js)
                ↓                       ↓
2. Upload Artifacts         Upload Artifacts
                ↓                       ↓
3. ═══════════════════════════════════════
   Deploy to Hostinger VPS
   ═══════════════════════════════════════
   - Backup automatique
   - Deploy Backend
   - Deploy Frontend
   - Health Checks
   - Rollback si échec
                ↓
4. Smoke Tests (validation finale)
```

## 📦 Configuration Initiale

### Étape 1: Générer les clés SSH

```bash
# Exécuter le script de génération
./scripts/generate-ci-ssh-key.sh

# Suivre les instructions à l'écran
# Les clés seront générées: ci-deploy-key et ci-deploy-key.pub
```

### Étape 2: Configurer GitHub Secrets

Aller dans votre repository GitHub:
```
Settings → Secrets and variables → Actions → New repository secret
```

Créer ces **3 secrets**:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `HOSTINGER_HOST` | `147.79.101.32` | Adresse IP du serveur |
| `HOSTINGER_USER` | `root` | Utilisateur SSH |
| `HOSTINGER_SSH_KEY` | `<contenu de ci-deploy-key>` | Clé privée SSH (tout le contenu) |

**Important:** Copier TOUT le contenu de la clé privée, y compris:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

### Étape 3: Installer la clé publique sur le serveur

**Option A: Installation automatique (recommandé)**
```bash
# Si vous avez exécuté le script generate-ci-ssh-key.sh
# et choisi l'installation automatique, c'est déjà fait!
```

**Option B: Installation manuelle**
```bash
# Se connecter au serveur
ssh root@147.79.101.32

# Ajouter la clé publique
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo 'VOTRE_CLE_PUBLIQUE' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Quitter
exit
```

### Étape 4: Tester la configuration

**Test local:**
```bash
# Tester la connexion SSH avec la clé
ssh -i ci-deploy-key root@147.79.101.32

# Si ça fonctionne, la clé est correctement installée
```

**Test GitHub Actions:**
```bash
# Faire un commit et push
git add .
git commit -m "test: CI/CD deployment"
git push origin main

# Aller dans GitHub → Actions → Voir le workflow en cours
```

## 🔄 Utilisation au Quotidien

### Déploiement Automatique

Chaque fois que vous poussez sur `main` ou `production`:

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# Le déploiement se lance automatiquement!
```

### Déploiement Manuel

Via l'interface GitHub:
1. Aller dans **Actions**
2. Sélectionner **Deploy to Hostinger Production**
3. Cliquer sur **Run workflow**
4. Choisir la branche
5. Cliquer sur **Run workflow**

### Suivre le Déploiement

1. Aller dans **Actions** sur GitHub
2. Cliquer sur le workflow en cours
3. Voir les logs en temps réel:
   - ✅ Build Backend
   - ✅ Build Frontend
   - ✅ Deploy
   - ✅ Smoke Tests

## 📊 Statut du Déploiement

### Indicateurs de Succès

✅ **Build réussi:**
- Backend compilé sans erreur
- Frontend build sans erreur
- Artifacts uploadés

✅ **Deploy réussi:**
- Backup créé
- Backend déployé et démarré
- Frontend déployé
- Health checks passent
- Services actifs

✅ **Tests réussis:**
- API Health accessible
- Frontend accessible
- Endpoints API fonctionnels

### En Cas d'Échec

Le workflow inclut un **rollback automatique**:

1. 🔍 Détection de l'erreur
2. 📦 Restauration du dernier backup
3. 🔄 Redémarrage des services
4. ⚠️ Notification de l'échec

**Logs d'erreur:**
```bash
# Consulter les logs sur GitHub Actions
# OU directement sur le serveur:

ssh root@147.79.101.32
journalctl -u token4good-backend -n 100 --no-pager
journalctl -u token4good-frontend -n 100 --no-pager
```

## 🛠️ Fonctionnalités Avancées

### Backups Automatiques

Avant chaque déploiement:
```
/var/www/token4good/backups/
├── 20251017_143022/
│   ├── token4good-backend
│   └── .next/
├── 20251017_120045/
└── ... (5 derniers backups conservés)
```

**Restauration manuelle:**
```bash
ssh root@147.79.101.32

# Lister les backups
ls -la /var/www/token4good/backups/

# Restaurer un backup spécifique
BACKUP=20251017_143022
cp /var/www/token4good/backups/$BACKUP/token4good-backend \
   /var/www/token4good/token4good-backend/
systemctl restart token4good-backend
```

### Health Checks

Le workflow vérifie automatiquement:

1. **Backend Local (3001):**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Frontend Local (3000):**
   ```bash
   curl http://localhost:3000
   ```

3. **Backend Public (HTTPS):**
   ```bash
   curl https://t4g.dazno.de/health
   ```

4. **Frontend Public (HTTPS):**
   ```bash
   curl https://t4g.dazno.de/
   ```

### Cache et Optimisations

**Rust Build Cache:**
- Les dépendances Cargo sont mises en cache
- Builds suivants: 2-3x plus rapides

**Node.js Cache:**
- `node_modules` en cache
- `npm ci` utilise le cache automatiquement

## 🔒 Sécurité

### Bonnes Pratiques

✅ **Clés SSH:**
- ✅ Utiliser des clés SSH dédiées pour CI/CD
- ✅ Clé privée uniquement dans GitHub Secrets
- ✅ Rotation tous les 90 jours
- ❌ Ne JAMAIS commiter les clés dans Git

✅ **Secrets:**
- ✅ Tous les secrets dans GitHub Secrets
- ✅ Pas de secrets dans le code
- ✅ Variables d'environnement sécurisées

✅ **Serveur:**
- ✅ Firewall (UFW) actif
- ✅ Fail2Ban configuré
- ✅ SSH sécurisé
- ✅ Certificats SSL (Let's Encrypt)

### Rotation des Clés SSH

Tous les 90 jours (recommandé):

```bash
# 1. Générer une nouvelle clé
./scripts/generate-ci-ssh-key.sh

# 2. Installer sur le serveur
ssh-copy-id -i ci-deploy-key.pub root@147.79.101.32

# 3. Mettre à jour GitHub Secret HOSTINGER_SSH_KEY

# 4. Tester un déploiement

# 5. Supprimer l'ancienne clé du serveur
ssh root@147.79.101.32
nano ~/.ssh/authorized_keys  # Supprimer l'ancienne ligne
```

## 🐛 Troubleshooting

### Problème: Build Backend Échoue

**Symptôme:**
```
error: could not compile `token4good-backend`
```

**Solution:**
```bash
# Vérifier les dépendances Cargo.toml
# Tester le build localement:
cd token4good-backend
cargo build --release
```

### Problème: Build Frontend Échoue

**Symptôme:**
```
Error: Cannot find module 'next'
```

**Solution:**
```bash
# Vérifier package.json
# Tester le build localement:
cd apps/dapp
npm install
npm run build
```

### Problème: Connexion SSH Échoue

**Symptôme:**
```
Permission denied (publickey)
```

**Solution:**
```bash
# 1. Vérifier que la clé publique est sur le serveur
ssh root@147.79.101.32 "cat ~/.ssh/authorized_keys"

# 2. Vérifier le secret GitHub HOSTINGER_SSH_KEY
# Doit contenir la clé privée COMPLÈTE

# 3. Régénérer les clés si nécessaire
./scripts/generate-ci-ssh-key.sh
```

### Problème: Backend ne Démarre Pas

**Symptôme:**
```
Backend health check failed
```

**Solution:**
```bash
# Se connecter au serveur
ssh root@147.79.101.32

# Vérifier les logs
journalctl -u token4good-backend -n 50 --no-pager

# Problèmes courants:
# - Base de données inaccessible
# - Variables d'environnement manquantes
# - Port déjà utilisé

# Redémarrer manuellement
systemctl restart token4good-backend
systemctl status token4good-backend
```

### Problème: Frontend ne Charge Pas

**Symptôme:**
```
502 Bad Gateway
```

**Solution:**
```bash
# Vérifier Nginx
ssh root@147.79.101.32
nginx -t
systemctl status nginx

# Vérifier les logs Nginx
tail -f /var/log/nginx/t4g-error.log

# Recharger Nginx
systemctl reload nginx
```

## 📈 Métriques et Monitoring

### Temps de Déploiement Moyen

| Étape | Durée |
|-------|-------|
| Build Backend | 3-5 min (1-2 min avec cache) |
| Build Frontend | 2-3 min (1 min avec cache) |
| Deploy | 1-2 min |
| Tests | 30s |
| **Total** | **7-11 min (3-6 min avec cache)** |

### Logs Disponibles

**GitHub Actions:**
- Logs de build complets
- Historique des déploiements
- Durée par étape

**Serveur:**
```bash
# Backend
journalctl -u token4good-backend -f

# Frontend
journalctl -u token4good-frontend -f

# Nginx
tail -f /var/log/nginx/t4g-access.log
tail -f /var/log/nginx/t4g-error.log
```

## 🎯 Checklist de Déploiement

Avant le premier déploiement:

- [ ] Clés SSH générées
- [ ] Secrets GitHub configurés
- [ ] Clé publique installée sur le serveur
- [ ] Test de connexion SSH réussi
- [ ] Workflow GitHub Actions actif
- [ ] Serveur Hostinger prêt
- [ ] Services systemd configurés
- [ ] Nginx configuré
- [ ] SSL activé

Pour chaque déploiement:

- [ ] Code testé localement
- [ ] Tests passent
- [ ] Commit et push
- [ ] Workflow GitHub Actions démarre
- [ ] Builds réussissent
- [ ] Déploiement réussi
- [ ] Health checks passent
- [ ] Smoke tests passent
- [ ] Site accessible

## 📚 Ressources

### Documentation
- [GitHub Actions](https://docs.github.com/en/actions)
- [Workflow YAML](.github/workflows/deploy-production.yml)
- [Script SSH](scripts/generate-ci-ssh-key.sh)

### Liens Utiles
- Repository: https://github.com/votre-org/token4good
- Actions: https://github.com/votre-org/token4good/actions
- Production: https://t4g.dazno.de
- Backend API: https://t4g.dazno.de/api

### Support
- Documentation principale: [QUICKSTART.md](QUICKSTART.md)
- Déploiement: [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
- Hostinger: [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)

---

**Date de création:** 17 octobre 2025  
**Dernière mise à jour:** 17 octobre 2025  
**Version:** 1.0

