import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { LangType } from '../types';
import { Spinner } from '../components';

export interface IPage {
  lang: LangType;
}

/**
 * Page d'accueil qui redirige les utilisateurs vers la page de login.
 * La redirection se fait côté serveur pour éviter les erreurs 500.
 */
export function Page({ lang }: IPage) {
  return (
    <>
      <Head>
        <title>Token For Good</title>
        <meta name="description" content={lang?.page?.home?.head?.metaDesc || 'Token For Good'} />
        <meta key="robots" name="robots" content="noindex,follow" />
        <meta
          property="og:image"
          content="https://app.token-for-good.com/social.png"
        />
        <meta property="og:title" content="Token For Good" />
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

/**
 * Redirection côté serveur pour éviter l'erreur 500 lors du SSR.
 * Les utilisateurs sont redirigés vers /login où la logique d'authentification est gérée.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  };
};

export default Page;
