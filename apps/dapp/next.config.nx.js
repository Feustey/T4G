// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const backendApiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

const nextConfig = {
  nx: {
    svgr: false,
  },
  transpilePackages: ['@t4g/service/data'],
  experimental: {
    externalDir: true, // Permettre les imports depuis l'extérieur de l'app
  },
  webpack: (config, { isServer, defaultLoaders }) => {
    const path = require('path');
    const libsPath = path.resolve(__dirname, '../../libs');
    
    // Résolution des alias pour les librairies locales
    config.resolve.alias = {
      ...config.resolve.alias,
      '@t4g/service/data': path.resolve(__dirname, '../../libs/service/data/src'),
      '@t4g/ui/components': path.resolve(__dirname, '../../libs/ui/components/src'),
      '@t4g/ui/elements': path.resolve(__dirname, '../../libs/ui/elements/src'),
      '@t4g/ui/hooks': path.resolve(__dirname, '../../libs/ui/hooks/src'),
      '@t4g/ui/icons': path.resolve(__dirname, '../../libs/ui/icons/src'),
      '@t4g/ui/layouts': path.resolve(__dirname, '../../libs/ui/layouts/src'),
      '@t4g/ui/pages': path.resolve(__dirname, '../../libs/ui/pages/src'),
      '@t4g/ui/providers': path.resolve(__dirname, '../../libs/ui/providers/src'),
      '@t4g/service/blockchain': path.resolve(__dirname, '../../libs/service/blockchain/src'),
      '@t4g/service/middleware': path.resolve(__dirname, '../../libs/service/middleware/src'),
      '@t4g/service/services': path.resolve(__dirname, '../../libs/service/services/src'),
      '@t4g/service/smartcontracts': path.resolve(__dirname, '../../libs/service/smartcontracts/src'),
      '@t4g/service/users': path.resolve(__dirname, '../../libs/service/users/src'),
      '@t4g/types': path.resolve(__dirname, '../../libs/types/src'),
    };

    // Ajouter une règle pour traiter les fichiers TypeScript des libs
    // Trouver la règle oneOf de Next.js
    const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
    if (oneOfRule) {
      // Ajouter une règle spécifique pour les libs AVANT les autres règles
      // pour qu'elle soit appliquée en premier
      oneOfRule.oneOf.unshift({
        test: /\.(ts|tsx|js|jsx)$/,
        include: [libsPath],
        use: defaultLoaders.babel || defaultLoaders.swcLoader || {
          loader: 'next-swc-loader',
          options: {},
        },
      });
      
      // Modifier les règles existantes pour ne pas exclure les libs
      oneOfRule.oneOf.forEach((rule) => {
        if (rule.exclude) {
          if (typeof rule.exclude === 'function') {
            const originalExclude = rule.exclude;
            rule.exclude = (modulePath) => {
              // Ne pas exclure les libs
              if (modulePath && modulePath.includes(libsPath)) {
                return false;
              }
              return originalExclude ? originalExclude(modulePath) : false;
            };
          } else if (Array.isArray(rule.exclude)) {
            // Si c'est un tableau, on ne peut pas facilement modifier
            // mais la règle que nous avons ajoutée devrait prendre le dessus
          }
        }
      });
    }

    // Configuration webpack pour le backend Rust
    if (isServer) {
      // Plus de dépendances MongoDB à ignorer
    }

    return config;
  },
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'fr',
    localeDetection: false,
  },
  trailingSlash: true,

  // Configuration pour déploiement standalone
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Variables d'environnement
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    NEXT_PUBLIC_DAZNO_API_URL: process.env.NEXT_PUBLIC_DAZNO_API_URL || 'https://www.dazno.de/api',
    NEXT_PUBLIC_DAZNO_USERS_API_URL: process.env.NEXT_PUBLIC_DAZNO_USERS_API_URL || 'https://www.dazno.de/api',
  },

  // Headers pour CORS avec Dazno
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://www.dazno.de' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },

  // Redirections
  async redirects() {
    return [
      {
        source: '/',
        destination: '/fr',
        permanent: false,
      },
    ]
  },

  async rewrites() {
    return [
      // Servir les fichiers statiques de la landing page
      {
        source: '/landing/:path*',
        destination: '/landing/:path*',
      },
      {
        source: '/api/:path*',
        destination: `${backendApiBase}/:path*`,
      },
    ];
  },

  // Configuration images
  images: {
    domains: ['www.dazno.de', 'dazno.de', 'token4good.com'],
  },

  publicRuntimeConfig: {
    polygonScanUrl: process.env.POLYGONSCAN_BASEURL,
    updatesUrl: process.env.UPDATES_URL,
  },
};

module.exports = withNx(nextConfig);
