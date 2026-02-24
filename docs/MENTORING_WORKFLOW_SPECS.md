# Spécifications Fonctionnelles — Workflow Mentoring Token4Good
> Version : 1.0 — Février 2026
> Statut : Référence pour implémentation et règle Cursor

---

## 0. Objectif

Permettre à tout utilisateur connecté d'agir comme **mentor** (alumni proposant des sessions) ou **tutoré** (cherchant un accompagnement), via deux points d'entrée clairs sur le dashboard :

1. **"Proposer une session de mentoring"** — avec sélection depuis le référentiel des apprentissages
2. **"Trouver un mentor"** — avec sélection d'un thème à apprendre

---

## 1. Diagnostic de l'Existant

### 1.1 Incohérences à corriger avant tout développement

| Point | État actuel | État cible |
|-------|------------|------------|
| Rôles backend | `mentor`, `mentee`, `alumni`, `service_provider`, `admin` | Conserver, étendre avec champs supplémentaires |
| Rôles frontend | `'ALUMNI'`, `'STUDENT'` (majuscules, divergents) | Aligner : `'alumni'`, `'mentee'` |
| Dashboard | CTA generiques, rien de spécifique au mentoring | Deux blocs CTA mentoring conditionnels |
| Référentiel thèmes | 4 catégories hardcodées | Table `learning_topics` en base, administrable |
| Sessions T4G | Routes backend OK, non intégrées dans `apiClient.ts` | Connecter au client API |
| Rôle unique/figé | Un user est soit mentor soit mentee de façon permanente | Capacité commutable via `is_mentor_active` |

### 1.2 Fichiers clés concernés

```
token4good-backend/src/models/user.rs           → ajout champs mentor
token4good-backend/src/models/mentoring.rs      → nouveaux modèles offer/booking
token4good-backend/src/routes/mentoring.rs      → nouvelles routes
token4good-backend/src/routes/token4good.rs     → sessions T4G existantes à étendre
token4good-backend/migrations/                  → nouvelles tables learning_topics
apps/dapp/pages/dashboard.tsx                   → ajout blocs CTA mentoring
apps/dapp/pages/onboarding.tsx                  → ajout étape sélection rôle+thèmes
apps/dapp/pages/profile.tsx                     → ajout section profil mentor
apps/dapp/pages/directory/index.tsx             → filtre mentors disponibles
apps/dapp/services/apiClient.ts                 → nouvelles méthodes mentoring
```

---

## 2. Modèle de Rôle Utilisateur

### 2.1 Principe

Un utilisateur peut **cumuler les deux capacités** : enseigner sur un sujet maîtrisé et apprendre sur un sujet inconnu. Le rôle n'est plus un attribut figé mais un **mode actif** par session.

`alumni` indique la maturité dans l'écosystème mais ne conditionne plus l'accès au mentoring.

### 2.2 Champs à ajouter au modèle `User` (Rust)

```rust
// Dans token4good-backend/src/models/user.rs
pub struct User {
    // ... champs existants ...
    pub mentor_topics: Vec<String>,          // slugs depuis learning_topics
    pub learning_topics: Vec<String>,        // slugs depuis learning_topics
    pub is_mentor_active: bool,              // profil mentor activé
    pub mentor_bio: Option<String>,          // bio spécifique au rôle mentor
    pub mentor_tokens_per_hour: Option<i32>, // tarif par défaut en T4G
}
```

### 2.3 Migration SQL correspondante

```sql
ALTER TABLE users
  ADD COLUMN mentor_topics        TEXT[]  DEFAULT '{}',
  ADD COLUMN learning_topics      TEXT[]  DEFAULT '{}',
  ADD COLUMN is_mentor_active     BOOLEAN DEFAULT false,
  ADD COLUMN mentor_bio           TEXT,
  ADD COLUMN mentor_tokens_per_hour INT;
```

### 2.4 Alignement frontend — règle stricte

```typescript
// ❌ INTERDIT dans le frontend
user.role === 'ALUMNI'
user.role === 'STUDENT'

// ✅ OBLIGATOIRE — aligner sur les valeurs sérialisées Rust
user.role === 'alumni'
user.role === 'mentee'
user.is_mentor_active === true  // pour les CTA mentoring
```

---

## 3. Référentiel des Apprentissages

### 3.1 Tables SQL (nouvelles migrations)

```sql
-- Migration : learning_categories
CREATE TABLE learning_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(100) UNIQUE NOT NULL,
  name        VARCHAR(200) NOT NULL,
  color       VARCHAR(7),
  icon_key    VARCHAR(50),
  sort_order  INT DEFAULT 0
);

-- Migration : learning_topics
CREATE TABLE learning_topics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(100) UNIQUE NOT NULL,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES learning_categories(id),
  level       VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  tags        TEXT[],
  icon_key    VARCHAR(50),
  is_active   BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Seed data — Contenu initial du référentiel

**Catégorie : `lightning_network` — Lightning Network**
| Slug | Nom | Niveau |
|------|-----|--------|
| `lightning-basics` | Comprendre les canaux Lightning | beginner |
| `lightning-channel-management` | Ouvrir et gérer ses canaux | intermediate |
| `lightning-routing-liquidity` | Routing et gestion de la liquidité | advanced |
| `lightning-app-integration` | Intégrer un nœud Lightning dans une app | advanced |

**Catégorie : `infrastructure` — DazBox / Infrastructure**
| Slug | Nom | Niveau |
|------|-----|--------|
| `dazbox-setup` | Installer et configurer sa DazBox | beginner |
| `node-monitoring` | Maintenance et monitoring de nœud | intermediate |
| `node-security` | Sauvegardes et sécurité de nœud | intermediate |
| `node-optimization` | Optimisation des performances | advanced |

**Catégorie : `bitcoin-payments` — Bitcoin & Paiements**
| Slug | Nom | Niveau |
|------|-----|--------|
| `bitcoin-basics` | Les bases de Bitcoin | beginner |
| `dazpay-integration` | Intégrer DazPay dans une boutique | intermediate |
| `bitcoin-accounting` | Comptabilité Bitcoin pour entreprises | intermediate |
| `crypto-compliance` | Fiscalité et conformité crypto | advanced |

**Catégorie : `development` — Développement**
| Slug | Nom | Niveau |
|------|-----|--------|
| `lnd-api-dev` | Développer avec l'API LND | intermediate |
| `rgb-basics` | RGB Protocol — bases | advanced |
| `lightning-app-dev` | Construire une application Lightning | advanced |

**Catégorie : `business` — Business & Communauté**
| Slug | Nom | Niveau |
|------|-----|--------|
| `bitcoin-pitch` | Pitcher un projet Bitcoin | beginner |
| `bitcoin-community` | Construire une communauté autour de Bitcoin | intermediate |
| `lightning-distribution` | Stratégie de distribution via Lightning | advanced |

### 3.3 Endpoints API référentiel

```
GET  /api/learning-categories              → liste des catégories (public, pas d'auth)
GET  /api/learning-topics                  → liste complète (public, pas d'auth)
GET  /api/learning-topics?category=<slug>  → filtrée par catégorie
GET  /api/learning-topics/:slug            → détail d'un thème
POST /api/admin/learning-topics            → créer un thème (admin only)
PUT  /api/admin/learning-topics/:id        → modifier (admin only)
```

---

## 4. Onboarding — Sélection de Rôle

### 4.1 Déclencheur

Affiché à la première connexion quand `user.is_onboarded = false`, avant accès au dashboard.

### 4.2 Étape 1 — Choix du mode

```
"Bienvenue dans la communauté Token4Good !
 Comment veux-tu participer ?"

[Card A] Je veux APPRENDRE
         Trouver un mentor sur un sujet précis
         → active : mentee mode

[Card B] Je veux TRANSMETTRE
         Proposer des sessions de mentoring
         → active : is_mentor_active = true

[Card C] Les deux à la fois
         → active les deux
```

### 4.3 Étape 2 — Sélection des thèmes

Si **apprendre** sélectionné :
- "Sur quoi veux-tu progresser ?" → multiselect depuis `learning_topics`
- Sauvegardé dans `user.learning_topics`

Si **transmettre** sélectionné :
- "Sur quoi peux-tu aider ?" → multiselect depuis `learning_topics`
- Sauvegardé dans `user.mentor_topics`

Si les deux :
- Les deux questions s'affichent séquentiellement.

---

## 5. Dashboard — Blocs CTA Mentoring

### 5.1 Logique d'affichage

```typescript
// apps/dapp/pages/dashboard.tsx
const showMentorBlock = user.is_mentor_active === true;
const showMenteeBlock = user.role === 'mentee' || user.learning_topics?.length > 0;
```

### 5.2 Bloc Mentor — "Proposer une session"

**Affiché si** : `user.is_mentor_active === true`

```
┌─────────────────────────────────────┐
│ ✦ Partage ton expertise             │
│ Tu peux enseigner sur :             │
│ [pill] Lightning [pill] DazBox ...  │
│                                     │
│ [Bouton primaire] Proposer une session │
│ [Lien] Mes sessions en cours (N →)  │
└─────────────────────────────────────┘
```

**Si `mentor_topics` est vide** :
```
│ ⚠ Configure tes thèmes pour activer  │
│ [Bouton] Configurer mon profil mentor │
```

**Navigation** : `/mentoring/offer/new`

### 5.3 Bloc Mentee — "Trouver un mentor"

**Affiché si** : `user.role === 'mentee'` ou `user.learning_topics?.length > 0`

```
┌─────────────────────────────────────┐
│ 🎓 Trouve un mentor                 │
│ Sur quel sujet veux-tu progresser ? │
│ [Dropdown catégories du référentiel]│
│                                     │
│ [Bouton primaire] Rechercher un mentor │
│ [Lien] Mes sessions planifiées (N →)│
└─────────────────────────────────────┘
```

**Navigation** : `/mentoring/find` (ou `/mentoring/find?category=<slug>` si dropdown sélectionné)

### 5.4 Widget "Prochaine session"

Affiché en bas de section si sessions à venir :
```
Prochaine session :
[Avatar] Alice M. — Gestion des canaux — Jeu 27 fév. 14h
[Bouton] Rejoindre  [Lien] Annuler
```

---

## 6. Page `/mentoring/offer/new` — Proposer une Session

### 6.1 Formulaire 3 étapes

**Étape 1 — Le sujet**
- Champ : thème (picker avec recherche depuis `GET /api/learning-topics`) — obligatoire
- Champ : niveau ciblé (radio: débutant / intermédiaire / avancé)
- Champ : description personnalisée (optionnel, pré-rempli depuis la description du thème)

**Étape 2 — Les modalités**
- Durée : radio — 30 min / 45 min / 60 min / 90 min
- Format : radio — Visio (lien fourni) / Chat texte / Asynchrone
- Tarif T4G : numérique (pré-rempli depuis `mentor_tokens_per_hour`, min 0)
  - Aide : "1 T4G ≈ 15 min d'expertise"
- Disponibilité : sélecteur de créneaux OU "Sur demande"

**Étape 3 — Confirmation**
- Récapitulatif complet
- Checkbox : "Je m'engage à honorer cette session"
- Bouton : "Publier ma session"

### 6.2 Résultat API

```typescript
// POST /api/mentoring/offers
{
  mentor_id: user.id,
  topic_slug: string,
  target_level: 'beginner' | 'intermediate' | 'advanced',
  description?: string,
  duration_minutes: number,
  format: 'video' | 'text' | 'async',
  token_cost: number,
  availability: TimeSlot[],  // [{ date: ISO8601, duration_minutes: number }]
}
```

Après création : notification push/email aux users dont `learning_topics` contient le topic.

---

## 7. Page `/mentoring/find` — Trouver un Mentor

### 7.1 Filtres

- **Catégorie** : pills depuis `GET /api/learning-categories`
- **Thème spécifique** : sous-filtre depuis `GET /api/learning-topics?category=<slug>`
- **Niveau** : débutant / intermédiaire / avancé
- **Format** : visio / texte / asynchrone
- **Budget max** : slider T4G (0 → 200)
- **Disponibilité** : "Cette semaine" / "Ce mois-ci" / "Sur demande"

### 7.2 Card d'une session disponible

```
[Avatar mentor]  Alice M.  ★4.8 (12 sessions)
Thème : Gestion des canaux Lightning
Niveau : Intermédiaire  •  Durée : 60 min  •  Format : Visio
Prix : 60 T4G
Disponible : Jeu 27 fév, Ven 28 fév
[Bouton] "Réserver"
```

**Tri par défaut** : matching `learning_topics` du user (pertinence) puis note moyenne.

### 7.3 API

```
GET /api/mentoring/offers?topic_slug=&level=&format=&max_cost=&availability=
```

---

## 8. Flux de Réservation (Mentee)

### 8.1 Étape 1 — Choix du créneau

- Sélecteur parmi les créneaux proposés par le mentor
- Option : "Proposer un autre créneau" → génère une demande de négociation

### 8.2 Étape 2 — Confirmation et séquestre T4G

```
Récapitulatif :
  Mentor   : Alice Martin
  Thème    : Gestion des canaux Lightning
  Durée    : 60 min  |  Format : Visio
  Prix     : 60 T4G

Ton solde : 120 T4G
Coût      :  60 T4G
Reste     :  60 T4G

[Bouton] "Confirmer et bloquer les T4G"
```

Si solde insuffisant → message + lien "Comment gagner des T4G ?"

### 8.3 Résultat API

```typescript
// POST /api/mentoring/bookings
{
  offer_id: string,
  mentee_id: user.id,
  scheduled_at: ISO8601,
}
```

- T4G **mis en séquestre** (pas encore transférés)
- `MentoringOffer.status` → `"booked"`
- Notification au mentor

---

## 9. Modèles Backend — Nouveaux (Rust)

### 9.1 `MentoringOffer`

```rust
pub struct MentoringOffer {
    pub id: String,
    pub mentor_id: String,
    pub topic_slug: String,
    pub target_level: String,       // "beginner" | "intermediate" | "advanced"
    pub description: Option<String>,
    pub duration_minutes: i32,
    pub format: String,             // "video" | "text" | "async"
    pub token_cost: i32,
    pub availability: serde_json::Value, // Vec<TimeSlot>
    pub status: OfferStatus,
    pub created_at: DateTime<Utc>,
}

pub enum OfferStatus {
    Open,
    Booked,
    Completed,
    Cancelled,
}
```

### 9.2 `MentoringBooking`

```rust
pub struct MentoringBooking {
    pub id: String,
    pub offer_id: String,
    pub mentee_id: String,
    pub scheduled_at: DateTime<Utc>,
    pub status: BookingStatus,
    pub mentee_confirmed: bool,
    pub mentor_confirmed: bool,
    pub tokens_escrowed: i32,
    pub mentee_rating: Option<i32>,
    pub mentor_rating: Option<i32>,
    pub mentee_comment: Option<String>,
    pub mentor_comment: Option<String>,
    pub learned_skills: Vec<String>,
    pub created_at: DateTime<Utc>,
}

pub enum BookingStatus {
    Pending,
    Confirmed,
    PendingCompletion,
    Completed,
    AutoCompleted,
    Disputed,
    Cancelled,
}
```

### 9.3 Tables SQL correspondantes

```sql
CREATE TABLE mentoring_offers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id        UUID REFERENCES users(id),
  topic_slug       VARCHAR(100) REFERENCES learning_topics(slug),
  target_level     VARCHAR(20),
  description      TEXT,
  duration_minutes INT NOT NULL,
  format           VARCHAR(20) NOT NULL,
  token_cost       INT NOT NULL,
  availability     JSONB DEFAULT '[]',
  status           VARCHAR(30) DEFAULT 'open',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mentoring_bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id          UUID REFERENCES mentoring_offers(id),
  mentee_id         UUID REFERENCES users(id),
  scheduled_at      TIMESTAMPTZ NOT NULL,
  status            VARCHAR(30) DEFAULT 'pending',
  mentee_confirmed  BOOLEAN DEFAULT false,
  mentor_confirmed  BOOLEAN DEFAULT false,
  tokens_escrowed   INT NOT NULL,
  mentee_rating     INT CHECK (mentee_rating BETWEEN 1 AND 5),
  mentor_rating     INT CHECK (mentor_rating BETWEEN 1 AND 5),
  mentee_comment    TEXT,
  mentor_comment    TEXT,
  learned_skills    TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. Cycle de Vie d'une Session

### 10.1 Machine à états

```
[open]
  → (mentee réserve)         → [booked / pending_confirmation]
  → (mentor confirme)        → [confirmed]
  → (session se déroule)
  → (heure fin atteinte)     → [pending_completion]
  → (mentee confirme)        → si mentor aussi confirmé → [completed]
  → (délai 48h dépassé)      → [auto_completed]
  → (litige ouvert)          → [disputed]
  → (annulation)             → [cancelled]
```

### 10.2 Règle de confirmation automatique

Si le mentee ne confirme pas dans les **48 heures** après l'heure de fin :
- Status → `auto_completed`
- T4G du séquestre libérés au mentor
- Proof RGB générée automatiquement

### 10.3 Attribution des T4G à la complétion

```
T4G mentor = tokens_escrowed × impact_score

impact_score = mentee_rating × level_multiplier
  level_multiplier :
    - contributeur (0-500 T4G total)  → 1.0
    - mentor      (500-1500 T4G)      → 1.1  (+10%)
    - expert      (1500+ T4G)         → 1.2  (+20%)

T4G mentee = bonus_learning (fixe : 5 T4G)
```

Après complétion : génération automatique d'une `MentoringProof` RGB via le service existant.

---

## 11. Évaluation Post-Session

### 11.1 Formulaire mentee (obligatoire pour libérer les T4G)

- Note globale : 1-5 étoiles (obligatoire)
- Commentaire (optionnel)
- Compétences acquises : multiselect depuis les `tags` du topic (optionnel)
- "Recommanderais-tu ce mentor ?" : Oui / Non

### 11.2 Formulaire mentor (optionnel)

- Note du mentee (engagement) : 1-5 étoiles
- Commentaire (optionnel)
- Thèmes effectivement couverts (confirmation ou ajustement)

---

## 12. Profil Mentor

### 12.1 Section dans `/profile` (nouveau panneau)

- Toggle : "Activer mon profil mentor" → met `is_mentor_active = true/false`
- Champs si activé :
  - Bio mentor (distincte de la bio générale)
  - Thèmes enseignés (multiselect référentiel)
  - Tarif par défaut (T4G/h)
  - Formats proposés (checkboxes)
- Stats affichées : sessions complétées, note moyenne, T4G gagnés en mentoring

### 12.2 Profil public `/directory/:id` (enrichi)

```
[Section Mentoring - si is_mentor_active]
Mentor disponible sur :
• Gestion des canaux Lightning (Intermédiaire)  ★4.9
• Intégration DazPay (Avancé)                  ★4.7
[Bouton] "Demander une session de mentoring"
```

---

## 13. Endpoints API Complets

### Référentiel (public, no auth)
```
GET  /api/learning-categories
GET  /api/learning-topics
GET  /api/learning-topics?category=<slug>
GET  /api/learning-topics/:slug
```

### Offres mentor
```
POST   /api/mentoring/offers
GET    /api/mentoring/offers               (filtres: topic_slug, level, format, max_cost)
GET    /api/mentoring/offers/:id
PUT    /api/mentoring/offers/:id
DELETE /api/mentoring/offers/:id
GET    /api/users/me/mentoring-offers
```

### Réservations
```
POST   /api/mentoring/bookings
GET    /api/mentoring/bookings/:id
POST   /api/mentoring/bookings/:id/confirm
POST   /api/mentoring/bookings/:id/dispute
GET    /api/users/me/mentoring-bookings
```

### Profil mentor
```
PUT    /api/users/me/mentor-profile
GET    /api/users/:id/mentor-profile
```

### Admin référentiel
```
POST   /api/admin/learning-topics
PUT    /api/admin/learning-topics/:id
DELETE /api/admin/learning-topics/:id
POST   /api/admin/learning-categories
```

---

## 14. Notifications

| Type | Déclencheur | Destinataire |
|------|------------|--------------|
| `MENTORING_OFFER_PUBLISHED` | Mentor publie une offre sur un thème | Mentees avec ce topic dans `learning_topics` |
| `MENTORING_SESSION_BOOKED` | Mentee réserve | Mentor |
| `MENTORING_SESSION_CONFIRMED` | Mentor confirme | Mentee |
| `MENTORING_REMINDER_24H` | 24h avant la session | Les deux |
| `MENTORING_REMINDER_1H` | 1h avant la session | Les deux |
| `MENTORING_COMPLETION_REQUEST` | Heure de fin atteinte | Mentee (demande de confirmation) |
| `MENTORING_COMPLETED` | Double confirmation | Les deux |
| `MENTORING_TOKENS_RECEIVED` | T4G libérés | Mentor |
| `MENTORING_PROOF_GENERATED` | Proof RGB créée | Les deux (lien vers `/proof/:id`) |
| `MENTORING_AUTO_COMPLETED` | 48h sans confirmation mentee | Les deux |

---

## 15. Pages à Créer / Modifier

### Nouvelles pages

| Route | Composant | Description |
|-------|-----------|-------------|
| `/mentoring` | `MentoringHub` | Landing mentoring (deux chemins : mentor / mentee) |
| `/mentoring/find` | `FindMentor` | Catalogue des offres avec filtres |
| `/mentoring/find/:topic-slug` | `FindMentorByTopic` | Offres filtrées sur un thème |
| `/mentoring/offer/new` | `NewMentoringOffer` | Formulaire 3 étapes (mentor) |
| `/mentoring/offer/:id/edit` | `EditMentoringOffer` | Modification d'une offre |
| `/mentoring/my-sessions` | `MySessions` | Historique toutes sessions |
| `/mentoring/session/:id` | `SessionDetail` | Détail + CTA complétion/évaluation |

### Pages modifiées

| Route | Modifications |
|-------|--------------|
| `/dashboard` | Ajout blocs §5.2 et §5.3 + widget §5.4 |
| `/profile` | Nouveau panneau "Profil Mentor" §12.1 |
| `/onboarding` | Étapes §4.2 et §4.3 ajoutées |
| `/directory` | Filtre "Mentors disponibles" + badge sur cards |
| `/directory/:id` | Section mentoring §12.2 |

---

## 16. Priorités d'Implémentation

### Phase 1 — Fondations *(Sprint 1, no breaking changes)*
- [ ] Migration SQL : `learning_categories`, `learning_topics` + seed data
- [ ] Migration SQL : champs mentor sur `users`
- [ ] Routes backend : `GET /api/learning-categories` et `GET /api/learning-topics`
- [ ] Correction frontend : `'ALUMNI'` → `'alumni'`, `'STUDENT'` → `'mentee'`
- [ ] Onboarding : ajout étapes sélection rôle + thèmes

### Phase 2 — Dashboard et Navigation *(Sprint 2)*
- [ ] Dashboard : blocs CTA mentoring conditionnels
- [ ] Page hub `/mentoring`
- [ ] Page `/mentoring/find` avec filtres et liste des offres

### Phase 3 — Flux Mentor *(Sprint 3)*
- [ ] Modèles Rust : `MentoringOffer`, `OfferStatus`
- [ ] Routes backend offres (`POST`, `GET`, `PUT`, `DELETE`)
- [ ] Formulaire `/mentoring/offer/new` (3 étapes)
- [ ] Page `/mentoring/my-sessions`

### Phase 4 — Flux Mentee et Séquestre *(Sprint 4)*
- [ ] Modèles Rust : `MentoringBooking`, `BookingStatus`
- [ ] Routes backend réservations + confirmation
- [ ] Séquestre T4G à la réservation
- [ ] Système de double confirmation post-session
- [ ] Évaluation et attribution T4G + proof RGB auto

### Phase 5 — Enrichissement *(Sprint 5)*
- [ ] Section profil mentor dans `/profile`
- [ ] Enrichissement `/directory` et `/directory/:id`
- [ ] Système de notifications complet (§14)
- [ ] Interface admin pour gérer le référentiel
- [ ] Page publique `/proof/:id` (voir GitHub issue #4)
