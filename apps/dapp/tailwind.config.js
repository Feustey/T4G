const { join } = require('path');

// Essayer d'importer Nx, sinon utiliser une version simple
let createGlobPatternsForDependencies;
try {
  createGlobPatternsForDependencies = require('@nrwl/next/tailwind').createGlobPatternsForDependencies;
} catch (e) {
  // Fallback si Nx n'est pas disponible
  createGlobPatternsForDependencies = () => [];
}

module.exports = {
  mode: 'jit',
  // presets: [require('../../tailwind-workspace-preset.js')], // Désactivé pour Vercel
  content: [
    join(__dirname, 'pages/**/*.{ts,tsx}'),
    join(__dirname, 'components/**/*.{ts,tsx}'),
    join(__dirname, 'layouts/**/*.{ts,tsx}'),
    join(__dirname, '../../libs/ui/**/*.{ts,tsx}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        t4g: {
          blue: { 400: '#7e7bff', 500: '#6a5bf9', 600: '#5b3dee' },
          green: { 400: '#52b580', 500: '#36ae72' },
          orange: { 500: '#ff8924' },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
