const { join } = require('path');

// Version simplifiée pour Vercel sans dépendances Nx
module.exports = {
  mode: 'jit',
  content: [
    join(__dirname, 'pages/**/*.{ts,tsx}'),
    join(__dirname, 'components/**/*.{ts,tsx}'),
    join(__dirname, 'layouts/**/*.{ts,tsx}'),
    join(__dirname, '../../libs/ui/**/*.{ts,tsx}'),
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        t4g: {
          primary: '#00C9A7',
          secondary: '#845EC2',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};




