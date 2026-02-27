# 📊 Guide de Monitoring Production - Token4Good

**Date**: 16 février 2026  
**Version**: 2.0.0  
**Status**: ✅ Prêt pour Déploiement

---

## 🎯 Objectifs du Monitoring

1. **Disponibilité** : Détecter les downtime immédiatement
2. **Performance** : Identifier les ralentissements avant impact utilisateur
3. **Erreurs** : Alerter sur les erreurs critiques
4. **Métriques Business** : Suivre les KPIs Token4Good

---

## 🔧 Configuration Railway (Backend)

### 1. Health Checks Automatiques

Railway monitor automatiquement le endpoint `/health` :

```rust
// Déjà implémenté dans src/routes/health.rs
GET /health → { "status": "ok", "services": {...} }
```

**Configuration Railway Dashboard** :
1. Aller dans Settings → Health Checks
2. Configurer :
   - **Path**: `/health`
   - **Interval**: 60 secondes
   - **Timeout**: 10 secondes
   - **Threshold**: 3 échecs consécutifs

### 2. Alertes Railway

#### Configuration des Webhooks

```bash
# Dans Railway Dashboard → Settings → Webhooks
```

**Créer un webhook pour Slack** :

```json
{
  "name": "Token4Good Alerts",
  "url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
  "events": [
    "deployment.failed",
    "deployment.succeeded",
    "service.crashed",
    "service.restarted"
  ]
}
```

**Alternative : Email Notifications**

Railway Dashboard → Settings → Notifications :
- ✅ Deployment failures
- ✅ Service crashes
- ✅ High CPU usage (>80%)
- ✅ High memory usage (>80%)

### 3. Métriques Railway

Railway fournit automatiquement :
- **CPU Usage** : Graphique temps réel
- **Memory Usage** : Utilisation RAM
- **Network** : Bandwidth in/out
- **Deployments** : Historique des déploiements

**Accès** : Railway Dashboard → Metrics

### 4. Logs Structurés

Le backend Rust utilise `tracing` pour des logs structurés :

```rust
// Déjà implémenté dans main.rs
tracing_subscriber::fmt::init();
```

**Visualiser les logs** :

```bash
# Logs en temps réel
railway logs --follow --environment production

# Logs récents
railway logs --environment production --lines 100

# Filtrer par niveau
railway logs --environment production | grep ERROR
```

---

## 🔧 Configuration Vercel (Frontend)

### 1. Monitoring Intégré Vercel

Vercel Analytics est activé automatiquement :
- **Performance**: Core Web Vitals
- **Erreurs**: JavaScript errors
- **Traffic**: Visites et pages vues

**Accès** : Vercel Dashboard → Analytics

### 2. Alertes Vercel

#### Email Notifications

Vercel Dashboard → Settings → Notifications :
- ✅ Build failures
- ✅ Deployment errors
- ✅ High error rate
- ✅ Performance degradation

#### Webhooks Vercel

```bash
# Configuration dans vercel.json (déjà présent)
```

Ou via Dashboard → Settings → Git Integration :

```json
{
  "name": "deployment-webhook",
  "url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
  "events": ["deployment-ready", "deployment-error"]
}
```

### 3. Logs Vercel

**Visualiser les logs** :

```bash
# Logs en temps réel
vercel logs --follow

# Logs d'un déploiement spécifique
vercel logs <deployment-url>

# Filtrer par erreur
vercel logs | grep "Error"
```

### 4. Real User Monitoring (RUM)

Vercel fournit automatiquement :
- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **TTFB** (Time To First Byte)

---

## 📈 Monitoring Externe

### 1. UptimeRobot (Gratuit)

**Configuration** :

1. Créer un compte sur [UptimeRobot](https://uptimerobot.com)
2. Ajouter des monitors :

**Monitor Frontend** :
```
Type: HTTP(s)
URL: https://app.token-for-good.com
Interval: 5 minutes
```

**Monitor Backend** :
```
Type: HTTP(s)
URL: https://apirust-production.up.railway.app/health
Interval: 5 minutes
```

**Monitor API Login** :
```
Type: HTTP(s)
URL: https://app.token-for-good.com/api/auth/health
Interval: 5 minutes
```

3. Configurer les alertes :
   - Email : admin@token4good.com
   - SMS (optionnel)
   - Slack webhook

### 2. Better Stack (ex-Logtail)

Pour logs centralisés et dashboards avancés :

```bash
# Installation
npm install @logtail/js

# Configuration dans apps/dapp/pages/_app.tsx
import { Logtail } from '@logtail/js'

const logtail = new Logtail(process.env.LOGTAIL_TOKEN)

// Logger les erreurs
window.onerror = (msg, url, lineNo, columnNo, error) => {
  logtail.error('Frontend Error', {
    message: msg,
    url,
    lineNo,
    columnNo,
    error: error?.stack
  })
}
```

---

## 🚨 Alertes Critiques

### Niveaux de Priorité

#### P0 - Critique (Immédiat)
- ❌ Service down complet
- ❌ Base de données inaccessible
- ❌ Taux d'erreur > 50%

**Action** : Notification SMS + Slack + Email

#### P1 - Haute (< 15 min)
- ⚠️ Performance dégradée (latence > 2s)
- ⚠️ Taux d'erreur > 10%
- ⚠️ Erreurs OAuth répétées

**Action** : Notification Slack + Email

#### P2 - Moyenne (< 1h)
- 🔶 Augmentation du trafic d'erreurs
- 🔶 Ralentissements ponctuels
- 🔶 Logs anormaux

**Action** : Notification Email

#### P3 - Basse (< 24h)
- 📊 Métriques inhabituelles
- 📊 Warnings dans les logs
- 📊 Optimisations possibles

**Action** : Dashboard / Email quotidien

### Configuration Slack

**Créer un canal** : `#token4good-alerts`

**Webhook Slack** :
1. Aller dans Slack → Settings & Administration → Manage Apps
2. Rechercher "Incoming Webhooks"
3. Ajouter à `#token4good-alerts`
4. Copier l'URL webhook

**Utiliser dans Railway et Vercel** (voir sections ci-dessus)

---

## 📊 Dashboards

### Dashboard Railway

**Métriques à surveiller** :
- CPU Usage : < 70% normal, > 80% attention
- Memory : < 70% normal, > 80% attention
- Network : Pic inhabituel = investigation
- Response time : < 100ms normal, > 500ms attention

### Dashboard Vercel

**Métriques à surveiller** :
- Build time : < 3min normal, > 5min attention
- Cold starts : < 500ms normal, > 1s attention
- Error rate : < 1% normal, > 5% attention
- Bandwidth : Pic inhabituel = investigation

### Dashboard Custom (Optionnel)

Pour un dashboard unifié, utiliser **Grafana Cloud** (gratuit jusqu'à 10k métriques) :

```bash
# 1. Créer compte sur grafana.com
# 2. Installer agent Grafana sur Railway
# 3. Configurer datasources
# 4. Importer dashboards pré-configurés
```

---

## 🔍 Métriques Business

### KPIs Token4Good à Monitorer

```sql
-- Nombre d'utilisateurs actifs (7 jours)
SELECT COUNT(DISTINCT user_id) 
FROM user_activities 
WHERE created_at > NOW() - INTERVAL '7 days';

-- Transactions Lightning (24h)
SELECT COUNT(*) 
FROM lightning_transactions 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Sessions de mentoring (7 jours)
SELECT COUNT(*) 
FROM mentoring_sessions 
WHERE created_at > NOW() - INTERVAL '7 days'
AND status = 'completed';

-- Tokens distribués (24h)
SELECT SUM(tokens_earned) 
FROM token_transactions 
WHERE created_at > NOW() - INTERVAL '24 hours';
```

**Créer un endpoint dédié** :

```rust
// token4good-backend/src/routes/metrics.rs
#[get("/business")]
pub async fn get_business_metrics(
    State(state): State<AppState>,
) -> Result<Json<BusinessMetrics>, StatusCode> {
    // Implémenté - retourne les KPIs
}
```

**Monitorer via cron** :

```bash
# Cron job quotidien pour envoyer les métriques
0 9 * * * curl https://apirust-production.up.railway.app/api/metrics/business | slack-notify
```

---

## 🧪 Tests de Monitoring

### Vérifier Health Checks

```bash
# Backend Railway
curl -I https://apirust-production.up.railway.app/health
# Attendu: HTTP 200

# Frontend Vercel
curl -I https://app.token-for-good.com/
# Attendu: HTTP 200

# API Routes
curl -I https://app.token-for-good.com/api/health
# Attendu: HTTP 200
```

### Simuler une Panne

```bash
# Arrêter temporairement le service Railway
railway down --environment staging

# Vérifier les alertes :
# - Email reçu
# - Slack notification
# - UptimeRobot alerte

# Redémarrer
railway up --environment staging
```

### Tester les Logs

```bash
# Générer une erreur test
curl -X POST https://apirust-production.up.railway.app/api/test/error

# Vérifier dans les logs Railway
railway logs | grep ERROR

# Vérifier dashboard Vercel
```

---

## 📋 Checklist de Déploiement

### Railway Backend

- [ ] Health check `/health` configuré
- [ ] Webhooks Slack configurés
- [ ] Email notifications activées
- [ ] Métriques CPU/Memory surveillées
- [ ] Logs accessibles et structurés
- [ ] Alertes testées

### Vercel Frontend

- [ ] Vercel Analytics activé
- [ ] Build notifications configurées
- [ ] Error tracking activé
- [ ] Performance monitoring activé
- [ ] Logs accessibles
- [ ] Alertes testées

### Monitoring Externe

- [ ] UptimeRobot configuré (3 monitors)
- [ ] Alertes email/SMS configurées
- [ ] Dashboard Slack créé (#token4good-alerts)
- [ ] Tests de pannes réussis

### Métriques Business

- [ ] Endpoint /api/metrics/business opérationnel
- [ ] Requêtes SQL optimisées
- [ ] Cron job quotidien configuré (optionnel)
- [ ] Dashboard business créé (optionnel)

---

## 🐛 Troubleshooting

### Problème : Pas d'alertes reçues

**Vérifications** :
1. Webhook URL correcte ?
2. Events correctement configurés ?
3. Service Slack/Email opérationnel ?
4. Test manuel du webhook

```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test Token4Good Alert"}' \
  https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Problème : Fausses alertes

**Causes** :
- Seuils trop bas
- Pics de trafic normaux
- Déploiements réguliers

**Solutions** :
1. Ajuster les seuils (CPU > 80% → 90%)
2. Exclure les heures de déploiement
3. Ajouter un buffer time (3 échecs avant alerte)

### Problème : Logs manquants

**Vérifications** :
1. `RUST_LOG=debug` configuré ?
2. Logs pas supprimés automatiquement ?
3. Permissions correctes ?

```bash
# Vérifier les variables Railway
railway variables | grep RUST_LOG
```

---

## 📞 Contacts Support

### En cas d'incident

**P0 - Critique** :
1. Slack #token4good-alerts : @channel
2. Astreinte DevOps : +33 X XX XX XX XX
3. Email : ops@token4good.com

**P1-P3** :
1. Slack #token4good-support
2. Email : support@token4good.com

### Escalade

- **Backend (Railway)** : https://help.railway.app
- **Frontend (Vercel)** : https://vercel.com/support
- **OAuth (LinkedIn)** : https://www.linkedin.com/help

---

## 🚀 Prochaines Étapes

### Phase 1 : Configuration Basique (✅ Prêt)
- Health checks Railway/Vercel
- Email notifications
- UptimeRobot monitoring
- Logs accessibles

### Phase 2 : Alertes Avancées (Optionnel)
- Slack webhooks configurés
- SMS alerts critiques
- Dashboards personnalisés
- Métriques business automatisées

### Phase 3 : Monitoring Avancé (Future)
- Grafana Cloud dashboards
- APM (Application Performance Monitoring)
- Distributed tracing
- Anomaly detection ML

---

## ✅ Résumé

Une fois ce guide appliqué :

✅ Health checks automatiques  
✅ Alertes email configurées  
✅ Monitoring externe (UptimeRobot)  
✅ Logs structurés accessibles  
✅ Dashboards Railway + Vercel  
✅ Métriques business disponibles  

**Production monitoring opérationnel ! 📊**

---

**Créé le**: 16 février 2026  
**Dernière mise à jour**: 16 février 2026  
**Version**: 2.0.0  
**Status**: ✅ Prêt pour Production
