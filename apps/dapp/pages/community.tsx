import React from 'react';
import getConfig from 'next/config';
import Head from 'next/head';
import useSwr from 'swr';
import ConnectedLayout from '../layouts/ConnectedLayout';
import { useIndexing } from '../hooks';
import { AuthPageType, LangType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Breadcrumb, CustomLink, Icons, Spinner } from '../components';
import { apiFetcher } from 'apps/dapp/services/config';

interface CommunityMetrics {
  usersCount: {
    alumnis: number;
    students: number;
  };
  interactionsCount: number;
  tokensSupply: number;
  tokensExchanged: number;
  txsCount: number;
}

interface WalletResponse {
  address: string;
  balance: number;
}

interface PageProps {
  lang: LangType;
}

const Page: React.FC<PageProps> & AuthPageType = ({
  lang,
}: // metrics,
// smartContractAddress,
PageProps) => {
  const POLYGONSCAN_BASEURL = getConfig().publicRuntimeConfig.polygonScanUrl;
  const { user } = useAuth();
  const { data: metrics } = useSwr<CommunityMetrics>(`/metrics`, apiFetcher);
  const {
    data: wallet,
    isLoading: isWalletLoading,
  } = useSwr<WalletResponse>(`/users/me/wallet`, apiFetcher); //TODO error

  return (
    <>
      <Head>
        <title>{lang.page.community.head.title}</title>
        {useIndexing(false)}
      </Head>
      <ConnectedLayout user={user ?? undefined} lang={lang}>
        <Breadcrumb
          links={[
            {
              text: lang.components.breadcrumb.dashboard.label,
              link: '/dashboard',
              parent: true,
            },
            { text: lang.components.breadcrumb.community.label },
          ]}
        />
        <div className="o-dashboard">
          <section className="o-dahboard-content">
            <div className="u-d--flex u-flex-column u-r-gap--md u-width--fill">
              <h1 className="u-d--flex u-align-items-center u-gap--s u-margin-lg--none u-margin--auto heading-2">
                <span className="c-icon--title u-margin--none">
                  {Icons.userGroupLine}
                </span>
                {lang.page.community.main.title1}
              </h1>
              <p className="u-text--bold">
                {lang.page.community.main.sub1}
              </p>
            </div>

            {!isWalletLoading && wallet && metrics ? (
            <div className="o-card">
              <div className="u-d--flex u-justify-content-between u-width--fill">
                <h2 className="subtitle-1">{lang.page.community.main.title2}</h2>
              </div>
              
              <ul role="list" className="c-notifications">
                <li>
                  <div className="flex items-center justify-around">
                    <div className="c-metrics__metric--community w-full">
                      <p className="c-metrics__metric__number">
                        {Number(metrics?.usersCount?.alumnis) +
                          Number(metrics?.usersCount?.students)}
                      </p>
                      <p>
                        {lang.page.community.main.section1.met1}
                      </p>
                    </div>
                    <div className="c-metrics__metric--community w-full">
                      <p className="c-metrics__metric__number">
                        {metrics ? metrics.usersCount.students : ''}
                      </p>
                      <p>
                        {lang.page.community.main.section1.met2}
                      </p>
                    </div>
                  </div>
                </li>
                 
                <li>
                  <div className="flex items-center justify-around">
                    <div className="c-metrics__metric--community w-full">
                      <p className="c-metrics__metric__number">
                        {metrics ? metrics.usersCount.alumnis : ''}
                      </p>
                      <p>
                        {lang.page.community.main.section1.met3}
                      </p>
                    </div>
                    <div className="c-metrics__metric--community w-full">
                      <p className="c-metrics__metric__number">
                        {metrics ? metrics.interactionsCount : ''}
                      </p>
                      <p>
                        {lang.page.community.main.section1.met4}
                      </p>
                    </div>
                  </div>
                </li>

                <li>
                  <div className="flex items-center justify-around">
                    <div className="c-metrics__metric--community w-full">
                      <p className="c-metrics__metric__number">
                        {metrics ? metrics.tokensSupply : ''}
                      </p>
                      <p>
                        {lang.page.community.main.section1.met5}
                      </p>
                    </div>
                    <div className="c-metrics__metric--community w-full">
                      <p className="c-metrics__metric__number">
                        {metrics ? metrics.tokensExchanged : ''}
                      </p>
                      <p>
                        {lang.page.community.main.section1.met6}
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            ) : (
              <>
                <Spinner lang={lang} spinnerText={'Loading...'} size="lg" />
              </>
            )}
          </section>
          {/* ── Section Nouveautés V2 ── */}
          <section className="o-dahboard-content">

            {/* Bandeau lancement V2 */}
            <div
              className="o-card"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              <div className="u-d--flex u-align-items-center u-gap--s" style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>🚀</span>
                <h2 className="subtitle-1" style={{ color: 'white', margin: 0 }}>
                  Token4Good V2 — en ligne !
                </h2>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.2)',
                    padding: '3px 10px',
                    borderRadius: 999,
                  }}
                >
                  Mars 2026
                </span>
              </div>
              <p style={{ margin: 0, opacity: 0.92, fontSize: 14, lineHeight: 1.6 }}>
                La plateforme T4G est entièrement reconstruite : nouvelle architecture Rust + PostgreSQL sur Railway,
                système de mentoring complet, portefeuille Lightning natif et annuaire communautaire en temps réel.
              </p>
            </div>

            {/* Timeline des améliorations récentes */}
            <div className="o-card">
              <h2 className="subtitle-1 u-d--flex u-align-items-center u-gap--s">
                <span className="c-icon--title u-margin--none" style={{ fontSize: 20 }}>
                  {Icons.bell}
                </span>
                Dernières améliorations
              </h2>
              <ul role="list" style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  {
                    emoji: '⚡',
                    color: '#f7931a',
                    date: 'Mars 2026',
                    title: 'Connexion Lightning (LNURL-Auth)',
                    desc: 'Authentification native via votre wallet Lightning. Retours visuels en temps réel sur chaque étape de connexion.',
                  },
                  {
                    emoji: '🎓',
                    color: '#2563eb',
                    date: 'Mars 2026',
                    title: 'Mentoring — réservation de sessions',
                    desc: 'Recherche de mentor par thème, sélection de créneaux, confirmation de session et suivi des échanges en T4G.',
                  },
                  {
                    emoji: '👥',
                    color: '#7c3aed',
                    date: 'Mars 2026',
                    title: 'Annuaire communautaire',
                    desc: 'Exploration de tous les membres inscrits avec badge Mentor, recherche floue par nom et tri par score.',
                  },
                  {
                    emoji: '🔔',
                    color: '#16a34a',
                    date: 'Mars 2026',
                    title: 'Système de notifications toast',
                    desc: 'Feedback instantané sur chaque action : connexion, réservation, confirmation ou annulation de transaction.',
                  },
                  {
                    emoji: '🗄️',
                    color: '#0891b2',
                    date: 'Fév. 2026',
                    title: 'Migration PostgreSQL sur Railway',
                    desc: 'Le backend est désormais 100 % Rust (Axum + SQLx) avec une base PostgreSQL managée sur Railway.',
                  },
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 14,
                      paddingBottom: 16,
                      borderBottom: i < 4 ? '1px solid var(--app-color-border, #f0f0f0)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: `${item.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                      }}
                    >
                      {item.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="u-d--flex u-align-items-center u-gap--s" style={{ marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</span>
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--app-color-text-disabled, #999)',
                            marginLeft: 'auto',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.date}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--app-color-text-secondary, #64748b)', lineHeight: 1.5 }}>
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </section>

          {!isWalletLoading && wallet && metrics && (
          <aside className="c-metrics">
            <div className="o-card">
              <div className="About__Wallet__title flex justify-between">
                <h2 className="subtitle-1">{lang.page.community.main.title3}</h2>
              </div>

              <div className="flex flex-col items-center justify-around pt-4 mx-auto max-w-full">
                
                <div className="c-metrics__metric--community">
                  <p className="c-metrics__metric__number">
                    {metrics ? metrics.txsCount : ''}
                  </p>
                  <p>{lang.page.community.main.title3}</p>
                </div>
                <p className="leading-4 mt-8">
                  {lang.page.community.main.section2.text1}
                </p>
                <p className="self-start mt-6 u-text--bold">
                  {lang.page.community.main.section2.text2} :
                </p>
                <div className="flex w-full mt-2">
                  <div className="overflow-hidden text-ellipsis hover:underline u-text--bold text-blue-005 max-w-max cursor-pointer">
                    {wallet.address}
                  </div>
                  <div className="grow-0 ml-4 cursor-pointer text-blue-008">
                    {Icons.copy}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="o-card">
              <div className="">
                <h2 className="subtitle-1">{lang.page.community.main.section2.text3}</h2>
                <p className="mt-8 mb-8 text-base text-blue-007">
                  {lang.page.community.main.section2.text4}
                </p>
                <div className="self-start">
                  
                  <CustomLink
                    href={POLYGONSCAN_BASEURL+"/address/"+wallet.address}
                    label={lang.page.community.main.section2.linktext}
                    iconName={'arrowRight'}
                    external={false}
                    newWindow={true}
                    className="c-link--icon"
                  />
                </div>
              </div>
            </div>
          </aside>
          )}
        </div>
      </ConnectedLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['alumni', 'mentee', 'mentor', 'service_provider'];

export const getServerSideProps = () => ({ props: {} });
