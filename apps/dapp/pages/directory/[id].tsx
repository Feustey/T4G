import { GetServerSideProps } from 'next';
import Head from 'next/head';
import ConnectedLayout from 'apps/dapp/layouts/ConnectedLayout';
import {
  AlumniBenefitPage,
  Breadcrumb,
  Icons,
  StudentBenefitPage,
} from 'apps/dapp/components';
import {
  AuthPageType,
  LangType,
  SessionType,
  UserCVType,
  UserExperienceType,
} from 'apps/dapp/types';
import { capitalise } from 'apps/dapp/services';
import { useAuth } from '../../contexts/AuthContext';
import { AppModal } from 'libs/ui/layouts/src/lib/AppLayout/AppModal';
import useSwr from 'swr';
import { UserCard } from 'apps/dapp/components/connected/UserCard';
import { apiFetcher } from 'apps/dapp/services/config';
import { User } from 'libs/types/src/lib/api/index.types';

interface IProfilePage {
  lang: LangType;
  categoryName: string;
  userId: string;
}

export function ProfilePage({
  lang,
  categoryName,
  userId,
}: IProfilePage & AuthPageType) {
  const { user } = useAuth();
  const { data: profile } = useSwr<User>(`/users/${userId}`, apiFetcher);
  const { data: cv } = useSwr<UserCVType>(
    `/users/${userId}/cv`,
    apiFetcher
  );

  return (
    <>
      {profile&& cv && (
        <>
          <Head>
            <title>
              {capitalise(profile.firstname.toLowerCase())}{' '}
              {capitalise(profile.lastname.toLowerCase())} - T4G
            </title>
          </Head>
          <ConnectedLayout user={user} lang={lang} classNameCSS="o-benefits">
            <Breadcrumb
              links={[
                {
                  text: lang.components.breadcrumb.dashboard.label,
                  link: '/dashboard',
                },
                {
                  text: 'Directory',
                  link: '/directory',
                  parent: true,
                },
                {
                  text:
                    capitalise(profile.firstname.toLowerCase()) +
                    ' ' +
                    capitalise(profile.lastname.toLowerCase()),
                },
              ]}
            />
            <div className="u-d--flex u-r-gap--md u-c-gap--md u-flex-wrap">
              <section className="c-student-benefit-page__booking">
                <UserCard
                  categorieName={categoryName}
                  userId={profile.id}
                  userRole={user.role}
                  isLink={false}
                  parent="directory"
                />
              </section>
              <section className="c-student-benefit-page__infos">
                {profile.about && (
                  <div>
                    <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin-b--m">
                      {' '}
                      {Icons.chat} About {capitalise(profile.firstname)}
                    </h2>
                    <p>{profile.about.split('/splitAbout/')[0]}</p>
                  </div>
                )}

                <div className="u-d--flex flex-wrap">
                  {profile.role === "ALUMNI" && (
                    <>
                      <div className="w-full lg:w-1/2 lg:pr-14">
                        <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin-b--m">
                          {' '}
                          {Icons.briefcase} Professional Experience
                        </h2>
                        <ul
                          role="list"
                          className="u-d--flex u-flex-column u-gap--m"
                        >
                          {cv.experiences?.map(
                            (xp: UserExperienceType, index: number) => {
                              return (
                                <li key={index}>
                                  <p className="u-margin--none u-text--bold">
                                    {capitalise(xp.title)} <br />{' '}
                                    {capitalise(xp.company)}
                                  </p>
                                  <p className="u-margin--none">
                                    {typeof xp?.from == 'string' ? (
                                      <>
                                        {
                                          new Date(xp?.from)
                                            .toDateString()
                                            .split(' ')[1]
                                        }{' '}
                                        {
                                          new Date(xp?.from)
                                            .toDateString()
                                            .split(' ')[3]
                                        }
                                      </>
                                    ) : (
                                      <>{xp?.from}</>
                                    )}
                                    {' - '}
                                    {xp?.isCurrent ? (
                                      'Now'
                                    ) : xp?.to ? (
                                      <>
                                        {typeof xp?.to != 'string' ? (
                                          <>
                                            {
                                              new Date(xp?.to)
                                                .toDateString()
                                                .split(' ')[1]
                                            }{' '}
                                            {
                                              new Date(xp?.to)
                                                .toDateString()
                                                .split(' ')[3]
                                            }
                                          </>
                                        ) : (
                                          <>{xp?.to}</>
                                        )}
                                      </>
                                    ) : (
                                      'Now'
                                    )}
                                  </p>
                                  <p className="u-margin--none">
                                    {xp.city ? `${capitalise(xp?.city)}, ` : ''}
                                    {capitalise(xp.country)}
                                  </p>
                                  {xp.industry && (
                                    <p className="u-margin--none text-blue-007">
                                      {capitalise(xp.industry)}{' '}
                                    </p>
                                  )}
                                </li>
                              );
                            }
                          )}
                        </ul>
                      </div>
                    </>
                  )}
                      <div className="w-full lg:w-1/2 lg:pr-14">
                        <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin-b--m">
                          {' '}
                          {Icons.academicCap} Formations
                        </h2>

                        <div>
                          <p className="u-margin--none u-text--bold">
                            {profile.program}
                          </p>
                          <p className="u-margin--none">
                            {profile.graduatedYear}
                          </p>
                        </div>
                      </div>
                </div>
              </section>
            </div>
            <AppModal />
          </ConnectedLayout>
        </>
      )}
    </>
  );
}

ProfilePage.auth = true;
ProfilePage.role = ['ALUMNI', 'STUDENT'];

export const getServerSideProps: GetServerSideProps = async function (context) {
  const userId = context.query.id as string;

  return {
    props: {
      userId,
    },
  };
};

export default ProfilePage;
