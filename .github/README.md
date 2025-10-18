# GitHub Actions - CI/CD Workflows

## 📋 Vue d'ensemble

Ce dossier contient les workflows GitHub Actions pour automatiser le build, les tests et le déploiement de Token4Good v2.

## 🚀 Workflows Disponibles

### 1. Deploy to Hostinger Production
**Fichier:** [`deploy-production.yml`](workflows/deploy-production.yml)

**Déclencheurs:**
- ✅ Push sur `main`
- ✅ Push sur `production`
- ✅ Manuel (workflow_dispatch)

**Étapes:**
1. Build Backend (Rust) avec cache Cargo
2. Build Frontend (Next.js) avec cache npm
3. Upload des artifacts
4. Backup automatique sur le serveur
5. Deploy Backend → Hostinger VPS
6. Deploy Frontend → Hostinger VPS
7. Health checks (local + public)
8. Rollback automatique si échec
9. Smoke tests post-déploiement

**Durée moyenne:** 7-11 minutes (3-6 min avec cache)

**URL de production:** https://t4g.dazno.de

---

### 2. Run Tests
**Fichier:** [`test.yml`](workflows/test.yml)

**Déclencheurs:**
- ✅ Push sur n'importe quelle branche
- ✅ Pull Request vers `main` ou `production`
- ✅ Manuel (workflow_dispatch)

**Étapes:**
1. **Backend Tests:**
   - Formatage (rustfmt)
   - Linting (clippy)
   - Tests unitaires
   - Tests d'intégration
   - Build check

2. **Frontend Tests:**
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Tests (si configurés)
   - Build check

3. **Security Audit:**
   - Audit Rust (cargo-audit)
   - Audit Node.js (npm audit)

4. **Code Quality:**
   - Métriques de code
   - Statistiques

**Durée moyenne:** 5-8 minutes

---

## 🔐 Configuration Requise

### Secrets GitHub

Aller dans **Settings → Secrets and variables → Actions** et créer:

| Secret Name | Description | Exemple |
|-------------|-------------|---------|
| `HOSTINGER_HOST` | IP du serveur Hostinger | `147.79.101.32` |
| `HOSTINGER_USER` | Utilisateur SSH | `root` |
| `HOSTINGER_SSH_KEY` | Clé privée SSH (complète) | `-----BEGIN OPENSSH...` |

### Génération des Clés SSH

```bash
# Exécuter le script de génération
./scripts/generate-ci-ssh-key.sh

# Suivre les instructions pour:
# 1. Copier la clé privée dans GitHub Secrets
# 2. Installer la clé publique sur le serveur
```

**Documentation complète:** [CI_CD_SETUP.md](../CI_CD_SETUP.md)

---

## 📊 Statuts et Badges

### Ajouter des badges dans votre README

```markdown
![Deploy](https://github.com/VOTRE-ORG/token4good/actions/workflows/deploy-production.yml/badge.svg)
![Tests](https://github.com/VOTRE-ORG/token4good/actions/workflows/test.yml/badge.svg)
```

### Consulter l'Historique

- **Actions:** https://github.com/VOTRE-ORG/token4good/actions
- **Déploiements:** https://github.com/VOTRE-ORG/token4good/deployments

---

## 🎯 Utilisation

### Déploiement Automatique

Simple push sur main:
```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# Le déploiement se lance automatiquement!
```

### Déploiement Manuel

1. Aller dans **Actions**
2. Sélectionner **Deploy to Hostinger Production**
3. Cliquer **Run workflow**
4. Choisir la branche
5. Cliquer **Run workflow**

### Tests avant Commit

Pour tester localement avant de push:

**Backend:**
```bash
cd token4good-backend
cargo fmt --check
cargo clippy
cargo test
cargo build --release
```

**Frontend:**
```bash
cd apps/dapp
npm run lint
npx tsc --noEmit
npm run build
```

---

## 🔄 Workflow Details

### Cache Strategy

**Rust (Backend):**
```yaml
~/.cargo/bin/
~/.cargo/registry/
token4good-backend/target/
```
- Clé: Hash de `Cargo.lock`
- Économie: 2-3x plus rapide

**Node.js (Frontend):**
```yaml
node_modules/
.next/cache/
```
- Clé: Hash de `package-lock.json`
- Économie: ~60% du temps

### Artifacts

**Backend Binary:**
- Nom: `backend-binary`
- Contenu: `token4good-backend` (binaire compilé)
- Rétention: 1 jour

**Frontend Build:**
- Nom: `frontend-build`
- Contenu: `.next/`, `public/`, configs
- Rétention: 1 jour

### Environments

**Production:**
- Nom: `production`
- URL: https://t4g.dazno.de
- Protection: Peut nécessiter approbation

---

## 🛡️ Sécurité

### Bonnes Pratiques

✅ **Secrets Management:**
- Tous les secrets dans GitHub Secrets
- Jamais de secrets hardcodés
- Rotation régulière (90 jours)

✅ **SSH Keys:**
- Clés dédiées pour CI/CD
- Permissions minimales
- Monitoring des accès

✅ **Déploiement:**
- Backup avant chaque deploy
- Health checks obligatoires
- Rollback automatique

### Permissions Requises

Le workflow nécessite:
- ✅ `contents: read` - Lire le code
- ✅ `deployments: write` - Créer des déploiements
- ✅ SSH vers le serveur

---

## 🐛 Troubleshooting

### Build Backend Échoue

**Erreur:** `error: could not compile`

**Solutions:**
1. Vérifier `Cargo.toml` et dépendances
2. Tester le build localement
3. Vérifier les logs GitHub Actions
4. Vider le cache si nécessaire

### Deploy Échoue

**Erreur:** `Permission denied (publickey)`

**Solutions:**
1. Vérifier `HOSTINGER_SSH_KEY` dans Secrets
2. Vérifier que la clé publique est sur le serveur
3. Tester manuellement: `ssh -i ci-deploy-key root@147.79.101.32`

### Health Check Échoue

**Erreur:** `Backend health check failed`

**Solutions:**
1. Se connecter au serveur: `ssh root@147.79.101.32`
2. Vérifier les logs: `journalctl -u token4good-backend -n 50`
3. Vérifier le service: `systemctl status token4good-backend`
4. Redémarrer: `systemctl restart token4good-backend`

### Rollback

En cas de problème après déploiement:

**Automatique:**
- Le workflow fait un rollback automatique en cas d'échec

**Manuel:**
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

---

## 📈 Monitoring

### Métriques Disponibles

**GitHub Actions:**
- ✅ Temps de build par job
- ✅ Taux de succès/échec
- ✅ Utilisation du cache
- ✅ Historique des déploiements

**Serveur:**
```bash
# Status des services
systemctl status token4good-backend
systemctl status token4good-frontend
systemctl status nginx

# Logs en temps réel
journalctl -u token4good-backend -f

# Health check
curl https://t4g.dazno.de/health
```

### Alertes

Pour recevoir des notifications:

1. **Email:** Configuré par défaut par GitHub
2. **Slack:** Ajouter une action Slack dans le workflow
3. **Discord:** Ajouter une action Discord dans le workflow

---

## 🔧 Maintenance

### Mise à Jour des Workflows

Pour modifier un workflow:

1. Éditer le fichier YAML dans `.github/workflows/`
2. Commit et push
3. Le nouveau workflow sera utilisé au prochain run

### Rotation des Secrets

**Recommandation:** Tous les 90 jours

```bash
# 1. Générer de nouvelles clés
./scripts/generate-ci-ssh-key.sh

# 2. Mettre à jour GitHub Secrets

# 3. Installer sur le serveur

# 4. Tester un déploiement

# 5. Supprimer les anciennes clés
```

### Nettoyage

**Artifacts:**
- Supprimés automatiquement après 1 jour
- Pas d'action nécessaire

**Logs:**
- Conservés pendant 90 jours
- Téléchargeables depuis GitHub Actions

**Backups sur le serveur:**
- 5 derniers backups conservés
- Rotation automatique

---

## 📚 Documentation

### Ressources Principales

- 📖 [Configuration CI/CD](../CI_CD_SETUP.md) - Guide complet
- 🔧 [Script SSH](../scripts/generate-ci-ssh-key.sh) - Génération de clés
- 🚀 [Déploiement](../PRODUCTION_DEPLOYMENT.md) - Guide de déploiement
- 📋 [Quick Start](../QUICKSTART.md) - Démarrage rapide

### Liens Utiles

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## 🤝 Contribution

Pour ajouter ou modifier un workflow:

1. Créer une branche
2. Modifier le workflow
3. Tester avec `workflow_dispatch`
4. Créer une Pull Request
5. Tests automatiques s'exécutent
6. Merge après validation

---

**Dernière mise à jour:** 17 octobre 2025  
**Version:** 1.0  
**Maintenu par:** Token4Good Team

