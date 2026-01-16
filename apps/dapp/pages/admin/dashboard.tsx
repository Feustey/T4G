import React from 'react';
import { AppLayout } from '../../components/elements';
import { DividerElement } from '../../components/elements';
import { Components } from '@t4g/types';
import useSwr from 'swr';
import moment from 'moment';
import Link from 'next/link';
import { TableSkeleton } from '../../components';

import Head from 'next/head';
import { useAppDispatch, useIndexing } from '../../hooks';
import AdminLayout from '../../layouts/AdminLayout';
import { AuthPageType, SessionType } from 'apps/dapp/types';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, AdminWalletInfo } from '../../services/apiClient';

const Page: React.FC<Components.Wallet.Page.Props> & AuthPageType = ({
  lang,
}: Components.Wallet.Page.Props) => {
  const { user } = useAuth();
  
  // Utiliser apiClient via SWR pour auto-refresh
  const {
    data,
    mutate,
    error,
    isLoading,
  } = useSwr<AdminWalletInfo[]>(
    'admin-wallets',
    () => apiClient.getAdminWallets({ limit: 100 }),
    { refreshInterval: 30000 } // Refresh toutes les 30s
  );

  // Helper pour formater les satoshis Lightning
  const formatLightningBalance = (msat: number): string => {
    const sats = Math.floor(msat / 1000);
    if (sats === 0) return '0 sats';
    if (sats < 1000) return `${sats} sats`;
    if (sats < 1000000) return `${(sats / 1000).toFixed(2)}k sats`;
    return `${(sats / 1000000).toFixed(2)}M sats`;
  };

  return (
    <>
      <Head>
        <title>{lang.page.admin.dashboard.head.title}</title>
        {useIndexing(false)}
      </Head>
      <AdminLayout lang={lang}>
        <AppLayout user={user}>
          <div className="Services Page flex flex-col items-center">
            <h1 className="text-h1 text-blue-005 w-1/2 font-medium text-center">
              Dashboard
            </h1>
          </div>

          <div className="Services Page flex flex-col items-center">
            <h4 className="text-h4 text-blue-004 w-3/5 mt-6 text-center"></h4>
          </div>

          <div className="Dashboard Page grid grid-cols-12 gap-6">
            <div className="Dashboard__main lg:col-span-8 col-span-12">
              <div className="Dashboard__Notifications">
                <div className="Dashboard__Notifications__title flex justify-between mt-12 mb-4">
                  <div>
                    <ul
                      className="  text-blue-005 p-5 overflow-x-auto bg-white"
                      role="list"
                    >
                      <li className="">
                        <div className="Row flex items-center justify-between font-medium">
                          <div className="min-w-[350px]">User</div>
                          <div className="min-w-[150px]">Lightning Address</div>
                          <div className="min-w-[120px]">Balance</div>
                          <div className="min-w-[120px]">Total Received</div>
                          <div className="min-w-[120px]">Transactions</div>
                        </div>
                        <DividerElement spacing="pt-10" bleeding />
                      </li>
                      {error && <p className="text-red-500 p-4">Erreur de chargement: {error.message}</p>}
                      {isLoading || !data ? (
                        <TableSkeleton totalCol={5} totalRows={5} />
                      ) : data.length === 0 ? (
                        <li className="text-center p-4 text-blue-003">
                          Aucun utilisateur trouvé
                        </li>
                      ) : (
                        data.map((walletInfo, i) => (
                          <li key={walletInfo.user_id + i} className="text-base">
                            <div className="Row flex items-center justify-between">
                              <div className="min-w-[350px]">
                                <div className="font-medium">{walletInfo.username}</div>
                                <p className="text-blue-003 text-xs">{walletInfo.email}</p>
                                <p className="text-blue-002 text-xs">
                                  ID: {walletInfo.user_id}
                                </p>
                              </div>
                              <div className="min-w-[150px]">
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                  {walletInfo.lightning_address || 'N/A'}
                                </span>
                              </div>
                              <div className="min-w-[120px]">
                                <span className={walletInfo.balance_msat > 0 ? 'font-bold text-green-600' : 'text-gray-500'}>
                                  ⚡ {formatLightningBalance(walletInfo.balance_msat)}
                                </span>
                              </div>
                              <div className="min-w-[120px]">
                                <span className="text-blue-004">
                                  {formatLightningBalance(walletInfo.total_received_msat)}
                                </span>
                              </div>
                              <div className="min-w-[120px]">
                                <span className="text-blue-003">
                                  {walletInfo.num_transactions} tx
                                </span>
                                {walletInfo.last_transaction_at && (
                                  <p className="text-xs text-gray-500">
                                    {moment(walletInfo.last_transaction_at).format('DD/MM/YY HH:mm')}
                                  </p>
                                )}
                              </div>
                            </div>
                            {i !== data.length - 1 && (
                              <DividerElement spacing="pt-10" bleeding />
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AppLayout>
      </AdminLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['SERVICE_PROVIDER'];
