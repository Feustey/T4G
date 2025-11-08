#!/bin/bash

set -euo pipefail

echo "Starting Token4Good Backend (external Lightning / Bitcoin)..."

# Dossier pour données applicatives (ex: RGB)
mkdir -p /app/data/rgb

# Lancer l’API Rust
exec /app/token4good-backend
