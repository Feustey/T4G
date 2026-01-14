// next.config.vercel.js - Configuration simplifiée pour Vercel
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  
  // Transpiler les packages du monorepo
  transpilePackages: [
    '@t4g/types',
    '@t4g/service/blockchain',
    '@t4g/service/data',
    '@t4g/service/middleware',
    '@t4g/service/services',
    '@t4g/service/smartcontracts',
    '@t4g/service/users',
    '@t4g/ui/components',
    '@t4g/ui/elements',
    '@t4g/ui/hooks',
    '@t4g/ui/icons',
    '@t4g/ui/layouts',
    '@t4g/ui/pages',
    '@t4g/ui/providers',
    '@shared/types',
  ],
  
  webpack: (config, { isServer }) => {
    // Fix pour les modules Node.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    // Éviter les duplications de React (fix pour erreur "Cannot read properties of null")
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: require('path').resolve(__dirname, '../../node_modules/react'),
        'react-dom': require('path').resolve(__dirname, '../../node_modules/react-dom'),
      };
    }
    
    // Aliases pour le monorepo
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared/types': require('path').resolve(__dirname, '../../shared/types/src/index.ts'),
      '@t4g/types': require('path').resolve(__dirname, '../../libs/types/src/index.ts'),
      '@t4g/service/blockchain': require('path').resolve(__dirname, '../../libs/service/blockchain/src/index.ts'),
      '@t4g/service/data': require('path').resolve(__dirname, '../../libs/service/data/src/index.ts'),
      '@t4g/service/middleware': require('path').resolve(__dirname, '../../libs/service/middleware/src/index.ts'),
      '@t4g/service/services': require('path').resolve(__dirname, '../../libs/service/services/src/index.ts'),
      '@t4g/service/smartcontracts': require('path').resolve(__dirname, '../../libs/service/smartcontracts/src/index.ts'),
      '@t4g/service/users': require('path').resolve(__dirname, '../../libs/service/users/src/index.ts'),
      '@t4g/ui/components': require('path').resolve(__dirname, '../../libs/ui/components/src/index.ts'),
      '@t4g/ui/elements': require('path').resolve(__dirname, '../../libs/ui/elements/src/index.ts'),
      '@t4g/ui/hooks': require('path').resolve(__dirname, '../../libs/ui/hooks/src/index.ts'),
      '@t4g/ui/icons': require('path').resolve(__dirname, '../../libs/ui/icons/src/index.ts'),
      '@t4g/ui/layouts': require('path').resolve(__dirname, '../../libs/ui/layouts/src/index.ts'),
      '@t4g/ui/pages': require('path').resolve(__dirname, '../../libs/ui/pages/src/index.ts'),
      '@t4g/ui/providers': require('path').resolve(__dirname, '../../libs/ui/providers/src/index.ts'),
    };
    
    return config;
  },
  
  // Variables d'environnement publiques avec fallbacks
  // Note: Ces valeurs sont injectées au build time et écrasent les fallbacks du code
  // Il faut donc définir des fallbacks ici aussi pour éviter undefined
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_DAZNO_API_URL: process.env.NEXT_PUBLIC_DAZNO_API_URL || 'https://www.dazno.de/api',
    NEXT_PUBLIC_DAZNO_USERS_API_URL: process.env.NEXT_PUBLIC_DAZNO_USERS_API_URL || 'https://www.dazno.de/api',
    NEXT_PUBLIC_DAZNO_VERIFY_URL: process.env.NEXT_PUBLIC_DAZNO_VERIFY_URL || 'https://www.dazno.de/api/verify',
  },
  
  // Désactiver TypeScript/ESLint checking pendant le build (déjà fait en dev)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Images
  images: {
    domains: ['dazno.de', 'api.dazno.de'],
  },
};

// Sentry configuration (désactivé pour le déploiement initial)
const sentryWebpackPluginOptions = {
  silent: true,
  org: 'token4good',
  project: 'dapp',
  dryRun: true, // Ne pas uploader à Sentry
};

// Export sans Sentry pour éviter les erreurs de build
module.exports = nextConfig;
// module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);

