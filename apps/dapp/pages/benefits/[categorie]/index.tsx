import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

import ConnectedLayout from 'apps/dapp/layouts/ConnectedLayout';
import { BenefitCard, Breadcrumb, Filters, Icons, IconsT4G, Spinner } from 'apps/dapp/components';
import {
  AuthPageType,
  CategoryType,
  LangType,
  ReceiveServiceType,
  SessionType,
  UserExperienceType,
} from 'apps/dapp/types';
import { useIndexing, useMediaQuery } from 'apps/dapp/hooks';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import useSwr from 'swr';
import { apiFetcher, apiUrl } from 'apps/dapp/services/config';

interface IBenefitPage {
  lang: LangType;
  categoryName: CategoryType['name'];
  categoryIcon: CategoryType['icon'];
  categoryDescription: CategoryType['description'];
}

export function BenefitPage({
  lang,
  categoryName,
  categoryIcon,
  categoryDescription,
}: IBenefitPage & AuthPageType) {
  const session = useSession().data as SessionType | null;
  const user = session?.user ?? null;


  const { data: service } = useSwr<ReceiveServiceType[]>(
    '/users/me/services',
    apiFetcher
  ); //TODO error
  //console.log(service)
  //console.log(category)
  //filteredAvailableServices=service
  let filteredAvailableServices =[]
  if(service){
    filteredAvailableServices = service.filter(
      (service: ReceiveServiceType) => service.category.name === categoryName
    );
  }

  const [incr, setIncr] = useState(0); // Indice de début de la plage

  const incrementSlice = () => {
    setIncr(incr + 12); // Incrémenter l'indice de début de la plage de 6
  };
  
  
  const [filterCountry, setFilterCountry] =
    useState<UserExperienceType['country']>('');
  // TODO : Change type by the correct one
  const [filterActivity, setFilterActivity] =
    useState<UserExperienceType['industry']>('');
  const [filterProposedServices, setFilterProposedServices] =
    useState<string>('');
  const [sort, setSort] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const isMobile = useMediaQuery(992);

  function getLevenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;

    if (m === 0) return n;
    if (n === 0) return m;

    const distanceMatrix: number[][] = Array.from({ length: m + 1 }, () =>
      Array.from({ length: n + 1 }, () => 0)
    );

    for (let i = 0; i <= m; i++) {
      distanceMatrix[i][0] = i;
    }

    for (let j = 0; j <= n; j++) {
      distanceMatrix[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        distanceMatrix[i][j] = Math.min(
          distanceMatrix[i - 1][j] + 1, // Suppression
          distanceMatrix[i][j - 1] + 1, // Insertion
          distanceMatrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }

    return distanceMatrix[m][n];
  }

  const handleRemove = (id: string) => {
    switch (id) {
      case 'country':
        setFilterCountry('');
        break;
      case 'activity':
        setFilterActivity('');
        break;
      case 'proposedServices':
        setFilterProposedServices('');
        break;
      case 'sort':
        setSort('');
        break;
      default:
        break;
    }
  };

  const handleChange = (value: string, id: string) => {
    switch (id) {
      case 'country':
        setFilterCountry(value);
        break;
      case 'activity':
        setFilterActivity(value);
        break;
      case 'sort':
        setSort(value);
        break;
      case 'proposedServices':
        setFilterProposedServices(value);
        break;
      default:
        break;
    }
  };

  const filteredServices = filteredAvailableServices
    .filter((service: ReceiveServiceType) => {
      if (filterCountry) {
        return (
          service.provider?.experiences?.find((xp) => xp.isCurrent === true)
            ?.country === filterCountry ||
          service.provider?.experiences[0]?.country === filterCountry
        );
      } else {
        return service;
      }
    })
    .filter((service: ReceiveServiceType) => {
      if (filterActivity) {
        return (
          service.provider?.experiences?.find((xp) => xp.isCurrent === true)
            ?.industry === filterActivity ||
          service.provider?.experiences[0]?.industry === filterActivity
        );
      } else {
        return service;
      }
    })
    .filter((service: ReceiveServiceType) => {
      if (filterProposedServices) {
        return service.provider?.proposedServices.includes(
          filterProposedServices
        );
      } else {
        return service;
      }
    })
    .filter((service: ReceiveServiceType) => {
      if (searchValue) {
        const distanceLastName = getLevenshteinDistance(
          service.provider?.lastName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''),
          searchValue
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
        );
        const distanceFirstName = getLevenshteinDistance(
          service.provider?.firstName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''),
          searchValue
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
        );
        return (
          service.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .includes(
              searchValue
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
            ) ||
          distanceLastName <= 2 ||
          distanceFirstName <= 2
        );
      } else {
        return true;
      }
    });

  let sortedServices: ReceiveServiceType[] = filteredServices;

  switch (sort) {
    case 'YEAR_ASC':
      sortedServices = filteredServices.sort(
        (a, b) =>
          Number(a.provider?.graduatedYear) - Number(b.provider?.graduatedYear)
      );
      break;
    case 'YEAR_DESC':
      sortedServices = filteredServices.sort(
        (a, b) =>
          Number(b.provider?.graduatedYear) - Number(a.provider?.graduatedYear)
      );
      break;
    case 'ALPHA_ASC':
      sortedServices = filteredServices.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      break;
    case 'ALPHA_DESC':
      sortedServices = filteredServices.sort((a, b) =>
        b.name.localeCompare(a.name)
      );
      break;
    case 'RATING':
      sortedServices = filteredServices.sort((a, b) => {
        const averageRatingA = a.rating.length > 0 ? a.rating.reduce((acc, curr) => acc + curr, 0) / a.rating.length : 0;
        const averageRatingB = b.rating.length > 0 ? b.rating.reduce((acc, curr) => acc + curr, 0) / b.rating.length : 0;
        
        return averageRatingB - averageRatingA;
      });
      break;

    default:
      sortedServices = filteredServices;
      break;
  }

  return (
    <>
      <Head>
        <title>
          {lang.page.benefits.detail.head.title} {categoryName} - T4G
        </title>
        {useIndexing(false)}
      </Head>
      <ConnectedLayout user={user ?? undefined} lang={lang} classNameCSS="o-benefits">
        <div className="u-d--flex u-flex-column u-r-gap--md">
          <Breadcrumb
            links={[
              {
                text: lang.components.breadcrumb.dashboard.label,
                link: '/dashboard',
              },
              {
                text: lang.components.breadcrumb.benefits.label,
                link: '/benefits',
                parent: true,
              },
              { text: categoryName },
            ]}
          />
          <section className="u-margin-lg--none u-margin--auto">
            <div className="u-d--flex u-flex-wrap u-justify-content-between ">
              <h1 className="u-d--flex u-align-items-center u-gap--s u-margin-lg--none u-margin--auto heading-2 u-width--fit ">
                <span className="c-icon--title--benefits--big u-margin--none">
                  {Icons[`${categoryIcon}`]}
                </span>
                {categoryName}
              </h1>
              {!isMobile && categoryName === 'Mentoring' && (
                <form onSubmit={(e) => e.preventDefault()}>
                  <input
                    className={'form-search'}
                    type="search"
                    onChange={(e) => {
                      setSearchValue(e.target.value.trim());
                    }}
                    onSubmit={(e) => e.preventDefault()}
                    placeholder="Who are you looking for?"
                  />
                </form>
              )}
            </div>
            <p className="u-text--bold mt-8">{categoryDescription}</p>

            {isMobile && categoryName === 'Mentoring' && (
              <form onSubmit={(e) => e.preventDefault()}>
                <input
                  className={'form-search'}
                  type="search"
                  onSubmit={(e) => e.preventDefault()}
                  onChange={(e) => {
                    setSearchValue(e.target.value.trim());
                  }}
                  placeholder="Who are you looking for?"
                />
              </form>
            )}
          </section>
          {categoryName === 'Mentoring' && (
            <Filters
              resultLength={sortedServices.length}
              lang={lang}
              country={filterCountry}
              activity={filterActivity}
              sort={sort}
              proposedServices={filterProposedServices}
              handleRemove={handleRemove}
              handleChange={handleChange}
            />
          )}
        </div>

        {sortedServices.length > 0 ? (
          <section
            className="o-layout--grid--auto"
            style={{ '--grid-min-size': `300px` } as React.CSSProperties}
          >
            {sortedServices.slice(0,24+incr).map(
              (filteredService: ReceiveServiceType, index: number) => (
                <BenefitCard
                  categorieName={categoryName}
                  parent={'benefits'}
                  key={index}
                  service={filteredService}
                  type={'BENEFITS'}
                  userRole={user.role}
                  isLink={true}
                />
              )
            )}
            
          </section>
        ):
        !service ? 
          <>
            <Spinner lang={lang} spinnerText={'Loading...'} size="lg" />
          </>
        : (
           <div className='flex flex-col justify-center items-center my-8'>
            <Image
              priority
              alt=""
              src="/assets/images/png/token-0.png"
              width={124}
              height={124}
            />
            <p className="">{lang.utils.noResult}...</p>
           </div>
        )}
        {!(sortedServices.length<incr+24) && (
        <button className="w-full flex justify-center" onClick={incrementSlice}> 
          <span className="flex items-center mr-2 text-blue-008" >{Icons['down' as keyof IconsT4G]}</span>Show more
        </button>
        )}
      </ConnectedLayout>
    </>
  );
}

BenefitPage.auth = true;
BenefitPage.role = ['ALUMNI', 'STUDENT'];

export default BenefitPage;


export const getServerSideProps: GetServerSideProps = async function (context) {
  const categoryName = context.query.categorie;

  let categoryIcon: string;
  let categoryDescription: string;

  const categoryResponse = await fetch(apiUrl('/service-categories/as_consumer'), {
    headers: {
      cookie: context.req.headers.cookie ?? '',
    },
  });

  if (!categoryResponse.ok) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  const categories: CategoryType[] = await categoryResponse.json();

  categories.forEach((categorie) => {
    if (categorie.name === categoryName) {
      categoryIcon = categorie?.icon || 'chat';
      categoryDescription = categorie?.description || ' ';
    }
  });


  return {
    props: {
      categoryName,
      categoryIcon,
      categoryDescription,
    },
  };
};
