import React from 'react';
import tailwindConfig from './tailwind.config.js';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          50: '#fffbeb',
          600: '#d97706',
          700: '#b45309',
        },
        orange: {
          600: '#ea580c',
        },
      },
    },
  },
  plugins: [],
};
