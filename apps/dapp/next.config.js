// next.config.vercel.js - Configuration simplifiée pour Vercel
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  
  webpack: (config, { isServer }) => {
    // Fix pour les modules Node.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
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
    NEXT_PUBLIC_DAZNO_VERIFY_URL: process.env.NEXT_PUBLIC_DAZNO_VERIFY_URL || 'https://dazno.de/api/auth/verify-session',
  },
  
  // Désactiver TypeScript/ESLint checking pendant le build (déjà fait en dev)
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Images
  images: {
    domains: ['dazno.de', 'api.dazno.de'],
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  silent: true,
  org: 'token4good',
  project: 'dapp',
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);

