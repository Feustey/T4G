import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import ConnectedLayout from '../../layouts/ConnectedLayout';
import { useIndexing } from '../../hooks';
import { AuthPageType, CategoryType, LangType } from 'apps/dapp/types';
import { ServicesList } from '../../components/ui';
import { useAppSelector } from 'apps/dapp/hooks';
import { selectProposedServices } from 'apps/dapp/store/slices/proposedServicesSlice';
import { alumniServices } from 'apps/dapp/data';
import Image from 'next/image';
import { Breadcrumb, CategoryCard, Icons, Spinner } from 'apps/dapp/components';
import { RightPanel, AppModal } from '../../lib/ui-layouts';
import useSwr from 'swr';
import { apiFetcher } from 'apps/dapp/services/config';

export interface IPage {
  lang: LangType;
}

type Tab = 'offres' | 'catalogue';

const TAB_STYLE_BASE: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '0.95rem',
  fontWeight: 600,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  borderBottom: '3px solid transparent',
  transition: 'color 0.15s, border-color 0.15s',
  color: 'var(--app-color-text-disabled, #94a3b8)',
};

const TAB_STYLE_ACTIVE: React.CSSProperties = {
  ...TAB_STYLE_BASE,
  color: 'var(--color-primary, #7c3aed)',
  borderBottom: '3px solid var(--color-primary, #7c3aed)',
};

const Page: React.FC<IPage> & AuthPageType = ({ lang }: IPage) => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('offres');

  // Activer l'onglet catalogue si ?tab=catalogue dans l'URL
  useEffect(() => {
    if (router.query.tab === 'catalogue') {
      setActiveTab('catalogue');
    }
  }, [router.query.tab]);

  const alumniStudentMentorServices: string[] =
    alumniServices.studentMentor.map((service) => service.name);

  const proposedServices = useAppSelector(selectProposedServices);

  const activeAlumniStudentMentorServices = proposedServices?.filter(
    (service) => alumniStudentMentorServices.includes(service)
  );

  const { data: providerCategories } = useSwr<CategoryType[]>(
    '/service-categories/as_provider',
    apiFetcher
  );

  const { data: consumerCategories } = useSwr<CategoryType[]>(
    '/service-categories/as_consumer',
    apiFetcher
  );

  return (
    <>
      <Head>
        <title>{lang.page.services.index.head.title}</title>
        {useIndexing(false)}
      </Head>
      <ConnectedLayout user={user} lang={lang} classNameCSS="o-services">
        <div className="u-d--flex u-align-center u-c-gap--md">
          <div className="u-d--flex u-flex-column u-r-gap--md u-width--fill">
            <Breadcrumb
              links={[
                {
                  text: lang.components.breadcrumb.dashboard.label,
                  link: '/dashboard',
                  parent: true,
                },
                { text: lang.components.breadcrumb.services.label },
              ]}
            />
            <div className="u-margin-lg--none u-margin--auto">
              <h1 className="u-d--flex u-align-items-center u-gap--s heading-2">
                <span className="c-icon--title--services--big u-margin--none">
                  {Icons.sparkles}
                </span>
                Services
              </h1>
            </div>
            <p className="u-text--bold">
              Proposez des services pour gagner des tokens, et dépensez-les dans
              le catalogue pour accéder aux avantages de la communauté.
            </p>
          </div>
          <Image
            priority
            alt=""
            src="/assets/images/svg/about-hero.svg"
            className="u-d-lg--block u-d--none h-56 w-44"
            width={183}
            height={222}
          />
        </div>

        {/* Onglets */}
        <div
          style={{
            display: 'flex',
            borderBottom: '2px solid var(--color-border, #e2e8f0)',
            marginBottom: '1.5rem',
            marginTop: '0.5rem',
          }}
        >
          <button
            style={activeTab === 'offres' ? TAB_STYLE_ACTIVE : TAB_STYLE_BASE}
            onClick={() => setActiveTab('offres')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {Icons.sparkles} Mes offres
            </span>
          </button>
          <button
            style={activeTab === 'catalogue' ? TAB_STYLE_ACTIVE : TAB_STYLE_BASE}
            onClick={() => setActiveTab('catalogue')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {Icons.gift} Catalogue
            </span>
          </button>
        </div>

        {/* Onglet Mes offres */}
        {activeTab === 'offres' && (
          <section
            className="o-layout--grid--auto"
            style={{ '--grid-min-size': `300px` } as React.CSSProperties}
          >
            {user.role === 'alumni' ? (
              <>
                {providerCategories &&
                  providerCategories.map((categorie: CategoryType, index: number) => (
                    <ServicesList
                      serviceId={categorie.id}
                      serviceCategory={categorie.name}
                      desc={categorie.description}
                      list={
                        categorie.name === 'Mentoring'
                          ? activeAlumniStudentMentorServices
                          : []
                      }
                      title={categorie.name}
                      icon={categorie.icon}
                      annotations={
                        categorie.name === 'Mentoring'
                          ? alumniServices.studentMentor
                          : []
                      }
                      key={index}
                    />
                  ))}
              </>
            ) : (
              <>
                {providerCategories &&
                  providerCategories.map((categorie: CategoryType, index: number) => (
                    <ServicesList
                      serviceId={categorie.id}
                      serviceCategory={categorie.name}
                      desc={categorie.description}
                      list={[]}
                      title={categorie.name}
                      icon={categorie.icon}
                      annotations={[]}
                      key={index}
                    />
                  ))}
              </>
            )}
          </section>
        )}

        {/* Onglet Catalogue */}
        {activeTab === 'catalogue' && (
          <section
            className="o-layout--grid--auto"
            style={{ '--grid-min-size': `350px` } as React.CSSProperties}
          >
            {consumerCategories ? (
              consumerCategories.map((categorie: CategoryType, index: number) => (
                <CategoryCard
                  lang={lang}
                  key={index}
                  categorie={categorie}
                  type="BENEFITS"
                />
              ))
            ) : (
              <Spinner lang={lang} spinnerText="Chargement..." size="lg" />
            )}
          </section>
        )}

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
