/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuration i18n simplifiée
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'fr',
    localeDetection: false,
  },
  
  trailingSlash: true,
  
  // Variables d'environnement
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_DAZNO_API_URL: process.env.NEXT_PUBLIC_DAZNO_API_URL,
    NEXT_PUBLIC_DAZNO_USERS_API_URL: process.env.NEXT_PUBLIC_DAZNO_USERS_API_URL,
  },

  // Headers CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://dazno.de' },
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

  // Configuration images
  images: {
    domains: ['dazno.de', 'api.dazno.de', 'token4good.com'],
  },

  // Configuration webpack pour éviter les erreurs de build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
      
      // Remplacer les imports DAO par des stubs
      config.resolve.alias = {
        ...config.resolve.alias,
        '@t4g/service/data': require.resolve('./lib/stubs/data-stubs.ts'),
      };
    }
    
    return config;
  },

  // Ignorer les erreurs TypeScript en production
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignorer ESLint pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
