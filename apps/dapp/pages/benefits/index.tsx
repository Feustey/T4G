import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ConnectedLayout from 'apps/dapp/layouts/ConnectedLayout';
import { Breadcrumb, Icons } from 'apps/dapp/components';
import { AuthPageType, LangType } from 'apps/dapp/types';
import { useIndexing } from 'apps/dapp/hooks';
import { useAuth } from '../../contexts/AuthContext';

interface IBenefitPage {
  lang: LangType;
}

// ─── Système de niveaux ────────────────────────────────────────────────────

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
      "Accès au catalogue de services",
      "Badge Contributeur sur votre profil",
      "Dashboard de vos impacts",
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
      "Tout ce qui est dans Contributeur",
      "Badge Mentor mis en avant dans l'annuaire",
      "Mise en avant prioritaire dans la recherche",
      "Accès aux événements communautaires",
      "Statistiques détaillées de vos sessions",
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
      "Tout ce qui est dans Mentor",
      "Badge Expert — statut top 5 % de la communauté",
      "Certificat de mentorat signé sur la blockchain (RGB)",
      "Accès aux événements VIP T4G",
      'Profil "Mentor vedette" sur la page d\'accueil',
      "Accès prioritaire aux nouvelles fonctionnalités",
    ],
  },
];

function getLevel(score: number) {
  return (
    LEVELS.find((l) => score >= l.min && score <= l.max) ?? LEVELS[0]
  );
}

function getNextLevel(score: number) {
  return LEVELS.find((l) => l.min > score) ?? null;
}

// ─── Barème de gains ───────────────────────────────────────────────────────

const EARNING_TABLE = [
  { action: 'Bonus bienvenue (1ère session)', tokens: 50, icon: '🎉' },
  { action: 'Session mentorat — 30 min', tokens: 20, icon: '⏱️' },
  { action: 'Session mentorat — 60 min', tokens: 40, icon: '⏰' },
  { action: 'Session mentorat — 90 min', tokens: 60, icon: '🕐' },
  { action: 'Évaluation 5 étoiles reçue', tokens: 10, icon: '⭐' },
  { action: 'Preuve de session soumise', tokens: 5, icon: '📋' },
  { action: 'Offre de mentorat créée', tokens: 5, icon: '✏️' },
];

// ─── Ce que vous pouvez acheter ────────────────────────────────────────────

const SPEND_CARDS = [
  {
    emoji: '🎓',
    title: 'Coaching professionnel',
    desc: 'Séances avec des experts de votre secteur pour booster votre carrière.',
    cost: 'Dès 30 T4G',
  },
  {
    emoji: '📜',
    title: 'Programmes de certification',
    desc: 'Accédez à des formations certifiantes reconnues dans votre domaine.',
    cost: 'Dès 60 T4G',
  },
  {
    emoji: '🎤',
    title: 'Conférences & événements',
    desc: 'Places pour des conférences, meetups et événements premium T4G.',
    cost: 'Dès 20 T4G',
  },
  {
    emoji: '🔍',
    title: 'Visibilité recrutement',
    desc: 'Mettez en avant votre profil auprès des recruteurs partenaires.',
    cost: 'Dès 50 T4G',
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────

export function BenefitPage({ lang }: IBenefitPage & AuthPageType) {
  const { user } = useAuth();
  const score = user?.score ?? 0;
  const currentLevel = getLevel(score);
  const nextLevel = getNextLevel(score);
  const progressPct = nextLevel
    ? Math.min(100, Math.round(((score - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100))
    : 100;

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

        {/* ── Hero ── */}
        <div className="u-d--flex u-align-items-center u-gap--s u-margin-lg--none u-margin--auto">
          <h1 className="u-d--flex u-align-items-center u-gap--s heading-2 u-margin--none">
            <span className="c-icon--title--benefits--big u-margin--none">{Icons.gift}</span>
            Vos avantages mentors
          </h1>
        </div>
        <p className="u-text--bold">
          Chaque session de mentorat vous rapporte des tokens T4G. Montez en niveau,
          débloquez des récompenses exclusives et dépensez vos tokens dans le catalogue.
        </p>

        {/* ── Niveau actuel ── */}
        <div className="o-card" style={{ borderLeft: `4px solid ${currentLevel.color}` }}>
          <div className="u-d--flex u-align-items-center u-justify-content-between u-width--fill" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--app-color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Votre niveau actuel
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '2rem' }}>{currentLevel.emoji}</span>
                <div>
                  <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: currentLevel.color }}>
                    {currentLevel.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--app-color-text-disabled)' }}>
                    {score} T4G accumulés
                  </p>
                </div>
              </div>
            </div>

            {nextLevel && (
              <div style={{ flex: 1, minWidth: '200px', maxWidth: '340px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--app-color-text-disabled)' }}>
                    Progression vers <strong>{nextLevel.emoji} {nextLevel.name}</strong>
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: nextLevel.color }}>
                    {nextLevel.min - score} T4G restants
                  </span>
                </div>
                <div style={{ height: '8px', borderRadius: '999px', background: 'var(--color-border, #e2e8f0)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '999px', width: `${progressPct}%`, background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel.color})`, transition: 'width 0.5s' }} />
                </div>
              </div>
            )}

            {!nextLevel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: currentLevel.bg, borderRadius: '8px', padding: '8px 16px' }}>
                <span>🏆</span>
                <span style={{ fontWeight: 700, color: currentLevel.color }}>Niveau maximum atteint !</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Barème de gains ── */}
        <div className="o-card">
          <h2 className="subtitle-1 u-d--flex u-align-items-center u-gap--s">
            <span>{Icons.sparkles}</span>
            Ce que vous gagnez comme mentor
          </h2>
          <p style={{ color: 'var(--app-color-text-disabled)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Chaque action récompensée est enregistrée dans votre score total.
          </p>
          <ul role="list" className="c-notifications" style={{ width: '100%' }}>
            {EARNING_TABLE.map((row) => (
              <li key={row.action}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.25rem', minWidth: '28px', textAlign: 'center' }} aria-hidden="true">{row.icon}</span>
                    <span style={{ fontSize: '0.9rem' }}>{row.action}</span>
                  </div>
                  <div className="c-metrics__metric--token" style={{ minWidth: '64px', textAlign: 'center' }}>
                    <p className="c-metrics__metric__number" style={{ fontSize: '1.3rem', lineHeight: '1.4', margin: 0, color: 'var(--color-primary, #7c3aed)' }}>
                      +{row.tokens}
                    </p>
                    <p style={{ fontSize: '10px', margin: 0, color: 'var(--app-color-text-disabled)' }}>T4G</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Niveaux ── */}
        <div>
          <h2 className="subtitle-1 u-d--flex u-align-items-center u-gap--s" style={{ marginBottom: '1rem' }}>
            <span>🎯</span>
            Les niveaux & récompenses
          </h2>
          <section
            className="o-layout--grid--auto"
            style={{ '--grid-min-size': '280px' } as React.CSSProperties}
          >
            {LEVELS.map((level) => {
              const isCurrentLevel = currentLevel.name === level.name;
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
                  {isCurrentLevel && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: level.color,
                      background: level.bg,
                      borderRadius: '999px',
                      padding: '2px 10px',
                    }}>
                      Niveau actuel
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.75rem' }}>{level.emoji}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: isUnlocked ? level.color : 'var(--app-color-text-disabled)' }}>
                        {level.name}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--app-color-text-disabled)' }}>
                        {level.max === Infinity ? `Dès ${level.min} T4G` : `${level.min}–${level.max} T4G`}
                      </p>
                    </div>
                  </div>
                  <ul style={{ margin: '12px 0 0', padding: '0 0 0 4px', listStyle: 'none' }}>
                    {level.perks.map((perk) => (
                      <li key={perk} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', padding: '4px 0', color: isUnlocked ? 'inherit' : 'var(--app-color-text-disabled)' }}>
                        <span style={{ color: isUnlocked ? level.color : 'var(--color-border, #cbd5e1)', flexShrink: 0 }}>✓</span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        </div>

        {/* ── Catalogue & CTA ── */}
        <div className="o-card" style={{ background: 'linear-gradient(135deg, var(--color-primary, #7c3aed)15, transparent)', borderLeft: '4px solid var(--color-primary, #7c3aed)' }}>
          <h2 className="subtitle-1 u-d--flex u-align-items-center u-gap--s">
            <span>{Icons.gift}</span>
            Dépensez vos tokens dans le catalogue
          </h2>
          <p style={{ color: 'var(--app-color-text-disabled)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            Vos {score} T4G vous donnent accès aux services de la communauté.
          </p>
          <div
            className="o-layout--grid--auto"
            style={{ '--grid-min-size': '200px', marginBottom: '1.5rem' } as React.CSSProperties}
          >
            {SPEND_CARDS.map((card) => (
              <div key={card.title} style={{ background: 'var(--app-color-surface, #fff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{card.emoji}</div>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.9rem' }}>{card.title}</p>
                <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: 'var(--app-color-text-disabled)' }}>{card.desc}</p>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary, #7c3aed)', background: '#ede9fe', borderRadius: '6px', padding: '2px 8px' }}>
                  {card.cost}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/services?tab=catalogue"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'var(--color-primary, #7c3aed)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              {Icons.gift} Voir le catalogue complet
            </Link>
            <Link
              href="/mentoring/offer/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '2px solid var(--color-primary, #7c3aed)',
                color: 'var(--color-primary, #7c3aed)',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              {Icons.sparkles} Proposer une session
            </Link>
          </div>
        </div>

      </ConnectedLayout>
    </>
  );
}

BenefitPage.auth = true;
BenefitPage.role = ['alumni', 'mentee', 'mentor', 'service_provider'];

export default BenefitPage;

export const getServerSideProps = () => ({ props: {} });
