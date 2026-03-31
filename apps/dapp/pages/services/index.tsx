import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import ConnectedLayout from '../../layouts/ConnectedLayout';
import { useIndexing } from '../../hooks';
import { AuthPageType, CategoryType, LangType } from 'apps/dapp/types';
import { Breadcrumb, Button, CategoryCard, Icons, Spinner } from 'apps/dapp/components';
import { RightPanel, AppModal } from '../../lib/ui-layouts';
import useSwr from 'swr';
import { apiFetcher } from 'apps/dapp/services/config';
import { apiClient, LearningCategory, MentoringOffer } from 'apps/dapp/services/apiClient';


export interface IPage {
  lang: LangType;
}

const FORMAT_ICONS: Record<string, string> = {
  video: '📹',
  text: '💬',
  async: '📼',
};

const FORMAT_LABELS: Record<string, string> = {
  video: 'Visio',
  text: 'Chat',
  async: 'Asynchrone',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const LEVEL_COLORS: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: '#dcfce7', color: '#166534' },
  intermediate: { bg: '#fef3c7', color: '#92400e' },
  advanced:     { bg: '#fce7f3', color: '#9d174d' },
};

// ── Carte offre mentoring compacte ────────────────────────────────────────────

interface OfferMiniCardProps {
  offer: MentoringOffer;
}

const OfferMiniCard: React.FC<OfferMiniCardProps> = ({ offer }) => {
  const router = useRouter();
  const level = LEVEL_COLORS[offer.target_level] ?? LEVEL_COLORS.beginner;

  return (
    <div
      className="o-card u-d--flex u-flex-column u-gap--s"
      style={{ borderLeft: '4px solid var(--app-token-color, #f59e0b)' }}
    >
      <div className="u-d--flex u-justify-content-between u-align-items-flex-start">
        <p className="u-margin--none" style={{ fontWeight: 700, fontSize: '0.95rem', flex: 1 }}>
          {offer.topic?.name ?? offer.topic_slug}
        </p>
        <span
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: '999px',
            fontWeight: 600,
            background: level.bg,
            color: level.color,
            whiteSpace: 'nowrap',
            marginLeft: 8,
          }}
        >
          {LEVEL_LABELS[offer.target_level]}
        </span>
      </div>

      {offer.description && (
        <p
          className="u-margin--none"
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary, #64748b)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {offer.description}
        </p>
      )}

      <div className="u-d--flex u-align-items-center u-gap--s" style={{ flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>
          {FORMAT_ICONS[offer.format]} {FORMAT_LABELS[offer.format]}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>
          · {offer.duration_minutes} min
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--app-token-color, #f59e0b)',
            marginLeft: 'auto',
          }}
        >
          {offer.token_cost} T4G
        </span>
      </div>

      <div className="u-d--flex u-gap--s">
        <Button
          variant="ghost"
          label="Modifier"
          onClick={() => router.push(`/mentoring/offer/${offer.id}`)}
        />
        {offer.average_rating != null && (
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)', alignSelf: 'center' }}>
            ★ {offer.average_rating.toFixed(1)}
            {offer.sessions_count != null && ` · ${offer.sessions_count} session${offer.sessions_count > 1 ? 's' : ''}`}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Carte thème de mentoring ──────────────────────────────────────────────────

interface ThemeCardProps {
  category: LearningCategory;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ category }) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/mentoring/find?category=${category.slug}`)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.5rem',
        padding: '1rem 1.25rem',
        borderRadius: '0.75rem',
        border: `2px solid ${category.color ?? 'var(--color-border, #e2e8f0)'}`,
        background: 'var(--color-surface, #fff)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
      }}
    >
      <span style={{ fontSize: 28 }}>
        {category.icon_key ?? '⚡'}
      </span>
      <p
        style={{
          margin: 0,
          fontWeight: 700,
          fontSize: '0.95rem',
          color: category.color ?? 'var(--color-text-primary)',
        }}
      >
        {category.name}
      </p>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>
        Voir les mentors →
      </p>
    </button>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────

const Page: React.FC<IPage> & AuthPageType = ({ lang }: IPage) => {
  const { user } = useAuth();
  const router = useRouter();

  const isMentorActive = user?.is_mentor_active === true;

  // Catégories de mentoring (thèmes)
  const { data: learningCategories = [], isLoading: isLoadingCategories } = useSwr<LearningCategory[]>(
    '/api/learning/categories',
    () => apiClient.getLearningCategories(),
    { revalidateOnFocus: false, errorRetryCount: 2 }
  );

  // Mes offres de mentoring (si mentor)
  const { data: myOffers = [], isLoading: isLoadingOffers } = useSwr<MentoringOffer[]>(
    isMentorActive ? '/api/users/me/mentoring-offers' : null,
    () => apiClient.getMyMentoringOffers(),
    { revalidateOnFocus: false, errorRetryCount: 2 }
  );

  // Catalogue (services à consommer)
  const { data: consumerCategories } = useSwr<CategoryType[]>(
    '/service-categories/as_consumer',
    apiFetcher,
    { revalidateOnFocus: false }
  );

  // Filtre thème pour "Mes offres"
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('');

  const activeOffers = useMemo(() =>
    myOffers.filter((o) => o.status === 'open'),
    [myOffers]
  );

  const filteredOffers = useMemo(() => {
    if (!selectedTopicFilter) return activeOffers;
    return activeOffers.filter(
      (o) => o.topic?.category?.slug === selectedTopicFilter || o.topic_slug.includes(selectedTopicFilter)
    );
  }, [activeOffers, selectedTopicFilter]);

  // Catégories représentées dans mes offres (pour le filtre)
  const offerCategories = useMemo(() => {
    const slugs = new Set(activeOffers.map((o) => o.topic?.category?.slug).filter(Boolean));
    return learningCategories.filter((c) => slugs.has(c.slug));
  }, [activeOffers, learningCategories]);

  return (
    <>
      <Head>
        <title>{lang.page.services.index.head.title}</title>
        {useIndexing(false)}
      </Head>

      <ConnectedLayout user={user} lang={lang} classNameCSS="o-services">

        {/* ── Breadcrumb + Hero ── */}
        <Breadcrumb
          links={[
            { text: lang.components.breadcrumb.dashboard.label, link: '/dashboard', parent: true },
            { text: lang.components.breadcrumb.services.label },
          ]}
        />

        <div style={{ marginBottom: '2rem' }}>
          <h1 className="u-d--flex u-align-items-center u-gap--s heading-2">
            <span className="c-icon--title--services--big u-margin--none">
              {Icons.sparkles}
            </span>
            Services
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary, #64748b)' }}>
            Propose des sessions de mentoring pour gagner des tokens T4G, et découvre les services disponibles dans le catalogue.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════
            SECTION 1 — MES OFFRES DE MENTORING
        ════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div
            className="u-d--flex u-align-items-center u-justify-content-between"
            style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}
          >
            <h2
              className="u-d--flex u-align-items-center u-gap--s"
              style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}
            >
              <span style={{ fontSize: 20 }}>✦</span>
              Mes offres de mentoring
            </h2>
            {isMentorActive && (
              <div className="u-d--flex u-gap--s">
                <Button
                  variant="ghost"
                  label="Mes sessions"
                  onClick={() => router.push('/mentoring/my-sessions?role=mentor')}
                />
                <Button
                  variant="primary"
                  label="+ Nouvelle offre"
                  onClick={() => router.push('/mentoring/offer/new')}
                />
              </div>
            )}
          </div>

          {!isMentorActive ? (
            /* CTA activation mentor */
            <div
              className="o-card u-d--flex u-align-items-center u-gap--m"
              style={{
                borderLeft: '4px solid var(--app-token-color, #f59e0b)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 220 }}>
                <p className="u-margin--none" style={{ fontWeight: 700, marginBottom: 4 }}>
                  Tu n&apos;es pas encore mentor
                </p>
                <p className="u-margin--none" style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
                  Active ton profil mentor pour proposer des sessions sur tes thèmes d&apos;expertise et gagner des tokens T4G.
                </p>
              </div>
              <Button
                variant="secondary"
                label="Activer mon profil mentor"
                onClick={() => router.push('/profile#mentor')}
              />
            </div>
          ) : isLoadingOffers ? (
            <Spinner lang={lang} spinnerText="Chargement de vos offres..." size="lg" />
          ) : activeOffers.length === 0 ? (
            <div
              className="o-card u-d--flex u-flex-column u-align-items-center u-gap--m"
              style={{ textAlign: 'center', padding: '2rem', background: 'var(--color-surface-secondary, #f8fafc)' }}
            >
              <span style={{ fontSize: 40 }}>✦</span>
              <div>
                <p className="u-margin--none" style={{ fontWeight: 600 }}>Aucune offre active</p>
                <p className="u-margin--none" style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
                  Crée ta première offre de mentoring sur l&apos;un des thèmes proposés.
                </p>
              </div>
              <Button
                variant="primary"
                label="Créer une offre"
                onClick={() => router.push('/mentoring/offer/new')}
              />
            </div>
          ) : (
            <>
              {/* Filtre par thème si plusieurs catégories représentées */}
              {offerCategories.length > 1 && (
                <div className="u-d--flex u-gap--s" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedTopicFilter('')}
                    style={{
                      padding: '4px 14px',
                      borderRadius: '999px',
                      border: `1.5px solid ${selectedTopicFilter === '' ? 'var(--app-token-color, #f59e0b)' : 'var(--color-border, #e2e8f0)'}`,
                      background: selectedTopicFilter === '' ? 'var(--app-token-color, #f59e0b)' : 'transparent',
                      color: selectedTopicFilter === '' ? '#fff' : 'inherit',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Tous
                  </button>
                  {offerCategories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedTopicFilter(cat.slug === selectedTopicFilter ? '' : cat.slug)}
                      style={{
                        padding: '4px 14px',
                        borderRadius: '999px',
                        border: `1.5px solid ${selectedTopicFilter === cat.slug ? (cat.color ?? 'var(--color-primary)') : 'var(--color-border, #e2e8f0)'}`,
                        background: selectedTopicFilter === cat.slug ? (cat.color ?? 'var(--color-primary)') : 'transparent',
                        color: selectedTopicFilter === cat.slug ? '#fff' : 'inherit',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              <div
                className="o-layout--grid--auto"
                style={{ '--grid-min-size': '280px', '--grid-gap': '1rem' } as React.CSSProperties}
              >
                {filteredOffers.map((offer) => (
                  <OfferMiniCard key={offer.id} offer={offer} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Séparateur */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e2e8f0)', margin: '0 0 2.5rem' }} />

        {/* ═══════════════════════════════════════════════════
            SECTION 2 — CATALOGUE DES SERVICES
        ════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2
              className="u-d--flex u-align-items-center u-gap--s"
              style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}
            >
              <span style={{ fontSize: 20 }}>{Icons.gift}</span>
              Catalogue des services
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
              Dépense tes tokens T4G pour accéder aux avantages et services de la communauté.
            </p>
          </div>

          {consumerCategories ? (
            consumerCategories.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary, #64748b)', fontSize: 14 }}>
                Aucun service disponible pour le moment.
              </p>
            ) : (
              <div
                className="o-layout--grid--auto"
                style={{ '--grid-min-size': '320px', '--grid-gap': '1.25rem' } as React.CSSProperties}
              >
                {consumerCategories.map((categorie: CategoryType, index: number) => (
                  <CategoryCard
                    lang={lang}
                    key={index}
                    categorie={categorie}
                    type="BENEFITS"
                  />
                ))}
              </div>
            )
          ) : (
            <Spinner lang={lang} spinnerText="Chargement du catalogue..." size="lg" />
          )}
        </section>

        {/* Séparateur */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e2e8f0)', margin: '0 0 2.5rem' }} />

        {/* ═══════════════════════════════════════════════════
            SECTION 3 — EXPLORER PAR THÈME DE MENTORING
        ════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2
              className="u-d--flex u-align-items-center u-gap--s"
              style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}
            >
              <span style={{ fontSize: 20 }}>🎓</span>
              Explorer par thème de mentoring
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
              Trouve un mentor ou propose une session sur les thèmes Bitcoin &amp; Lightning Network.
            </p>
          </div>

          {isLoadingCategories ? (
            <Spinner lang={lang} spinnerText="Chargement des thèmes..." size="lg" />
          ) : learningCategories.length === 0 ? (
            <div className="o-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <p style={{ color: 'var(--color-text-secondary, #64748b)', margin: 0, fontSize: 14 }}>
                Les thèmes de mentoring seront disponibles prochainement.
              </p>
            </div>
          ) : (
            <div
              className="o-layout--grid--auto"
              style={{ '--grid-min-size': '180px', '--grid-gap': '1rem' } as React.CSSProperties}
            >
              {learningCategories.map((cat) => (
                <ThemeCard key={cat.slug} category={cat} />
              ))}
            </div>
          )}

          {/* CTA bas de page */}
          <div
            className="o-card u-d--flex u-align-items-center u-gap--m"
            style={{
              marginTop: '1.5rem',
              background: 'var(--color-surface-secondary, #f8fafc)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <p className="u-margin--none" style={{ fontWeight: 600, marginBottom: 4 }}>
                La communauté Token4Good
              </p>
              <p className="u-margin--none" style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
                Des experts sur Bitcoin, Lightning Network, DazBox et plus encore. Chaque session génère une preuve RGB immuable.
              </p>
            </div>
            <div className="u-d--flex u-gap--s">
              <Button
                variant="ghost"
                label="Voir la communauté"
                onClick={() => router.push('/community')}
              />
              <Button
                variant="secondary"
                label="Trouver un mentor"
                onClick={() => router.push('/mentoring/find')}
              />
            </div>
          </div>
        </section>

        <RightPanel />
        <AppModal />
      </ConnectedLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['alumni', 'mentee', 'mentor', 'service_provider'];

export const getServerSideProps = () => ({ props: {} });
