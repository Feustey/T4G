import React, { useEffect, useState } from 'react';
import * as process from 'process';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LangType, LocaleType } from '../types';
import PublicLayout from '../layouts/PublicLayout';
import { useIndexing } from '../hooks';
import { GetServerSideProps } from 'next';
import OnboardingLayout from '../layouts/OnboardingLayout';
import { Button } from '../components';
import { checkDaznoSession } from '../utils/dazeno-auth';
import { useAuth } from '../contexts/AuthContext';

export interface IPage {
  lang: LangType;
}

export function Page({ lang }: IPage) {
  const router = useRouter();
  const locale = router.locale as LocaleType;
  const { login, isAuthenticated, user } = useAuth();

  const [debugButtonsVisible, setDebugButtonsVisible] =
    useState<boolean>(false);
  const [isDazenoUser, setIsDazenoUser] = useState<boolean>(false);
  const [isCheckingDazeno, setIsCheckingDazeno] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  useEffect(() => {
    if (process.env.NEXTAUTH_URL !== 'token-for-good.com') {
      setDebugButtonsVisible(
        process.env.NODE_ENV === 'development' ||
          router.query.debug != undefined
      );
    } else {
      setDebugButtonsVisible(false);
    }

    // Vérifier la session Dazno
    const checkDazno = async () => {
      setIsCheckingDazeno(true);
      try {
        const daznoSession = await checkDaznoSession();
        
        if (daznoSession.authenticated && daznoSession.token) {
          // Auto-login avec le token Dazno via le nouveau système JWT
          await login('dazno', { token: daznoSession.token });
          // La redirection sera gérée par le useEffect ci-dessous
        } else if (daznoSession.authenticated) {
          setIsDazenoUser(true);
        }
      } catch (error) {
        console.error('Erreur vérification Dazno:', error);
      } finally {
        setIsCheckingDazeno(false);
      }
    };

    checkDazno();
  }, [router.query.debug, locale, login]);

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated && user) {
      // Rediriger selon le statut d'onboarding
      if (user.is_onboarded) {
        router.push(`/${locale}/`); // Dashboard
      } else {
        router.push(`/${locale}/onboarding`);
      }
    }
  }, [isAuthenticated, user, locale, router]);

  // const debugButtonsVisible = (router.query.debug != undefined) || (process.env.NODE_ENV === "development");
  if (typeof window !== 'undefined') {
    const url = new URLSearchParams(window.location.search).get('callbackUrl');
    if (url) {
      window.location.href = url;
    }
  }

  return (
    <>
      <Head>
        <title>{lang.page.user.login.head.title}</title>
        {useIndexing(false)}
      </Head>
      <OnboardingLayout lang={lang}>
        <div className="e-page-layout h-[60vh]">
          <div className="flex flex-wrap justify-center gap-8 items-center h-full w-full">
            {isCheckingDazeno ? (
              <div className="text-center">
                <p>Vérification de la session Dazno...</p>
              </div>
            ) : isDazenoUser ? (
              <div className="text-center">
                <p className="mb-4">Vous êtes déjà connecté via Dazno.de</p>
                <p>Redirection en cours...</p>
              </div>
            ) : (
              <>
                <Button
                  label={'Login with Daznode'}
                  variant="primary"
                  disabled={isLoggingIn}
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsLoggingIn(true);
                    try {
                      // Rediriger vers OAuth Dazno (à implémenter côté backend)
                      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/dazno/authorize?redirect=${encodeURIComponent(window.location.origin + `/${locale}/login`)}`;
                    } catch (error) {
                      console.error('Erreur login Dazno:', error);
                      setIsLoggingIn(false);
                    }
                  }}
                />
                <Button
                  label={'Login with LinkedIn'}
                  variant="primary"
                  disabled={isLoggingIn}
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsLoggingIn(true);
                    try {
                      // Rediriger vers OAuth LinkedIn (à implémenter côté backend)
                      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/linkedin/authorize?redirect=${encodeURIComponent(window.location.origin + `/onboarding`)}`;
                    } catch (error) {
                      console.error('Erreur login LinkedIn:', error);
                      setIsLoggingIn(false);
                    }
                  }}
                />
              </>
            )}
          </div>

          {debugButtonsVisible && (
            <div
              style={{
                position: 'fixed',
                bottom: 100,
                right: 24,
                zIndex: 999,
              }}
            >
              <Button
                label={'Login as admin'}
                variant="secondary"
                onClick={async (e) => {
                  e.preventDefault();
                  setIsLoggingIn(true);
                  try {
                    await login('custom', {
                      email: 'admin@token-for-good.com',
                      password: 'admin',
                    });
                    router.push(`/${locale}/onboarding`);
                  } catch (error) {
                    console.error('Erreur login admin:', error);
                    alert('Erreur de connexion');
                    setIsLoggingIn(false);
                  }
                }}
              />
              <Button
                label={'Login as alumni'}
                variant="secondary"
                onClick={async (e) => {
                  e.preventDefault();
                  setIsLoggingIn(true);
                  try {
                    await login('custom', {
                      email: 'alumni@token-for-good.com',
                      password: 'alumni',
                    });
                    router.push(`/${locale}/onboarding`);
                  } catch (error) {
                    console.error('Erreur login alumni:', error);
                    alert('Erreur de connexion');
                    setIsLoggingIn(false);
                  }
                }}
              />
              <Button
                label={'Login as student'}
                variant="secondary"
                onClick={async (e) => {
                  e.preventDefault();
                  setIsLoggingIn(true);
                  try {
                    await login('custom', {
                      email: 'student@token-for-good.com',
                      password: 'student',
                    });
                    // La redirection sera gérée par le useEffect
                  } catch (error) {
                    console.error('Erreur login student:', error);
                    alert('Erreur de connexion');
                    setIsLoggingIn(false);
                  }
                }}
              />
            </div>
          )}
        </div>
      </OnboardingLayout>
    </>
  );
}

export default Page;

export const getServerSideProps: GetServerSideProps = async function (context) {
  const { callbackUrl } = context.query;
  console.log(callbackUrl);

  return {
    props: {},
  };
};
