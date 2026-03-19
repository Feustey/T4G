import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ConnectedLayout from 'apps/dapp/layouts/ConnectedLayout';
import { Breadcrumb, Icons } from 'apps/dapp/components';
import { AuthPageType, LangType, UserCVType, UserExperienceType } from 'apps/dapp/types';
import { capitalise } from 'apps/dapp/services';
import { useAuth } from '../../contexts/AuthContext';
import { AppModal } from '../../lib/ui-layouts';
import useSwr from 'swr';
import { UserCard } from 'apps/dapp/components/connected/UserCard';
import { apiClient, User } from '../../services/apiClient';
import { Button } from 'apps/dapp/components';

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
  const router = useRouter();
  const { data: profile } = useSwr<User>(['user', userId], () => apiClient.getUser(userId));
  const { data: cv } = useSwr<UserCVType>(['user-cv', userId], () => apiClient.getUserCV(userId) as Promise<UserCVType>);

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
                  userRole={profile.role}
                  isMentorActive={profile.is_mentor_active}
                  isLink={false}
                  parent="directory"
                />
              </section>
              <section className="c-student-benefit-page__infos">
                {(profile.bio || (profile as { about?: string }).about) && (
                  <div>
                    <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin-b--m">
                      {Icons.chat} About {capitalise(profile.firstname)}
                    </h2>
                    <p>{((profile.bio || (profile as { about?: string }).about) ?? '').split('/splitAbout/')[0]}</p>
                  </div>
                )}

                {profile.is_mentor_active && (
                  <div className="u-margin-b--m">
                    <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin-b--m">
                      {Icons.sparkles} Mentor disponible
                    </h2>
                    {profile.mentor_bio && (
                      <p className="u-margin-b--s">{profile.mentor_bio}</p>
                    )}
                    {profile.mentor_topics && profile.mentor_topics.length > 0 && (
                      <div className="u-d--flex u-flex-wrap u-gap--xs u-margin-b--s">
                        {profile.mentor_topics.map((slug) => (
                          <span
                            key={slug}
                            style={{
                              padding: '4px 12px',
                              borderRadius: 999,
                              fontSize: 12,
                              background: 'var(--color-primary-light, #eff6ff)',
                              color: 'var(--color-primary, #2563eb)',
                            }}
                          >
                            {slug}
                          </span>
                        ))}
                      </div>
                    )}
                    <Button
                      variant="primary"
                      label="Demander une session de mentoring"
                      onClick={() => router.push(`/mentoring/find?mentor=${profile.id}`)}
                    />
                  </div>
                )}

                <div className="u-d--flex flex-wrap">
                  {(profile.role === "alumni" || profile.role === "mentor") && (
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
                            {profile.graduated_year}
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
ProfilePage.role = ['alumni', 'mentee', 'mentor', 'service_provider'];

export const getServerSideProps: GetServerSideProps = async function (context) {
  const userId = context.query.id as string;

  return {
    props: {
      userId,
      categoryName: 'Directory',
    },
  };
};

export default ProfilePage;
