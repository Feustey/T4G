import React from 'react';
import { AppLayout } from '../../components/elements';
import {
  ServiceCatalogueList,
  ServiceCreateForm,
} from '../../components/ui';
import { Api, Components } from '../../lib/types';
import { ButtonElement } from '../../components/elements';
import { useAppContext } from '../../contexts/AppContext';
import useSwr from 'swr';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import { useIndexing } from '../../hooks';
import AdminLayout from '../../layouts/AdminLayout';
import { AuthPageType, SessionType } from '../../types';
import { apiFetcher } from 'apps/dapp/services/config';

const Page: React.FC<Components.Admin.ServiceCataloguePage.Props> &
  AuthPageType = ({
  provider,
  lang,
}: Components.Admin.ServiceCataloguePage.Props) => {
  const { user } = useAuth();

  const { setRightPanel } = useAppContext();
  const {
    data: services,
    error: servicesError,
    mutate: refreshServices,
  } = useSwr<Api.Service[]>(`/admin/services`, apiFetcher);
  const { data: serviceCategories } = useSwr<Api.Category[]>(
    `/service-categories/as_provider`,
    apiFetcher
  );

  return (
    <>
      <Head>
        <title>{lang.page.admin.serviceCatalogue.head.title}</title>
        {useIndexing(false)}
      </Head>
      <AdminLayout lang={lang}>
        <AppLayout user={user}>
          <div className="About Page flex flex-col items-center">
            <h1 className="text-h1 text-blue-005 w-1/2 font-medium text-center">
              Alumni benefits catalogue
            </h1>
          </div>
          <div className="About grid grid-cols-12 gap-6 mt-6">
            <main className="About__main lg:col-span-12 col-span-12">
              <div className="Dashboard__Notifications">
                <div className="Dashboard__Notifications__title flex justify-between mb-4">
                  <h3 className="text-h3 text-blue-005 top-6 relative font-medium">
                    Alumni benefits catalogue
                  </h3>
                  <ButtonElement
                    onClick={() => {
                      setRightPanel({
                        component: (
                          <ServiceCreateForm
                            serviceCategories={serviceCategories}
                            provider={user.id}
                            onServiceCreated={refreshServices}
                          />
                        ),
                      });
                    }}
                    variant={{
                      hover: 'hover:drop-shadow-md',
                      text: 'text-white',
                      border: 'bg-green-001',
                      height: 'h-40 lg:h-48',
                      width: 'ml-5',
                    }}
                  >
                    ADD A BENEFIT
                  </ButtonElement>
                </div>
                <div className="mt-6">
                  {servicesError ? (
                    <p>Erreur</p>
                  ) : (
                    <ServiceCatalogueList
                      services={services}
                      serviceCategories={serviceCategories}
                      provider={provider}
                      lang={lang}
                    />
                  )}
                </div>
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
