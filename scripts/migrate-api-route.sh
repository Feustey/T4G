#!/bin/bash
# scripts/migrate-api-route.sh
# Outil d'aide à la migration des routes API Next.js vers Backend Rust

set -e

API_ROUTE=$1  # Ex: auth/login
BACKEND_DIR="token4good-backend/src/routes"
FRONTEND_DIR="apps/dapp/pages/api"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Vérifier les arguments
if [ -z "$API_ROUTE" ]; then
  print_error "Usage: ./scripts/migrate-api-route.sh <route>"
  echo "Example: ./scripts/migrate-api-route.sh auth/login"
  exit 1
fi

print_header "🔄 Migration de la route API: $API_ROUTE"

# 1. Vérifier que la route Next.js existe
NEXTJS_FILE="$FRONTEND_DIR/$API_ROUTE.ts"
if [ ! -f "$NEXTJS_FILE" ] && [ ! -f "${NEXTJS_FILE}x" ]; then
  NEXTJS_FILE="${FRONTEND_DIR}/${API_ROUTE}.tsx"
  if [ ! -f "$NEXTJS_FILE" ]; then
    print_error "Route Next.js non trouvée: $FRONTEND_DIR/$API_ROUTE.ts(x)"
    exit 1
  fi
fi

print_success "Route Next.js trouvée: $NEXTJS_FILE"

# 2. Extraire le module backend (première partie du chemin)
MODULE=$(echo $API_ROUTE | cut -d'/' -f1)
BACKEND_FILE="$BACKEND_DIR/$MODULE.rs"

echo ""
print_success "Module backend identifié: $MODULE"
print_success "Fichier backend: $BACKEND_FILE"

# 3. Extraire le nom de la fonction depuis le chemin
FUNCTION_NAME=$(echo $API_ROUTE | sed 's/\//_/g')

# 4. Analyser la route Next.js pour extraire des informations
echo ""
print_header "📝 Analyse de la route Next.js"

if grep -q "POST" "$NEXTJS_FILE" || grep -q "post" "$NEXTJS_FILE"; then
  HTTP_METHOD="POST"
  RUST_METHOD="post"
elif grep -q "PUT" "$NEXTJS_FILE" || grep -q "put" "$NEXTJS_FILE"; then
  HTTP_METHOD="PUT"
  RUST_METHOD="put"
elif grep -q "DELETE" "$NEXTJS_FILE" || grep -q "delete" "$NEXTJS_FILE"; then
  HTTP_METHOD="DELETE"
  RUST_METHOD="delete"
else
  HTTP_METHOD="GET"
  RUST_METHOD="get"
fi

print_success "Méthode HTTP détectée: $HTTP_METHOD"

# 5. Afficher un template pour le backend
echo ""
print_header "📋 Template Backend Rust"

cat <<EOF

// À ajouter dans $BACKEND_FILE

#[${RUST_METHOD}("/${API_ROUTE}")]
pub async fn ${FUNCTION_NAME}(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<${FUNCTION_NAME^}Request>,
) -> Result<Json<${FUNCTION_NAME^}Response>, StatusCode> {
    // TODO: Migrer la logique depuis $NEXTJS_FILE
    
    // 1. Validation des données
    // 2. Appel aux services (db, dazno, rgb, etc.)
    // 3. Transformation des données
    // 4. Retour de la réponse
    
    todo!("Implement ${API_ROUTE} migration")
}

// Structures de données
#[derive(Debug, Deserialize)]
pub struct ${FUNCTION_NAME^}Request {
    // TODO: Extraire depuis $NEXTJS_FILE
}

#[derive(Debug, Serialize)]
pub struct ${FUNCTION_NAME^}Response {
    // TODO: Extraire depuis $NEXTJS_FILE
}

EOF

# 6. Template pour la mise à jour du frontend
echo ""
print_header "📋 Mise à Jour Frontend"

cat <<EOF

// Dans apps/dapp/services/apiClient.ts ou le fichier correspondant

// AVANT:
const result = await fetch('/api/${API_ROUTE}', {
  method: '${HTTP_METHOD}',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})

// APRÈS:
const result = await fetch(\`\${config.apiUrl}/api/${API_ROUTE}\`, {
  method: '${HTTP_METHOD}',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`  // Si authentification requise
  },
  body: JSON.stringify(data)
})

EOF

# 7. Instructions pas à pas
echo ""
print_header "✅ Prochaines Étapes"

cat <<EOF

1. Copier le template backend ci-dessus dans: ${BLUE}$BACKEND_FILE${NC}

2. Ouvrir la route Next.js pour analyser la logique:
   ${BLUE}$NEXTJS_FILE${NC}

3. Migrer la logique métier vers le backend Rust

4. Mettre à jour les appels API dans le frontend

5. Tester localement:
   ${BLUE}# Backend${NC}
   cd token4good-backend
   cargo test
   cargo run

   ${BLUE}# Frontend${NC}
   cd apps/dapp
   npm run dev

6. Tester la route migrée:
   ${BLUE}curl -X ${HTTP_METHOD} http://localhost:3000/api/${API_ROUTE} \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer \$TOKEN" \\
     -d '{}'${NC}

7. Déployer:
   ${BLUE}git add .
   git commit -m "feat: migrate /${API_ROUTE} to backend Rust"
   git push origin main${NC}

8. Valider en production (24h de monitoring)

9. Supprimer l'ancienne route:
   ${BLUE}git rm $NEXTJS_FILE
   git commit -m "chore: remove deprecated Next.js route /${API_ROUTE}"
   git push origin main${NC}

EOF

# 8. Checklist
echo ""
print_header "📋 Checklist de Migration"

cat <<EOF

- [ ] Backend Rust: Handler créé dans $BACKEND_FILE
- [ ] Backend Rust: Structures de données définies
- [ ] Backend Rust: Logique migrée et testée
- [ ] Backend Rust: Tests unitaires ajoutés
- [ ] Frontend: Appels API mis à jour
- [ ] Frontend: Types TypeScript mis à jour
- [ ] Tests locaux: Backend OK
- [ ] Tests locaux: Frontend OK
- [ ] Tests E2E: Flow complet validé
- [ ] Déployé en production
- [ ] Monitoring 24h: Pas d'erreurs
- [ ] Ancienne route Next.js supprimée
- [ ] Documentation mise à jour

EOF

print_success "✅ Plan de migration généré !"
echo ""
print_warning "📚 Documentation complète: FRONTEND_MIGRATION_PLAN.md"
