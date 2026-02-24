import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSwr from 'swr';
import ConnectedLayout from '../../layouts/ConnectedLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useIndexing } from '../../hooks';
import { Breadcrumb, Button, Icons, Spinner } from '../../components';
import { AuthPageType, LangType } from '../../types';
import { apiClient, LearningCategory, LearningTopic, MentoringOffer } from '../../services/apiClient';

interface IPage {
  lang: LangType;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const FORMAT_LABELS: Record<string, string> = {
  video: 'Visio',
  text: 'Chat',
  async: 'Asynchrone',
};

const FORMAT_ICONS: Record<string, string> = {
  video: '📹',
  text: '💬',
  async: '📼',
};

const LEVEL_COLORS: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: '#dcfce7', color: '#166534' },
  intermediate: { bg: '#fef3c7', color: '#92400e' },
  advanced:     { bg: '#fce7f3', color: '#9d174d' },
};

// Données mock pour affichage sans backend (sera remplacé par vraie API)
const MOCK_OFFERS: MentoringOffer[] = [
  {
    id: 'offer_1',
    mentor_id: 'mentor_1',
    mentor: { id: 'mentor_1', firstname: 'Alice', lastname: 'Martin', score: 480, mentor_bio: 'Opératrice de nœud depuis 3 ans, passionnée par le routing Lightning.' },
    topic_slug: 'lightning-channel-management',
    topic: { id: 't1', slug: 'lightning-channel-management', name: 'Gestion des canaux Lightning', level: 'intermediate', tags: ['lightning', 'channels'], sort_order: 2 },
    target_level: 'intermediate',
    description: 'Je t\'aide à ouvrir tes premiers canaux et à optimiser ta liquidité.',
    duration_minutes: 60,
    format: 'video',
    token_cost: 60,
    availability: [{ date: new Date(Date.now() + 2 * 86400000).toISOString(), duration_minutes: 60 }],
    status: 'open',
    average_rating: 4.9,
    sessions_count: 12,
    created_at: new Date().toISOString(),
  },
  {
    id: 'offer_2',
    mentor_id: 'mentor_2',
    mentor: { id: 'mentor_2', firstname: 'Bob', lastname: 'Dupont', score: 1600, mentor_bio: 'Expert RGB Protocol et développeur Lightning depuis 2019.' },
    topic_slug: 'rgb-basics',
    topic: { id: 't2', slug: 'rgb-basics', name: 'RGB Protocol — bases', level: 'advanced', tags: ['rgb', 'protocol'], sort_order: 2 },
    target_level: 'advanced',
    duration_minutes: 90,
    format: 'video',
    token_cost: 120,
    availability: [{ date: new Date(Date.now() + 3 * 86400000).toISOString(), duration_minutes: 90 }],
    status: 'open',
    average_rating: 4.7,
    sessions_count: 7,
    created_at: new Date().toISOString(),
  },
  {
    id: 'offer_3',
    mentor_id: 'mentor_3',
    mentor: { id: 'mentor_3', firstname: 'Chloé', lastname: 'Bernard', score: 820, mentor_bio: 'Je configure des DazBox et accompagne les nouveaux opérateurs.' },
    topic_slug: 'dazbox-setup',
    topic: { id: 't3', slug: 'dazbox-setup', name: 'Installer et configurer sa DazBox', level: 'beginner', tags: ['dazbox', 'setup'], sort_order: 1 },
    target_level: 'beginner',
    description: 'Setup complet de ta DazBox en moins d\'une heure.',
    duration_minutes: 45,
    format: 'video',
    token_cost: 30,
    availability: [
      { date: new Date(Date.now() + 86400000).toISOString(), duration_minutes: 45 },
      { date: new Date(Date.now() + 4 * 86400000).toISOString(), duration_minutes: 45 },
    ],
    status: 'open',
    average_rating: 5.0,
    sessions_count: 23,
    created_at: new Date().toISOString(),
  },
  {
    id: 'offer_4',
    mentor_id: 'mentor_4',
    mentor: { id: 'mentor_4', firstname: 'David', lastname: 'Leroy', score: 560, mentor_bio: 'Intégrations DazPay pour commerçants, plusieurs projets livrés.' },
    topic_slug: 'dazpay-integration',
    topic: { id: 't4', slug: 'dazpay-integration', name: 'Intégrer DazPay dans une boutique', level: 'intermediate', tags: ['dazpay', 'payments'], sort_order: 2 },
    target_level: 'intermediate',
    duration_minutes: 60,
    format: 'text',
    token_cost: 40,
    availability: [],
    status: 'open',
    average_rating: 4.5,
    sessions_count: 4,
    created_at: new Date().toISOString(),
  },
];

function getUserLevel(score: number): string {
  if (score >= 1500) return 'Expert';
  if (score >= 500) return 'Mentor';
  return 'Contributeur';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

const Page: React.FC<IPage> & AuthPageType = ({ lang }: IPage) => {
  const { user } = useAuth();
  const router = useRouter();

  // Filtre pré-sélectionné depuis l'URL (ex: ?category=lightning_network)
  const initialCategory = typeof router.query.category === 'string' ? router.query.category : '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [maxCost, setMaxCost] = useState<number>(200);

  // Fetch des catégories depuis l'API
  const { data: categories = [], isLoading: isLoadingCategories } = useSwr<LearningCategory[]>(
    '/api/learning/categories',
    () => apiClient.getLearningCategories(),
    { revalidateOnFocus: false }
  );

  // Fetch des offres (mock pour l'instant, remplacé quand l'API sera disponible)
  const { data: rawOffers = MOCK_OFFERS, isLoading: isLoadingOffers } = useSwr<MentoringOffer[]>(
    ['/api/mentoring/offers', selectedCategory, selectedLevel, selectedFormat, maxCost],
    () => apiClient.getMentoringOffers({
      category: selectedCategory || undefined,
      level: selectedLevel || undefined,
      format: selectedFormat || undefined,
      max_cost: maxCost < 200 ? maxCost : undefined,
    }),
    {
      revalidateOnFocus: false,
      onError: () => { /* fallback sur mock */ },
    }
  );

  // Filtrage côté client sur les mocks si l'API ne filtre pas encore
  const offers = useMemo(() => {
    return rawOffers.filter((o) => {
      if (selectedCategory && o.topic?.category?.slug !== selectedCategory && !o.topic_slug.includes(selectedCategory)) return false;
      if (selectedLevel && o.target_level !== selectedLevel) return false;
      if (selectedFormat && o.format !== selectedFormat) return false;
      if (o.token_cost > maxCost) return false;
      return true;
    });
  }, [rawOffers, selectedCategory, selectedLevel, selectedFormat, maxCost]);

  const isLoading = isLoadingCategories || isLoadingOffers;

  return (
    <>
      <Head>
        <title>Trouver un mentor — Token4Good</title>
        {useIndexing(false)}
      </Head>

      <ConnectedLayout user={user} lang={lang}>
        <Breadcrumb
          links={[
            { text: 'Dashboard', link: '/dashboard', parent: true },
            { text: 'Mentoring', link: '/mentoring', parent: true },
            { text: 'Trouver un mentor' },
          ]}
        />

        <h1 className="u-d--flex u-align-items-center u-gap--s heading-2">
          <span className="c-icon--title u-margin--none">🎓</span>
          Trouver un mentor
        </h1>

        {/* ── Filtres ── */}
        <div
          className="o-card u-d--flex u-flex-column u-gap--m"
          style={{ padding: '1rem 1.25rem' }}
        >
          {/* Catégories */}
          {!isLoadingCategories && categories.length > 0 && (
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '0.875rem' }}>Catégorie</p>
              <div className="u-d--flex flex-wrap u-gap--xs">
                <button
                  onClick={() => setSelectedCategory('')}
                  style={{
                    padding: '4px 14px',
                    borderRadius: '999px',
                    border: `1.5px solid ${selectedCategory === '' ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #e2e8f0)'}`,
                    background: selectedCategory === '' ? 'var(--color-primary, #2563eb)' : 'transparent',
                    color: selectedCategory === '' ? '#fff' : 'inherit',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'all 0.15s',
                  }}
                >
                  Toutes
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)}
                    style={{
                      padding: '4px 14px',
                      borderRadius: '999px',
                      border: `1.5px solid ${selectedCategory === cat.slug ? (cat.color || 'var(--color-primary)') : 'var(--color-border, #e2e8f0)'}`,
                      background: selectedCategory === cat.slug ? (cat.color || 'var(--color-primary)') : 'transparent',
                      color: selectedCategory === cat.slug ? '#fff' : 'inherit',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      transition: 'all 0.15s',
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ligne : niveau + format + budget */}
          <div
            className="u-d--flex flex-wrap u-gap--m"
            style={{ alignItems: 'flex-end' }}
          >
            {/* Niveau */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 4 }}>
                Niveau
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '0.375rem',
                  border: '1.5px solid var(--color-border, #e2e8f0)',
                  fontSize: 13,
                  background: 'transparent',
                  cursor: 'pointer',
                  minWidth: 140,
                }}
              >
                <option value="">Tous niveaux</option>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>

            {/* Format */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 4 }}>
                Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '0.375rem',
                  border: '1.5px solid var(--color-border, #e2e8f0)',
                  fontSize: 13,
                  background: 'transparent',
                  cursor: 'pointer',
                  minWidth: 140,
                }}
              >
                <option value="">Tous formats</option>
                <option value="video">Visio</option>
                <option value="text">Chat</option>
                <option value="async">Asynchrone</option>
              </select>
            </div>

            {/* Budget */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 4 }}>
                Budget max : <strong>{maxCost === 200 ? 'Illimité' : `${maxCost} T4G`}</strong>
              </label>
              <input
                type="range"
                min={0}
                max={200}
                step={10}
                value={maxCost}
                onChange={(e) => setMaxCost(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Reset */}
            {(selectedCategory || selectedLevel || selectedFormat || maxCost < 200) && (
              <Button
                variant="ghost"
                label="Réinitialiser"
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedLevel('');
                  setSelectedFormat('');
                  setMaxCost(200);
                }}
              />
            )}
          </div>
        </div>

        {/* ── Résultats ── */}
        {isLoading ? (
          <Spinner lang={lang} spinnerText="Chargement des mentors..." size="lg" />
        ) : offers.length === 0 ? (
          <div
            className="o-card u-d--flex u-flex-column u-align-items-center u-gap--m"
            style={{ textAlign: 'center', padding: '2.5rem' }}
          >
            <span style={{ fontSize: 48 }}>🔍</span>
            <p style={{ fontWeight: 600, margin: 0 }}>Aucun mentor disponible pour ces filtres</p>
            <p style={{ color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>
              Essaie d&apos;élargir ta recherche ou reviens plus tard.
            </p>
            <Button variant="secondary" label="Réinitialiser les filtres" onClick={() => {
              setSelectedCategory(''); setSelectedLevel(''); setSelectedFormat(''); setMaxCost(200);
            }} />
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--color-text-secondary, #64748b)', fontSize: 13, margin: '0.5rem 0' }}>
              {offers.length} session{offers.length > 1 ? 's' : ''} disponible{offers.length > 1 ? 's' : ''}
            </p>
            <div
              className="o-layout--grid--auto"
              style={{ '--grid-min-size': '300px', '--grid-gap': '1.25rem' } as React.CSSProperties}
            >
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onBook={() => router.push(`/mentoring/session/${offer.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </ConnectedLayout>
    </>
  );
};

// ── Composant card d'une offre ──

interface OfferCardProps {
  offer: MentoringOffer;
  onBook: () => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onBook }) => {
  const level = LEVEL_COLORS[offer.target_level] ?? LEVEL_COLORS.beginner;
  const nextSlot = offer.availability?.[0];

  return (
    <div
      className="o-card u-d--flex u-flex-column u-gap--s"
      style={{ position: 'relative', height: '100%' }}
    >
      {/* En-tête mentor */}
      <div className="u-d--flex u-align-items-center u-gap--s">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--color-primary-light, #eff6ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            color: 'var(--color-primary, #2563eb)',
            flexShrink: 0,
          }}
        >
          {offer.mentor?.firstname?.[0] ?? '?'}
          {offer.mentor?.lastname?.[0] ?? ''}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="u-margin--none" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {offer.mentor?.firstname} {offer.mentor?.lastname}
          </p>
          <p className="u-margin--none" style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>
            {getUserLevel(offer.mentor?.score ?? 0)}
            {offer.sessions_count != null && ` · ${offer.sessions_count} sessions`}
            {offer.average_rating != null && ` · ★${offer.average_rating.toFixed(1)}`}
          </p>
        </div>
      </div>

      {/* Thème */}
      <div>
        <p className="u-margin--none" style={{ fontWeight: 600, fontSize: '1rem' }}>
          {offer.topic?.name ?? offer.topic_slug}
        </p>
        {offer.description && (
          <p
            className="u-margin--none"
            style={{
              fontSize: 13,
              color: 'var(--color-text-secondary, #64748b)',
              marginTop: 2,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {offer.description}
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="u-d--flex flex-wrap u-gap--xs">
        <span
          style={{
            fontSize: 12,
            padding: '2px 10px',
            borderRadius: '999px',
            fontWeight: 500,
            background: level.bg,
            color: level.color,
          }}
        >
          {LEVEL_LABELS[offer.target_level]}
        </span>
        <span
          style={{
            fontSize: 12,
            padding: '2px 10px',
            borderRadius: '999px',
            fontWeight: 500,
            background: 'var(--color-surface-secondary, #f1f5f9)',
            color: 'var(--color-text-secondary, #64748b)',
          }}
        >
          {FORMAT_ICONS[offer.format]} {FORMAT_LABELS[offer.format]}
        </span>
        <span
          style={{
            fontSize: 12,
            padding: '2px 10px',
            borderRadius: '999px',
            fontWeight: 500,
            background: 'var(--color-surface-secondary, #f1f5f9)',
            color: 'var(--color-text-secondary, #64748b)',
          }}
        >
          {offer.duration_minutes} min
        </span>
      </div>

      {/* Disponibilité + prix */}
      <div className="u-d--flex u-justify-content-between u-align-items-center" style={{ marginTop: 'auto' }}>
        <div>
          {nextSlot ? (
            <p className="u-margin--none" style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>
              Prochain créneau : <strong>{formatDate(nextSlot.date)}</strong>
            </p>
          ) : (
            <p className="u-margin--none" style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>
              Sur demande
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="u-margin--none" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--app-token-color, #f59e0b)' }}>
            {offer.token_cost} T4G
          </p>
        </div>
      </div>

      <Button
        variant="primary"
        className="u-width--fill"
        onClick={onBook}
        label="Réserver"
      />
    </div>
  );
};

export default Page;

Page.auth = true;
Page.role = ['alumni', 'mentee', 'mentor', 'service_provider'];
