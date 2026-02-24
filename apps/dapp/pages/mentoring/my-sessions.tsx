import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSwr from 'swr';
import ConnectedLayout from '../../layouts/ConnectedLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useIndexing } from '../../hooks';
import { Breadcrumb, Button, Spinner } from '../../components';
import { AuthPageType, LangType } from '../../types';
import { apiClient, MentoringOffer, MentoringBooking } from '../../services/apiClient';

interface IPage {
  lang: LangType;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:               { label: 'Ouverte',          color: '#166534', bg: '#dcfce7' },
  booked:             { label: 'Réservée',          color: '#1d4ed8', bg: '#dbeafe' },
  completed:          { label: 'Complétée',         color: '#6b21a8', bg: '#f3e8ff' },
  auto_completed:     { label: 'Auto-complétée',    color: '#6b21a8', bg: '#f3e8ff' },
  cancelled:          { label: 'Annulée',           color: '#991b1b', bg: '#fee2e2' },
  pending:            { label: 'En attente',        color: '#92400e', bg: '#fef3c7' },
  confirmed:          { label: 'Confirmée',         color: '#166534', bg: '#dcfce7' },
  pending_completion: { label: 'À confirmer',       color: '#c2410c', bg: '#ffedd5' },
  disputed:           { label: 'Litige',            color: '#991b1b', bg: '#fee2e2' },
};

const FORMAT_LABELS: Record<string, string> = { video: '📹 Visio', text: '💬 Chat', async: '📼 Asynchrone' };
const LEVEL_LABELS: Record<string, string>  = { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

type ActiveTab = 'mentor' | 'mentee';

const Page: React.FC<IPage> & AuthPageType = ({ lang }: IPage) => {
  const { user } = useAuth();
  const router = useRouter();

  const defaultTab: ActiveTab =
    (router.query.role as ActiveTab) === 'mentor' ? 'mentor' : 'mentee';
  const [tab, setTab] = useState<ActiveTab>(defaultTab);

  // Offres du mentor
  const { data: myOffers = [], isLoading: isLoadingOffers } = useSwr<MentoringOffer[]>(
    user?.is_mentor_active ? '/api/users/me/mentoring-offers' : null,
    () => apiClient.getMyMentoringOffers(),
    { revalidateOnFocus: false }
  );

  // Réservations du mentee
  const { data: myBookings = [], isLoading: isLoadingBookings } = useSwr<MentoringBooking[]>(
    '/api/users/me/mentoring-bookings',
    () => apiClient.getMyMentoringBookings(),
    { revalidateOnFocus: false }
  );

  const isLoading = isLoadingOffers || isLoadingBookings;

  const showMentorTab  = user?.is_mentor_active === true;
  const showMenteeTab  = user?.role === 'mentee' || (user?.learning_topics?.length ?? 0) > 0;

  const activeOffers    = myOffers.filter((o) => o.status === 'open');
  const bookedOffers    = myOffers.filter((o) => o.status === 'booked');
  const pastOffers      = myOffers.filter((o) => ['completed', 'cancelled', 'auto_completed'].includes(o.status));
  const upcomingBookings = myBookings.filter((b) => ['pending', 'confirmed'].includes(b.status));
  const pendingConfirm  = myBookings.filter((b) => b.status === 'pending_completion');
  const pastBookings    = myBookings.filter((b) => ['completed', 'auto_completed', 'cancelled', 'disputed'].includes(b.status));

  const justCreated = router.query.created === '1';

  return (
    <>
      <Head>
        <title>Mes sessions — Token4Good</title>
        {useIndexing(false)}
      </Head>

      <ConnectedLayout user={user} lang={lang}>
        <Breadcrumb
          links={[
            { text: 'Dashboard', link: '/dashboard', parent: true },
            { text: 'Mentoring', link: '/mentoring', parent: true },
            { text: 'Mes sessions' },
          ]}
        />

        <div className="u-d--flex u-justify-content-between u-align-items-center flex-wrap u-gap--s">
          <h1 className="heading-2" style={{ margin: 0 }}>Mes sessions</h1>
          {showMentorTab && (
            <Button variant="primary" label="+ Proposer une session" onClick={() => router.push('/mentoring/offer/new')} />
          )}
        </div>

        {/* Confirmation de création */}
        {justCreated && (
          <div className="o-card" style={{ borderLeft: '4px solid var(--color-success, #16a34a)', background: '#f0fdf4', padding: '0.75rem 1rem' }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#166534' }}>
              ✅ Ta session a été publiée ! Les membres dont les thèmes correspondent seront notifiés.
            </p>
          </div>
        )}

        {/* Onglets mentor / mentee */}
        {showMentorTab && showMenteeTab && (
          <div className="u-d--flex u-gap--s" style={{ borderBottom: '2px solid var(--color-border, #e2e8f0)', marginBottom: '1rem' }}>
            {(['mentor', 'mentee'] as ActiveTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '8px 16px', background: 'none', cursor: 'pointer', fontWeight: tab === t ? 700 : 400,
                  border: 'none', borderBottom: tab === t ? '3px solid var(--color-primary, #2563eb)' : '3px solid transparent',
                  color: tab === t ? 'var(--color-primary, #2563eb)' : 'inherit', marginBottom: -2, transition: 'all 0.15s',
                }}
              >
                {t === 'mentor' ? '✦ En tant que mentor' : '🎓 En tant que mentee'}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <Spinner lang={lang} spinnerText="Chargement de tes sessions…" size="lg" />
        ) : (
          <>
            {/* ── VUE MENTOR ── */}
            {(tab === 'mentor' || !showMenteeTab) && showMentorTab && (
              <div className="u-d--flex u-flex-column u-gap--m">

                {/* Réservées */}
                {bookedOffers.length > 0 && (
                  <Section title={`Sessions réservées (${bookedOffers.length})`} accent="#1d4ed8">
                    {bookedOffers.map((o) => <OfferCard key={o.id} offer={o} />)}
                  </Section>
                )}

                {/* À confirmer */}
                {myOffers.filter((o) => o.status === 'booked').length > 0 && (
                  <Section title="En attente de ta confirmation" accent="#c2410c">
                    {myOffers.filter((o) => o.status === 'booked').map((o) => (
                      <OfferCard key={o.id} offer={o} showConfirmCta onConfirm={() => router.push(`/mentoring/session/${o.id}`)} />
                    ))}
                  </Section>
                )}

                {/* Ouvertes */}
                {activeOffers.length > 0 && (
                  <Section title={`Offres publiées (${activeOffers.length})`} accent="#166534">
                    {activeOffers.map((o) => <OfferCard key={o.id} offer={o} />)}
                  </Section>
                )}

                {/* Passées */}
                {pastOffers.length > 0 && (
                  <Section title="Sessions passées" collapsed>
                    {pastOffers.map((o) => <OfferCard key={o.id} offer={o} />)}
                  </Section>
                )}

                {myOffers.length === 0 && (
                  <EmptyState
                    icon="✦"
                    title="Aucune session proposée"
                    desc="Publie ta première session de mentoring pour être visible par la communauté."
                    cta="Proposer une session"
                    onCta={() => router.push('/mentoring/offer/new')}
                  />
                )}
              </div>
            )}

            {/* ── VUE MENTEE ── */}
            {(tab === 'mentee' || !showMentorTab) && showMenteeTab && (
              <div className="u-d--flex u-flex-column u-gap--m">

                {/* À confirmer (pending_completion) */}
                {pendingConfirm.length > 0 && (
                  <Section title={`À confirmer (${pendingConfirm.length})`} accent="#c2410c">
                    {pendingConfirm.map((b) => (
                      <BookingCard
                        key={b.id} booking={b}
                        cta="Confirmer la complétion"
                        onCta={() => router.push(`/mentoring/session/${b.id}`)}
                      />
                    ))}
                  </Section>
                )}

                {/* À venir */}
                {upcomingBookings.length > 0 && (
                  <Section title={`Sessions planifiées (${upcomingBookings.length})`} accent="#1d4ed8">
                    {upcomingBookings.map((b) => <BookingCard key={b.id} booking={b} />)}
                  </Section>
                )}

                {/* Passées */}
                {pastBookings.length > 0 && (
                  <Section title="Sessions passées" collapsed>
                    {pastBookings.map((b) => <BookingCard key={b.id} booking={b} />)}
                  </Section>
                )}

                {myBookings.length === 0 && (
                  <EmptyState
                    icon="🎓"
                    title="Aucune session réservée"
                    desc="Explore les mentors disponibles et réserve ta première session."
                    cta="Trouver un mentor"
                    onCta={() => router.push('/mentoring/find')}
                  />
                )}
              </div>
            )}
          </>
        )}
      </ConnectedLayout>
    </>
  );
};

// ── Composants internes ──

const Section = ({
  title, accent, children, collapsed = false,
}: { title: string; accent?: string; children: React.ReactNode; collapsed?: boolean }) => {
  const [open, setOpen] = useState(!collapsed);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: 0 }}
      >
        <span style={{ width: 4, height: 18, borderRadius: 2, background: accent ?? 'var(--color-primary, #2563eb)', display: 'inline-block' }} />
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</span>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="u-d--flex u-flex-column u-gap--s">
          {children}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#666', bg: '#f1f5f9' };
  return (
    <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: '999px', fontWeight: 600, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
};

const OfferCard = ({
  offer, showConfirmCta, onConfirm,
}: { offer: MentoringOffer; showConfirmCta?: boolean; onConfirm?: () => void }) => (
  <div className="o-card u-d--flex u-flex-column u-gap--s">
    <div className="u-d--flex u-justify-content-between u-align-items-center flex-wrap u-gap--xs">
      <p style={{ margin: 0, fontWeight: 600 }}>{offer.topic_slug}</p>
      <StatusBadge status={offer.status} />
    </div>
    <div className="u-d--flex flex-wrap u-gap--xs" style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
      <span>{LEVEL_LABELS[offer.target_level] ?? offer.target_level}</span>
      <span>·</span>
      <span>{FORMAT_LABELS[offer.format] ?? offer.format}</span>
      <span>·</span>
      <span>{offer.duration_minutes} min</span>
      <span>·</span>
      <span style={{ color: 'var(--app-token-color, #f59e0b)', fontWeight: 600 }}>{offer.token_cost} T4G</span>
    </div>
    {showConfirmCta && onConfirm && (
      <Button variant="primary" label="Voir la réservation" onClick={onConfirm} />
    )}
  </div>
);

const BookingCard = ({
  booking, cta, onCta,
}: { booking: MentoringBooking; cta?: string; onCta?: () => void }) => (
  <div className="o-card u-d--flex u-flex-column u-gap--s">
    <div className="u-d--flex u-justify-content-between u-align-items-center flex-wrap u-gap--xs">
      <p style={{ margin: 0, fontWeight: 600 }}>{formatDate(booking.scheduled_at)}</p>
      <StatusBadge status={booking.status} />
    </div>
    <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
      Séquestre : <strong>{booking.tokens_escrowed} T4G</strong>
      {booking.mentee_rating != null && ` · Note donnée : ★${booking.mentee_rating}`}
    </p>
    {cta && onCta && (
      <Button variant="primary" label={cta} onClick={onCta} />
    )}
  </div>
);

const EmptyState = ({ icon, title, desc, cta, onCta }: { icon: string; title: string; desc: string; cta: string; onCta: () => void }) => (
  <div className="o-card u-d--flex u-flex-column u-align-items-center u-gap--m" style={{ padding: '2.5rem', textAlign: 'center' }}>
    <span style={{ fontSize: 48 }}>{icon}</span>
    <p style={{ fontWeight: 600, margin: 0 }}>{title}</p>
    <p style={{ color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>{desc}</p>
    <Button variant="primary" label={cta} onClick={onCta} />
  </div>
);

export default Page;

Page.auth = true;
Page.role = ['alumni', 'mentee', 'mentor', 'service_provider'];
