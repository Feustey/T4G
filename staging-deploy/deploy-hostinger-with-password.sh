#!/bin/bash
# Déploiement Token4Good sur Hostinger via SCP + SSH avec mot de passe

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
SSH_PASSWORD="Criteria0-Cadmium5-Attempt9-Exit2-Floss1"

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
sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no "$ARCHIVE_PATH" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_TARBALL}"

info "🛠️ Déploiement distant (extraction + installation)"
sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no "${REMOTE_USER}@${REMOTE_HOST}" <<EOF
set -euo pipefail
mkdir -p "${REMOTE_DIR}"
tar -xzf "${REMOTE_TARBALL}" -C "${REMOTE_DIR}" --strip-components=1
rm -f "${REMOTE_TARBALL}"

cd "${REMOTE_DIR}"

echo "Structure déployée dans ${REMOTE_DIR}:" >&2
ls -la >&2

echo "Contenu du backend:" >&2
ls -la token4good-backend/ >&2

echo "Déploiement terminé sur \$(hostname)" >&2
echo "Localisation: ${REMOTE_DIR}" >&2
EOF

rm -rf "$TEMP_DIR"
success "✅ Déploiement Hostinger terminé avec succès!"