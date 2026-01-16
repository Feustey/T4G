import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LangType, LocaleType } from '../types';
import { Spinner } from '../components';
import { useAuth } from '../contexts/AuthContext';

export interface IPage {
  lang: LangType;
}

/**
 * Page d'accueil qui redirige les utilisateurs selon leur statut d'authentification et d'onboarding.
 * Affiche un spinner pendant la redirection.
 * Note: Le SSR est géré par AuthContext qui vérifie typeof window !== 'undefined'
 */
export function Page({ lang }: IPage) {
  const router = useRouter();
  const locale = router.locale as LocaleType;
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Attendre que le chargement soit terminé avant de rediriger
    if (loading) return;

    if (isAuthenticated && user) {
      // Utilisateur authentifié
      if (!user.is_onboarded) {
        // Première connexion → onboarding
        router.push('/onboarding', '/onboarding', { locale });
      } else {
        // Utilisateur déjà onboardé → dashboard
        router.push('/dashboard', '/dashboard', { locale });
      }
    } else {
      // Non authentifié → login
      router.push('/login', '/login', { locale });
    }
  }, [router, locale, isAuthenticated, user, loading]);

  return (
    <>
      <Head>
        <title>Token For Good</title>
        <meta name="description" content={lang?.page?.home?.head?.metaDesc || 'Token For Good'} />
        <meta name="keywords" content={lang?.utils?.keywords || 'Token For Good'} />
        <meta key="robots" name="robots" content="noindex,follow" />
        <meta
          property="og:image"
          content="https://app.token-for-good.com/social.png"
        />
        <meta property="og:title" content="Token For Good" />
        <meta
          property="og:description"
          content={lang?.page?.home?.head?.metaDesc || 'Token For Good'}
        />
      </Head>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spinner lang={lang} spinnerText={lang?.utils?.redirecting || 'Redirection...'} size="lg" />
      </div>
    </>
  );
}

export default Page;
