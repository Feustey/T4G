import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LangType } from '../types';
import { Spinner } from '../components';
import { useAuth } from '../contexts/AuthContext';

export interface IPage {
  lang: LangType;
}

/**
 * Page d'accueil :
 * - Redirige vers /landing/index.html pour les visiteurs non authentifiés
 * - Redirige les utilisateurs authentifiés vers dashboard ou onboarding
 */
export function Page({ lang }: IPage) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (loading) return;

    if (isAuthenticated && user) {
      // Utilisateur authentifié → redirection
      if (!user.is_onboarded) {
        // Première connexion → onboarding
        router.push('/onboarding');
      } else {
        // Utilisateur déjà onboardé → dashboard
        router.push('/dashboard');
      }
    } else {
      // Non authentifié → rediriger vers la page landing Next.js
      router.push('/landing');
    }
  }, [router, isAuthenticated, user, loading]);

  // Toujours afficher le spinner pendant le chargement ou la redirection
  return (
    <>
      <Head>
        <title>Token For Good</title>
        <meta name="description" content="Token for Good - Plateforme collaborative Web3" />
        <meta name="keywords" content="Token for Good, T4G, Web3, Bitcoin, Lightning Network" />
      </Head>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spinner lang={lang} spinnerText={lang?.utils?.redirecting || 'Chargement...'} size="lg" />
      </div>
    </>
  );
}

export default Page;
