# Instructions de finalisation Token4Good v2

## Avancement réalisé

- [x] Routage Next/Vercel mis à jour pour déporter toutes les routes `/api/*` vers le backend Rust et réactivation de la vérification TypeScript.
- [x] Backend Rust durci (binding `0.0.0.0`, healthcheck multi-services, Docker runtime avec `expect`, script `start.sh` renforcé).
- [x] Fichier d'exemple `.env` nettoyé pour retirer les secrets sensibles.
- [ ] Suite de tests refactorisée et automatisations CI.
- [ ] Intégration RGB/Lightning complète sans dépendances CLI.

## Constat actuel
- Frontend Next.js repose encore sur l'ancienne stack Mongo (DAO `@t4g/service/data`) et sert ses propres routes API.
- Backend Rust (Axum) expose RGB/Lightning/Dazno mais reste majoritairement simulé et dépend d'outils CLI absents en production.
- Les tests unitaires et d'intégration ne compilent pas ou supposent des services externes actifs.
- Le binaire backend écoute sur `127.0.0.1`, le script Docker requiert `expect`, et les dépendances Bitcoin/LND sont installées ad hoc.
- Vercel ne proxifie que `/api/backend/**` vers Railway ; les autres routes `/api/*` restent servies par Next.
- Le domaine `t4g.dazno.de` n'est pas enregistré côté Vercel.
- Le fichier `SAMPLE.env` contient des secrets sensibles à extraire hors du dépôt.

## Actions prioritaires

### 1. Refonte frontend
- Supprimer ou remplacer les API Routes Next (`apps/dapp/pages/api/**`) par des appels directs vers `process.env.NEXT_PUBLIC_API_URL`.
- Mettre à jour les services client pour consommer l'API Supabase/RGB (plus de dépendance à Mongo).
- Réactiver la vérification TypeScript (`apps/dapp/next.config.js`, retirer `ignoreBuildErrors`).

### 2. Durcir le backend Rust
- Faire écouter Axum sur `0.0.0.0` pour l'exposition conteneurisée.
- Remplacer les appels `Command::new()` à `rgb-cli`/`lncli` par des bibliothèques Rust ou isoler ces commandes dans des services dédiés.
- Implémenter les providers d'authentification manquants (t4g, LinkedIn) et le refresh token.
- Ajouter de vrais checks de santé sur DB, RGB, Lightning et Dazno.

### 3. Suite de tests
- Corriger les `mod tests` pour qu'ils se compilent (importer les modules via crate root).
- Injecter des mocks pour RGB/Lightning/Dazno afin d'éviter les appels réseau dans les tests.
- Séparer tests unitaires/integration et fournir des scripts de lancement reproductibles.

### 4. Pipeline et conteneur
- Installer `expect` et figer les versions Bitcoin/LND dans l'image Docker.
- Externaliser la configuration RGB/LND (volumes + secrets) pour l'environnement Railway/GCP.
- Vérifier que le healthcheck Docker fonctionne sans dépendances manuelles.

### 5. Configuration Vercel et DNS
- Ajouter `t4g.dazno.de` dans Vercel (Settings → Domains) puis vérifier le CNAME.
- Étendre `vercel.json` pour proxifier toutes les routes `/api/*` vers le backend Rust ou migrer totalement les endpoints côté Axum.
- Mettre à jour les variables d'environnement (NextAuth, API URL, Dazno, Supabase) dans Vercel production et preview.

### 6. Sécurité et gestion des secrets
- Retirer les secrets réels de `SAMPLE.env` et les stocker via Vercel / Railway / Secret Manager.
- Documenter la procédure de rotation (Supabase, Dazno, Alchemy, PolygonScan).

## Validation finale
- Relancer un build `apps/dapp` (lint + type-check + `npm run build`).
- Déployer le backend Rust corrigé dans l'environnement cible (Railway ou autre) et tester `/health`.
- Vérifier depuis `https://t4g.dazno.de` les parcours clefs : login Dazno, création de preuve, transfert, tableau de bord.
- Mettre en place un monitoring (logs, métriques) pour Supabase, Axum et Vercel.
