// next.config.js - Configuration unifiée Token4Good v2
// Fusion de next.config.js, next.config.production.js et next.config.nx.js
const { withSentryConfig } = require('@sentry/nextjs');

// Nx optionnel - uniquement en développement local
let withNx;
try {
  withNx = require('@nrwl/next/plugins/with-nx');
} catch {
  // Fallback sans Nx pour Vercel
  withNx = (config) => config;
}

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
    scrollRestoration: true,
  },
  
  // Configuration Webpack pour le monorepo
  webpack: (config, { isServer, defaultLoaders, dev, webpack }) => {
    const path = require('path');
    const libsPath = path.resolve(__dirname, '../../libs');
    
    // Fix pour les modules Node.js (côté client uniquement)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      ...(isServer ? {} : { crypto: false }), // crypto uniquement côté client
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
  // Note: NEXT_PUBLIC_API_URL n'est pas ici pour éviter d'injecter 'http://localhost:3000'
  // dans le bundle Vercel si la variable n'est pas configurée.
  // Le fallback est dans apiClient.ts : 'https://apirust-production.up.railway.app'
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_DAZNO_API_URL: process.env.NEXT_PUBLIC_DAZNO_API_URL || 'https://www.token-for-good.com/api',
    NEXT_PUBLIC_DAZNO_USERS_API_URL: process.env.NEXT_PUBLIC_DAZNO_USERS_API_URL || 'https://www.token-for-good.com/api',
    NEXT_PUBLIC_DAZNO_VERIFY_URL: process.env.NEXT_PUBLIC_DAZNO_VERIFY_URL || 'https://www.token-for-good.com/api/verify',
  },
  
  // Configuration des images
  images: {
    domains: [
      'token-for-good.com',
      'www.token-for-good.com',
      'api.token-for-good.com',
      'token4good.com',
      'token-for-good.com',
      'www.token-for-good.com',
      'app.token-for-good.com',
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
          { key: 'Access-Control-Allow-Origin', value: 'https://app.token-for-good.com' },
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
      // Ancienne landing statique Webflow → landing React
      { source: '/landing/index.html', destination: '/', permanent: true },
      { source: '/fr/landing/index.html', destination: '/fr', permanent: true },
      { source: '/en/landing/index.html', destination: '/en', permanent: true },
    ];
  },
  
  // Rewrites pour le backend Rust et landing page
  // En développement local : proxifie /api/* vers le backend Rust sur localhost:3001
  // En production Vercel : les rewrites de vercel.json prennent le relais (ignorés ici)
  async rewrites() {
    // NEXT_PUBLIC_API_URL pointe sur la BASE du backend (sans /api)
    // Exemples : http://localhost:3001 ou https://apirust-production.up.railway.app
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');
    return [
      // Servir les fichiers statiques de la landing page
      {
        source: '/landing/:path*',
        destination: '/landing/:path*',
      },
      // Auth Next.js : lnurl uniquement (différé — nécessite stockage PostgreSQL)
      {
        source: '/api/auth/lnurl/:path*',
        destination: '/api/auth/lnurl/:path*',
      },
      // Proxy vers le backend Rust (développement local uniquement)
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
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
// Sur Vercel : dryRun pour éviter exit 1 si upload Sentry échoue (token invalide, réseau, etc.)
const isVercel = process.env.VERCEL === '1';
const hasValidSentry = process.env.SENTRY_AUTH_TOKEN && !isVercel;
const sentryWebpackPluginOptions = {
  silent: true,
  hideSourceMaps: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  dryRun: !hasValidSentry, // Skip upload sur Vercel ou si pas de token
};

// Export avec Nx et optionnellement Sentry
const configWithNx = withNx(nextConfig);
module.exports = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(configWithNx, sentryWebpackPluginOptions)
  : configWithNx;
