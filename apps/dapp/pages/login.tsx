import React, { useEffect, useState } from 'react';
import * as process from 'process';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LangType, LocaleType } from '../types';
import PublicLayout from '../layouts/PublicLayout';
import { useIndexing, useOAuth } from '../hooks';
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
  const { loginWithLinkedIn, loginWithDazno } = useOAuth();

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

    // Vérifier la session Dazno (uniquement si pas en local)
    const checkDazno = async () => {
      // Ne pas vérifier Dazno en développement local
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          setIsCheckingDazeno(false);
          return;
        }
      }

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
    console.log('🔵 useEffect redirection - isAuthenticated:', isAuthenticated, 'user:', user);
    if (isAuthenticated && user) {
      console.log('🔵 Utilisateur authentifié, is_onboarded:', user.is_onboarded);
      // Rediriger selon le statut d'onboarding
      // Si is_onboarded est true, aller au dashboard
      // Sinon (false ou undefined), aller vers onboarding-simple
      if (user.is_onboarded === true) {
        console.log('🔵 Redirection vers dashboard');
        router.push(`/${locale}/`); // Dashboard
      } else {
        console.log('🔵 Redirection vers onboarding-simple (is_onboarded:', user.is_onboarded, ')');
        router.push(`/${locale}/onboarding-simple`);
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
                      // Utiliser le hook useOAuth pour Dazno
                      await loginWithDazno();
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
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLoggingIn(true);
                    try {
                      // Utiliser le hook useOAuth pour LinkedIn
                      loginWithLinkedIn();
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
                      email: `test.admin.${Date.now()}@token-for-good.com`,
                      password: 'admin',
                    });
                    router.push(`/${locale}/onboarding`);
                  } catch (error) {
                    console.error('Erreur login admin:', error);
                    const message = error instanceof Error ? error.message : 'Erreur de connexion';
                    alert(message);
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
                      email: `test.alumni.${Date.now()}@token-for-good.com`,
                      password: 'alumni',
                    });
                    router.push(`/${locale}/onboarding`);
                  } catch (error) {
                    console.error('Erreur login alumni:', error);
                    const message = error instanceof Error ? error.message : 'Erreur de connexion';
                    alert(message);
                    setIsLoggingIn(false);
                  }
                }}
              />
              <Button
                label={'Login as student'}
                variant="secondary"
                onClick={async (e) => {
                  alert('Bouton cliqué ! Vérifiez la console du navigateur (F12)');
                  console.log('🔵 Bouton student cliqué');
                  e.preventDefault();
                  setIsLoggingIn(true);
                  try {
                    console.log('🔵 Appel de login...');
                    const email = `test.student.${Date.now()}@token-for-good.com`;
                    console.log('🔵 Email:', email);
                    await login('custom', {
                      email: email,
                      password: 'student',
                    });
                    console.log('🔵 Login réussi !');
                    console.log('🔵 Tentative de redirection manuelle vers onboarding-simple...');
                    await router.push(`/${locale}/onboarding-simple`);
                    console.log('🔵 Redirection manuelle effectuée');
                    alert('Login réussi ! Redirection vers onboarding...');
                  } catch (error) {
                    console.error('🔴 Erreur login student:', error);
                    const message = error instanceof Error ? error.message : 'Erreur de connexion';
                    alert('ERREUR: ' + message);
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
