import { Components } from '@t4g/types';
import { BlockchainReceipt } from '@t4g/ui/components';
import { AppLayout } from '@t4g/ui/layouts';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import useSwr from 'swr';
import { useAppSelector, useIndexing } from '../../hooks';
import AdminLayout from '../../layouts/AdminLayout';
import { AuthPageType, SessionType } from 'apps/dapp/types';
import { useSession } from 'next-auth/react';
import { TableSkeleton } from 'apps/dapp/components';
import { HiddenIconElement } from '@t4g/ui/icons';
import { ButtonElement } from '@t4g/ui/elements';
import { UpdateDeliveryStatus } from 'libs/ui/components/src/lib/Admin/UpdateDeliveryStatus';
import { useAppContext } from '@t4g/ui/providers';
import { selectPendingTransactions } from 'apps/dapp/store/slices';
import { apiFetcher } from 'apps/dapp/services/config';

const Page: React.FC<Components.Admin.ServiceDeliveryPage.Props> &
  AuthPageType = ({ lang }: Components.Admin.ServiceDeliveryPage.Props) => {
  const session = useSession().data as SessionType;
  const user = session.user;
  const { setRightPanel, updateDisabled, setUpdateDisabled } = useAppContext();

  const {
    error,
    mutate,
    data: txs,
    isLoading,
  } = useSwr(`/admin/service-delivery`, apiFetcher);

  function filtrerServices(services) {
    try {
      const res = [];
      console.log('services', services);
      services?.sort(function (a, b) {
        return new Date(b.ts).getTime() - new Date(a.ts).getTime();
      });
      const dealIds = [...new Set(services?.map((objet) => objet.dealId))];

      for (let i = 0; i < dealIds.length; i++) {
        const dealId = dealIds[i];
        const objetsFiltres = services?.filter(
          (objet) => objet.dealId === dealId
        )[0];
        res.push(objetsFiltres);
      }
      return res;
    } catch (e) {
      console.error(e, services);
      console.log('services', services);
      return filtreredServices;
    }
  }

  const [filtreredServices, setFiltreredServices] = useState([]);

  //filter services when txs change
  useEffect(() => {
    if (txs) {
      setFiltreredServices(filtrerServices(txs));
      setUpdateDisabled(false);
    }
  }, [txs]);

  //update transactions when pendingTransactions change
  const pendingTransactions = useAppSelector(selectPendingTransactions);
  useEffect(() => {
    mutate();
  }, [pendingTransactions]);

  console.log(filtreredServices)
  return (
    <>
      <Head>
        <title>{lang.page.admin.serviceDelivery.head.title}</title>
        {useIndexing(false)}
      </Head>
      <AdminLayout lang={lang}>
        <AppLayout user={user}>
          <div className="About Page flex flex-col items-center">
            <h1 className="text-h1 text-blue-005 w-1/2 font-medium text-center">
              Alumni benefit redeems
            </h1>
          </div>
          <div className="About grid grid-cols-12 gap-6 mt-8">
            <main className="About__main lg:col-span-12 col-span-12">
              <div className="Dashboard__Notifications">
                <div className="Dashboard__Notifications__title flex justify-between mb-4">
                  <h3 className="text-h3 text-blue-005 font-medium">
                    Alumni benefit redeems
                  </h3>
                </div>
                {error ? (
                  <p>Erreur</p>
                ) : (
                  <div>
                    <div
                      className="RedeemsList   text-blue-005 grid p-5 mb-12 overflow-x-auto bg-white"
                      style={{
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                      }}
                    >
                      <div className="TxReceipt border-blue-003 pb-10 font-medium border-b min-w-[30px]" />
                      <div className="TxTimeStamp border-blue-003 font-medium border-b min-w-[180px]">
                        Date
                      </div>
                      <div className="Name border-blue-003 font-medium border-b min-w-[180px]">
                        Buyer
                      </div>
                      <div className="BenefitProvider border-blue-003 font-medium border-b min-w-[180px]">
                        Provider
                      </div>
                      <div className="BenefitCategory border-blue-003 font-medium border-b min-w-[200px]">
                        Benefit category
                      </div>
                      <div className="BenefitName border-blue-003 font-medium border-b min-w-[180px]">
                        Benefit name
                      </div>
                      <div className="RedeemStatus border-blue-003 pl-12 font-medium border-b min-w-[180px]">
                        Delivery status
                      </div>

                      {isLoading ? (
                        <TableSkeleton totalCol={7} totalRows={1}/>
                      ) : filtreredServices && filtreredServices.length > 0 ? (
                        filtreredServices.map((transaction: any) => (
                          <React.Fragment key={transaction.hash}>
                            <div className="TxReceipt border-blue-003 flex items-center pl-2 pr-2 border-b">
                              <div
                                className="Link"
                                onClick={() =>
                                  setRightPanel({
                                    component: (
                                      <BlockchainReceipt
                                        services={[]}
                                        transaction={transaction}
                                      />
                                    ),
                                  })
                                }
                              >
                                <span
                                  className="text-blue-008 hover:text-white hover:bg-blue-008 flex items-center"
                                  style={{ cursor: 'zoom-in' }}
                                >
                                  <HiddenIconElement size="small" />{' '}
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      color: '#ccc',
                                    }}
                                  >
                                    #{transaction?.dealId}
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className="TxTimeStamp border-blue-003 flex items-center py-3 text-base border-b min-w-[180px]">
                              {new Date(transaction?.ts).toLocaleDateString()}
                            </div>
                            <div className="Name border-blue-003 flex items-center text-base border-b min-w-[180px]">
                              {transaction?.serviceBuyerInfo?.firstname}{' '}
                              {transaction?.serviceBuyerInfo?.lastname}
                            </div>
                            <div className="BenefitProvider border-blue-003 flex items-center text-base border-b min-w-[180px]">
                              t4g
                            </div>
                            <div className="BenefitCategory border-blue-003 flex items-center text-base border-b min-w-[200px]">
                              {transaction?.serviceInfo?.category}
                            </div>
                            <div className="BenefitName border-blue-003 flex items-center text-base border-b min-w-[180px]">
                              {transaction?.serviceInfo?.name}
                            </div>
                            <div className="RedeemStatus border-blue-003 flex items-center pl-12 text-base border-b min-w-[180px]">
                              {transaction?.event === 'DealCreated' && (
                                <ButtonElement
                                  disabled={updateDisabled}
                                  onClick={() => {
                                    setRightPanel({
                                      component: (
                                        <UpdateDeliveryStatus
                                          transaction={transaction}
                                          onUpdate={mutate}
                                        />
                                      ),
                                    });
                                  }}
                                  variant={{
                                    hover: 'hover:drop-shadow-md',
                                    text: 'text-white',
                                    border: 'bg-green-001',
                                    height: 'h-40',
                                    width: 'w-[150px]',
                                    active: 'bg-green-001',
                                    disabled: 'bg-green-002',
                                  }}
                                >
                                  {updateDisabled
                                    ? 'PENDING TRANSACTION'
                                    : 'UPDATE'}
                                </ButtonElement>
                              )}
                              {transaction?.event === 'DealValidated' && (
                                <span
                                  className={`inline-block font-medium u-margin--auto text-green-001`}
                                >
                                  Confirmed
                                </span>
                              )}
                              {transaction?.event === 'DealCancelled' && (
                                <span
                                  className={`inline-block font-medium u-margin--auto text-red-500`}
                                >
                                  Cancelled
                                </span>
                              )}
                            </div>
                          </React.Fragment>
                        ))
                      ) : (
                        <p>Pas de données</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </AppLayout>
      </AdminLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['SERVICE_PROVIDER'];
