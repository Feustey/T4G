import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LangType, LocaleType } from '../types';
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
  const locale = router.locale as LocaleType;
  const { user, isAuthenticated, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (loading) return;

    if (isAuthenticated && user) {
      // Utilisateur authentifié → redirection
      setRedirecting(true);
      
      if (!user.is_onboarded) {
        // Première connexion → onboarding
        router.push('/onboarding', '/onboarding', { locale });
      } else {
        // Utilisateur déjà onboardé → dashboard
        router.push('/dashboard', '/dashboard', { locale });
      }
    } else {
      // Non authentifié → rediriger vers la landing page statique
      setRedirecting(true);
      // Utiliser window.location pour servir le fichier HTML statique directement
      if (typeof window !== 'undefined') {
        window.location.href = '/landing/index.html';
      }
    }
  }, [router, locale, isAuthenticated, user, loading]);

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
