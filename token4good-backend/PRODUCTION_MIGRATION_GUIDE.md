# 🔧 Guide d'Exécution de la Migration Production

## ✅ Fichiers Créés

1. **Migration SQL complète** : `migrations/005_production_complete_migration.sql`
2. **Script d'exécution** : `scripts/apply-production-migration.sh`

## 🚀 Méthodes d'Exécution

### Méthode 1 : Via le Script Shell (Recommandé)

```bash
cd token4good-backend

# Option A : Fournir la DATABASE_URL en argument
./scripts/apply-production-migration.sh 'postgresql://user:password@host:port/database'

# Option B : Utiliser la variable d'environnement
export DATABASE_URL='postgresql://user:password@host:port/database'
./scripts/apply-production-migration.sh
```

### Méthode 2 : Via psql Directement

```bash
cd token4good-backend

# Exécuter directement avec psql
psql 'postgresql://user:password@host:port/database' -f migrations/005_production_complete_migration.sql
```

### Méthode 3 : Via Supabase SQL Editor

1. Ouvrir le dashboard Supabase : https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **SQL Editor**
4. Copier le contenu de `migrations/005_production_complete_migration.sql`
5. Coller dans l'éditeur SQL
6. Cliquer sur **Run**

### Méthode 4 : Via Railway CLI

```bash
cd token4good-backend

# Si vous utilisez Railway
railway run psql -f migrations/005_production_complete_migration.sql
```

## 📋 Ce que fait la Migration

La migration complète crée et met à jour :

### Tables Principales
- ✅ `users` (avec tous les champs des migrations 001, 002, 003)
- ✅ `mentoring_requests`
- ✅ `mentoring_proofs`
- ✅ `proofs`

### Tables Services
- ✅ `service_categories`
- ✅ `services`
- ✅ `blockchain_transactions`
- ✅ `experiences`
- ✅ `notifications`

### Tables Token4Good (T4G)
- ✅ `t4g_token_transactions`
- ✅ `t4g_mentoring_sessions`
- ✅ `t4g_services`
- ✅ `t4g_bookings`

### Fonctionnalités
- ✅ Tous les index nécessaires
- ✅ Triggers pour `updated_at` automatique
- ✅ Fonction `calculate_user_level()`
- ✅ Vérifications finales

## 🔍 Vérification Post-Migration

Après l'exécution, vérifiez que toutes les tables sont créées :

```sql
SELECT 
    'Migration complète' as status,
    COUNT(*) FILTER (WHERE table_name IN ('users', 'mentoring_requests', 'mentoring_proofs', 'proofs')) as tables_mentoring,
    COUNT(*) FILTER (WHERE table_name IN ('service_categories', 'services', 'blockchain_transactions', 'experiences', 'notifications')) as tables_services,
    COUNT(*) FILTER (WHERE table_name LIKE 't4g_%') as tables_t4g
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'users', 'mentoring_requests', 'mentoring_proofs', 'proofs',
    'service_categories', 'services', 'blockchain_transactions',
    'experiences', 'notifications',
    't4g_token_transactions', 't4g_mentoring_sessions',
    't4g_services', 't4g_bookings'
);
```

## ⚠️ Notes Importantes

1. **Idempotent** : Le script peut être exécuté plusieurs fois sans erreur
2. **Sans perte de données** : Les tables existantes ne sont pas supprimées
3. **Colonnes manquantes** : Les colonnes manquantes sont ajoutées automatiquement
4. **Index** : Les index sont créés uniquement s'ils n'existent pas

## 🚨 En cas d'erreur

Si vous rencontrez des erreurs :

1. **Vérifier la connexion** :
   ```bash
   psql 'postgresql://...' -c "SELECT 1;"
   ```

2. **Vérifier les permissions** : L'utilisateur doit avoir les droits CREATE, ALTER, etc.

3. **Vérifier les extensions** : Les extensions `uuid-ossp` et `pgcrypto` doivent être disponibles

4. **Consulter les logs** : Les erreurs détaillées sont affichées dans la console





