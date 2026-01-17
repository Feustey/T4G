# ✅ Token4Good - Checklist de Déploiement Production

**Date:** 3 novembre 2025  
**Target:** Production (Railway + Vercel)  
**Version:** 2.0.0

---

## 🔴 Phase 1: Préparation (15 min)

### Installation des Outils
- [ ] Railway CLI installé: `npm install -g @railway/cli`
- [ ] Vercel CLI installé: `npm install -g vercel`
- [ ] Railway login: `railway login`
- [ ] Vercel login: `vercel login`
- [ ] jq installé (pour tester les réponses JSON)

### Vérification du Code
- [ ] Backend compile sans erreur: `cd token4good-backend && cargo build --release`
- [ ] Frontend build réussit: `cd apps/dapp && npm run build`
- [ ] Tous les tests passent: `cargo test --lib`
- [ ] Pas d'erreurs de linting
- [ ] Git status clean ou commits préparés

### Préparation des Secrets
- [ ] JWT_SECRET généré (32+ chars): `openssl rand -base64 32`
- [ ] DATABASE_URL Supabase prêt
- [ ] LND macaroon encodé en base64
- [ ] LND TLS cert encodé en base64
- [ ] OAuth credentials (LinkedIn, t4g, Dazno) disponibles

---

## 🟠 Phase 2: Backend Railway (30 min)

### Configuration Initiale
- [ ] Projet Railway créé: `railway init`
- [ ] Lien établi: `railway link`
- [ ] PostgreSQL ajouté: `railway add -d postgres`
- [ ] DATABASE_URL automatiquement créée

### Variables d'Environnement Backend

#### JWT & Security
- [ ] `JWT_SECRET`: (32+ chars généré)
- [ ] `JWT_EXPIRATION_HOURS`: `24`

#### Database
- [ ] `DATABASE_URL`: (auto-créé par Railway PostgreSQL)

#### RGB Protocol
- [ ] `RGB_DATA_DIR`: `/app/data/rgb`
- [ ] `RGB_NETWORK`: `mainnet` (ou `testnet`)

#### Lightning Network
- [ ] `LND_REST_HOST`: `https://your-lnd-node.com:8080`
- [ ] `LND_MACAROON_PATH`: (base64 encoded)
- [ ] `LND_TLS_CERT_PATH`: (base64 encoded)

#### Dazno Integration
- [ ] `DAZNO_API_URL`: `https://api.dazno.de`

#### Server Config
- [ ] `HOST`: `0.0.0.0`
- [ ] `PORT`: `3000`
- [ ] `RUST_LOG`: `info,token4good_backend=debug`

#### CORS
- [ ] `ALLOWED_ORIGINS`: `https://t4g.dazno.de,https://dazno.de`

### Déploiement Backend
- [ ] Script exécutable: `chmod +x scripts/deploy-railway.sh`
- [ ] Déploiement lancé: `./scripts/deploy-railway.sh production`
- [ ] Build Docker réussi
- [ ] Déploiement terminé sans erreur
- [ ] URL Railway notée: `railway domain`

### Validation Backend
- [ ] Health check répond: `curl https://YOUR-RAILWAY-URL/health`
- [ ] Status "healthy" retourné
- [ ] Database: `true`
- [ ] Lightning: vérifié
- [ ] RGB: vérifié
- [ ] Logs sans erreur critique: `railway logs`

---

## 🟡 Phase 3: Frontend Vercel (30 min)

### Configuration vercel.json
- [ ] URL Railway mise à jour dans `vercel.json`
- [ ] Rewrites configurés pour `/api/*`
- [ ] Rewrites configurés pour `/health`
- [ ] Headers CORS configurés

### Variables d'Environnement Frontend

#### API Backend
- [ ] `NEXT_PUBLIC_API_URL`: `https://YOUR-RAILWAY-URL`

#### Dazno Integration
- [ ] `NEXT_PUBLIC_DAZNO_API_URL`: `https://api.dazno.de`
- [ ] `NEXT_PUBLIC_DAZNO_USERS_API_URL`: `https://api.dazno.de/users`
- [ ] `NEXT_PUBLIC_DAZNO_VERIFY_URL`: `https://api.dazno.de/auth/verify-session`

#### OAuth (Optionnel)
- [ ] `LINKEDIN_CLIENT_ID`: (si utilisé)
- [ ] `LINKEDIN_CLIENT_SECRET`: (si utilisé)

### Build Local de Vérification
- [ ] `cd apps/dapp && npm run build`
- [ ] Build réussi sans erreur
- [ ] Aucune référence à routes API Next.js dépréciées
- [ ] Bundle size raisonnable (< 1MB)

### Déploiement Frontend
- [ ] Script exécutable: `chmod +x scripts/deploy-vercel.sh`

#### Preview Deployment
- [ ] Déploiement preview: `./scripts/deploy-vercel.sh preview`
- [ ] Build Vercel réussi
- [ ] Preview URL obtenue
- [ ] Preview testée manuellement

#### Production Deployment
- [ ] Déploiement production: `./scripts/deploy-vercel.sh production`
- [ ] Build production réussi
- [ ] Production URL obtenue
- [ ] Logs Vercel sans erreur: `vercel logs`

### Validation Frontend
- [ ] Frontend accessible: `curl https://t4g-dazno-de.vercel.app`
- [ ] Proxy API fonctionnel: `curl https://t4g-dazno-de.vercel.app/health`
- [ ] Response JSON valide
- [ ] Status code 200

---

## 🔵 Phase 4: DNS & Domaine Personnalisé (15 min)

### Configuration DNS Provider
- [ ] Connexion au DNS provider (Cloudflare, etc.)
- [ ] Création CNAME record:
  - Type: `CNAME`
  - Name: `t4g`
  - Value: `cname.vercel-dns.com`
  - TTL: `Auto`
- [ ] CNAME sauvegardé et actif

### Configuration Vercel Domain
- [ ] Ajout domaine: `vercel domains add t4g.dazno.de`
- [ ] Vérification DNS: attendre propagation (1-5 min)
- [ ] SSL certificate: auto-généré par Vercel
- [ ] Domaine vérifié et actif

### Validation DNS
- [ ] DNS résolu: `nslookup t4g.dazno.de`
- [ ] HTTPS actif: `https://t4g.dazno.de`
- [ ] Certificate valide (cadenas vert)
- [ ] Redirection HTTP → HTTPS automatique

---

## 🟢 Phase 5: Tests End-to-End (30 min)

### Tests d'Infrastructure
- [ ] Backend health check: `curl https://YOUR-RAILWAY-URL/health`
- [ ] Frontend health check: `curl https://t4g.dazno.de/health`
- [ ] Proxy API fonctionne correctement
- [ ] Performance < 500ms (p95)

### Tests d'Authentification

#### Login Dazno
- [ ] Ouvrir `https://t4g.dazno.de/login`
- [ ] Cliquer "Login with Dazno"
- [ ] Redirection OAuth Dazno
- [ ] Callback réussi
- [ ] JWT stocké dans localStorage
- [ ] User profile chargé

#### Login LinkedIn (si configuré)
- [ ] Cliquer "Login with LinkedIn"
- [ ] Redirection OAuth LinkedIn
- [ ] Callback réussi
- [ ] JWT stocké
- [ ] User profile chargé

#### Logout
- [ ] Cliquer "Logout"
- [ ] JWT supprimé
- [ ] Redirection vers login
- [ ] Session terminée

### Tests Fonctionnels

#### Profil Utilisateur
- [ ] Consulter profil: `/profile`
- [ ] Données utilisateur affichées
- [ ] Avatar visible
- [ ] Informations correctes

#### Mentoring Flow
- [ ] Créer demande de mentoring
- [ ] Liste des demandes visible
- [ ] Assigner un mentor
- [ ] Statut mis à jour

#### RGB Proofs
- [ ] Créer une proof
- [ ] Contract ID généré
- [ ] Proof visible dans la liste
- [ ] Détails proof accessibles
- [ ] Vérification proof fonctionne

#### Lightning Payments
- [ ] Créer invoice
- [ ] Payment request généré
- [ ] QR code affiché
- [ ] Vérifier statut paiement
- [ ] Balance mise à jour

### Tests Performance
- [ ] Page load < 2s (FCP)
- [ ] API response < 200ms (p50)
- [ ] API response < 500ms (p95)
- [ ] Pas de memory leaks (DevTools)

### Tests Erreurs
- [ ] 404 page existe
- [ ] 500 error handled gracefully
- [ ] Network errors handled
- [ ] Toast notifications fonctionnent

---

## 🟣 Phase 6: Monitoring & Observabilité (20 min)

### Configuration Monitoring

#### UptimeRobot (ou équivalent)
- [ ] Compte créé
- [ ] Monitor backend: `https://YOUR-RAILWAY-URL/health`
- [ ] Monitor frontend: `https://t4g.dazno.de`
- [ ] Interval: 5 minutes
- [ ] Alerts email configurées

#### Sentry (Error Tracking)
- [ ] Projet Sentry créé
- [ ] DSN ajouté au frontend
- [ ] DSN ajouté au backend (optionnel)
- [ ] Test error envoyé et reçu

#### Logs Centralisés
- [ ] Railway logs accessibles: `railway logs`
- [ ] Vercel logs accessibles: `vercel logs`
- [ ] Slack webhook configuré (optionnel)
- [ ] Alerts critiques configurées

### Dashboard Monitoring
- [ ] Railway dashboard vérifié
- [ ] Vercel dashboard vérifié
- [ ] Métriques CPU/RAM visibles
- [ ] Request rate visible
- [ ] Error rate visible

---

## ⚫ Phase 7: Documentation & Communication (15 min)

### Documentation Updated
- [ ] README.md à jour
- [ ] URLs production ajoutées
- [ ] Variables d'environnement documentées
- [ ] Troubleshooting guide mis à jour

### Backup & Recovery
- [ ] Backup database fait: `pg_dump`
- [ ] Procédure rollback documentée
- [ ] Contacts d'urgence listés
- [ ] Plan de disaster recovery révisé

### Communication Équipe
- [ ] Équipe dev notifiée
- [ ] Équipe support notifiée
- [ ] Procédures d'incident partagées
- [ ] Calendrier on-call défini

### Communication Utilisateurs
- [ ] Annonce de lancement préparée
- [ ] Email utilisateurs rédigé
- [ ] Social media posts prêts
- [ ] Support FAQ mise à jour

---

## 🎉 Phase 8: Go-Live Final (5 min)

### Validation Finale
- [ ] Tous les tests passés
- [ ] Aucune erreur critique en logs
- [ ] Performance acceptable
- [ ] Monitoring actif
- [ ] Équipe disponible

### Annonce Officielle
- [ ] Email utilisateurs envoyé
- [ ] Social media posts publiés
- [ ] Status page mise à jour: "Production"
- [ ] Célébration de l'équipe ! 🎉

---

## 📊 Post-Deployment (24h après)

### Monitoring Actif
- [ ] Vérifier logs toutes les 2h (première journée)
- [ ] Vérifier métriques performance
- [ ] Vérifier error rate
- [ ] Vérifier user feedback

### Optimisations Immédiates
- [ ] Identifier bottlenecks
- [ ] Optimiser requêtes lentes
- [ ] Ajuster cache si nécessaire
- [ ] Ajuster rate limits si nécessaire

### Feedback Utilisateurs
- [ ] Collecter premiers retours
- [ ] Prioriser bugs critiques
- [ ] Planifier hotfixes si nécessaire
- [ ] Mettre à jour roadmap

---

## 🚨 Rollback Plan (En cas de problème critique)

### Backend Rollback
```bash
# Lister les déploiements
railway deployments

# Rollback vers version précédente
railway rollback <deployment-id>
```

### Frontend Rollback
```bash
# Lister les déploiements
vercel ls

# Rollback vers version précédente
vercel rollback <deployment-url>
```

### Database Rollback
```bash
# Restaurer depuis backup
pg_restore -d DATABASE_URL backup.dump
```

---

## 📞 Contacts d'Urgence

### Technique
- **DevOps Lead:** [email]
- **Backend Lead:** [email]
- **Frontend Lead:** [email]

### Infrastructure
- **Railway Support:** https://railway.app/help
- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/support

---

## ✅ Statut Global

- [ ] **Phase 1:** Préparation ✓
- [ ] **Phase 2:** Backend Railway ✓
- [ ] **Phase 3:** Frontend Vercel ✓
- [ ] **Phase 4:** DNS & Domaine ✓
- [ ] **Phase 5:** Tests E2E ✓
- [ ] **Phase 6:** Monitoring ✓
- [ ] **Phase 7:** Documentation ✓
- [ ] **Phase 8:** Go-Live ✓

**Durée Totale Estimée:** 2h30 - 3h

**Status:** ⬜ À Démarrer | 🟡 En Cours | ✅ Complété

---

**Last Updated:** 3 novembre 2025  
**Version:** 2.0.0  
**Next Review:** Après déploiement production

