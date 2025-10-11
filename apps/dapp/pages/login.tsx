import { getProviders, signIn } from 'next-auth/react';
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

export interface IPage {
  lang: LangType;
}

export function Page({ lang }: IPage) {
  const router = useRouter();
  const locale = router.locale as LocaleType;

  const [debugButtonsVisible, setDebugButtonsVisible] =
    useState<boolean>(false);
  const [isDazenoUser, setIsDazenoUser] = useState<boolean>(false);
  const [isCheckingDazeno, setIsCheckingDazeno] = useState<boolean>(false);

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
          // Auto-login avec le token Dazno
          await signIn('dazeno', { 
            token: daznoSession.token,
            callbackUrl: `/${locale}/onboarding` 
          });
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
  }, [router.query.debug, locale]);

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
                  onClick={(e) => {
                    e.preventDefault();
                    signIn('daznode', { callbackUrl: `/${locale}/onboarding` });
                  }}
                />
                <Button
                  label={'Login with LinkedIn'}
                  variant="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    signIn('linkedin', { callbackUrl: `/onboarding` });
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
                onClick={(e) => {
                  e.preventDefault();
                  signIn('custom', {
                    username: 'admin',
                    callbackUrl: `/${locale}/onboarding`,
                  });
                }}
              />
              <Button
                label={'Login as alumni'}
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  signIn('custom', {
                    username: 'alumni',
                    callbackUrl: `/${locale}/onboarding`,
                  });
                }}
              />
              <Button
                label={'Login as student'}
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  signIn('custom', {
                    username: 'student',
                    callbackUrl: `/${locale}/onboarding`,
                  });
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
