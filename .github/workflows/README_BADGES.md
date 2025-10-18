# GitHub Actions Badges

## 📊 Badges de Statut

Pour afficher les badges dans votre README principal, ajoutez:

### Deploy Production
```markdown
[![Deploy to Hostinger](https://github.com/VOTRE-ORG/token4good/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/VOTRE-ORG/token4good/actions/workflows/deploy-production.yml)
```

### Tests
```markdown
[![Run Tests](https://github.com/VOTRE-ORG/token4good/actions/workflows/test.yml/badge.svg)](https://github.com/VOTRE-ORG/token4good/actions/workflows/test.yml)
```

### Badge Combiné
```markdown
[![Deploy](https://github.com/VOTRE-ORG/token4good/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/VOTRE-ORG/token4good/actions/workflows/deploy-production.yml) [![Tests](https://github.com/VOTRE-ORG/token4good/actions/workflows/test.yml/badge.svg)](https://github.com/VOTRE-ORG/token4good/actions/workflows/test.yml)
```

## 📝 Exemple de README

```markdown
# Token4Good v2

[![Deploy to Hostinger](https://github.com/VOTRE-ORG/token4good/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/VOTRE-ORG/token4good/actions/workflows/deploy-production.yml)
[![Run Tests](https://github.com/VOTRE-ORG/token4good/actions/workflows/test.yml/badge.svg)](https://github.com/VOTRE-ORG/token4good/actions/workflows/test.yml)

## 🚀 Déploiement Automatique

Chaque push sur `main` déclenche automatiquement:
- ✅ Build Backend (Rust)
- ✅ Build Frontend (Next.js)
- ✅ Deploy sur Hostinger VPS
- ✅ Tests automatiques
- ✅ Rollback si échec

**Production:** https://t4g.dazno.de
```

## 🎨 Styles Alternatifs

### Style Shields.io

**Deploy:**
```markdown
![Deploy](https://img.shields.io/github/actions/workflow/status/VOTRE-ORG/token4good/deploy-production.yml?branch=main&label=deploy&logo=github)
```

**Tests:**
```markdown
![Tests](https://img.shields.io/github/actions/workflow/status/VOTRE-ORG/token4good/test.yml?branch=main&label=tests&logo=github)
```

### Avec Couleurs Personnalisées

```markdown
![Deploy](https://img.shields.io/github/actions/workflow/status/VOTRE-ORG/token4good/deploy-production.yml?branch=main&label=deploy&logo=github&color=success)
```

## 📈 Badge de Déploiement avec Date

```markdown
![Last Deploy](https://img.shields.io/github/last-commit/VOTRE-ORG/token4good/main?label=last%20deploy)
```

## 🔗 URLs à Remplacer

Remplacer `VOTRE-ORG` par votre organisation/username GitHub dans tous les badges ci-dessus.

Exemple si votre repo est `github.com/dazno/token4good`:
```markdown
[![Deploy](https://github.com/dazno/token4good/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/dazno/token4good/actions/workflows/deploy-production.yml)
```

