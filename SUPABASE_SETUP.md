# Configuration Supabase pour Token4Good RGB

## 🚀 Étapes de déploiement

### 1. Créer le projet Supabase

1. Aller sur [https://supabase.com](https://supabase.com)
2. Se connecter ou créer un compte
3. Cliquer sur "New Project"
4. Choisir une organisation
5. Configurer le projet :
   - **Nom** : `token4good-rgb`
   - **Mot de passe de base** : (générer un mot de passe fort)
   - **Région** : Europe (eu-central-1) ou la plus proche
   - **Plan** : Free ou Pro selon les besoins

### 2. Exécuter le schéma de base de données

1. Aller dans l'onglet **SQL Editor** de Supabase
2. Copier tout le contenu du fichier `supabase-final-schema.sql`
3. Le coller dans l'éditeur SQL
4. Cliquer sur **Run** pour exécuter le script
5. Vérifier qu'aucune erreur n'apparaît

### 3. Vérifier la structure créée

#### Tables créées :
- ✅ `users` - Utilisateurs avec UUID
- ✅ `mentoring_requests` - Demandes de mentoring
- ✅ `mentoring_proofs` - Preuves RGB de mentoring
- ✅ `proofs` - Système de preuves génériques
- ✅ `user_sessions` - Sessions d'authentification

#### Vérifications à effectuer :

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier les index
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Vérifier les contraintes
SELECT conname, contype FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace;

-- Tester l'insertion d'un utilisateur
INSERT INTO users (email, firstname, lastname, username, role, lightning_address) 
VALUES ('test@example.com', 'Test', 'User', 'testuser', 'alumni', 'test@lightning.token4good.com');

-- Vérifier l'insertion
SELECT id, email, username, role, created_at FROM users LIMIT 1;
```

### 4. Récupérer les informations de connexion

1. Aller dans **Settings** → **Database**
2. Copier les informations de connexion :

```bash
# URL de connexion
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.glikbylflheewbonytev.supabase.co:5432/postgres

# Informations détaillées
Host: db.glikbylflheewbonytev.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: [YOUR-PASSWORD]
```

### 5. Configurer Row Level Security (RLS)

Le schéma active automatiquement RLS avec les policies suivantes :

#### Policies configurées :
- **Users** : Accès en lecture/écriture à son propre profil
- **Mentoring Requests** : Accès aux demandes où l'utilisateur est mentee ou mentor
- **Proofs** : Accès aux preuves liées à l'utilisateur
- **Service Role** : Accès complet pour le backend

#### Vérifier RLS :
```sql
-- Vérifier que RLS est activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Lister les policies
SELECT schemaname, tablename, policyname, permissive, roles 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 6. Tester les fonctionnalités

#### Test des triggers :
```sql
-- Insérer un utilisateur
INSERT INTO users (email, firstname, lastname, username, role, lightning_address) 
VALUES ('trigger-test@example.com', 'Trigger', 'Test', 'triggertest', 'mentee', 'trigger@lightning.token4good.com');

-- Mettre à jour et vérifier que updated_at change
UPDATE users SET firstname = 'Updated' WHERE email = 'trigger-test@example.com';

-- Vérifier
SELECT created_at, updated_at FROM users WHERE email = 'trigger-test@example.com';
```

#### Test des vues :
```sql
-- Tester la vue des utilisateurs actifs
SELECT * FROM active_users_stats LIMIT 5;

-- Tester la vue des demandes détaillées
SELECT * FROM mentoring_requests_detailed LIMIT 5;
```

### 7. Configuration des variables d'environnement

#### Pour Vercel (Frontend) :
```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.glikbylflheewbonytev.supabase.co:5432/postgres
NEXTAUTH_URL=https://app.token-for-good.com
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
NEXT_PUBLIC_API_URL=https://token4good-backend-production.up.railway.app
NEXT_PUBLIC_DAZNO_API_URL=https://api.dazno.de
NEXT_PUBLIC_DAZNO_USERS_API_URL=https://dazno.de/api
NODE_ENV=production
```

#### Pour Railway (Backend Rust) :
```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.glikbylflheewbonytev.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
RGB_DATA_DIR=/tmp/rgb_data
RUST_LOG=info
PORT=3000
ENVIRONMENT=production
```

### 8. Monitoring et observabilité

#### Dans Supabase Dashboard :

1. **Database** → **Logs** : Surveiller les requêtes
2. **Database** → **Reports** : Performances et utilisation
3. **API** → **Logs** : Logs des API calls
4. **Auth** → **Users** : Gestion des utilisateurs

#### Métriques importantes à surveiller :
- Nombre de connexions actives
- Temps de réponse des requêtes
- Utilisation du stockage
- Nombre d'utilisateurs actifs

### 9. Backup et sécurité

#### Backup automatique :
- Supabase effectue des backups automatiques
- Les backups point-in-time sont disponibles
- Configuration dans **Settings** → **Database** → **Backups**

#### Sécurité :
- ✅ RLS activé sur toutes les tables
- ✅ Contraintes de validation en place
- ✅ Index pour les performances
- ✅ Triggers pour l'intégrité des données

### 10. Tests de charge (optionnel)

```sql
-- Script de test de charge basique
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..1000 LOOP
        INSERT INTO users (email, firstname, lastname, username, role, lightning_address) 
        VALUES (
            'loadtest' || i || '@example.com',
            'Load',
            'Test' || i,
            'loadtest' || i,
            CASE WHEN i % 3 = 0 THEN 'mentor' ELSE 'mentee' END,
            'loadtest' || i || '@lightning.token4good.com'
        );
    END LOOP;
END $$;

-- Vérifier les performances
EXPLAIN ANALYZE SELECT * FROM users WHERE role = 'mentor' LIMIT 10;
```

## ✅ Checklist de validation

- [ ] Projet Supabase créé
- [ ] Schéma SQL exécuté sans erreur
- [ ] Toutes les tables créées (5 tables)
- [ ] Index créés et fonctionnels
- [ ] RLS activé avec policies
- [ ] Triggers fonctionnels (updated_at)
- [ ] Vues créées et accessibles
- [ ] Test d'insertion/mise à jour réussi
- [ ] URL de connexion récupérée
- [ ] Variables d'environnement configurées
- [ ] Tests de base passés

## 🔧 Dépannage

### Erreurs communes :

**"Extension uuid-ossp not available"**
```sql
-- Exécuter en tant que superuser
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**"RLS Policy prevents access"**
```sql
-- Vérifier les policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

**"Foreign key constraint violation"**
```sql
-- Vérifier l'ordre d'insertion des données
-- Toujours insérer users avant mentoring_requests
```

### Support :
- Documentation Supabase : https://supabase.com/docs
- Communauté Discord : https://discord.supabase.com
- GitHub Issues Token4Good : [Lien vers votre repo]

## 🎉 Félicitations !

Une fois toutes ces étapes complétées, votre base de données Supabase PostgreSQL est prête pour Token4Good RGB !

URL finale : `postgresql://postgres:[YOUR-PASSWORD]@db.glikbylflheewbonytev.supabase.co:5432/postgres`