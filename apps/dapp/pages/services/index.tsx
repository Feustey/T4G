import React from 'react';
import { AppLayout } from '../../components/elements';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import ConnectedLayout from '../../layouts/ConnectedLayout';
import { useIndexing } from '../../hooks';
import { AuthPageType, CategoryType, LangType, SessionType } from 'apps/dapp/types';
import { ServicesList } from '../../components/ui';
import { useAppSelector } from 'apps/dapp/hooks';
import { selectProposedServices } from 'apps/dapp/store/slices/proposedServicesSlice';
import { alumniServices } from 'apps/dapp/data';
import Image from 'next/image';
import { Breadcrumb, Icons } from 'apps/dapp/components';
import { RightPanel, AppModal } from '@t4g/ui/layouts';
import useSwr from 'swr';
import { apiFetcher } from 'apps/dapp/services/config';


export interface IPage {
  lang: LangType;
}

const Page: React.FC<IPage> & AuthPageType = ({ lang }: IPage) => {
  const { user } = useAuth();

  const alumniStudentMentorServices: string[] =
    alumniServices.studentMentor.map((service) => service.name);

  const proposedServices = useAppSelector(selectProposedServices);

  const activeAlumniStudentMentorServices = proposedServices?.filter(
    (service) => alumniStudentMentorServices.includes(service)
  );

  const { data: categorieList } = useSwr<CategoryType[]>(
    '/service-categories/as_provider',
    apiFetcher
  ); //TODO error

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
              <h1 className="u-d--flex u-align-items-center u-gap--s heading-2 ">
                <span className="c-icon--title--services--big u-margin--none">
                  {Icons.sparkles}
                </span>
                Services
              </h1>
            </div>
            <p className="u-text--bold">
              Earn tokens for different services, and turn these tokens into
              great benefits. <br />
              Tell us what services you’d like to deliver to the community.
            </p>
          </div>
          <Image
            priority
            alt=""
            src="/assets/images/svg/about-hero.svg"
            className="u-d-lg--block u-d--none h-56 w-44"
            width={"183"}
            height={"222"}
          />
        </div>

        <section
          className="o-layout--grid--auto"
          style={{ '--grid-min-size': `300px` } as React.CSSProperties}
        >
          {user.role === 'ALUMNI' ? (
            <>
              {categorieList && categorieList.map((categorie: CategoryType, index: number) => (
                <ServicesList
                serviceId={categorie.id}
                serviceCategory={categorie.name}
                desc={categorie.description}
                list={categorie.name=="Mentoring"?activeAlumniStudentMentorServices:[]}
                title={categorie.name}
                icon={categorie.icon}
                annotations={categorie.name=="Mentoring"?alumniServices.studentMentor:[]}
                key={index}
                />
            ))}
            </>
          ):(
            <>
            
          {categorieList && categorieList.map((categorie: CategoryType, index: number) => (
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
        <RightPanel />
        <AppModal />
      </ConnectedLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['ALUMNI','STUDENT'];
