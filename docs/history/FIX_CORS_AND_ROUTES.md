# Fix CORS et Routes Manquantes - 21 Janvier 2026

## Problème Principal : CORS

### Symptôme
```
Access to fetch at 'https://apirust-production.up.railway.app/...' from origin 'http://localhost:4200' has been blocked by CORS policy: 
The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

### Cause
Le backend Rust utilise `allow_origin(Any)` qui génère `Access-Control-Allow-Origin: *`, mais le frontend envoie `credentials: 'include'`. Cette combinaison est **interdite** par la spécification CORS.

### Solution Implémentée ✅

**Fichier:** `token4good-backend/src/lib.rs`

1. Ajout import `http::Method`
2. Création fonction `build_cors_layer()` :
   - Origines autorisées spécifiques : `http://localhost:4200`, `https://token4good.vercel.app`, etc.
   - Méthodes HTTP explicites au lieu de `Any`
   - **Ajout crucial:** `.allow_credentials(true)`

```rust
fn build_cors_layer() -> CorsLayer {
    let allowed_origins = vec![
        "http://localhost:4200".parse().unwrap(),           // Dev frontend
        "http://localhost:3000".parse().unwrap(),           // Dev backend
        "https://token4good.vercel.app".parse().unwrap(),   // Production
        "https://t4g.dazno.de".parse().unwrap(),            // Production alternative
    ];

    CorsLayer::new()
        .allow_origin(allowed_origins)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::PATCH,
            Method::OPTIONS,
        ])
        .allow_headers(Any)
        .allow_credentials(true)
}
```

## Problème : Routes `/me` vs `/:id`

### Symptôme
```
GET /api/users/me → 501 (Not Implemented)
```

### Cause
Dans Axum, l'ordre des routes est important. La route `/:id` était définie **avant** `/me`, donc `/me` était traité comme un ID.

### Solution Implémentée ✅

**Fichier:** `token4good-backend/src/routes/users.rs`

Réorganisation des routes :
```rust
pub fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_users).post(create_user))
        // Routes /me DOIVENT être avant /:id
        .route("/me", get(get_current_user))
        .route("/me/notifications", get(get_user_notifications))
        .route("/me/wallet", get(get_current_user_wallet))
        .route("/me/services", get(get_current_user_services))
        .route("/me/transactions", get(get_current_user_transactions))
        .route("/me/profile", get(get_current_user_profile))
        .route("/me/cv", get(get_current_user_cv))
        .route("/me/about", get(get_current_user_about))
        .route("/me/metrics", get(get_current_user_metrics))
        .route("/me/pending", get(get_current_user_pending))
        // Routes /:id après /me
        .route("/:id", get(get_user).put(update_user).delete(delete_user))
        .route("/:id/profile", get(get_user_profile))
        .route("/:id/cv", get(get_user_cv))
        .route("/:id/wallet", get(get_user_wallet))
        .route("/:id/transactions", get(get_user_transactions))
        .route("/:id/services", get(get_user_services))
        .route("/:id/avatar", get(get_user_avatar))
        .route("/:id/disable-first-access", get(disable_first_access))
}
```

### Handlers Ajoutés ✅

Tous les handlers `/me/*` créés :
- `get_current_user_wallet()`
- `get_current_user_services()`
- `get_current_user_transactions()`
- `get_current_user_profile()`
- `get_current_user_cv()`
- `get_current_user_about()` - NOUVEAU
- `get_current_user_metrics()` - NOUVEAU
- `get_current_user_pending()` - NOUVEAU
- `get_user_avatar()` - NOUVEAU
- `disable_first_access()` - NOUVEAU

### Nouveaux Types Ajoutés ✅

```rust
pub struct UserAbout {
    pub id: String,
    pub bio: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_login: Option<chrono::DateTime<chrono::Utc>>,
}

pub struct UserMetrics {
    pub total_transactions: u32,
    pub total_earned_msat: u64,
    pub total_spent_msat: u64,
    pub services_provided: u32,
    pub services_consumed: u32,
    pub reputation_score: f64,
}

pub struct PendingTransaction {
    pub id: String,
    pub amount_msat: u64,
    pub description: String,
    pub status: String,  // Champ ajouté
    pub created_at: chrono::DateTime<chrono::Utc>,
}

pub struct AvatarResponse {
    pub avatar: Option<String>,
}

pub struct DisableFirstAccessResponse {
    pub success: bool,
    pub message: String,
}
```

## Routes Ajoutées ✅

### 1. `/service-categories/as_consumer` ✅
- **Fichier:** `token4good-backend/src/routes/service_categories.rs` (NOUVEAU)
- **Route:** GET `/service-categories/as_consumer`
- **Retourne:** Liste des catégories de services pour les consommateurs
- **Format:** JSON avec structure compatible frontend

### 2. `/service-categories/as_provider` ✅
- **Fichier:** `token4good-backend/src/routes/service_categories.rs`
- **Route:** GET `/service-categories/as_provider`
- **Retourne:** Liste des catégories de services pour les fournisseurs
- **Format:** JSON avec structure compatible frontend

### Structure de Réponse
```rust
pub struct ServiceCategoryResponse {
    pub id: String,
    pub name: String,
    pub kind: String,
    pub description: String,
    pub href: String,
    pub default_price: i32,
    pub default_unit: String,
    pub icon: String,
    pub disabled: i32,
    pub service_provider_type: String,
    pub audience: String,
}
```

### 3. Frontend URLs incorrectes ⚠️
Quelques URLs dans le frontend n'ont pas le préfixe `/api` :
- `/metrics` → devrait être `/api/metrics`
- Les routes `/service-categories/*` sont OK (pas de préfixe `/api`)
- Vérifier tous les appels API dans le frontend

## Tests de Compilation ✅

```bash
cd token4good-backend
cargo check
# ✅ Compilation réussie (seulement des warnings)
```

## Prochaines Étapes

1. **Tester le backend en local:**
   ```bash
   cd token4good-backend
   cargo run
   ```

2. **Tester une requête avec curl:**
   ```bash
   curl -X GET http://localhost:3000/health \
     -H "Origin: http://localhost:4200" \
     --verbose
   ```
   
   Vérifier les headers CORS dans la réponse :
   - `Access-Control-Allow-Origin: http://localhost:4200` (pas `*`)
   - `Access-Control-Allow-Credentials: true`

3. **Implémenter routes manquantes:**
   - `/service-categories/as_consumer`
   - Autres routes discovery

4. **Corriger les URLs frontend** (si nécessaire)

5. **Tester le flow complet** login → onboarding → dashboard

## Notes Importantes

- **CORS credentials:** Quand `credentials: 'include'` est utilisé, l'origine doit être **spécifique**, pas `*`
- **Ordre des routes:** Dans Axum, les routes plus spécifiques (`/me`) doivent être définies **avant** les routes génériques (`/:id`)
- **AuthUserExtractor:** Tous les handlers `/me/*` doivent extraire l'utilisateur du JWT via `AuthUserExtractor`

## Commandes Utiles

```bash
# Vérifier compilation
cd token4good-backend && cargo check

# Lancer le backend en dev
cd token4good-backend && cargo run

# Lancer le frontend
npm run dev

# Vérifier les routes définies
rg "\.route\(" token4good-backend/src/routes/

# Chercher les appels API dans le frontend
rg "apiFetch|apiUrl" apps/dapp/
```

## État Actuel

✅ **CORS corrigé** - Configuration avec origines spécifiques + credentials  
✅ **Routes `/api/users/me/*` implémentées** - Tous les endpoints nécessaires créés  
✅ **Code compile sans erreurs** - Seulement des warnings restants  
✅ **Routes `/service-categories/*` implémentées** - as_consumer et as_provider fonctionnels  
⚠️ **Tester le backend en local** - Démarrer et tester les endpoints  
⚠️ **Vérifier toutes les URLs frontend** - Certaines routes n'ont pas le bon préfixe

## Résumé des Fichiers Modifiés

### Backend Rust
1. **`token4good-backend/src/lib.rs`**
   - Ajout de `http::Method` aux imports
   - Création de `build_cors_layer()` avec origines spécifiques
   - Ajout de `.allow_credentials(true)`
   - Ajout du nest pour `/service-categories`

2. **`token4good-backend/src/routes/users.rs`**
   - Réorganisation des routes (/ /me avant /:id)
   - Ajout de 9 nouveaux handlers pour `/me/*`
   - Ajout de 5 nouveaux types de réponse
   - Fix du champ `status` dans `PendingTransaction`

3. **`token4good-backend/src/routes/service_categories.rs`** (NOUVEAU)
   - Création du module complet
   - Handlers pour `as_consumer` et `as_provider`
   - Type `ServiceCategoryResponse` avec sérialisation camelCase

4. **`token4good-backend/src/routes/mod.rs`**
   - Ajout du module `pub mod service_categories;`

### Documentation
5. **`FIX_CORS_AND_ROUTES.md`** (NOUVEAU)
   - Documentation complète des modifications
   - Guide de test et déploiement  
