import React from 'react';
import { CopyIconElement, PolygonIconElement } from '../components/icons';
import getConfig from 'next/config';
import Head from 'next/head';
import useSwr from 'swr';
import ConnectedLayout from '../layouts/ConnectedLayout';
import { useIndexing } from '../hooks';
import { AuthPageType, LangType, SessionType } from '../types';
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
Page.role = ['ALUMNI', 'STUDENT', 'SERVICE_PROVIDER'];
