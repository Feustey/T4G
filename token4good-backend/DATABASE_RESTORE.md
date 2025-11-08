# 🔧 Guide de Restauration de la Base de Données

Ce guide explique comment restaurer complètement la structure de la base de données PostgreSQL pour Token4Good.

## 📋 Prérequis

- PostgreSQL accessible (local, Docker, ou Supabase)
- Variable d'environnement `DATABASE_URL` configurée
- `sqlx-cli` installé (optionnel, pour la méthode 1)

## 🚀 Méthodes de Restauration

### Méthode 1 : Via les Migrations SQLx (Recommandé)

Le backend Rust applique automatiquement les migrations au démarrage, mais vous pouvez aussi les appliquer manuellement :

```bash
# Installer sqlx-cli si nécessaire
cargo install sqlx-cli --no-default-features --features postgres

# Appliquer les migrations
cd token4good-backend
sqlx migrate run

# Ou utiliser le script fourni
./scripts/apply-migrations.sh
```

**Avantages :**
- Gestion automatique des versions de migration
- Suivi des migrations appliquées dans `_sqlx_migrations`
- Idempotent (peut être exécuté plusieurs fois sans erreur)

### Méthode 2 : Script SQL Complet

Si les migrations SQLx ne fonctionnent pas ou pour Supabase, utilisez le script SQL complet :

```bash
# Via psql
psql $DATABASE_URL -f token4good-backend/scripts/restore-database-schema.sql

# Ou depuis Supabase SQL Editor
# 1. Ouvrir Supabase Dashboard → SQL Editor
# 2. Copier le contenu de `scripts/restore-database-schema.sql`
# 3. Coller et exécuter
```

**Avantages :**
- Fonctionne partout (psql, Supabase, pgAdmin, etc.)
- Restauration complète en une seule commande
- Pas de dépendance à sqlx-cli

### Méthode 3 : Démarrage du Backend

Le backend applique automatiquement les migrations au démarrage :

```bash
cd token4good-backend
DATABASE_URL="postgresql://..." cargo run
```

Les migrations sont exécutées automatiquement dans `src/services/database.rs`.

## 📊 Structure Créée

### Tables Principales

- **users** - Utilisateurs avec tous les champs (auth, profil, wallet)
- **mentoring_requests** - Demandes de mentoring
- **mentoring_proofs** - Preuves RGB de mentoring
- **proofs** - Système de preuves génériques
- **services** - Services proposés
- **service_categories** - Catégories de services
- **blockchain_transactions** - Transactions blockchain
- **experiences** - Expériences professionnelles
- **notifications** - Notifications utilisateurs

### Migrations

1. **001_initial.sql** - Tables de base (users, mentoring, proofs)
2. **002_add_services_and_categories.sql** - Services, catégories, transactions
3. **003_add_user_auth_fields.sql** - Champs d'authentification (email_verified, last_login)

## ✅ Vérification

Après restauration, vérifiez que toutes les tables sont créées :

```sql
-- Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier les migrations SQLx appliquées
SELECT * FROM _sqlx_migrations ORDER BY installed_on;

-- Vérifier les index
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Test d'insertion
INSERT INTO users (id, email, firstname, lastname, username, role, lightning_address) 
VALUES ('test-' || gen_random_uuid()::text, 'test@example.com', 'Test', 'User', 'testuser', 'alumni', 'test@lightning.token4good.com');
```

## 🔍 Dépannage

### Erreur : "relation already exists"
- Normal si les tables existent déjà
- Les migrations utilisent `CREATE TABLE IF NOT EXISTS`
- Les colonnes utilisent `ADD COLUMN IF NOT EXISTS`

### Erreur : "permission denied"
- Vérifiez les permissions de l'utilisateur PostgreSQL
- Pour Supabase, utilisez le service role

### Erreur : "extension does not exist"
- Certaines migrations nécessitent des extensions PostgreSQL
- Exécutez : `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### Migrations SQLx ne fonctionnent pas
- Vérifiez que `DATABASE_URL` est correct
- Utilisez la Méthode 2 (script SQL complet)

## 📝 Notes

- Toutes les migrations sont **idempotentes** (peuvent être exécutées plusieurs fois)
- Les données existantes ne seront **pas supprimées**
- Seule la structure (schéma) est restaurée, pas les données
- Pour restaurer des données, utilisez un dump/restore PostgreSQL

## 🔗 Fichiers Utiles

- `migrations/001_initial.sql` - Migration initiale
- `migrations/002_add_services_and_categories.sql` - Services et catégories
- `migrations/003_add_user_auth_fields.sql` - Champs d'authentification
- `scripts/apply-migrations.sh` - Script d'application des migrations
- `scripts/restore-database-schema.sql` - Script SQL complet

