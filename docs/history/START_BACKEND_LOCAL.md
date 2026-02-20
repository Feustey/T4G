# Démarrer le Backend T4G en Local

## ✅ Correction Effectuée

Les 3 boutons de login ont été corrigés pour utiliser le bon port du backend :
- ❌ Ancien : `http://localhost:8080` (port LND)
- ✅ Nouveau : `http://localhost:3000` (port backend Rust)

## 🚀 Démarrer le Backend

### Option 1 : Docker Compose (Recommandé)

```bash
# Démarrer tous les services (backend + PostgreSQL + Bitcoin + LND)
docker-compose -f docker-compose.dev.yml up -d

# Vérifier que les services sont démarrés
docker-compose -f docker-compose.dev.yml ps

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Tester le backend
curl http://localhost:3000/health
```

### Option 2 : Cargo (Développement direct)

```bash
# Aller dans le dossier backend
cd token4good-backend

# Démarrer le serveur Rust
cargo run

# Ou en mode watch (redémarre automatiquement)
cargo watch -x run
```

## 🧪 Tester l'Authentification

Une fois le backend démarré :

1. **Démarrer le frontend** :
```bash
npm run dev
# ou
nx serve dapp
```

2. **Accéder à la page de login** :
```
http://localhost:4200/login
```

3. **Tester les 3 boutons** :
   - Login with Daznode ✅
   - Login with LinkedIn ✅
   - Login as admin/alumni/student (debug) ✅

## 📝 Configuration

Le fichier `.env.local` a été mis à jour avec :
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Cette configuration est automatiquement utilisée par :
- `apps/dapp/services/apiClient.ts`
- `apps/dapp/contexts/AuthContext.tsx`
- Tous les hooks OAuth

## ⚠️ Prérequis

Pour Docker Compose :
- Docker & Docker Compose installés
- Minimum 4GB RAM disponible
- Ports libres : 3000, 5432, 8080, 9735, 10009, 18443

Pour Cargo :
- Rust installé (via rustup)
- PostgreSQL en cours d'exécution
- Variables d'environnement configurées dans `token4good-backend/.env`

## 🔍 Dépannage

### Backend ne démarre pas
```bash
# Vérifier les logs Docker
docker-compose -f docker-compose.dev.yml logs backend

# Vérifier que le port 3000 est libre
lsof -i :3000
```

### Erreur de connexion PostgreSQL
```bash
# Vérifier que PostgreSQL est démarré
docker-compose -f docker-compose.dev.yml ps postgres

# Recréer la base de données
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Erreur "Failed to fetch"
1. Vérifier que le backend répond : `curl http://localhost:3000/health`
2. Vérifier la configuration : `cat .env.local | grep API_URL`
3. Redémarrer le frontend : Ctrl+C puis `npm run dev`

## 📚 Documentation Complète

- Backend Setup : `token4good-backend/README_SETUP.md`
- Configuration : `CONFIGURATION_DEV_LOCAL.md`
- Architecture : `.cursor/rules/architecture-token4good.mdc`
