// next.config.js - Configuration unifiée Token4Good v2
// Fusion de next.config.js, next.config.production.js et next.config.nx.js
const { withSentryConfig } = require('@sentry/nextjs');
const withNx = require('@nrwl/next/plugins/with-nx');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration Nx
  nx: {
    svgr: false,
  },
  
  // Configuration de base
  reactStrictMode: true,
  swcMinify: true,
  
  // Transpile les packages du monorepo
  transpilePackages: ['@t4g/service/data'],
  
  // Configuration expérimentale pour les répertoires externes
  experimental: {
    externalDir: true, // Permettre les imports depuis l'extérieur de l'app
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Configuration Webpack pour le monorepo
  webpack: (config, { isServer, defaultLoaders, dev, webpack }) => {
    const path = require('path');
    const libsPath = path.resolve(__dirname, '../../libs');
    
    // Fix pour les modules Node.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    // Résolution des alias pour les librairies locales
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
      'apps/dapp': path.resolve(__dirname, '.'),
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
    const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
    if (oneOfRule) {
      // Ajouter une règle spécifique pour les libs AVANT les autres règles
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
          }
        }
      });
    }

    // Optimisations pour la production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },
  
  // Internationalisation
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'fr',
    localeDetection: false,
  },
  
  // Trailing slash pour compatibilité
  trailingSlash: true,
  
  // Variables d'environnement publiques avec fallbacks
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_DAZNO_API_URL: process.env.NEXT_PUBLIC_DAZNO_API_URL || 'https://www.dazno.de/api',
    NEXT_PUBLIC_DAZNO_USERS_API_URL: process.env.NEXT_PUBLIC_DAZNO_USERS_API_URL || 'https://www.dazno.de/api',
    NEXT_PUBLIC_DAZNO_VERIFY_URL: process.env.NEXT_PUBLIC_DAZNO_VERIFY_URL || 'https://www.dazno.de/api/verify',
  },
  
  // Configuration des images
  images: {
    domains: [
      'dazno.de',
      'www.dazno.de',
      'api.dazno.de',
      'token4good.com',
      't4g.dazno.de',
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
          { key: 'Access-Control-Allow-Origin', value: 'https://t4g.dazno.de' },
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
    ];
  },
  
  // Redirections
  async redirects() {
    return [
      {
        source: '/',
        destination: '/fr',
        permanent: false,
      },
    ];
  },
  
  // Rewrites pour le backend Rust et landing page
  async rewrites() {
    const backendApiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
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
  
  // Configuration TypeScript
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // Configuration ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuration du compilateur
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
  dryRun: !process.env.SENTRY_AUTH_TOKEN, // Ne pas uploader si pas de token
};

// Export avec Nx et optionnellement Sentry
const configWithNx = withNx(nextConfig);
module.exports = process.env.SENTRY_AUTH_TOKEN 
  ? withSentryConfig(configWithNx, sentryWebpackPluginOptions)
  : configWithNx;
