# GitHub Actions – Workflows Token4Good v2

Ce dossier héberge les pipelines CI/CD officiels pour la stack **Railway + Vercel**.

---

## 🚀 Workflows disponibles

### 1. Deploy to Vercel (`vercel-deploy.yml`)
- Déclencheurs :
  - Push sur `main` touchant `apps/dapp/**` ou `vercel.json`
  - Pull request sur `main`
- Étapes :
  1. Install Node.js 18 + cache npm
  2. Build Next.js (`npm run build`)
  3. Déploiement preview (branches ≠ main)
  4. Déploiement production (branche `main`)
- Secrets requis :
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_DAZNO_API_URL`, `NEXT_PUBLIC_DAZNO_USERS_API_URL`
  - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

### 2. Run Tests (`test.yml`)
- Déclencheurs : push toutes branches, pull request sur `main`/`production`, déclenchement manuel
- Jobs :
  - **Backend** : rustfmt, clippy, tests unitaires/intégration, build release
  - **Frontend** : npm ci, ESLint, TypeScript, build
  - **Security** : `cargo audit`, `npm audit`
  - **Code Quality** : statistiques rapides
- Variables utilisées : `NODE_VERSION=18`, `RUST_VERSION=stable`

---

## 🔐 Secrets GitHub

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Token API Vercel (CI) |
| `VERCEL_ORG_ID` | ID d’organisation Vercel |
| `VERCEL_PROJECT_ID` | ID du projet Next.js |
| `NEXT_PUBLIC_API_URL` | URL du backend Railway |
| `NEXT_PUBLIC_DAZNO_API_URL` | Endpoint Dazno API |
| `NEXT_PUBLIC_DAZNO_USERS_API_URL` | Endpoint utilisateurs Dazno |
| `NEXTAUTH_SECRET` | Secret NextAuth (32+ chars) |
| `NEXTAUTH_URL` | URL publique du frontend |

Ajouter les secrets via **Settings → Secrets and variables → Actions**.

---

## 🧪 Tests locaux avant CI

```
# Backend
cd token4good-backend
cargo fmt --check
cargo clippy -- -D warnings
cargo test

# Frontend
cd apps/dapp
npm run lint
npx tsc --noEmit
npm run build
```

---

## 📈 Badges (exemple)

```
![Tests](https://github.com/VOTRE-ORG/T4G/actions/workflows/test.yml/badge.svg)
![Deploy](https://github.com/VOTRE-ORG/T4G/actions/workflows/vercel-deploy.yml/badge.svg)
```

---

## 🛠️ Maintenance

- **Rotation secrets** : tous les 90 jours (Vercel & GitHub)
- **Mises à jour Node.js** : aligner `NODE_VERSION` avec la version Vercel
- **Caches GitHub** : vidés automatiquement si `package-lock.json` ou `Cargo.lock` change

---

## 📞 Support

- Slack : `#token4good-ops`
- Email : devops@token4good.com
- Docs : `PRODUCTION_DEPLOYMENT.md`, `DEPLOYMENT_GUIDE.md`

---

*Dernière mise à jour : 30 octobre 2025*
