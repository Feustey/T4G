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
import { apiClient, User } from '../../services/apiClient';

interface IDirectoryPage {
  lang: LangType;
}

export function DirectoryPage({
  lang,
}: IDirectoryPage & AuthPageType) {
  const { user } = useAuth();
  const categoryName="Directory"

  const { data: users } = useSwr<User[]>('/api/users', () => apiClient.getUsers());

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
  .filter((u: User) => {
    if (searchValue) {
      const distanceLastName = getLevenshteinDistance(
        (u.lastname || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
        searchValue
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      );
      const distanceFirstName = getLevenshteinDistance(
        (u.firstname || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
        searchValue
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      );
      const isLastNameIncluded = (u.lastname || '')
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
        (u.firstname || '')
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

  const getName = (u: User) => `${u.firstname || ''} ${u.lastname || ''}`.trim();
  switch (sort) {
    case 'YEAR_ASC':
      sortedUsers = [...filteredUsers].sort(
        (a, b) =>
          Number((a as any).graduated_year) - Number((b as any).graduated_year)
      );
      break;
    case 'YEAR_DESC':
      sortedUsers = [...filteredUsers].sort(
        (a, b) =>
          Number((b as any).graduated_year) - Number((a as any).graduated_year)
      );
      break;
    case 'ALPHA_ASC':
      sortedUsers = [...filteredUsers].sort((a, b) =>
        getName(a).localeCompare(getName(b))
      );
      break;
    case 'ALPHA_DESC':
      sortedUsers = [...filteredUsers].sort((a, b) =>
        getName(b).localeCompare(getName(a))
      );
      break;
    case 'RATING':
      sortedUsers = [...filteredUsers].sort((a, b) =>
        (b.score ?? 0) - (a.score ?? 0)
      );
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
              (dirUser: User) => (
                <UserCard
                  categorieName={categoryName}
                  key={dirUser.id}
                  userId={dirUser.id}
                  userRole={dirUser.role}
                  isMentorActive={dirUser.is_mentor_active}
                  isLink={true}
                  parent="directory"
                  prefetchedUser={dirUser}
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
DirectoryPage.role = ['alumni', 'mentee', 'mentor', 'service_provider'];

export default DirectoryPage;

export const getServerSideProps = () => ({ props: {} });
