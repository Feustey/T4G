import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import { LangType, LocaleType } from '../types';
import { Spinner } from '../components';
import { useAuth } from '../contexts/AuthContext';

export interface IPage {
  lang: LangType;
  htmlContent: string;
}

/**
 * Page d'accueil :
 * - Affiche la landing page pour les visiteurs non authentifiés
 * - Redirige les utilisateurs authentifiés vers dashboard ou onboarding
 */
export function Page({ lang, htmlContent }: IPage) {
  const router = useRouter();
  const locale = router.locale as LocaleType;
  const { user, isAuthenticated, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Attendre que le chargement soit terminé avant de rediriger
    if (loading) return;

    if (isAuthenticated && user) {
      // Utilisateur authentifié → préparer la redirection
      setShouldRedirect(true);
      
      if (!user.is_onboarded) {
        // Première connexion → onboarding
        router.push('/onboarding', '/onboarding', { locale });
      } else {
        // Utilisateur déjà onboardé → dashboard
        router.push('/dashboard', '/dashboard', { locale });
      }
    }
  }, [router, locale, isAuthenticated, user, loading]);

  // Afficher le spinner pendant le chargement ou la redirection
  if (loading || shouldRedirect) {
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

  // Afficher la landing page pour les visiteurs non authentifiés
  return (
    <>
      <Head>
        <title>Token for Good - Valorise les échanges dans la communauté des Grandes Ecoles</title>
        <meta name="description" content="Token for Good est la meilleure plateforme collaborative Web3 qui distribue des tokens au sein d'une communauté de Grande Ecole. Elle dynamise et valorise les contributions positives des communautés alumni et étudiantes." />
        <meta name="keywords" content="Token for Good, T4G, Web3, Bitcoin, Lightning Network, Alumni, Grande Ecole" />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </>
  );
}

export default Page;

export const getStaticProps: GetStaticProps = async () => {
  // Dans un monorepo Nx, process.cwd() pointe vers la racine du workspace
  // Nous devons construire le chemin correct vers apps/dapp/public/landing/index.html
  const isProduction = process.env.NODE_ENV === 'production';
  
  let filePath: string;
  
  if (isProduction) {
    // En production (Vercel), le répertoire de travail est déjà apps/dapp
    filePath = path.join(process.cwd(), 'public', 'landing', 'index.html');
  } else {
    // En développement, depuis la racine du monorepo
    const workspaceRoot = process.cwd();
    filePath = path.join(workspaceRoot, 'apps', 'dapp', 'public', 'landing', 'index.html');
  }
  
  // Vérifier si le fichier existe et utiliser le bon chemin
  if (!fs.existsSync(filePath)) {
    // Essayer l'autre chemin
    const altPath = path.join(process.cwd(), 'public', 'landing', 'index.html');
    if (fs.existsSync(altPath)) {
      filePath = altPath;
    } else {
      // Dernier essai : depuis apps/dapp
      filePath = path.join(process.cwd(), 'apps', 'dapp', 'public', 'landing', 'index.html');
    }
  }
  
  const htmlContent = fs.readFileSync(filePath, 'utf8');

  return {
    props: {
      htmlContent,
    },
  };
};
