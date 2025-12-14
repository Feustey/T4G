// next.config.vercel.js - Configuration simplifiée pour Vercel
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  
  webpack: (config) => {
    // Fix pour les modules Node.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    return config;
  },
  
  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_DAZNO_API_URL: process.env.NEXT_PUBLIC_DAZNO_API_URL,
    NEXT_PUBLIC_DAZNO_USERS_API_URL: process.env.NEXT_PUBLIC_DAZNO_USERS_API_URL,
    NEXT_PUBLIC_DAZNO_VERIFY_URL: process.env.NEXT_PUBLIC_DAZNO_VERIFY_URL,
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

