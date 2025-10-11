import Head from 'next/head';

import ConnectedLayout from 'apps/dapp/layouts/ConnectedLayout';
import { Breadcrumb, CategoryCard, Icons, Spinner } from 'apps/dapp/components';
import {
  AuthPageType,
  CategoryType,
  LangType,
  SessionType,
} from 'apps/dapp/types';
import { useIndexing } from 'apps/dapp/hooks';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import useSwr from 'swr';
import { apiFetcher } from 'apps/dapp/services/config';

interface IBenefitPage {
  lang: LangType;
}

export function BenefitPage({
  lang,
}: IBenefitPage & AuthPageType) {
  const session = useSession().data as SessionType | null;
  const user = session?.user ?? null;
  
  const { data: categorieList } = useSwr<CategoryType[]>(
    '/service-categories/as_consumer',
    apiFetcher
  ); //TODO error
  return (
    <>
      <Head>
        <title>{lang.page.benefits.index.head.title}</title>
        {useIndexing(false)}
      </Head>
      <ConnectedLayout user={user ?? undefined} lang={lang} classNameCSS="o-benefits">
        <div className="u-d--flex u-align-center u-c-gap--md">
          <div className="u-d--flex u-flex-column u-r-gap--md u-width--fill">
            <Breadcrumb
              links={[
                {
                  text: lang.components.breadcrumb.dashboard.label,
                  link: '/dashboard',
                  parent: true,
                },
                { text: lang.components.breadcrumb.benefits.label },
              ]}
            />
            <div className="u-margin-lg--none u-margin--auto">
              <h1 className="u-d--flex u-align-items-center u-gap--s heading-2 ">
                <span className="c-icon--title--benefits--big u-margin--none">
                  {Icons.gift}
                </span>
                {lang.page.benefits.index.main.title}
              </h1>
            </div>
            <p className="u-text--bold">{lang.page.benefits.index.main.sub}</p>
          </div>
          <Image
            priority
            alt=""
            src="/assets/images/png/new-home-hero2.png"
            className="u-d-lg--block u-d--none u-image-hero--benefits"
            width={264}
            height={168}
          />
        </div>

        <section
          className="o-layout--grid--auto"
          style={{ '--grid-min-size': `350px` } as React.CSSProperties}
        >
          {categorieList ? categorieList.map((categorie: CategoryType, index: number) => (
            <CategoryCard
              lang={lang}
              key={index}
              categorie={categorie}
              type={'BENEFITS'}
            />
          )):
          <>
            <Spinner lang={lang} spinnerText={'Loading...'} size="lg" />
          </>
          }
        </section>
      </ConnectedLayout>
    </>
  );
}

BenefitPage.auth = true;
BenefitPage.role = ['ALUMNI', 'STUDENT'];

export default BenefitPage;
