import { GetStaticProps } from 'next';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';

interface LandingPageProps {
  htmlContent: string;
}

export default function LandingPage({ htmlContent }: LandingPageProps) {
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

export const getStaticProps: GetStaticProps = async () => {
  // Essayer différents chemins pour trouver le fichier
  const possiblePaths = [
    // En production Vercel (depuis apps/dapp)
    path.join(process.cwd(), 'public', 'landing', 'index.html'),
    // En développement local depuis la racine du monorepo
    path.join(process.cwd(), 'apps', 'dapp', 'public', 'landing', 'index.html'),
    // Chemin absolu depuis __dirname
    path.join(__dirname, '..', '..', 'public', 'landing', 'index.html'),
  ];

  let htmlContent = '';
  let fileFound = false;

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        htmlContent = fs.readFileSync(filePath, 'utf8');
        fileFound = true;
        console.log(`✅ Landing page trouvée à : ${filePath}`);
        break;
      }
    } catch (error) {
      console.log(`❌ Chemin non trouvé : ${filePath}`);
    }
  }

  if (!fileFound) {
    console.error('❌ Fichier landing/index.html introuvable dans aucun des chemins testés');
    throw new Error('Landing page HTML file not found');
  }

  return {
    props: {
      htmlContent,
    },
  };
}
