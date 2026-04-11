module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#000000', // Pure Black
          800: '#1a1a1a', // Darker Charcoal for contrast with pure black
          700: '#3A2F2A', // Ink Brown
          600: '#4A4A4A', // Soft Charcoal (Body)
        },
        paper: {
          warm: '#F7F5F2', // Warm paper (Exact)
          50: '#F7F5F2',
          100: '#f9f5f0',
          200: '#f0e6d2',
          gray: '#6B625D', // Warm Gray (Sub-heading)
        },
        gold: {
          calligraphy: '#C8A951', // Gold accent (Exact)
          highlight: '#FFD700', // Bright vibrant gold for better visibility
          400: '#C8A951',
          500: '#C8A951',
          600: '#b8860b',
        },
        bottle: {
          DEFAULT: '#006A4E', // More vibrant Bottle Green
          dark: '#004225',
          light: '#008B6B',
          deep: '#013220',
        },
        rose: {
          200: '#E8D5C4', // Vintage Blush (Light Beige/Pink)
          300: '#DBBFA9', // Darker Blush for hover
        },
        accent: {
          sienna: '#8A4B2D', // Burnt Sienna
          blue: '#2F3E46', // Deep Ink Blue
        }
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        subheading: ['"Lora"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        script: ['"Allura"', 'cursive'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
        widest: '0.25em', // For headings
      }
    },
  },
  plugins: [],
};
