# CLAUDE.md — Token4Good

Guide de référence pour Claude Code. Mis à jour : mars 2026.

---

## Architecture du projet

```
T4G/
├── apps/dapp/              # Frontend Next.js 14 (TypeScript)
├── token4good-backend/     # Backend Rust (Axum + SQLx + PostgreSQL)
├── libs/                   # Librairies partagées (UI, types, hooks)
├── docs/                   # Documentation technique
├── railway.toml            # Config déploiement Railway (backend)
└── SAMPLE.env              # Template variables d'environnement
```

### Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14, React 18, TypeScript, Redux Toolkit, SWR |
| Backend | Rust, Axum, SQLx, PostgreSQL (Railway) |
| Auth | JWT custom, OAuth (GitHub, LinkedIn, Dazno), LNURL-Auth (Lightning) |
| Notifications | Redux slice `userNotifications` + hook `useNotify` |
| Déploiement | Railway (backend), Vercel (frontend) |
| Base de données | PostgreSQL sur Railway (anciennement Supabase) |

---

## Commandes essentielles

### Frontend (`apps/dapp/`)
```bash
npm run dev          # Serveur de développement (port 3000)
npm run build        # Build Next.js production
npm run lint         # ESLint (run par le hook pre-commit)
npm run type-check   # TypeScript check
npm run test         # Jest tests
npm run test:watch   # Jest en mode watch
```

### Backend (`token4good-backend/`)
```bash
cargo build          # Compilation développement
cargo build --release # Compilation production
cargo run            # Démarrer le backend (port 8080)
cargo test           # Tests Rust
```

### Git / Deploy
```bash
git push origin main  # Déclenche le build Next.js via hook pre-push
railway up            # Déployer le backend sur Railway
vercel --prod         # Déployer le frontend sur Vercel
```

---

## Hooks pre-commit & pre-push

- **pre-commit** : `eslint apps/dapp` + `commitlint`
- **pre-push** : `next build` complet (vérifie les types + build prod)
- Les warnings ESLint sont tolérés, les **erreurs bloquent**
- Les lignes du body du commit sont limitées à **100 caractères**
- Format de commit : `type(scope): message` (Conventional Commits)

---

## Notifications / Toasts

Le système de toasts est centralisé dans Redux.

### Hook `useNotify` (`hooks/useNotify.ts`)
```typescript
const notify = useNotify();
notify.success('Message de succès');
notify.error('Message d\'erreur');
notify.warning('Avertissement');
notify.info('Information');
```

### Utiliser directement le store Redux
```typescript
import { addUserNotificationsState } from 'apps/dapp/store/slices';
import { v4 as uuidv4 } from 'uuid';
dispatch(addUserNotificationsState({ id: uuidv4(), status: 'success', content: 'OK' }));
```

> **Règle** : ne jamais utiliser `alert()` ni laisser les erreurs silencieuses en `console.error` seul — toujours afficher un toast.

---

## Authentification

Flux supportés (tous gérés dans `contexts/AuthContext.tsx`) :

| Méthode | Fichier clé |
|---------|-------------|
| GitHub OAuth | `hooks/useOAuth.ts` → `loginWithGitHub()` |
| LinkedIn OAuth | `hooks/useOAuth.ts` → `loginWithLinkedIn()` |
| Dazno / Daznode | `hooks/useOAuth.ts` → `loginWithDazno()` |
| Magic Link email | `hooks/useOAuth.ts` → `sendMagicLink()` |
| LNURL-Auth (Lightning) | `components/auth/LNURLAuthModal.tsx` |
| Debug (dev only) | `login.tsx` → boutons debug en bas de page |

Callbacks OAuth : `pages/auth/callback/[provider].tsx`

---

## Mentoring

| Fonctionnalité | Page |
|---------------|------|
| Trouver un mentor | `pages/mentoring/find.tsx` |
| Mes sessions | `pages/mentoring/my-sessions.tsx` |
| Créer une offre | `pages/mentoring/offer/new.tsx` |
| Voir une offre | `pages/mentoring/offer/[id].tsx` |
| Session en cours | `pages/mentoring/session/[id].tsx` |

API client mentoring : `services/apiClient.ts` → `apiClient.createMentoringBooking()`

---

## API Backend (Rust)

Base URL locale : `http://localhost:8080`

Endpoints principaux :

```
GET  /health
POST /api/auth/login
GET  /api/users/me
GET  /api/users/me/metrics
GET  /api/users/me/notifications
GET  /api/metrics
GET  /api/mentoring/offers
POST /api/mentoring/bookings
GET  /api/mentoring/sessions/:id
```

Routes définies dans : `token4good-backend/src/routes/`

---

## Base de données

- **Prod** : PostgreSQL sur **Railway** (variable `DATABASE_URL`)
- **Schéma** : `supabase-final-schema.sql` (référence), migrations SQLx dans le backend Rust
- Tables principales : `users`, `services`, `categories`, `transactions`, `notifications`, `mentoring_offers`, `mentoring_bookings`
- **Ne pas utiliser Supabase client-side pour les requêtes SQL** — passer par le backend Rust

---

## Variables d'environnement clés

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080   # URL backend Rust
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secret>
GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET
NEXT_PUBLIC_DAZNO_VERIFY_URL
DAZNO_API_KEY
```

### Backend (`token4good-backend/.env`)
```bash
DATABASE_URL=postgresql://...@railway.app/railway
JWT_SECRET=<secret>
PORT=8080
RUST_LOG=info
```

---

## Patterns à respecter

### Pages authentifiées
```typescript
// Toujours ajouter en bas de fichier :
Page.auth = true;
Page.role = ['alumni', 'mentee', 'mentor'];
```

### Données avec fallback SWR
```typescript
const { data = FALLBACK_DATA, isLoading, error } = useSwr('/api/...', apiFetcher, {
  fallbackData: FALLBACK_DATA,
  revalidateOnFocus: false,
  shouldRetryOnError: true,
  errorRetryCount: 2,
});
// Si erreur → notify.warning() pour prévenir l'utilisateur
```

### Appels API
```typescript
// Utiliser apiClient (services/apiClient.ts) pour les endpoints métier
// Utiliser apiFetcher (services/config.ts) pour SWR
```

---

## Ce qui reste à faire / connu

- Warnings ESLint nombreux dans la codebase (hors scope immédiat) — `any`, variables non utilisées
- `loginWithLinkedIn` importé dans `login.tsx` mais non utilisé (bouton LinkedIn absent de l'UI)
- `PublicLayout` importé mais non utilisé dans `login.tsx`
- Build Next.js déclenché à chaque `git push` (~2-3 min)
