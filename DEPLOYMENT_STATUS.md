# 📊 État du Déploiement PostgreSQL

## ✅ Ce qui est fait

### Migration PostgreSQL
- ✅ Migration SQL complète (002_add_services_and_categories.sql)
- ✅ Backend Rust avec PostgreSQL compilé localement
- ✅ Frontend avec DAOs PostgreSQL
- ✅ Commit de migration créé

### Fichiers de configuration
- ✅ `.env.production` pour le backend
- ✅ `.env.production` pour le frontend
- ✅ Script de déploiement `deploy-production-postgres.sh`
- ✅ Service systemd configuré

## ⚠️ Problème rencontré

### Incompatibilité binaire macOS → Linux

Le binaire Rust compilé sur macOS (Darwin) **ne peut pas s'exécuter sur Linux** (le serveur de production).

**Erreur :**
```
status=203/EXEC
ldd: not a dynamic executable
```

## 🔧 Solution requise

### Option 1 : Compilation sur le serveur (Recommandé)

Il faut installer Rust/Cargo sur le serveur de production :

```bash
# SSH sur le serveur
ssh root@147.79.101.32

# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Compiler le backend
cd /var/www/token4good/token4good-backend
cargo build --release

# Redémarrer le service
systemctl restart token4good-backend.service
```

### Option 2 : Cross-compilation (Alternative)

Compiler depuis macOS pour Linux :

```bash
# Installer cross-compilation
rustup target add x86_64-unknown-linux-gnu
brew install filosottile/musl-cross/musl-cross

# Compiler
cd token4good-backend
cargo build --release --target x86_64-unknown-linux-gnu

# Copier le binaire
scp target/x86_64-unknown-linux-gnu/release/token4good-backend root@147.79.101.32:/var/www/token4good/token4good-backend/target/release/
```

### Option 3 : Docker (Best Practice)

Créer une image Docker pour garantir la portabilité :

```dockerfile
# Dockerfile
FROM rust:1.75 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
COPY --from=builder /app/target/release/token4good-backend /usr/local/bin/
CMD ["token4good-backend"]
```

## 📋 Configuration actuelle du serveur

### Base de données
```
DATABASE_URL=postgresql://postgres.ftpnieqpzstcdttmcsen:***@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### Service systemd
```ini
[Unit]
Description=Token4Good Rust Backend (PostgreSQL)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/token4good/token4good-backend
EnvironmentFile=/var/www/token4good/token4good-backend/.env
ExecStart=/var/www/token4good/token4good-backend/target/release/token4good-backend
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Fichiers déployés
- ✅ Code source : `/var/www/token4good/`
- ✅ Migrations SQL : `/var/www/token4good/token4good-backend/migrations/`
- ✅ Configuration : `/var/www/token4good/token4good-backend/.env`
- ❌ **Binaire incompatible** : `/var/www/token4good/token4good-backend/target/release/token4good-backend`

## 🚀 Prochaines étapes

1. **Installer Rust sur le serveur**
   ```bash
   ssh root@147.79.101.32 'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y'
   ```

2. **Compiler le backend sur le serveur**
   ```bash
   ssh root@147.79.101.32 'source ~/.cargo/env && cd /var/www/token4good/token4good-backend && cargo build --release'
   ```

3. **Démarrer le service**
   ```bash
   ssh root@147.79.101.32 'systemctl restart token4good-backend.service && systemctl status token4good-backend.service'
   ```

4. **Vérifier que le backend répond**
   ```bash
   curl http://147.79.101.32:8080/health
   ```

5. **Déployer et configurer le frontend**
   - Mettre à jour `.env.local` avec `NEXT_PUBLIC_USE_POSTGRES=true`
   - Pointer `NEXT_PUBLIC_API_URL` vers `http://147.79.101.32:8080`
   - Build et démarrer avec PM2

## 📝 Notes importantes

- Le backend est **prêt** - il compile sans erreur en local
- La migration SQL est **complète**
- Le problème est **uniquement** le déploiement du binaire cross-platform
- Une fois Rust installé sur le serveur, le déploiement sera **instantané**

## 🎯 Commande rapide de déploiement

Une fois Rust installé :

```bash
./deploy-production-postgres.sh
```

Ou manuellement :

```bash
ssh root@147.79.101.32 << 'EOF'
source ~/.cargo/env
cd /var/www/token4good/token4good-backend
cargo build --release
systemctl restart token4good-backend.service
systemctl status token4good-backend.service
EOF
```
