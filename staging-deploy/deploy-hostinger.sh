#!/bin/bash
# Déploiement Token4Good sur Hostinger via SCP + SSH

set -euo pipefail

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REMOTE_USER="${HOSTINGER_USER:-root}"
REMOTE_HOST="${HOSTINGER_HOST:-147.79.101.32}"
REMOTE_DIR="${HOSTINGER_REMOTE_DIR:-/var/www/token4good}"
REMOTE_TARBALL="/tmp/token4good-hostinger.tar.gz"

info() { echo -e "${BLUE}$1${NC}"; }
success() { echo -e "${GREEN}$1${NC}"; }
warn() { echo -e "${YELLOW}$1${NC}"; }
error() { echo -e "${RED}$1${NC}"; }

# Vérifications de base
declare -a REQUIRED_FILES=(
  "apps/dapp/package.json"
  "token4good-backend/Cargo.toml"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    error "Fichier requis manquant: $file"
    exit 1
  fi
done

warn "Assure-toi que 'cargo check', 'cargo test', 'yarn install' et 'yarn type-check' ont été exécutés avec succès AVANT le déploiement."
read -p "Poursuivre le déploiement sur ${REMOTE_USER}@${REMOTE_HOST}? (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  warn "Déploiement annulé."
  exit 0
fi

info "🚧 Préparation du paquet de déploiement"
TEMP_DIR="$(mktemp -d)"
ARCHIVE_PATH="$TEMP_DIR/token4good-hostinger.tar.gz"

# Exclure ce qui ne doit pas partir en production
info "🔧 Création de l'archive (exclusion: .git, node_modules, target, .env*)"
tar --exclude='.git' \
    --exclude='node_modules' \
    --exclude='apps/dapp/.next' \
    --exclude='apps/dapp/out' \
    --exclude='token4good-backend/target' \
    --exclude='.env*' \
    -czf "$ARCHIVE_PATH" .

success "Archive prête: $ARCHIVE_PATH"

info "📦 Transfert du paquet vers Hostinger"
scp "$ARCHIVE_PATH" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_TARBALL}"

info "🛠️ Déploiement distant (extraction + commandes personnalisables)"
ssh "${REMOTE_USER}@${REMOTE_HOST}" <<EOF
set -euo pipefail
mkdir -p "${REMOTE_DIR}"
tar -xzf "${REMOTE_TARBALL}" -C "${REMOTE_DIR}" --strip-components=1
rm -f "${REMOTE_TARBALL}"

cd "${REMOTE_DIR}"

# TODO: Adapter les commandes suivantes à l'infrastructure Hostinger
# Exemple pour reconstruire le frontend Next.js et backend Rust :
# npm install --production --prefix apps/dapp
# npm run build --prefix apps/dapp
# cargo build --release --manifest-path token4good-backend/Cargo.toml
# systemctl restart token4good-frontend.service
# systemctl restart token4good-backend.service

echo "Déploiement terminé sur \$(hostname)" >&2
EOF

rm -rf "$TEMP_DIR"
success "✅ Déploiement Hostinger terminé. Personnalise les commandes distantes si besoin."
