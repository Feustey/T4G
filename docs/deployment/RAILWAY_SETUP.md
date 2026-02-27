# 🚂 Token4Good v2 – Mise en place Railway (Backend Rust)

Ce guide décrit la mise en production de l’API Rust sur Railway, depuis la configuration du projet jusqu’aux tests post-déploiement.

---

## 1. Pré-requis

- Compte Railway avec droits « Admin » sur l’organisation Token4Good
- Node.js ≥ 18 et npm installés localement
- CLI Railway :
  ```bash
  npm install -g @railway/cli
  railway --version
  ```
- Accès lecture/écriture au repo (`token4good-backend`) et aux secrets Dazno/LND
- (Optionnel) Accès à un nœud Lightning + macaroon/tls cert encodés base64

---

## 2. Initialiser le projet Railway

1. Ouvrir un terminal dans `token4good-backend/` :
   ```bash
   cd /Users/stephanecourant/Documents/DAZ/_T4G/T4G/token4good-backend
   railway login
   ```
2. Créer/associer le service :
   ```bash
   railway init                 # créer « token4good-backend » si absent
   railway link                 # associer la branche locale au projet/prod
   ```
3. Ajouter PostgreSQL managé (si non créé) :
   ```bash
   railway add -d postgres      # provisionne la base et crée DATABASE_URL
   ```

> 💡 Vérifier dans le dashboard (railway.app) : un environnement `production` doit contenir un service « backend » + un service « postgres ».

---

## 3. Définir les variables d’environnement

Ouvrir `railway open` → onglet **Variables** (ou via CLI `railway variables set`). Valeurs à renseigner :

| Catégorie | Variable | Exemple / Remarque |
|-----------|----------|--------------------|
| Application | `HOST` | `0.0.0.0` |
| | `PORT` | `3000` |
| | `RUST_LOG` | `info,token4good_backend=debug` |
| Auth | `JWT_SECRET` | `openssl rand -base64 32` |
| | `JWT_EXPIRATION_HOURS` | `24` |
| Base de données | `DATABASE_URL` | Créée automatiquement (ne pas modifier) |
| RGB | `RGB_DATA_DIR` | `/app/rgb_data` |
| | `BITCOIN_NETWORK` | `mainnet` (ou `testnet`) |
| Lightning | `LND_REST_HOST` | `https://<votre-node>:8080` |
| | `LND_MACAROON_PATH` | contenu base64 du macaroon admin |
| | `LND_TLS_CERT_PATH` | contenu base64 du certificat |
| Dazno | `DAZNO_LIGHTNING_API_URL` | `https://api.token-for-good.com` |
| | `DAZNO_USERS_API_URL` | `https://token-for-good.com/api` |
| | `DAZNO_API_KEY` | API key fournie par Dazno |
| Webhooks | `T4G_API_KEY` | clé partagée pour authentifier les webhooks entrants |
| | `T4G_WEBHOOK_SECRET` | secret Stripe/Dazno si utilisé |

> ℹ️ Railway ne gère pas de volumes persistants sur les plans gratuits. Si vous devez stocker les données RGB, créez un volume :
> ```bash
> railway volume create --mount-path /app/rgb_data --name rgb-data
> ```

---

## 4. Construire & déployer

1. S’assurer que les dépendances Rust sont OK :
   ```bash
   cargo check --release
   cargo test --lib
   ```
2. Lancer le script d’automatisation (build Docker + `railway up`) :
   ```bash
   ./railway-deploy.sh
   ```
   Le script vérifie la compilation, exécute les tests et déclenche le déploiement via `railway.json` (Dockerfile).
3. Vérifier les logs live :
   ```bash
   railway logs --service backend --follow
   ```

---

## 5. Tests post-déploiement

1. Health check :
   ```bash
   curl https://<votre-sous-domaine>.up.railway.app/health
   ```
2. API (exemple) :
   ```bash
   curl https://<backend>.up.railway.app/api/users \
     -H "Authorization: Bearer <JWT_TEST>"
   ```
3. Script dédié :
   ```bash
   ./test-health.sh https://<backend>.up.railway.app
   ```
4. Récupérer le domaine pour configurer Vercel :
   ```bash
   railway domain
   ```

---

## 6. Étapes complémentaires

- **Migrations SQL** : Railway lance automatiquement `cargo` via Dockerfile, mais vous pouvez exécuter une migration ponctuelle :
  ```bash
  railway run --service backend "sqlx migrate run"
  ```
- **Monitoring** : Configurer un webhook (cf. `RAILWAY_WEBHOOK_SETUP.md`) pour envoyer les alertes dans Slack `#token4good-ops`.
- **Environnements multiples** :
  ```bash
  railway environment create staging
  railway link --environment staging
  ```
  Puis répéter la configuration des variables.
- **Rotation des secrets** : suivre `SECRETS_ROTATION_GUIDE.md` (JWT → 90 jours, LND → 180 jours, etc.).

---

## 7. Checklist validation

- [ ] `railway status` montre le service `backend` en **Running**
- [ ] `curl https://<backend>/health` renvoie `status: healthy`
- [ ] Les logs ne contiennent pas d’erreurs critiques (`railway logs --since 15m`)
- [ ] Les variables d’environnement sensibles sont présentes et à jour
- [ ] L’URL Railway est répercutée dans `vercel.json` et `NEXT_PUBLIC_API_URL`

Une fois ces points validés, vous pouvez basculer le frontend Vercel sur l’URL Railway puis effectuer les tests E2E.
