import React from 'react';
import { TransactionList } from '@t4g/ui/components';
import { Components } from '@t4g/types';
import useSwr from 'swr';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useIndexing } from '../hooks';
import ConnectedLayout from '../layouts/ConnectedLayout';
import { AuthPageType, SessionType, UserMetricsType, LangType, NotificationType } from '../types';
import { Breadcrumb, Icons, Metrics, Spinner } from '../components';
import { apiFetcher } from 'apps/dapp/services/config';

interface WalletResponse {
  address: string;
  balance: number;
}

export interface Iwallet {
  lang: LangType;
}

const Page: React.FC<Iwallet> & AuthPageType = ({
  lang,
}: Iwallet) => {
  const session = useSession().data as SessionType;
  const user = session.user;

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
  } = useSwr<NotificationType[]>(`/users/me/notifications`, apiFetcher); //TODO error
  const {
    data: wallet,
    isLoading: isWalletLoading,
  } = useSwr<WalletResponse>(`/users/me/wallet`, apiFetcher); //TODO error

  const { data: userMetrics } = useSwr<UserMetricsType>(
    `/users/me/metrics`,
    apiFetcher
  );


  return (
    <>
      <Head>
        <title>{lang.page.wallet.head.title}</title>
        {useIndexing(false)}
      </Head>
      <ConnectedLayout user={user} lang={lang}>
        <Breadcrumb
          links={[
            {
              text: lang.components.breadcrumb.dashboard.label,
              link: '/dashboard',
              parent: true,
            },
            { text: lang.components.breadcrumb.wallet.label },
          ]}
        />
        <div className="o-dashboard">
          <section className="o-dahboard-content">
            <div className="u-d--flex u-flex-column u-r-gap--md u-width--fill">
              <h1 className="u-d--flex u-align-items-center u-gap--s u-margin-lg--none u-margin--auto heading-2">
                <span className="c-icon--title u-margin--none">
                  {Icons.token}
                </span>
                Wallet
              </h1>
              <p className="u-text--bold">
                Your wallet shows an overview of all your activity and token
                movements, and allows you to track these transactions on the
                blockchain.
              </p>
            </div>
            
            {transactions && userMetrics ? (
            <div className="o-card">
              <div className="u-d--flex u-justify-content-between u-width--fill">
                <h2 className="subtitle-1">My transactions</h2>
              </div>
              {(() => {
                const normalizedTransactions = (transactions ?? []) as unknown as Components.Wallet.TransactionList.Props['transactions'];
                return (
                <TransactionList
                  isLoading={isTransactionsLoading}
                  transactions={normalizedTransactions.sort(function (a, b) {
                    return (
                      new Date(b.ts).getTime() - new Date(a.ts).getTime()
                    );
                  })}
                />
                );
              })()}
            </div>
            ) : (
              <>
                <Spinner lang={lang} spinnerText={'Loading...'} size="lg" />
              </>
            )}
          </section>
          {!isWalletLoading && wallet && userMetrics && transactions && (
          <Metrics lang={lang} globalMetrics={null} userMetrics={userMetrics} boolComm={false} address={wallet.address}/>
          )}
        </div>
      </ConnectedLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['ALUMNI', 'STUDENT', 'SERVICE_PROVIDER'];
