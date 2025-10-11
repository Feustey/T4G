import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LangType, LocaleType } from '../types';
import { Spinner } from '../components'; // Optionnel: pour un meilleur retour visuel

export interface IPage {
  lang: LangType;
}

/**
 * Page d'accueil qui redirige immédiatement les utilisateurs vers le parcours d'onboarding.
 * Affiche un spinner pendant la redirection.
 */
export function Page({ lang }: IPage) {
  const router = useRouter();
  const locale = router.locale as LocaleType;

  useEffect(() => {
    // Redirige vers la page d'onboarding en conservant la locale actuelle.
    router.push('/onboarding', '/onboarding', { locale });
  }, [router, locale]);

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
