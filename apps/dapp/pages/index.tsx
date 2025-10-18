import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LangType, LocaleType } from '../types';
import { Spinner } from '../components'; // Optionnel: pour un meilleur retour visuel
import { useAuth } from '../contexts/AuthContext';

export interface IPage {
  lang: LangType;
}

/**
 * Page d'accueil qui redirige les utilisateurs selon leur statut d'authentification et d'onboarding.
 * Affiche un spinner pendant la redirection.
 */
export function Page({ lang }: IPage) {
  const router = useRouter();
  const locale = router.locale as LocaleType;
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
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
  }, [router, locale, isAuthenticated, user]);

  return (
    <>
      <Head>
        <title>Token For Good</title>
        {/* Les balises meta sont conservées pour le référencement, même si la page est transitoire */}
        <meta name="description" content={lang.page.home.head.metaDesc} />
        <meta name="keywords" content={`${lang.utils.keywords}`} />
        <meta key="robots" name="robots" content="noindex,follow" />
        <meta
          property="og:image"
          content="https://app.token-for-good.com/social.png"
        />
        <meta property="og:title" content="Token For Good" />
        <meta
          property="og:description"
          content={lang.page.home.head.metaDesc}
        />
        {/* ... autres balises meta ... */}
      </Head>
      {/* Affiche un spinner pour indiquer à l'utilisateur qu'une action est en cours */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spinner lang={lang} spinnerText={lang.utils.redirecting} size="lg" />
      </div>
    </>
  );
}

export default Page;
