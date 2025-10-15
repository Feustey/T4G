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
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@t4g/service/data': require('path').resolve(__dirname, '../../libs/service/data/src'),
    };

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

  // Configuration pour Vercel
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
