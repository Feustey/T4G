import { useState } from 'react';
import Head from 'next/head';

import ConnectedLayout from 'apps/dapp/layouts/ConnectedLayout';
import {  Breadcrumb, Filters, Icons, IconsT4G, Spinner } from 'apps/dapp/components';
import {
  AuthPageType,
  LangType,
  SessionType,
  UserExperienceType,
} from 'apps/dapp/types';
import { useIndexing, useMediaQuery } from 'apps/dapp/hooks';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';
import useSwr, { SWRResponse } from 'swr';
import { UserCard } from 'apps/dapp/components/connected/UserCard';
import { User, UserWallet } from '@t4g/types';
import { __values } from 'tslib';
import { apiFetcher } from 'apps/dapp/services/config';

interface IDirectoryPage {
  lang: LangType;
}

export function DirectoryPage({
  lang,
}: IDirectoryPage & AuthPageType) {
  const { user } = useAuth();
  const categoryName="Directory"

  const { data: users } = useSwr<User[]>('/users', apiFetcher); //TODO error

  //filteredAvailableServices=service
  let filteredTypeUsers =[]
  if(users){
    filteredTypeUsers = users
  }


  const [incr, setIncr] = useState(0); // Indice de début de la plage

  const incrementSlice = () => {
    setIncr(incr + 12); // Incrémenter l'indice de début de la plage de 6
  };
  
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

  const filteredUsers = filteredTypeUsers
  .filter((user: User) => {
    if (searchValue) {
      const distanceLastName = getLevenshteinDistance(
        user.lastname
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
        searchValue
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      );
      const distanceFirstName = getLevenshteinDistance(
        user.firstname
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
        searchValue
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      );
      const isLastNameIncluded = user.lastname
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(
          searchValue
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
        );
      
      return (
        user.firstname
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes(
            searchValue
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
          ) ||
        isLastNameIncluded ||
        distanceLastName <= 2 ||
        distanceFirstName <= 2
      );
    } else {
      return true;
    }
  });

  let sortedUsers: User[] = filteredUsers;

  switch (sort) {
    case 'YEAR_ASC':
      sortedUsers = filteredUsers.sort(
        (a, b) =>
          Number(a.provider?.graduatedYear) - Number(b.provider?.graduatedYear)
      );
      break;
    case 'YEAR_DESC':
      sortedUsers = filteredUsers.sort(
        (a, b) =>
          Number(b.provider?.graduatedYear) - Number(a.provider?.graduatedYear)
      );
      break;
    case 'ALPHA_ASC':
      sortedUsers = filteredUsers.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      break;
    case 'ALPHA_DESC':
      sortedUsers = filteredUsers.sort((a, b) =>
        b.name.localeCompare(a.name)
      );
      break;
    case 'RATING':
      sortedUsers = filteredUsers.sort((a, b) => {
        const averageRatingA = a.rating.length > 0 ? a.rating.reduce((acc, curr) => acc + curr, 0) / a.rating.length : 0;
        const averageRatingB = b.rating.length > 0 ? b.rating.reduce((acc, curr) => acc + curr, 0) / b.rating.length : 0;
        
        return averageRatingB - averageRatingA;
      });
      break;

    default:
      sortedUsers = filteredUsers;
      break;
  }

  return (
    <>
      <Head>
        <title>
          {categoryName} - T4G
        </title>
        {useIndexing(false)}
      </Head>
      <ConnectedLayout user={user} lang={lang} classNameCSS="">
        <div className="u-d--flex u-flex-column u-r-gap--md">
          <Breadcrumb
            links={[
              {
                text: lang.components.breadcrumb.dashboard.label,
                link: '/dashboard',
                parent: true,
              },
              { text: categoryName },
            ]}
          />
          <section className="u-margin-lg--none u-margin--auto">
            <div className="u-d--flex u-flex-wrap u-justify-content-between ">
              <h1 className="u-d--flex u-align-items-center u-gap--s u-margin-lg--none u-margin--auto heading-2 u-width--fit ">
                <span className="c-icon--title u-margin--none">
                  {Icons["identification"]}
                </span>
                Directory
              </h1>
              {!isMobile && (
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
            <p className="u-text--bold mt-8">Explore our student and alumni directory.</p>

            {isMobile && (
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
        </div>

        {sortedUsers && sortedUsers.length > 0 ? (
          <section
            className="o-layout--grid--auto"
            style={{ '--grid-min-size': `300px` } as React.CSSProperties}
          >
            {sortedUsers.slice(0,24+incr).map(
              (user: User, index: number) => (
                <UserCard
                  categorieName={categoryName}
                  key={index}
                  userId={user.id}
                  userRole={user.role}
                  isLink={true}
                  parent="directory"
                />
              )
            )}
            
          </section>
        ):
        (!sortedUsers || sortedUsers.length<1) ? 
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
        {sortedUsers && !(sortedUsers.length<incr+24) && (
        <button className="w-full flex justify-center" onClick={incrementSlice}> 
          <span className="flex items-center mr-2 text-blue-008" >{Icons['down' as keyof IconsT4G]}</span>Show more
        </button>
        )}
      </ConnectedLayout>
    </>
  );
}

DirectoryPage.auth = true;
DirectoryPage.role = ['ALUMNI', 'STUDENT'];

export default DirectoryPage;
