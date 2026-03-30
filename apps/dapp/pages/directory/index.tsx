import { useState, useMemo, useRef, useEffect } from 'react';
import Head from 'next/head';

import ConnectedLayout from 'apps/dapp/layouts/ConnectedLayout';
import {  Breadcrumb, Icons, IconsT4G, Spinner } from 'apps/dapp/components';
import {
  AuthPageType,
  LangType,
} from 'apps/dapp/types';
import { useIndexing, useMediaQuery } from 'apps/dapp/hooks';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';
import useSwr from 'swr';
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

  const { data: users, isLoading: isUsersLoading } = useSwr<User[]>(
    '/api/users?limit=100',
    () => apiClient.getUsers({ limit: 100 }),
    { revalidateOnFocus: false }
  );

  const [incr, setIncr] = useState(0);
  const incrementSlice = () => setIncr((v) => v + 12);

  const [sort] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useMediaQuery(992);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchValue), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchValue]);

  const sortedUsers = useMemo(() => {
    const normalize = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const q = normalize(debouncedSearch);

    const levenshtein = (a: string, b: string): number => {
      if (!a.length) return b.length;
      if (!b.length) return a.length;
      const row = Array.from({ length: b.length + 1 }, (_, i) => i);
      for (let i = 1; i <= a.length; i++) {
        let prev = i;
        for (let j = 1; j <= b.length; j++) {
          const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], row[j], prev) + 1;
          row[j - 1] = prev;
          prev = val;
        }
        row[b.length] = prev;
      }
      return row[b.length];
    };

    const filtered = (users ?? []).filter((u) => {
      if (!q) return true;
      const first = normalize(u.firstname || '');
      const last  = normalize(u.lastname  || '');
      return first.includes(q) || last.includes(q) ||
             levenshtein(first, q) <= 2 || levenshtein(last, q) <= 2;
    });

    const getName = (u: User) => `${u.firstname || ''} ${u.lastname || ''}`.trim();
    switch (sort) {
      case 'YEAR_ASC':  return [...filtered].sort((a, b) => Number((a as any).graduated_year) - Number((b as any).graduated_year));
      case 'YEAR_DESC': return [...filtered].sort((a, b) => Number((b as any).graduated_year) - Number((a as any).graduated_year));
      case 'ALPHA_ASC': return [...filtered].sort((a, b) => getName(a).localeCompare(getName(b)));
      case 'ALPHA_DESC':return [...filtered].sort((a, b) => getName(b).localeCompare(getName(a)));
      case 'RATING':    return [...filtered].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      default:          return filtered;
    }
  }, [users, debouncedSearch, sort]);

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
                    onChange={(e) => setSearchValue(e.target.value.trim())}
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

        {isUsersLoading ? (
          <Spinner lang={lang} spinnerText={'Loading...'} size="lg" />
        ) : sortedUsers.length > 0 ? (
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
        ) : (
          <div className='flex flex-col justify-center items-center my-8'>
            <Image
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
