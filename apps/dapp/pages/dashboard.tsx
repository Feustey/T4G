import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { useAppDispatch, useAppSelector, useIndexing, useNotify } from '../hooks';
import ConnectedLayout from '../layouts/ConnectedLayout';
import {
  AuthPageType,
  LangType,
  NotificationType,
  PendingTransactionType,
  ReceiveServiceType,
  UserMetricsType,
} from '../types';
import {
  BenefitCard,
  Button,
  CancellingTransactionModal,
  ConfirmingTransactionModal,
  FirstDashboardAccessModal,
  Icons,
  Metrics,
  PendingTransactionCard,
  Spinner,
} from '../components';
import {
  selectPendingTransactions,
  setPendingTransactionsState,
} from '../store/slices';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useNetwork } from '../contexts/NetworkContext';
import useSwr from 'swr';
import { apiFetcher } from 'apps/dapp/services/config';
import {
  FALLBACK_METRICS,
  FALLBACK_USER_METRICS,
  FALLBACK_SERVICES,
  FALLBACK_NOTIFICATIONS,
  FALLBACK_USER_ABOUT,
  FALLBACK_DASHBOARD_ACCESS,
} from '../services/fallbackData';

interface DashboardMetrics {
  usersCount: {
    alumnis: number;
    students: number;
    total: number;
  };
  interactionsCount: number;
  tokensSupply: number;
  tokensExchanged: number;
  txsCount: number;
}

export interface IDashboard {
  lang: LangType;
}

const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  SERVICE_BOOKED_BY_STUDENT: { icon: '📅', color: 'var(--color-info, #2563eb)', label: 'Réservation' },
  SERVICE_DELIVERY_CONFIRMED_BY_STUDENT: { icon: '✅', color: 'var(--color-success, #16a34a)', label: 'Confirmé' },
  SERVICE_DELIVERY_CANCELED_BY_STUDENT: { icon: '❌', color: 'var(--color-error, #d32f2f)', label: 'Annulé' },
  WELCOME_BONUS: { icon: '🎉', color: 'var(--color-primary, #7c3aed)', label: 'Bienvenue' },
};

const getNotificationConfig = (type: string) =>
  NOTIFICATION_TYPE_CONFIG[type] ?? { icon: '🔔', color: 'var(--app-color-text-disabled)', label: '' };

const Page: React.FC<IDashboard> & AuthPageType = ({ lang }: IDashboard) => {
  const pendingTransactions = useAppSelector(selectPendingTransactions);
  const { user } = useAuth();
  const { isOnline, apiAvailable, checkAPI } = useNetwork();
  const [transactionToUpdate, setTransactionToUpdate] =
    useState<PendingTransactionType | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [dismissedProfilePrompt, setDismissedProfilePrompt] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const notify = useNotify();
  const router = useRouter();

  // Vérifier que l'utilisateur est connecté avant de faire les appels API
  const shouldFetch = typeof window !== 'undefined' && user && user.id;

  const { data: metrics = FALLBACK_METRICS, isLoading: isLoadingMetrics, error: metricsError } = useSwr<DashboardMetrics>(
    shouldFetch ? `/api/metrics` : null,
    apiFetcher,
    {
      fallbackData: FALLBACK_METRICS,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );
  const { data: userMetrics = FALLBACK_USER_METRICS, isLoading: isLoadingUserMetrics, error: userMetricsError } = useSwr<UserMetricsType>(
    shouldFetch ? `/api/users/me/metrics` : null,
    apiFetcher,
    {
      fallbackData: FALLBACK_USER_METRICS,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );
  const { data: services = FALLBACK_SERVICES, isLoading: isLoadingServices, error: servicesError } = useSwr<ReceiveServiceType[]>(
    shouldFetch ? `/api/users/me/services` : null,
    apiFetcher,
    {
      fallbackData: FALLBACK_SERVICES,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );
  const { data: notifications = FALLBACK_NOTIFICATIONS, isLoading: isLoadingNotifications, error: notificationsError } = useSwr<NotificationType[]>(
    shouldFetch ? `/api/users/me/notifications` : null,
    apiFetcher,
    {
      fallbackData: FALLBACK_NOTIFICATIONS,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );
  const { data: dashboardAccessCount = FALLBACK_DASHBOARD_ACCESS, error: dashboardAccessError } = useSwr<{ dashboardAccessCount: number }>(
    shouldFetch && user?.id ? `/api/users/${user.id}/disable-first-access` : null,
    apiFetcher,
    {
      fallbackData: FALLBACK_DASHBOARD_ACCESS,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );
  const { data: userAbout = FALLBACK_USER_ABOUT, isLoading: isLoadingUserAbout, error: userAboutError } = useSwr<string>(
    shouldFetch ? `/api/users/me/about` : null,
    apiFetcher,
    {
      fallbackData: FALLBACK_USER_ABOUT,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );

  // Afficher les erreurs dans la console et notifier l'utilisateur
  React.useEffect(() => {
    if (metricsError) console.error('🔴 Dashboard - Metrics error:', metricsError);
    if (userMetricsError) console.error('🔴 Dashboard - User metrics error:', userMetricsError);
    if (servicesError) console.error('🔴 Dashboard - Services error:', servicesError);
    if (notificationsError) console.error('🔴 Dashboard - Notifications error:', notificationsError);
    if (dashboardAccessError) console.error('🔴 Dashboard - Dashboard access error:', dashboardAccessError);
    if (userAboutError) console.error('🔴 Dashboard - User about error:', userAboutError);

    const hasAnyError = metricsError || userMetricsError || servicesError || notificationsError || userAboutError;
    if (hasAnyError) {
      notify.warning('Certaines données n\'ont pas pu être chargées. Affichage des dernières données disponibles.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metricsError, userMetricsError, servicesError, notificationsError, dashboardAccessError, userAboutError]);

  const isLoading = isLoadingMetrics || isLoadingUserMetrics || isLoadingServices || isLoadingNotifications || isLoadingUserAbout;
  
  // Vérifier s'il y a des erreurs réseau critiques
  const hasNetworkError = 
    !isOnline || 
    !apiAvailable ||
    (metricsError && (metricsError as any)?.isNetworkError) ||
    (userMetricsError && (userMetricsError as any)?.isNetworkError) ||
    (servicesError && (servicesError as any)?.isNetworkError) ||
    (notificationsError && (notificationsError as any)?.isNetworkError) ||
    (userAboutError && (userAboutError as any)?.isNetworkError);

  // Déterminer si on est en mode cache (données affichées mais API indispo)
  const isUsingCache = hasNetworkError && (
    metrics !== FALLBACK_METRICS || 
    userMetrics !== FALLBACK_USER_METRICS || 
    services?.length > 0 || 
    notifications?.length > 0
  );

  const handleTransactionModalOpen = (transaction: PendingTransactionType, type: 'CONFIRM' | 'CANCEL') => {
    setTransactionToUpdate(transaction);
    if (type === 'CONFIRM') {
      setIsConfirming(true);
    } else {
      setIsCancelling(true);
    }
  };

  const handleTransactionModalClose = (remove: boolean) => {
    if (remove && transactionToUpdate) {
      const updatedTransactions = pendingTransactions.filter(
        (tx) => tx.dealId !== transactionToUpdate.dealId
      );
      dispatch(setPendingTransactionsState(updatedTransactions));
      if (isConfirming) notify.success('Transaction confirmée avec succès.');
      if (isCancelling) notify.info('Transaction annulée.');
    }
    setIsConfirming(false);
    setIsCancelling(false);
    setTransactionToUpdate(null);
  };

  const sortedNotifications = useMemo(() => {
    if (!notifications) return [];
    return [...notifications]
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, 5);
  }, [notifications]);

  const totalNotificationsCount = notifications?.length ?? 0;

  const topServices = useMemo(() => {
    if (!services) return [];
    return [...services]
      .map(service => {
        const totalRating = service.rating.reduce((acc, curr) => acc + curr, 0);
        const averageRating = service.rating.length > 0 ? totalRating / service.rating.length : 0;
        return { ...service, averageRating };
      })
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 4);
  }, [services]);

  return (
    <>
      <Head>
        <title>{lang?.page?.dashboard?.head?.title ?? 'Tableau de bord'}</title>
        {useIndexing(false)}
      </Head>
      {isCancelling && transactionToUpdate && (
        <CancellingTransactionModal
          transaction={transactionToUpdate}
          handleModalClose={handleTransactionModalClose}
        />
      )}

      {user?.role === 'mentee' && isConfirming && transactionToUpdate && (
        <ConfirmingTransactionModal
          transaction={transactionToUpdate}
          handleModalClose={handleTransactionModalClose}
          lang={lang}
        />
      )}
      {dashboardAccessCount?.dashboardAccessCount === 1 && (
        <FirstDashboardAccessModal userRole={user?.role ?? 'mentee'} />
      )}

      <ConnectedLayout user={user} lang={lang}>
        <h1 className="u-d--flex u-align-items-center u-gap--s u-margin-lg--none u-margin--auto heading-2">
          <span className="c-icon--title u-margin--none">{Icons.dashboard}</span>
          {lang?.page?.dashboard?.title ?? 'Tableau de bord'}
        </h1>
        
        {/* Banner d'avertissement en mode offline/cache */}
        {hasNetworkError && (
          <div 
            className="o-card u-d--flex u-flex-column u-align-items-center u-gap--m" 
            style={{ 
              backgroundColor: isUsingCache ? 'var(--color-warning-light, #fff3cd)' : 'var(--color-error-light, #ffebee)',
              borderLeft: isUsingCache ? '4px solid var(--color-warning, #ff9800)' : '4px solid var(--color-error, #d32f2f)'
            }}
          >
            <p className="u-margin--none u-text--center" style={{ fontWeight: 600 }}>
              {isUsingCache 
                ? '⚠️ Mode hors ligne : affichage des dernières données disponibles'
                : '🔴 Impossible de se connecter au serveur'
              }
            </p>
            {!isOnline && (
              <p className="u-margin--none u-text--center" style={{ fontSize: '0.875rem' }}>
                Votre appareil semble hors ligne. Vérifiez votre connexion Internet.
              </p>
            )}
            {isOnline && !apiAvailable && (
              <p className="u-margin--none u-text--center" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)' }}>
                Le serveur backend ({process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}) est inaccessible.
              </p>
            )}
            <div className="u-d--flex u-gap--s u-width--fill">
              <Button
                className="flex-1"
                variant={isUsingCache ? "secondary" : "primary"}
                onClick={() => checkAPI().then(() => window.location.reload())}
                label="Réessayer"
              />
              {!isUsingCache && (
                <Button
                  className="flex-1"
                  variant="ghost"
                  onClick={() => window.location.reload()}
                  label="Actualiser"
                />
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <Spinner lang={lang} spinnerText={lang?.utils?.loading ?? 'Chargement...'} size="lg" />
        ) : (
          <div className="o-dashboard">
            <section className="o-dahboard-content">
              {pendingTransactions?.length > 0 && (
                <>
                  <h2 className="subtitle-1">{lang?.page?.dashboard?.pendingActions ?? 'Actions en attente'}</h2>
                  <div className="o-layout--grid--auto" style={{ '--grid-min-size': `350px` } as React.CSSProperties}>
                    {pendingTransactions.map((pendingTransaction) => (
                      <PendingTransactionCard
                        key={pendingTransaction.dealId}
                        pendingTransaction={pendingTransaction}
                        lang={lang}
                        userRole={user?.role ?? 'mentee'}
                        onClick={(type) => handleTransactionModalOpen(pendingTransaction, type)}
                      />
                    ))}
                  </div>
                </>
              )}

              {userAbout === '' && !dismissedProfilePrompt && (
                <div
                  className="o-card u-d--flex u-flex-column u-gap--m"
                  style={{
                    borderLeft: '4px solid var(--color-primary, #2563eb)',
                    background: 'var(--color-primary-light, #eff6ff)',
                  }}
                >
                  <div className="u-d--flex u-align-items-center u-gap--s">
                    <Image alt={lang?.utils?.tokenAlt ?? 'Token'} src="/assets/images/png/token.png" width={28} height={28} priority />
                    <p className="u-margin--none" style={{ fontWeight: 600 }}>
                      {lang?.page?.dashboard?.completeProfile?.text ?? 'Complétez votre profil'}
                    </p>
                  </div>
                  <p className="u-margin--none" style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
                    Ajoutez une description pour aider la communauté à vous connaître et gagner en visibilité.
                  </p>
                  <div className="u-d--flex u-gap--s">
                    <Button
                      variant="primary"
                      onClick={() => router.push(`/profile`)}
                      label={lang?.page?.dashboard?.completeProfile?.button ?? 'Compléter'}
                    />
                    <Button
                      variant="ghost"
                      onClick={() => setDismissedProfilePrompt(true)}
                      label="Plus tard"
                    />
                  </div>
                </div>
              )}

              {sortedNotifications.length > 0 && (
                <Link href="/notifications" passHref>
                  <a className="c-metrics__section-link">
                    <div className="u-d--flex u-justify-content-between u-align-items-center u-width--fill">
                      <div className="u-d--flex u-align-items-center u-gap--s">
                        <h2 className="subtitle-1">{lang?.page?.dashboard?.notifications?.title ?? 'Notifications'}</h2>
                        {totalNotificationsCount > 5 && (
                          <span className="c-metrics__metric__number" style={{
                            fontSize: '18px',
                            lineHeight: 1,
                            color: 'var(--app-token-color)',
                          }}>
                            {totalNotificationsCount}
                          </span>
                        )}
                      </div>
                      <span className="c-link--icon" style={{ fontSize: '13px', color: 'var(--app-comunity-color)' }}>
                        {(lang?.utils as { seeAll?: string })?.seeAll ?? 'Voir tout'} →
                      </span>
                    </div>
                    <ul role="list" className="c-notifications" style={{ width: '100%' }}>
                      {sortedNotifications.map((notification) => {
                        const config = getNotificationConfig(notification.type);
                        return (
                          <li key={notification.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            {notification.amount > 0 && (
                              <div className="c-metrics__metric--token" style={{ minWidth: '56px' }}>
                                <p className="c-metrics__metric__number" style={{ fontSize: '24px', lineHeight: '28px' }}>
                                  +{notification.amount}
                                </p>
                                <p style={{ fontSize: '11px', margin: 0 }}>T4G</p>
                              </div>
                            )}
                            <div style={{ flex: 1 }}>
                              <div className="u-d--flex u-align-items-center u-gap--s" style={{ marginBottom: '2px' }}>
                                <span style={{ fontSize: '15px', lineHeight: 1 }} aria-hidden="true">{config.icon}</span>
                                <span style={{ color: 'var(--app-color-text-disabled)', fontSize: '12px' }}>
                                  {moment(notification.ts).fromNow()}
                                </span>
                                {config.label && (
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: config.color,
                                    backgroundColor: `${config.color}1a`,
                                    borderRadius: '4px',
                                    padding: '1px 6px',
                                  }}>
                                    {config.label}
                                  </span>
                                )}
                              </div>
                              <p style={{ margin: 0, fontSize: '14px' }}>{notification.message}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </a>
                </Link>
              )}

              <div className="u-d--flex flex-wrap u-gap--s">
                <div className="o-card flex-1 u-d--flex u-flex-column">
                  <span className="c-icon--title--benefits u-margin--none u-d--flex">{Icons.gift}</span>
                  <p className="u-margin--none">{lang?.page?.dashboard?.discoverBenefits?.text ?? 'Découvrez les avantages'}</p>
                  <Button
                    className="u-width--fill u-margin-t--auto"
                    variant="secondary"
                    theme="BENEFITS"
                    onClick={() => router.push(`/benefits`)}
                    label={lang?.page?.dashboard?.discoverBenefits?.button ?? 'Découvrir'}
                  />
                </div>
                {(user?.role === 'alumni' || user?.role === 'mentor') && (
                  <div className="o-card flex-1 u-d--flex u-flex-column">
                    <span className="c-icon--title--services u-margin--none u-d--flex">{Icons.sparkles}</span>
                    <p className="u-margin--none">{lang?.page?.dashboard?.discoverServices?.text ?? 'Découvrez les services'}</p>
                    <Button
                      className="u-width--fill u-margin-t--auto"
                      variant="secondary"
                      theme="SERVICES"
                      onClick={() => router.push(`/services`)}
                      label={lang?.page?.dashboard?.discoverServices?.button ?? 'Découvrir'}
                    />
                  </div>
                )}
                {/* Bloc mentor : proposer une session */}
                {user?.is_mentor_active && (
                  <div className="o-card flex-1 u-d--flex u-flex-column">
                    <span className="c-icon--title--services u-margin--none u-d--flex">{Icons.sparkles}</span>
                    <p className="u-margin--none">Partage ton expertise en proposant une session de mentoring.</p>
                    {user?.mentor_topics && user.mentor_topics.length > 0 ? (
                      <Button
                        className="u-width--fill u-margin-t--auto"
                        variant="primary"
                        onClick={() => router.push('/mentoring/offer/new')}
                        label="Proposer une session"
                      />
                    ) : (
                      <Button
                        className="u-width--fill u-margin-t--auto"
                        variant="secondary"
                        onClick={() => router.push('/profile#mentor')}
                        label="Configurer mon profil mentor"
                      />
                    )}
                  </div>
                )}
                {/* Bloc mentee : trouver un mentor */}
                {(user?.role === 'mentee' || (user?.learning_topics && user.learning_topics.length > 0)) && (
                  <div className="o-card flex-1 u-d--flex u-flex-column">
                    <span className="c-icon--title--benefits u-margin--none u-d--flex">{Icons.gift}</span>
                    <p className="u-margin--none">Trouve un mentor pour progresser sur un thème qui t&apos;intéresse.</p>
                    <Button
                      className="u-width--fill u-margin-t--auto"
                      variant="primary"
                      theme="BENEFITS"
                      onClick={() => router.push('/mentoring/find')}
                      label="Trouver un mentor"
                    />
                  </div>
                )}
              </div>

              <Link href="/community" passHref>
                <a className="c-metrics__section-link">
                  <h2 className="subtitle-1">My Community</h2>
                  <div
                    className="o-layout--grid--auto u-width--fill"
                    style={{ '--grid-min-size': '120px', '--grid-gap': '32px' } as React.CSSProperties}
                  >
                    <div className="c-metrics__metric--community">
                      <p className="c-metrics__metric__number">
                        {(metrics?.usersCount?.alumnis ?? 0) + (metrics?.usersCount?.students ?? 0)}
                      </p>
                      <p>Members</p>
                    </div>
                    <div className="c-metrics__metric--community">
                      <p className="c-metrics__metric__number">
                        {metrics?.interactionsCount ?? 0}
                      </p>
                      <p>Transactions</p>
                    </div>
                    <div className="c-metrics__metric--community">
                      <p className="c-metrics__metric__number">
                        {metrics?.tokensExchanged ?? 0}
                      </p>
                      <p>Tokens échangés</p>
                    </div>
                  </div>
                </a>
              </Link>

              {topServices.length > 0 && (
                <div>
                  <h2 className="subtitle-1">{lang?.page?.dashboard?.topServices ?? 'Top services'}</h2>
                  <section className="o-layout--grid--auto" style={{ '--grid-min-size': `300px` } as React.CSSProperties}>
                    {topServices.map((service) => (
                      <BenefitCard
                        key={service.id}
                        lang={lang}
                        categorieName={service.category.name}
                        parent={'benefits'}
                        service={service}
                        type={'BENEFITS'}
                        userRole={user?.role ?? 'mentee'}
                        isLink={true}
                      />
                    ))}
                  </section>
                </div>
              )}
            </section>
            <Metrics lang={lang} globalMetrics={metrics} userMetrics={userMetrics} boolComm={true} />
          </div>
        )}
      </ConnectedLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['alumni', 'mentee', 'mentor', 'service_provider'];

export const getServerSideProps = () => ({ props: {} });
