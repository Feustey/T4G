# 📖 Runbooks Production - Token4Good

**Date**: 16 février 2026  
**Version**: 2.0.0  
**Status**: ✅ Guide Opérationnel Complet

---

## 🎯 Objectif

Ce document contient les procédures opérationnelles pour gérer les incidents et opérations courantes en production Token4Good.

---

## 🚨 Procédures d'Incident

### 1. Backend Railway Down (P0)

**Symptômes** :
- Health check `/health` retourne 502/503
- UptimeRobot alerte
- Utilisateurs ne peuvent pas se connecter

**Diagnostic** :

```bash
# 1. Vérifier le statut Railway
railway status --environment production

# 2. Consulter les logs
railway logs --environment production --lines 100

# 3. Vérifier les métriques
# Railway Dashboard → Metrics
```

**Actions de résolution** :

```bash
# Si le service est crashed :
railway restart --environment production

# Si problème de mémoire (OOM) :
# Railway Dashboard → Settings → Resources → Augmenter RAM

# Si problème de database :
railway run --environment production psql $DATABASE_URL
# Vérifier les connexions actives
SELECT count(*) FROM pg_stat_activity;
```

**Rollback si nécessaire** :

```bash
# Lister les déploiements
railway deployments --environment production

# Rollback vers le déploiement précédent
railway rollback --environment production <deployment-id>
```

**Communication** :
1. Slack #token4good-alerts : "🔴 Backend down, investigating"
2. Status page (si existante) : "Service disruption"
3. Après résolution : "✅ Resolved, monitoring"

---

### 2. Frontend Vercel Down (P0)

**Symptômes** :
- https://app.token-for-good.com inaccessible (502/503)
- Build Vercel a échoué
- Déploiement en erreur

**Diagnostic** :

```bash
# 1. Vérifier le statut Vercel
vercel ls

# 2. Consulter les logs du dernier déploiement
vercel logs --follow

# 3. Vérifier le build
# Vercel Dashboard → Deployments → Latest → Build Logs
```

**Actions de résolution** :

```bash
# Si build échoué :
# 1. Vérifier les erreurs dans Build Logs
# 2. Corriger le code localement
# 3. Tester le build local
cd apps/dapp
npm run build

# 4. Commit et push
git add .
git commit -m "fix: resolve build error"
git push origin main

# OU rollback immédiat :
vercel rollback <previous-deployment-url>
```

**Rollback rapide** :

```bash
# Voir les déploiements récents
vercel ls --environment production

# Promouvoir un déploiement précédent
vercel promote <deployment-url>
```

**Communication** : Même que Backend Down

---

### 3. OAuth Authentication Failing (P1)

**Symptômes** :
- Utilisateurs ne peuvent pas se connecter
- Erreurs 401/403 répétées
- Boucles de redirection OAuth

**Diagnostic** :

```bash
# 1. Tester LinkedIn OAuth
curl -I "https://app.token-for-good.com/auth/callback/linkedin?code=test&state=test"

# 2. Consulter les logs backend
railway logs --environment production | grep "OAuth"

# 3. Vérifier les variables d'environnement
vercel env ls --environment production | grep LINKEDIN
railway variables --environment production | grep JWT
```

**Actions de résolution** :

**Provider Down (LinkedIn, t4g)** :
- Vérifier le status du provider externe
- Communiquer aux utilisateurs
- Activer les autres providers OAuth

**Credentials Invalides** :

```bash
# Vérifier et régénérer si nécessaire
vercel env pull .env.production
# Comparer avec les credentials du provider dashboard

# Mettre à jour sur Vercel
vercel env add LINKEDIN_CLIENT_ID production
vercel env add LINKEDIN_CLIENT_SECRET production

# Redéployer
vercel --prod
```

**Redirect URI Mismatch** :
1. Vérifier les Redirect URIs dans le provider dashboard
2. Ajouter l'URI manquante : `https://app.token-for-good.com/auth/callback/<provider>`
3. Attendre 5-10min propagation
4. Tester à nouveau

---

### 4. Database Inaccessible (P0)

**Symptômes** :
- Backend logs : "Error connecting to database"
- Erreurs 500 sur toutes les requêtes
- Railway métriques : 0 DB connections

**Diagnostic** :

```bash
# 1. Vérifier la connexion database
railway run --environment production psql $DATABASE_URL

# 2. Si connexion échoue, vérifier Railway
# Railway Dashboard → PostgreSQL service → Metrics

# 3. Vérifier les connexions actives
SELECT count(*) FROM pg_stat_activity;
# Si > 100 connexions : leak probable
```

**Actions de résolution** :

**Connexions épuisées** :

```sql
-- Terminer les connexions idle
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND state_change < NOW() - INTERVAL '5 minutes';
```

**Database down** :
- Railway Dashboard → PostgreSQL → Restart
- Vérifier les logs pour cause du crash
- Si corruption : Restore depuis backup

**Connection pool saturé** :

```rust
// Augmenter le pool size dans token4good-backend
// src/services/database.rs
let pool = PgPoolOptions::new()
    .max_connections(20)  // Augmenter de 10 → 20
    .connect(&database_url)
    .await?;
```

---

### 5. High Error Rate (P1)

**Symptômes** :
- Vercel Analytics : Error rate > 5%
- Logs remplis d'erreurs
- Utilisateurs rapportent des bugs

**Diagnostic** :

```bash
# 1. Identifier le type d'erreur dominant
railway logs --environment production | grep ERROR | sort | uniq -c | sort -nr

# 2. Consulter Vercel Analytics
# Dashboard → Analytics → Errors

# 3. Identifier l'endpoint/page problématique
vercel logs | grep "500" | awk '{print $5}' | sort | uniq -c | sort -nr
```

**Actions de résolution** :

**Erreur spécifique répétée** :
1. Reproduire localement l'erreur
2. Fix immédiat si critique
3. Hotfix branch + deploy
4. Monitoring post-deploy

**Erreur de dépendance externe (Dazno API)** :

```bash
# Vérifier l'API Dazno
curl -I https://api.token-for-good.com/health

# Si down, activer fallback mode
railway variables set DAZNO_FALLBACK_MODE=true --environment production
railway restart --environment production
```

**Erreur de charge** :
- Vérifier métriques CPU/RAM
- Scaler horizontalement si nécessaire
- Railway: Augmenter resources

---

### 6. Slow Performance (P2)

**Symptômes** :
- TTFB > 2 secondes
- Utilisateurs rapportent lenteur
- Core Web Vitals dégradés

**Diagnostic** :

```bash
# 1. Mesurer la performance
curl -w "@curl-format.txt" -o /dev/null -s https://app.token-for-good.com/

# Format curl-format.txt :
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n

# 2. Identifier le goulot d'étranglement
# Backend lent ? Frontend lent ? Database lente ?
```

**Actions de résolution** :

**Backend lent** :

```bash
# Vérifier les requêtes SQL lentes
railway run --environment production psql $DATABASE_URL

SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

# Ajouter des index si nécessaire
CREATE INDEX idx_users_email ON users(email);
```

**Frontend lent** :
- Vérifier Vercel Analytics → Core Web Vitals
- Optimiser les images (Next.js Image)
- Réduire la taille du bundle (lazy loading)

**Database lente** :
- Augmenter les resources PostgreSQL
- Ajouter des index
- Optimiser les requêtes N+1

---

## 🔄 Opérations Courantes

### Déploiement Production

**Pré-requis** :
- [ ] Tests locaux passent
- [ ] Build local réussit
- [ ] Code review approuvé
- [ ] Variables d'environnement à jour

**Procédure** :

```bash
# 1. Backend Railway (automatique sur git push)
git push origin main
# Railway détecte le push et déploie automatiquement

# 2. Vérifier le déploiement
railway status --environment production
railway logs --follow --environment production

# 3. Frontend Vercel (automatique sur git push)
# Vercel détecte le push et déploie automatiquement

# 4. Vérifier le déploiement
vercel ls
vercel logs --follow

# 5. Tests post-déploiement
curl https://apirust-production.up.railway.app/health
curl https://app.token-for-good.com/

# 6. Monitoring (15 minutes)
# Surveiller les métriques et logs
```

**Rollback si problème** : Voir sections incidents ci-dessus

---

### Mise à Jour Variables d'Environnement

**Backend Railway** :

```bash
# Ajouter/Modifier une variable
railway variables set JWT_SECRET=new_secret --environment production

# Lister les variables
railway variables --environment production

# Redémarrer pour appliquer
railway restart --environment production
```

**Frontend Vercel** :

```bash
# Ajouter/Modifier une variable
vercel env add NEXT_PUBLIC_API_URL production
# Entrer la valeur interactivement

# Lister les variables
vercel env ls --environment production

# Redéployer pour appliquer
vercel --prod
```

**⚠️ Important** : Les secrets ne doivent JAMAIS être commités dans Git

---

### Backup et Restore Database

**Backup Automatique** :
Railway effectue des backups automatiques quotidiens de PostgreSQL.

**Backup Manuel** :

```bash
# Export complet
railway run --environment production pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Export d'une table spécifique
railway run --environment production pg_dump $DATABASE_URL -t users > backup_users.sql
```

**Restore** :

```bash
# Restore complet (⚠️ DANGER : écrase la DB)
railway run --environment production psql $DATABASE_URL < backup_20260216.sql

# Restore d'une table
railway run --environment production psql $DATABASE_URL < backup_users.sql
```

**Best Practice** :
- Backup avant toute migration majeure
- Tester le restore sur staging d'abord
- Conserver les backups 30 jours minimum

---

### Migration Database

**Procédure** :

```bash
# 1. Créer la migration
cd token4good-backend
sqlx migrate add <description>

# 2. Éditer le fichier de migration
vim migrations/<timestamp>_<description>.sql

# 3. Tester localement
sqlx migrate run --database-url $DATABASE_URL_LOCAL

# 4. Backup production
railway run --environment production pg_dump $DATABASE_URL > backup_pre_migration.sql

# 5. Appliquer en production
railway run --environment production sqlx migrate run

# 6. Vérifier
railway run --environment production psql $DATABASE_URL
\dt  # Lister les tables
SELECT * FROM _sqlx_migrations;  # Vérifier la migration
```

**Rollback migration** :

```sql
-- Pas de rollback automatique SQLx
-- Restaurer depuis backup si problème critique
```

---

### Rotation des Secrets

**Fréquence recommandée** : Tous les 90 jours

**Procédure** :

```bash
# 1. Générer nouveau secret
openssl rand -base64 32

# 2. Mettre à jour Railway
railway variables set JWT_SECRET=<nouveau_secret> --environment production

# 3. Mettre à jour Vercel
vercel env add NEXTAUTH_SECRET production
# Entrer le nouveau secret

# 4. Redéployer les deux services
railway restart --environment production
vercel --prod

# 5. Invalider les anciens tokens JWT (optionnel)
# Les tokens existants expireront naturellement (24h)
# Forcer la déconnexion : UPDATE users SET dazno_token = NULL;
```

---

### Scaling

**Augmenter les Resources Railway** :

1. Railway Dashboard → Service → Settings → Resources
2. Augmenter RAM/CPU selon besoin
3. Cliquer "Update"
4. Le service redémarre automatiquement

**Scaling Horizontal (Multiple Instances)** :

Railway Pro plan requis :
1. Dashboard → Service → Settings → Scaling
2. Augmenter le nombre d'instances
3. Load balancing automatique par Railway

**Vercel Scaling** :
- Automatique et illimité
- Pas de configuration nécessaire
- Facturation à l'usage

---

## 📋 Checklists

### Checklist Incident

- [ ] Incident détecté et confirmé
- [ ] Priorité assignée (P0, P1, P2, P3)
- [ ] Communication initiale (Slack)
- [ ] Investigation en cours
- [ ] Logs consultés
- [ ] Métriques vérifiées
- [ ] Cause identifiée
- [ ] Solution appliquée
- [ ] Service vérifié
- [ ] Monitoring post-résolution (30min)
- [ ] Post-mortem écrit (pour P0/P1)
- [ ] Communication de résolution

### Checklist Déploiement

- [ ] Tests locaux OK
- [ ] Build local OK
- [ ] Code review OK
- [ ] Changelog mis à jour
- [ ] Variables d'environnement vérifiées
- [ ] Backup database effectué (si migration)
- [ ] Déploiement déclenché
- [ ] Health checks OK
- [ ] Logs surveillés (15min)
- [ ] Tests post-deploy OK
- [ ] Métriques normales
- [ ] Communication aux utilisateurs (si breaking change)

### Checklist Maintenance

- [ ] Notification préalable utilisateurs
- [ ] Backup database
- [ ] Mode maintenance activé (optionnel)
- [ ] Opération effectuée
- [ ] Vérifications post-opération
- [ ] Mode maintenance désactivé
- [ ] Communication fin de maintenance

---

## 📞 Contacts & Escalade

### Niveaux d'Escalade

**Niveau 1 - DevOps**
- Incidents P2/P3
- Opérations courantes
- Contact : Slack #token4good-support

**Niveau 2 - Lead Tech**
- Incidents P1
- Décisions architecturales
- Contact : lead-tech@token4good.com

**Niveau 3 - CTO**
- Incidents P0
- Décisions critiques
- Contact : cto@token4good.com / +33 X XX XX XX XX

### Contacts Externes

- **Railway Support** : https://help.railway.app
- **Vercel Support** : https://vercel.com/support
- **LinkedIn OAuth** : https://www.linkedin.com/help
- **Dazno API** : api-support@token-for-good.com

---

## 📚 Ressources

### Dashboards

- **Railway** : https://railway.app/dashboard
- **Vercel** : https://vercel.com/dashboard
- **UptimeRobot** : https://uptimerobot.com/dashboard

### Documentation

- [Architecture Token4Good](./README.md)
- [Guide Monitoring](./PRODUCTION_MONITORING_GUIDE.md)
- [Config OAuth](./OAUTH_PRODUCTION_CONFIG.md)
- [Déploiement](./docs/deployment/DEPLOIEMENT_PRODUCTION_GUIDE.md)

### Commandes Rapides

```bash
# Status services
railway status --environment production
vercel ls

# Logs temps réel
railway logs --follow --environment production
vercel logs --follow

# Redémarrer services
railway restart --environment production
vercel --prod  # Redéploiement

# Rollback
railway rollback --environment production
vercel rollback <deployment-url>

# Database
railway run --environment production psql $DATABASE_URL

# Variables
railway variables --environment production
vercel env ls --environment production
```

---

## ✅ Révision et Amélioration

Ce runbook doit être :
- **Testé** : Chaque procédure testée en staging
- **Mis à jour** : Après chaque incident majeur
- **Révisé** : Trimestriellement
- **Accessible** : Partagé avec toute l'équipe

**Dernière révision** : 16 février 2026  
**Prochaine révision** : 16 mai 2026

---

**Créé le**: 16 février 2026  
**Version**: 2.0.0  
**Status**: ✅ Production Ready  
**Équipe**: Token4Good DevOps
