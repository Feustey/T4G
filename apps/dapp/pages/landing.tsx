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
    // Chemin alternatif pour Nx monorepo
    path.join(process.cwd(), '..', '..', 'apps', 'dapp', 'public', 'landing', 'index.html'),
  ];

  let htmlContent = '';
  let fileFound = false;
  const testedPaths: string[] = [];

  for (const filePath of possiblePaths) {
    try {
      testedPaths.push(filePath);
      if (fs.existsSync(filePath)) {
        htmlContent = fs.readFileSync(filePath, 'utf8');
        fileFound = true;
        console.log(`✅ Landing page trouvée à : ${filePath}`);
        break;
      }
    } catch (error) {
      console.log(`❌ Erreur lors de la lecture du chemin : ${filePath}`, error);
    }
  }

  if (!fileFound) {
    console.error('❌ Fichier landing/index.html introuvable dans aucun des chemins testés:');
    console.error(testedPaths.join('\n'));
    console.error('Current working directory:', process.cwd());
    
    // Retourner une page d'erreur simple au lieu de throw
    return {
      props: {
        htmlContent: `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Token for Good</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 2rem;
              }
              h1 {
                font-size: 2.5rem;
                margin-bottom: 1rem;
              }
              a {
                color: white;
                text-decoration: underline;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Token for Good</h1>
              <p>Plateforme collaborative Web3</p>
              <p><a href="/login">Se connecter</a></p>
            </div>
          </body>
          </html>
        `,
      },
    };
  }

  return {
    props: {
      htmlContent,
    },
  };
};
