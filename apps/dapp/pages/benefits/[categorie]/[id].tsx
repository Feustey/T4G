import { GetServerSideProps } from 'next';
import Head from 'next/head';
import ConnectedLayout from 'apps/dapp/layouts/ConnectedLayout';
import {
  AlumniBenefitPage,
  Breadcrumb,
  StudentBenefitPage,
} from 'apps/dapp/components';
import {
  AuthPageType,
  LangType,
  ReceiveServiceType,
  SessionType,
  UserCVType,
} from 'apps/dapp/types';
import { useIndexing } from 'apps/dapp/hooks';
import { capitalise, getServiceByIdServerSide } from 'apps/dapp/services';
import { useAuth } from '../../../contexts/AuthContext';
import { AppModal } from '../../../lib/ui-layouts';

interface IBenefitPage {
  lang: LangType;
  filteredAvailableServices: ReceiveServiceType[];
  categoryName: string;
  benefit: ReceiveServiceType;
  providerCv: UserCVType;
}

export function BenefitPage({
  lang,
  categoryName,
  benefit,
}: IBenefitPage & AuthPageType) {
  const { user } = useAuth();
  return (
    <>
      <Head>
        <title>
          {lang.page.benefits.detail.head.title} :{' '}
          {capitalise(benefit.name.toLowerCase())} - T4G
        </title>
        {useIndexing(false)}
      </Head>
      <ConnectedLayout user={user} lang={lang} classNameCSS="o-benefits">
        <Breadcrumb
          links={[
            {
              text: lang.components.breadcrumb.dashboard.label,
              link: '/dashboard',
            },
            {
              text: lang.components.breadcrumb.benefits.label,
              link: '/benefits',
            },
            {
              text: categoryName,
              link: `/benefits/${encodeURIComponent(categoryName)}`,
              parent: true,
            },
            { text: capitalise(benefit.name.toLowerCase()) },
          ]}
        />
        <div className="u-d--flex u-r-gap--md u-c-gap--md u-flex-wrap">
          {user.role === 'ALUMNI' && (
            <AlumniBenefitPage lang={lang} benefit={benefit} />
          )}
          {user.role === 'STUDENT' && (
            <StudentBenefitPage lang={lang} benefit={benefit} />
          )}
        </div>
        <AppModal />
      </ConnectedLayout>
    </>
  );
}

BenefitPage.auth = true;
BenefitPage.role = ['ALUMNI', 'STUDENT'];

export const getServerSideProps: GetServerSideProps = async function (context) {
  const benefitId = context.query.id as string;
  const categoryName = context.query.categorie as string;

  const benefit = await getServiceByIdServerSide(benefitId as string);

  return {
    props: {
      categoryName,
      benefit,
    },
  };
};

export default BenefitPage;
