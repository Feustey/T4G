import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSwr from 'swr';
import ConnectedLayout from '../../layouts/ConnectedLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useIndexing } from '../../hooks';
import { Breadcrumb, Button, Spinner } from '../../components';
import { AuthPageType, LangType } from '../../types';
import { apiClient, LearningCategory, MentoringOffer } from '../../services/apiClient';

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

  const [mounted, setMounted] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  // Activer le rendu client (évite les erreurs d'hydratation SSR/CSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchroniser les filtres quand l'URL change (ex: navigation, lien direct)
  useEffect(() => {
    const cat = typeof router.query.category === 'string' ? router.query.category : '';
    const mid = typeof router.query.mentor === 'string' ? router.query.mentor : '';
    setSelectedCategory(cat);
    setSelectedMentorId(mid);
  }, [router.query.category, router.query.mentor]);

  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [maxCost, setMaxCost] = useState<number>(200);

  // Fetch des catégories depuis l'API
  const { data: categories = [], isLoading: isLoadingCategories } = useSwr<LearningCategory[]>(
    '/api/learning/categories',
    () => apiClient.getLearningCategories(),
    { revalidateOnFocus: false }
  );

  // Fetch des offres
  const { data: rawOffers = [], isLoading: isLoadingOffers } = useSwr<MentoringOffer[]>(
    ['/api/mentoring/offers', selectedCategory, selectedLevel, selectedFormat, maxCost, selectedMentorId],
    () => apiClient.getMentoringOffers({
      category: selectedCategory || undefined,
      level: selectedLevel || undefined,
      format: selectedFormat || undefined,
      max_cost: maxCost < 200 ? maxCost : undefined,
      mentor_id: selectedMentorId || undefined,
    }),
    {
      revalidateOnFocus: false,
      onError: () => { /* fallback sur tableau vide */ },
    }
  );

  // Filtrage côté client (complément aux filtres API)
  const offers = useMemo(() => {
    return rawOffers.filter((o) => {
      if (selectedCategory && o.topic?.category?.slug !== selectedCategory && !o.topic_slug.includes(selectedCategory)) return false;
      if (selectedLevel && o.target_level !== selectedLevel) return false;
      if (selectedFormat && o.format !== selectedFormat) return false;
      if (selectedMentorId && o.mentor_id !== selectedMentorId) return false;
      if (o.token_cost > maxCost) return false;
      return true;
    });
  }, [rawOffers, selectedCategory, selectedLevel, selectedFormat, maxCost, selectedMentorId]);

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
            {(selectedCategory || selectedLevel || selectedFormat || maxCost < 200 || selectedMentorId) && (
              <Button
                variant="ghost"
                label="Réinitialiser"
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedLevel('');
                  setSelectedFormat('');
                  setMaxCost(200);
                  setSelectedMentorId('');
                  router.replace('/mentoring/find', undefined, { shallow: true });
                }}
              />
            )}
          </div>
        </div>

        {/* ── Résultats ── */}
        {!mounted || isLoading ? (
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
              setSelectedCategory(''); setSelectedLevel(''); setSelectedFormat(''); setMaxCost(200); setSelectedMentorId('');
              router.replace('/mentoring/find', undefined, { shallow: true });
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

export const getServerSideProps = () => ({ props: {} });
