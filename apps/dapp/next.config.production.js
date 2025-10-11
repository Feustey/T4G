// Configuration Next.js optimisée pour la production Vercel
// ========================================================

const { withSentryConfig } = require('@sentry/nextjs');

/**
 * Configuration Next.js pour Token4Good RGB v2
 * Optimisée pour Vercel avec intégration Dazno
 */
const nextConfig = {
  // Configuration de base
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  
  // Internationalisation
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'fr',
    localeDetection: false, // Désactiver pour éviter les problèmes de build
  },
  
  // Trailing slash pour compatibilité
  trailingSlash: true,

  // Variables d'environnement publiques
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_DAZNO_API_URL: process.env.NEXT_PUBLIC_DAZNO_API_URL,
    NEXT_PUBLIC_DAZNO_USERS_API_URL: process.env.NEXT_PUBLIC_DAZNO_USERS_API_URL,
  },

  // Configuration des images
  images: {
    domains: [
      'dazno.de', 
      'api.dazno.de', 
      'token4good.com',
      'token4good.vercel.app'
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers pour CORS et sécurité
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
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
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

  // Configuration Webpack pour éviter les erreurs de compilation
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ignorer les modules problématiques en production
    if (!dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Éviter les imports MongoDB/DAO en frontend
        '@t4g/service/data': false,
      };
    }

    // Optimisations pour la production
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      };
    }

    return config;
  },

  // Configuration Sentry
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
  },

  // Configuration expérimentale
  experimental: {
    // Optimisations modernes
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Configuration du compilateur
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configuration TypeScript
  typescript: {
    // Ignorer les erreurs TypeScript en production (temporaire)
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  // Configuration ESLint
  eslint: {
    // Ignorer ESLint pendant le build
    ignoreDuringBuilds: true,
  },

  // Configuration runtime publique
  publicRuntimeConfig: {
    polygonScanUrl: process.env.POLYGONSCAN_BASEURL,
    updatesUrl: process.env.UPDATES_URL,
  },
};

// Configuration Sentry pour la production
const sentryWebpackPluginOptions = {
  silent: true,
  hideSourceMaps: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

// Export avec ou sans Sentry selon l'environnement
module.exports = process.env.SENTRY_AUTH_TOKEN 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;