import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ConnectedLayout from '../../layouts/ConnectedLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useIndexing } from '../../hooks';
import { Breadcrumb, Button, Icons } from '../../components';
import { AuthPageType, LangType } from '../../types';

interface IPage {
  lang: LangType;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const Page: React.FC<IPage> & AuthPageType = ({ lang }: IPage) => {
  const { user } = useAuth();
  const router = useRouter();

  const showMentorPath = user?.is_mentor_active === true;
  const showMenteePath =
    user?.role === 'mentee' ||
    (user?.learning_topics && user.learning_topics.length > 0);

  const topicLabels = user?.mentor_topics?.slice(0, 3) ?? [];

  return (
    <>
      <Head>
        <title>Mentoring — Token4Good</title>
        {useIndexing(false)}
      </Head>

      <ConnectedLayout user={user} lang={lang}>
        <Breadcrumb
          links={[
            { text: 'Dashboard', link: '/dashboard', parent: true },
            { text: 'Mentoring' },
          ]}
        />

        <h1 className="u-d--flex u-align-items-center u-gap--s heading-2">
          <span className="c-icon--title u-margin--none">{Icons.sparkles}</span>
          Mentoring
        </h1>

        <p style={{ color: 'var(--color-text-secondary, #64748b)', marginTop: 0 }}>
          Partage ton expertise ou trouve un accompagnement sur les sujets Bitcoin &amp; Lightning.
        </p>

        <div
          className="o-layout--grid--auto"
          style={{ '--grid-min-size': '300px', '--grid-gap': '1.5rem' } as React.CSSProperties}
        >
          {/* --- Chemin Mentor --- */}
          <div
            className="o-card u-d--flex u-flex-column u-gap--m"
            style={{
              borderTop: '4px solid var(--app-token-color, #f59e0b)',
              opacity: showMentorPath ? 1 : 0.55,
            }}
          >
            <div className="u-d--flex u-align-items-center u-gap--s">
              <span style={{ fontSize: 32 }}>✦</span>
              <div>
                <p className="u-margin--none" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  Transmettre
                </p>
                <p className="u-margin--none" style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
                  Propose des sessions de mentoring
                </p>
              </div>
            </div>

            {showMentorPath ? (
              <>
                {topicLabels.length > 0 && (
                  <div className="u-d--flex flex-wrap u-gap--xs">
                    {topicLabels.map((slug) => (
                      <span
                        key={slug}
                        style={{
                          background: 'var(--app-token-color-light, #fef3c7)',
                          color: 'var(--app-token-color-dark, #92400e)',
                          borderRadius: '999px',
                          fontSize: 12,
                          padding: '2px 10px',
                          fontWeight: 500,
                        }}
                      >
                        {slug}
                      </span>
                    ))}
                    {(user?.mentor_topics?.length ?? 0) > 3 && (
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        +{(user?.mentor_topics?.length ?? 0) - 3} autres
                      </span>
                    )}
                  </div>
                )}
                <Button
                  variant="primary"
                  className="u-width--fill u-margin-t--auto"
                  onClick={() => router.push('/mentoring/offer/new')}
                  label="Proposer une session"
                />
                <Button
                  variant="ghost"
                  className="u-width--fill"
                  onClick={() => router.push('/mentoring/my-sessions?role=mentor')}
                  label="Mes sessions en cours"
                />
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>
                  Active ton profil mentor et indique les thèmes sur lesquels tu peux aider.
                </p>
                <Button
                  variant="secondary"
                  className="u-width--fill u-margin-t--auto"
                  onClick={() => router.push('/profile#mentor')}
                  label="Activer mon profil mentor"
                />
              </>
            )}
          </div>

          {/* --- Chemin Mentee --- */}
          <div
            className="o-card u-d--flex u-flex-column u-gap--m"
            style={{
              borderTop: '4px solid var(--app-comunity-color, #6366f1)',
              opacity: showMenteePath ? 1 : 0.55,
            }}
          >
            <div className="u-d--flex u-align-items-center u-gap--s">
              <span style={{ fontSize: 32 }}>🎓</span>
              <div>
                <p className="u-margin--none" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  Apprendre
                </p>
                <p className="u-margin--none" style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
                  Trouve un mentor sur un sujet précis
                </p>
              </div>
            </div>

            {showMenteePath ? (
              <>
                {(user?.learning_topics?.length ?? 0) > 0 && (
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>
                      Tes thèmes d&apos;apprentissage :
                    </p>
                    <div className="u-d--flex flex-wrap u-gap--xs">
                      {user.learning_topics.slice(0, 3).map((slug) => (
                        <span
                          key={slug}
                          style={{
                            background: 'var(--color-primary-light, #eff6ff)',
                            color: 'var(--color-primary, #2563eb)',
                            borderRadius: '999px',
                            fontSize: 12,
                            padding: '2px 10px',
                            fontWeight: 500,
                          }}
                        >
                          {slug}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  variant="primary"
                  className="u-width--fill u-margin-t--auto"
                  onClick={() => router.push('/mentoring/find')}
                  label="Trouver un mentor"
                />
                <Button
                  variant="ghost"
                  className="u-width--fill"
                  onClick={() => router.push('/mentoring/my-sessions?role=mentee')}
                  label="Mes sessions planifiées"
                />
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary, #64748b)', margin: 0 }}>
                  Indique les thèmes que tu veux apprendre pour voir les mentors disponibles.
                </p>
                <Button
                  variant="secondary"
                  className="u-width--fill u-margin-t--auto"
                  onClick={() => router.push('/profile#learning')}
                  label="Configurer mes thèmes"
                />
              </>
            )}
          </div>
        </div>

        {/* --- Stats communauté --- */}
        <div
          className="o-card u-d--flex u-flex-column u-gap--s"
          style={{ marginTop: '1.5rem', background: 'var(--color-surface-secondary, #f8fafc)' }}
        >
          <p className="u-margin--none" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            La communauté Token4Good
          </p>
          <p className="u-margin--none" style={{ fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}>
            Des membres experts sur le Lightning Network, DazBox, Bitcoin et plus encore.
            Chaque session génère une preuve RGB immuable et des tokens T4G.
          </p>
          <Button
            variant="ghost"
            onClick={() => router.push('/community')}
            label="Voir la communauté"
          />
        </div>
      </ConnectedLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['alumni', 'mentee', 'mentor', 'service_provider'];

export const getServerSideProps = () => ({ props: {} });
