import React, { useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ConnectedLayout from 'apps/dapp/layouts/ConnectedLayout';
import { Breadcrumb, Button, Icons, Spinner } from 'apps/dapp/components';
import { AuthPageType, CategoryType, LangType } from 'apps/dapp/types';
import { useIndexing } from 'apps/dapp/hooks';
import { useNotify } from 'apps/dapp/hooks';
import { useAuth } from '../../contexts/AuthContext';
import useSwr from 'swr';
import { apiFetcher } from 'apps/dapp/services/config';
import { apiClient, LearningCategory, MentoringOffer, TimeSlot } from 'apps/dapp/services/apiClient';

interface IBenefitPage {
  lang: LangType;
}

// ─── Niveaux ───────────────────────────────────────────────────────────────

const LEVELS = [
  {
    name: 'Contributeur',
    emoji: '🌱',
    min: 0,
    max: 499,
    color: '#16a34a',
    bg: '#dcfce7',
    perks: [
      "Profil visible dans l'annuaire",
      'Accès au catalogue de services',
      'Badge Contributeur sur votre profil',
      'Dashboard de vos impacts',
    ],
  },
  {
    name: 'Mentor',
    emoji: '⚡',
    min: 500,
    max: 1499,
    color: '#d97706',
    bg: '#fef3c7',
    perks: [
      'Tout ce qui est dans Contributeur',
      "Badge Mentor mis en avant dans l'annuaire",
      'Mise en avant prioritaire dans la recherche',
      'Accès aux événements communautaires',
      'Statistiques détaillées de vos sessions',
    ],
  },
  {
    name: 'Expert',
    emoji: '🏆',
    min: 1500,
    max: Infinity,
    color: '#7c3aed',
    bg: '#ede9fe',
    perks: [
      'Tout ce qui est dans Mentor',
      'Badge Expert — statut top 5 % de la communauté',
      'Certificat de mentorat signé sur la blockchain (RGB)',
      'Accès aux événements VIP T4G',
      "Profil \"Mentor vedette\" sur la page d'accueil",
      'Accès prioritaire aux nouvelles fonctionnalités',
    ],
  },
];

const EARNING_TABLE = [
  { action: 'Bonus bienvenue (1ère connexion)', tokens: 100, icon: '🎉' },
  { action: 'Session mentorat — 30 min', tokens: 20, icon: '⏱️' },
  { action: 'Session mentorat — 60 min', tokens: 40, icon: '⏰' },
  { action: 'Session mentorat — 90 min', tokens: 60, icon: '🕐' },
  { action: 'Évaluation 5 étoiles reçue', tokens: 10, icon: '⭐' },
  { action: 'Preuve de session soumise', tokens: 5, icon: '📋' },
  { action: 'Offre de mentorat créée', tokens: 5, icon: '✏️' },
];

function getLevel(score: number) {
  return LEVELS.find((l) => score >= l.min && score <= l.max) ?? LEVELS[0];
}
function getNextLevel(score: number) {
  return LEVELS.find((l) => l.min > score) ?? null;
}

// ─── Constantes affichage offres ───────────────────────────────────────────

const FORMAT_ICONS: Record<string, string> = { video: '📹', text: '💬', async: '📼' };
const FORMAT_LABELS: Record<string, string> = { video: 'Visio', text: 'Chat', async: 'Asynchrone' };
const LEVEL_LABELS: Record<string, string> = { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' };
const LEVEL_COLORS: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: '#dcfce7', color: '#166534' },
  intermediate: { bg: '#fef3c7', color: '#92400e' },
  advanced:     { bg: '#fce7f3', color: '#9d174d' },
};

// ─── BookingModal ───────────────────────────────────────────────────────────

interface BookingModalProps {
  offer: MentoringOffer;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ offer, onClose }) => {
  const router = useRouter();
  const notify = useNotify();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slots: TimeSlot[] = offer.availability ?? [];
  const hasSlots = slots.length > 0;
  const canConfirm = !isBooking && (!hasSlots || !!selectedSlot);

  const handleBook = async () => {
    setIsBooking(true);
    setError(null);
    try {
      const booking = await apiClient.createMentoringBooking({
        offer_id: offer.id,
        scheduled_at: selectedSlot ?? new Date().toISOString(),
        notes: notes.trim() || undefined,
      });
      onClose();
      notify.success('Réservation confirmée !');
      router.push(`/mentoring/session/${booking.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réservation.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--color-surface, #fff)',
          borderRadius: '1rem', padding: '1.5rem',
          maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
              {offer.mentor?.firstname} {offer.mentor?.lastname}
            </p>
            <h2 style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '1.1rem' }}>
              {offer.topic?.name ?? offer.topic_slug}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
              {offer.duration_minutes} min · {FORMAT_ICONS[offer.format]} {FORMAT_LABELS[offer.format]} ·{' '}
              <strong style={{ color: 'var(--app-token-color, #f59e0b)' }}>{offer.token_cost} T4G</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--color-text-secondary, #94a3b8)', lineHeight: 1, padding: '2px 6px' }}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Créneaux */}
        {hasSlots ? (
          <div>
            <p style={{ margin: '0 0 10px', fontWeight: 600, fontSize: '0.875rem' }}>Choisir un créneau</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {slots.slice(0, 8).map((slot) => {
                const isSelected = selectedSlot === slot.date;
                const time = new Date(slot.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                return (
                  <button
                    key={slot.date}
                    type="button"
                    onClick={() => setSelectedSlot(slot.date)}
                    style={{
                      padding: '7px 14px', borderRadius: '0.5rem', fontSize: 13,
                      border: `2px solid ${isSelected ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)'}`,
                      background: isSelected ? 'var(--color-primary, #2563eb)' : '#fff',
                      color: isSelected ? '#fff' : '#1a202c',
                      fontWeight: isSelected ? 700 : 400, cursor: 'pointer',
                    }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)', fontStyle: 'italic', margin: 0 }}>
            Pas de créneau fixe — le mentor organisera la session avec toi après la réservation.
          </p>
        )}

        {/* Message */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>
            Message au mentor{' '}
            <span style={{ fontWeight: 400, color: 'var(--color-text-secondary, #64748b)' }}>(facultatif)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Décris ton niveau, tes objectifs, tes questions…"
            style={{
              width: '100%', border: '1.5px solid var(--color-border, #e2e8f0)',
              borderRadius: '0.5rem', padding: '8px 12px', fontSize: 13,
              resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <p style={{ margin: 0, color: '#dc2626', fontSize: 13, background: '#fef2f2', padding: '8px 12px', borderRadius: '0.5rem' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleBook}
            disabled={!canConfirm}
            style={{
              flex: 1, background: canConfirm ? 'var(--color-primary, #2563eb)' : '#94a3b8',
              color: '#fff', border: 'none', borderRadius: '0.5rem',
              padding: '11px 16px', fontWeight: 700, fontSize: '0.95rem',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
            }}
          >
            {isBooking ? 'Réservation…' : 'Confirmer la réservation'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '11px 16px', borderRadius: '0.5rem',
              border: '1.5px solid var(--color-border, #e2e8f0)',
              background: 'transparent', cursor: 'pointer',
              fontSize: '0.875rem', color: 'var(--color-text-secondary, #64748b)',
            }}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── OfferRecoCard ──────────────────────────────────────────────────────────

interface OfferRecoCardProps {
  offer: MentoringOffer;
  onBook: (offer: MentoringOffer) => void;
  myId: string;
}

const OfferRecoCard: React.FC<OfferRecoCardProps> = ({ offer, onBook, myId }) => {
  const level = LEVEL_COLORS[offer.target_level] ?? LEVEL_COLORS.beginner;
  const isOwnOffer = offer.mentor_id === myId;
  const cat = offer.topic?.category;

  return (
    <div
      className="o-card u-d--flex u-flex-column u-gap--s"
      style={{
        borderTop: `3px solid ${cat?.color ?? 'var(--color-primary, #2563eb)'}`,
        opacity: isOwnOffer ? 0.5 : 1,
      }}
    >
      {/* Mentor */}
      <div className="u-d--flex u-align-items-center u-gap--s">
        <div
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: cat?.color ? `${cat.color}22` : 'var(--color-primary-light, #eff6ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16,
            color: cat?.color ?? 'var(--color-primary, #2563eb)',
            flexShrink: 0,
          }}
        >
          {offer.mentor?.firstname?.[0] ?? '?'}{offer.mentor?.lastname?.[0] ?? ''}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="u-margin--none" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {offer.mentor?.firstname} {offer.mentor?.lastname}
          </p>
          <p className="u-margin--none" style={{ fontSize: 11, color: 'var(--color-text-secondary, #64748b)' }}>
            {cat?.name && <span>{cat.name} · </span>}
            {offer.sessions_count != null && `${offer.sessions_count} sessions`}
            {offer.average_rating != null && ` · ★ ${offer.average_rating.toFixed(1)}`}
          </p>
        </div>
      </div>

      {/* Sujet */}
      <div>
        <p className="u-margin--none" style={{ fontWeight: 700, fontSize: '1rem' }}>
          {offer.topic?.name ?? offer.topic_slug}
        </p>
        {offer.description && (
          <p
            className="u-margin--none"
            style={{
              fontSize: 13, color: 'var(--color-text-secondary, #64748b)', marginTop: 2,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}
          >
            {offer.description}
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="u-d--flex flex-wrap u-gap--xs">
        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: '999px', fontWeight: 500, background: level.bg, color: level.color }}>
          {LEVEL_LABELS[offer.target_level]}
        </span>
        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: '999px', fontWeight: 500, background: 'var(--color-surface-secondary, #f1f5f9)', color: 'var(--color-text-secondary, #64748b)' }}>
          {FORMAT_ICONS[offer.format]} {FORMAT_LABELS[offer.format]}
        </span>
        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: '999px', fontWeight: 500, background: 'var(--color-surface-secondary, #f1f5f9)', color: 'var(--color-text-secondary, #64748b)' }}>
          {offer.duration_minutes} min
        </span>
      </div>

      {/* Prix + CTA */}
      <div className="u-d--flex u-justify-content-between u-align-items-center" style={{ marginTop: 'auto' }}>
        <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--app-token-color, #f59e0b)' }}>
          {offer.token_cost} T4G
        </span>
        <Button
          variant="primary"
          label={isOwnOffer ? 'Ma propre offre' : 'Réserver'}
          onClick={() => !isOwnOffer && onBook(offer)}
          disabled={isOwnOffer}
        />
      </div>
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────

export function BenefitPage({ lang }: IBenefitPage & AuthPageType) {
  const { user } = useAuth();
  const router = useRouter();
  const score = user?.score ?? 0;
  const currentLevel = getLevel(score);
  const nextLevel = getNextLevel(score);
  const progressPct = nextLevel
    ? Math.min(100, Math.round(((score - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100))
    : 100;

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [bookingOffer, setBookingOffer] = useState<MentoringOffer | null>(null);
  const [showEarnings, setShowEarnings] = useState(false);
  const [showLevels, setShowLevels] = useState(false);

  const closeModal = useCallback(() => setBookingOffer(null), []);

  // Thèmes de mentoring
  const { data: learningCategories = [], isLoading: isLoadingCategories } = useSwr<LearningCategory[]>(
    '/api/learning/categories',
    () => apiClient.getLearningCategories(),
    { revalidateOnFocus: false, errorRetryCount: 2 }
  );

  // Offres recommandées — filtrées par thème sélectionné ou topics de l'user
  const swrKey = selectedCategory
    ? ['/api/mentoring/offers', selectedCategory]
    : '/api/mentoring/offers';

  const { data: rawOffers = [], isLoading: isLoadingOffers } = useSwr<MentoringOffer[]>(
    swrKey,
    () => apiClient.getMentoringOffers(
      selectedCategory ? { category: selectedCategory } : {}
    ),
    { revalidateOnFocus: false, errorRetryCount: 2 }
  );

  // Catégories du catalogue (services à consommer)
  const { data: consumerCategories } = useSwr<CategoryType[]>(
    '/service-categories/as_consumer',
    apiFetcher,
    { revalidateOnFocus: false }
  );

  // Filtrage et personnalisation des offres
  const recommendedOffers = useMemo(() => {
    if (!rawOffers.length) return [];

    let offers = rawOffers.filter((o) => o.status === 'open');

    // Personnalisation : prioriser les thèmes qui intéressent l'utilisateur
    const userTopics = [
      ...(user?.learning_topics ?? []),
      ...(user?.mentor_topics ?? []),
    ];

    if (userTopics.length > 0 && !selectedCategory) {
      // Séparer offres pertinentes et autres
      const relevant = offers.filter((o) =>
        userTopics.some((t) => o.topic_slug.includes(t) || o.topic?.category?.slug === t)
      );
      const others = offers.filter((o) =>
        !userTopics.some((t) => o.topic_slug.includes(t) || o.topic?.category?.slug === t)
      );
      offers = [...relevant, ...others];
    }

    return offers.slice(0, 9);
  }, [rawOffers, user?.learning_topics, user?.mentor_topics, selectedCategory]);

  // Comptage des offres par catégorie pour les pills
  const countByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    rawOffers.forEach((o) => {
      const cat = o.topic?.category?.slug;
      if (cat) map[cat] = (map[cat] ?? 0) + 1;
    });
    return map;
  }, [rawOffers]);

  const hasPersonalizedTopics =
    (user?.learning_topics?.length ?? 0) > 0 || (user?.mentor_topics?.length ?? 0) > 0;

  return (
    <>
      <Head>
        <title>Avantages mentors — T4G</title>
        {useIndexing(false)}
      </Head>

      <ConnectedLayout user={user ?? undefined} lang={lang} classNameCSS="o-benefits">

        <Breadcrumb
          links={[
            { text: lang.components.breadcrumb.dashboard.label, link: '/dashboard', parent: true },
            { text: 'Avantages' },
          ]}
        />

        {/* ── Hero + niveau ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="u-d--flex u-align-items-center u-gap--s heading-2 u-margin--none">
            <span className="c-icon--title--benefits--big u-margin--none">{Icons.gift}</span>
            Avantages
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary, #64748b)' }}>
            Dépense tes tokens T4G pour recevoir du mentorat sur les sujets qui t&apos;intéressent.
          </p>
        </div>

        {/* Niveau actuel */}
        <div
          className="o-card"
          style={{
            borderLeft: `4px solid ${currentLevel.color}`,
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '2rem' }}>{currentLevel.emoji}</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--app-color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ton niveau
              </p>
              <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: currentLevel.color }}>
                {currentLevel.name}
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--app-color-text-disabled)' }}>
                {score} T4G accumulés
              </p>
            </div>
          </div>

          {nextLevel && (
            <div style={{ flex: 1, minWidth: 200, maxWidth: 340 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--app-color-text-disabled)' }}>
                  Vers <strong>{nextLevel.emoji} {nextLevel.name}</strong>
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: nextLevel.color }}>
                  {nextLevel.min - score} T4G restants
                </span>
              </div>
              <div style={{ height: 8, borderRadius: '999px', background: 'var(--color-border, #e2e8f0)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%', borderRadius: '999px',
                    width: `${progressPct}%`,
                    background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel.color})`,
                    transition: 'width 0.5s',
                  }}
                />
              </div>
            </div>
          )}

          {!nextLevel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: currentLevel.bg, borderRadius: 8, padding: '8px 16px' }}>
              <span>🏆</span>
              <span style={{ fontWeight: 700, color: currentLevel.color }}>Niveau maximum !</span>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 1 — SESSIONS RECOMMANDÉES
        ════════════════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2
              className="u-d--flex u-align-items-center u-gap--s"
              style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}
            >
              <span>🎓</span>
              {hasPersonalizedTopics ? 'Recommandé pour toi' : 'Sessions disponibles'}
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
              {hasPersonalizedTopics
                ? 'Sessions de mentoring sélectionnées selon tes thèmes d\'apprentissage.'
                : 'Explore les sessions disponibles et réserve avec tes tokens T4G.'}
            </p>
          </div>

          {/* Filtre par thème */}
          {!isLoadingCategories && learningCategories.length > 0 && (
            <div className="u-d--flex u-gap--s" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedCategory('')}
                style={{
                  padding: '5px 16px', borderRadius: '999px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  border: `1.5px solid ${selectedCategory === '' ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)'}`,
                  background: selectedCategory === '' ? 'var(--color-primary, #2563eb)' : 'transparent',
                  color: selectedCategory === '' ? '#fff' : 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                Tous
              </button>
              {learningCategories.map((cat) => {
                const count = countByCategory[cat.slug] ?? 0;
                const isActive = selectedCategory === cat.slug;
                const userCares = (user?.learning_topics ?? []).some((t) => t.includes(cat.slug));
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(isActive ? '' : cat.slug)}
                    style={{
                      padding: '5px 16px', borderRadius: '999px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      border: `1.5px solid ${isActive ? (cat.color ?? 'var(--color-primary)') : userCares ? `${cat.color ?? '#2563eb'}66` : 'var(--color-border, #e2e8f0)'}`,
                      background: isActive ? (cat.color ?? 'var(--color-primary)') : 'transparent',
                      color: isActive ? '#fff' : 'inherit',
                      transition: 'all 0.15s',
                      position: 'relative',
                    }}
                  >
                    {cat.name}
                    {count > 0 && (
                      <span
                        style={{
                          marginLeft: 6, fontSize: 11, fontWeight: 700,
                          background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--color-surface-secondary, #f1f5f9)',
                          color: isActive ? '#fff' : 'var(--color-text-secondary, #64748b)',
                          borderRadius: '999px', padding: '0 6px',
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Suggestion de configurer ses thèmes */}
          {!hasPersonalizedTopics && (
            <div
              className="o-card u-d--flex u-align-items-center u-gap--m"
              style={{
                marginBottom: '1rem',
                background: 'var(--color-primary-light, #eff6ff)',
                border: '1.5px solid var(--color-primary, #2563eb)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <p className="u-margin--none" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary, #2563eb)' }}>
                  💡 Personnalise tes recommandations
                </p>
                <p className="u-margin--none" style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)', marginTop: 2 }}>
                  Indique les thèmes que tu veux apprendre et on sélectionne les meilleures sessions pour toi.
                </p>
              </div>
              <Button
                variant="secondary"
                label="Configurer mes thèmes"
                onClick={() => router.push('/profile#learning')}
              />
            </div>
          )}

          {/* Grille d'offres */}
          {isLoadingOffers ? (
            <Spinner lang={lang} spinnerText="Chargement des sessions..." size="lg" />
          ) : recommendedOffers.length === 0 ? (
            <div
              className="o-card u-d--flex u-flex-column u-align-items-center u-gap--m"
              style={{ textAlign: 'center', padding: '2rem' }}
            >
              <span style={{ fontSize: 40 }}>🔍</span>
              <div>
                <p className="u-margin--none" style={{ fontWeight: 600 }}>Aucune session disponible</p>
                <p className="u-margin--none" style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
                  {selectedCategory ? 'Essaie un autre thème.' : 'Reviens bientôt pour découvrir de nouvelles sessions.'}
                </p>
              </div>
              {selectedCategory && (
                <Button variant="ghost" label="Voir toutes les sessions" onClick={() => setSelectedCategory('')} />
              )}
            </div>
          ) : (
            <>
              <div
                className="o-layout--grid--auto"
                style={{ '--grid-min-size': '280px', '--grid-gap': '1.25rem' } as React.CSSProperties}
              >
                {recommendedOffers.map((offer) => (
                  <OfferRecoCard
                    key={offer.id}
                    offer={offer}
                    onBook={setBookingOffer}
                    myId={user?.id ?? ''}
                  />
                ))}
              </div>

              {rawOffers.length > 9 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Button
                    variant="ghost"
                    label={`Voir toutes les sessions (${rawOffers.length})`}
                    onClick={() => router.push(selectedCategory ? `/mentoring/find?category=${selectedCategory}` : '/mentoring/find')}
                  />
                </div>
              )}
            </>
          )}
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e2e8f0)', margin: '0 0 2.5rem' }} />

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 2 — AUTRES AVANTAGES (CATALOGUE)
        ════════════════════════════════════════════════════════════════════ */}
        {consumerCategories && consumerCategories.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2
                className="u-d--flex u-align-items-center u-gap--s"
                style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}
              >
                <span>{Icons.gift}</span>
                Autres avantages
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
                D&apos;autres façons de dépenser tes tokens T4G dans la communauté.
              </p>
            </div>

            <div
              className="o-layout--grid--auto"
              style={{ '--grid-min-size': '240px', '--grid-gap': '1rem' } as React.CSSProperties}
            >
              {consumerCategories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => !cat.disabled && router.push(`/benefits/${encodeURIComponent(cat.name)}`)}
                  disabled={!!cat.disabled}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                    padding: '1.25rem', borderRadius: '0.75rem', textAlign: 'left', width: '100%',
                    border: '1.5px solid var(--color-border, #e2e8f0)',
                    background: cat.disabled ? 'var(--color-surface-secondary, #f8fafc)' : 'var(--color-surface, #fff)',
                    cursor: cat.disabled ? 'not-allowed' : 'pointer',
                    opacity: cat.disabled ? 0.6 : 1,
                    transition: 'box-shadow 0.15s, transform 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!cat.disabled) {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>
                    {cat.icon ? Icons[cat.icon as keyof typeof Icons] ?? '🎁' : '🎁'}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{cat.name}</p>
                    {cat.description && (
                      <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
                        {cat.description}
                      </p>
                    )}
                  </div>
                  {cat.disabled ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--app-color-text-disabled)', background: 'var(--color-surface-secondary, #f1f5f9)', borderRadius: 4, padding: '2px 8px', alignSelf: 'flex-start' }}>
                      Bientôt
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--color-primary, #2563eb)', fontWeight: 600, marginTop: 'auto' }}>
                      Explorer →
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e2e8f0)', margin: '0 0 2.5rem' }} />

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 3 — COMMENT GAGNER DES TOKENS (accordéon)
        ════════════════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => setShowEarnings((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              padding: '0 0 1rem', textAlign: 'left',
            }}
          >
            <h2
              className="u-d--flex u-align-items-center u-gap--s"
              style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}
            >
              <span>{Icons.sparkles}</span>
              Comment gagner des tokens
            </h2>
            <span style={{ fontSize: 20, color: 'var(--color-text-secondary, #64748b)', transform: showEarnings ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              ▾
            </span>
          </button>

          {showEarnings && (
            <div className="o-card">
              <ul role="list" className="c-notifications" style={{ width: '100%' }}>
                {EARNING_TABLE.map((row) => (
                  <li key={row.action}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.2rem', minWidth: 28, textAlign: 'center' }} aria-hidden="true">{row.icon}</span>
                        <span style={{ fontSize: '0.9rem' }}>{row.action}</span>
                      </div>
                      <div className="c-metrics__metric--token" style={{ minWidth: 64, textAlign: 'center' }}>
                        <p className="c-metrics__metric__number" style={{ fontSize: '1.2rem', lineHeight: '1.4', margin: 0, color: 'var(--color-primary, #7c3aed)' }}>
                          +{row.tokens}
                        </p>
                        <p style={{ fontSize: 10, margin: 0, color: 'var(--app-color-text-disabled)' }}>T4G</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '1rem' }}>
                <Button
                  variant="primary"
                  label="Proposer une session de mentoring"
                  onClick={() => router.push('/mentoring/offer/new')}
                />
              </div>
            </div>
          )}
        </section>

        {/* Niveaux (accordéon) */}
        <section style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => setShowLevels((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              padding: '0 0 1rem', textAlign: 'left',
            }}
          >
            <h2
              className="u-d--flex u-align-items-center u-gap--s"
              style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}
            >
              <span>🎯</span>
              Niveaux &amp; récompenses
            </h2>
            <span style={{ fontSize: 20, color: 'var(--color-text-secondary, #64748b)', transform: showLevels ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              ▾
            </span>
          </button>

          {showLevels && (
            <div
              className="o-layout--grid--auto"
              style={{ '--grid-min-size': '260px' } as React.CSSProperties}
            >
              {LEVELS.map((level) => {
                const isCurrent = currentLevel.name === level.name;
                const isUnlocked = score >= level.min;
                return (
                  <div
                    key={level.name}
                    className="o-card"
                    style={{
                      borderTop: `4px solid ${isUnlocked ? level.color : 'var(--color-border, #e2e8f0)'}`,
                      opacity: isUnlocked ? 1 : 0.6,
                      position: 'relative',
                    }}
                  >
                    {isCurrent && (
                      <span style={{
                        position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 700,
                        color: level.color, background: level.bg, borderRadius: '999px', padding: '2px 10px',
                      }}>
                        Niveau actuel
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: '1.75rem' }}>{level.emoji}</span>
                      <div>
                        <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isUnlocked ? level.color : 'var(--app-color-text-disabled)' }}>
                          {level.name}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--app-color-text-disabled)' }}>
                          {level.max === Infinity ? `Dès ${level.min} T4G` : `${level.min}–${level.max} T4G`}
                        </p>
                      </div>
                    </div>
                    <ul style={{ margin: '12px 0 0', padding: '0 0 0 4px', listStyle: 'none' }}>
                      {level.perks.map((perk) => (
                        <li key={perk} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.85rem', padding: '4px 0', color: isUnlocked ? 'inherit' : 'var(--app-color-text-disabled)' }}>
                          <span style={{ color: isUnlocked ? level.color : 'var(--color-border, #cbd5e1)', flexShrink: 0 }}>✓</span>
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </ConnectedLayout>

      {/* Modal de réservation */}
      {bookingOffer && (
        <BookingModal offer={bookingOffer} onClose={closeModal} />
      )}
    </>
  );
}

BenefitPage.auth = true;
BenefitPage.role = ['alumni', 'mentee', 'mentor', 'service_provider'];

export default BenefitPage;

export const getServerSideProps = () => ({ props: {} });
