import React, { useState } from 'react';
import { AppLayout } from '../../components/elements';
import { LinkElement } from '../../components/elements';
import { Wallet, TransactionList } from '../../components/ui';
import { GetServerSideProps } from 'next';
import { Components } from '@t4g/types';
import useSwr from 'swr';
import Head from 'next/head';
import { useIndexing } from '../../hooks';
import AdminLayout from '../../layouts/AdminLayout';
import { AuthPageType } from 'apps/dapp/types';
import { apiFetcher } from 'apps/dapp/services/config';

interface AdminWalletResponse {
  transactions: unknown[];
  userStat: {
    servicesProvided: number;
    tokensEarned: number;
    benefitsEnjoyed: number;
    tokensUsed: number;
  };
  txCount: number;
}

const Page: React.FC<Components.Wallet.Page.Props> & AuthPageType = ({
  user,
  lang,
}: Components.Wallet.Page.Props) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userStat, setUserStat] = useState({
    servicesProvided: 0,
    tokensEarned: 0,
    benefitsEnjoyed: 0,
    tokensUsed: 0,
  });
  const [txCount, setTxCount] = useState<number>();
  const { data, error } = useSwr<AdminWalletResponse>(
    `/users/${user.id}/admin-wallet`,
    apiFetcher,
    {
      refreshInterval: 5000,
    }
  );

  React.useEffect(() => {
    if (data) {
      setTransactions(data.transactions ?? []);
      setUserStat(data.userStat);
      setTxCount(data.txCount);
      setIsLoading(false);
    }
  }, [data]);

  return (
    <>
      <Head>
        <title>{lang.page.admin.wallet.head.title}</title>
        {useIndexing(false)}
      </Head>
      <AdminLayout lang={lang}>
        <AppLayout user={user}>
          <div className="Services Page flex flex-col items-center">
            <h1>Your wallet</h1>
            <h4 className="text-h4 text-blue-004 w-3/5 mt-6 text-center">
              Your wallet shows an overview of all your activity and token
              movements, and allows you to track these transactions on the
              blockchain.
            </h4>
          </div>

          <div className="Dashboard Page grid grid-cols-12 gap-6">
            <main className="Dashboard__main lg:col-span-8 col-span-12">
              <div className="Dashboard__Notifications">
                <div className="Dashboard__Notifications__title flex justify-between mt-12 mb-4">
                  <h3 className="text-h3 text-blue-005 font-medium">
                    Transactions
                  </h3>
                </div>
                {error ? (
                  <p>Erreur</p>
                ) : (
                  <TransactionList
                    isLoading={isLoading}
                    transactions={transactions}
                  />
                )}
              </div>
            </main>

            <aside className="Dashboard__sidebar lg:col-span-4 col-span-12">
              <div className="Dashboard__Wallet">
                <div className="Dashboard__Wallet__title flex justify-between mt-6">
                  <h3 className="text-blue-005 text-h3 font-medium">
                    Your wallet
                  </h3>
                  <LinkElement href={'#'}>View wallet</LinkElement>
                </div>

                <div className="Dashboard__Wallet__widget relative -mt-5">
                  <Wallet
                    balance={user.wallet.balance}
                    address={user.wallet.address}
                    userRole={user.role}
                    variant="wallet"
                  />
                </div>
              </div>

              <div className="Dashboard__Impact mt-12">
                <div className="Dashboard__Impact__title flex items-center justify-between mb-4">
                  <h3 className="text-blue-005 text-h3 font-medium">
                    Your impact
                  </h3>
                  <LinkElement href={'#'}>View activity</LinkElement>
                </div>
                {/*<BadgeCardItem />*/}
                {/*<div className="Dashboard__Impact__metrics mt-5">*/}
                {/*  <DashboardMetrics metrics={metrics} set="impact" />*/}
                {/*</div>*/}
              </div>
            </aside>
          </div>
        </AppLayout>
      </AdminLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['SERVICE_PROVIDER'];

export const getServerSideProps: GetServerSideProps = async function (context) {
  const { props } = await getPageProps(context);

  return {
    props: {
      user: {
        ...(props.user ?? {}),
      },
    },
  };
};
