import moment from 'moment';
import Image from 'next/image';
import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { useAppDispatch, useAppSelector, useIndexing } from '../hooks';
import ConnectedLayout from '../layouts/ConnectedLayout';
import {
  AuthPageType,
  LangType,
  NotificationType,
  PendingTransactionType,
  SessionType,
  ReceiveServiceType,
  UserMetricsType,
} from '../types';
import {
  BenefitCard,
  Button,
  CancellingTransactionModal,
  ConfirmingTransactionModal,
  CustomLink,
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
import useSwr from 'swr';
import { apiFetcher } from 'apps/dapp/services/config';

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

const Page: React.FC<IDashboard> & AuthPageType = ({ lang }: IDashboard) => {
  const pendingTransactions = useAppSelector(selectPendingTransactions);
  const { user } = useAuth();
  const [transactionToUpdate, setTransactionToUpdate] =
    useState<PendingTransactionType | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { data: metrics, isLoading: isLoadingMetrics } = useSwr<DashboardMetrics>(
    `/metrics`,
    apiFetcher
  );
  const { data: userMetrics, isLoading: isLoadingUserMetrics } = useSwr<UserMetricsType>(
    `/users/me/metrics`,
    apiFetcher
  );
  const { data: services, isLoading: isLoadingServices } = useSwr<ReceiveServiceType[]>(
    `/users/me/services`,
    apiFetcher
  );
  const { data: notifications, isLoading: isLoadingNotifications } = useSwr<NotificationType[]>(
    `/users/me/notifications`,
    apiFetcher
  );
  const { data: dashboardAccessCount } = useSwr<{ dashboardAccessCount: number }>(
    `/users/${user.id}/disable-first-access`,
    apiFetcher
  );
  const { data: userAbout, isLoading: isLoadingUserAbout } = useSwr<string>(
    `/users/me/about`,
    apiFetcher
  );

  const isLoading = isLoadingMetrics || isLoadingUserMetrics || isLoadingServices || isLoadingNotifications || isLoadingUserAbout;

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
    }
    setIsConfirming(false);
    setIsCancelling(false);
    setTransactionToUpdate(null);
  };

  const sortedNotifications = useMemo(() => {
    if (!notifications) return [];
    return [...notifications]
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, 3);
  }, [notifications]);

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
        <title>{lang.page.dashboard.head.title}</title>
        {useIndexing(false)}
      </Head>
      {isCancelling && transactionToUpdate && (
        <CancellingTransactionModal
          transaction={transactionToUpdate}
          handleModalClose={handleTransactionModalClose}
        />
      )}

      {user.role === 'STUDENT' && isConfirming && transactionToUpdate && (
        <ConfirmingTransactionModal
          transaction={transactionToUpdate}
          handleModalClose={handleTransactionModalClose}
          lang={lang}
        />
      )}
      {dashboardAccessCount?.dashboardAccessCount === 1 && (
        <FirstDashboardAccessModal userRole={user.role} lang={lang} />
      )}

      <ConnectedLayout user={user} lang={lang}>
        <h1 className="u-d--flex u-align-items-center u-gap--s u-margin-lg--none u-margin--auto heading-2">
          <span className="c-icon--title u-margin--none">{Icons.dashboard}</span>
          {lang.page.dashboard.title}
        </h1>
        {isLoading ? (
          <Spinner lang={lang} spinnerText={lang.utils.loading} size="lg" />
        ) : (
          <div className="o-dashboard">
            <section className="o-dahboard-content">
              {pendingTransactions?.length > 0 && (
                <>
                  <h2 className="subtitle-1">{lang.page.dashboard.pendingActions}</h2>
                  <div className="o-layout--grid--auto" style={{ '--grid-min-size': `350px` } as React.CSSProperties}>
                    {pendingTransactions.map((pendingTransaction) => (
                      <PendingTransactionCard
                        key={pendingTransaction.dealId}
                        pendingTransaction={pendingTransaction}
                        lang={lang}
                        userRole={user.role}
                        onClick={(type) => handleTransactionModalOpen(pendingTransaction, type)}
                      />
                    ))}
                  </div>
                </>
              )}

              {userAbout === '' && (
                <div className="o-card u-d--flex u-flex-column u-align-items-center u-gap--m">
                  <Image alt={lang.utils.tokenAlt} src="/assets/images/png/token.png" width={32} height={32} priority />
                  <p className="u-margin--none u-text--center">{lang.page.dashboard.completeProfile.text}</p>
                  <Button
                    className="u-width--fill"
                    variant="primary"
                    onClick={() => router.push(`/profile`)}
                    label={lang.page.dashboard.completeProfile.button}
                  />
                </div>
              )}

              {sortedNotifications.length > 0 && (
                <div className="o-card">
                  <div className="u-d--flex u-justify-content-between u-width--fill">
                    <h2 className="subtitle-1">{lang.page.dashboard.notifications.title}</h2>
                    <CustomLink href={'/notifications'} label={lang.utils.seeAll} iconName={'arrowRight'} external={false} className="c-link--icon" />
                  </div>
                  <ul role="list" className="c-notifications">
                    {sortedNotifications.map((notification) => (
                      <li key={notification.id}>
                        <span>{moment(notification.ts).fromNow()}</span>
                        <p>{notification.message}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="u-d--flex flex-wrap u-gap--s">
                <div className="o-card flex-1 u-d--flex u-flex-column">
                  <span className="c-icon--title--benefits u-margin--none u-d--flex">{Icons.gift}</span>
                  <p className="u-margin--none">{lang.page.dashboard.discoverBenefits.text}</p>
                  <Button
                    className="u-width--fill u-margin-t--auto"
                    variant="secondary"
                    theme="BENEFITS"
                    onClick={() => router.push(`/benefits`)}
                    label={lang.page.dashboard.discoverBenefits.button}
                  />
                </div>
                {user.role === 'ALUMNI' && (
                  <div className="o-card flex-1 u-d--flex u-flex-column">
                    <span className="c-icon--title--services u-margin--none u-d--flex">{Icons.sparkles}</span>
                    <p className="u-margin--none">{lang.page.dashboard.discoverServices.text}</p>
                    <Button
                      className="u-width--fill u-margin-t--auto"
                      variant="secondary"
                      theme="SERVICES"
                      onClick={() => router.push(`/services`)}
                      label={lang.page.dashboard.discoverServices.button}
                    />
                  </div>
                )}
              </div>

              {topServices.length > 0 && (
                <div>
                  <h2 className="subtitle-1">{lang.page.dashboard.topServices}</h2>
                  <section className="o-layout--grid--auto" style={{ '--grid-min-size': `300px` } as React.CSSProperties}>
                    {topServices.map((service) => (
                      <BenefitCard
                        key={service.id}
                        lang={lang}
                        categorieName={service.category.name}
                        parent={'benefits'}
                        service={service}
                        type={'BENEFITS'}
                        userRole={user.role}
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
Page.role = ['ALUMNI', 'STUDENT'];
