import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { LangType } from '../types';
import { Spinner } from '../components';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from './landing';

export interface IPage {
  lang: LangType;
}

/**
 * Page d'accueil :
 * - Visiteurs non authentifiés : affiche la landing directement (pas de redirection)
 * - Utilisateurs authentifiés : redirection vers dashboard ou onboarding
 */
export function Page({ lang }: IPage) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && user) {
      if (!user.is_onboarded) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  }, [router, isAuthenticated, user, loading]);

  // Utilisateur authentifié en cours de redirection → spinner
  if (loading || (isAuthenticated && user)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner lang={lang} spinnerText={(lang?.utils as { redirecting?: string })?.redirecting || 'Chargement...'} size="lg" />
      </div>
    );
  }

  // Non authentifié → afficher la landing directement
  return <LandingPage />;
}

export default Page;
