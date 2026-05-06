/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Storey primary — terracotta
        brand: {
          50:  '#fdf3f2',
          100: '#fce4e1',
          200: '#f9cdc8',
          300: '#f4a99f',
          400: '#ec7b6e',
          500: '#df5243',
          600: '#B85042',
          700: '#8E3D32',
          800: '#762f27',
          900: '#622824',
        },
        // Sand — warm cream accent
        sand: {
          50:  '#fefefe',
          100: '#fdfcf6',
          200: '#FAF6EC',
          300: '#E7E8D1',
          400: '#d8d9bc',
          500: '#c4c6a3',
          600: '#a8aa82',
          700: '#888a62',
          800: '#6e7050',
          900: '#5a5c40',
        },
        // Sage — muted green accent
        sage: {
          50:  '#f4f7f5',
          100: '#e6ede8',
          200: '#cdddd2',
          300: '#A7BEAE',
          400: '#82a38c',
          500: '#638c6e',
          600: '#4e7057',
          700: '#3f5a46',
          800: '#354a3b',
          900: '#2d3d31',
        },
        // Charcoal — dark tones
        charcoal: {
          50:  '#f5f5f4',
          100: '#e8e8e6',
          200: '#d2d2cf',
          300: '#b0b0ac',
          400: '#878784',
          500: '#5F5E5A',
          600: '#4a4a47',
          700: '#3d3d3a',
          800: '#2C2C2A',
          900: '#1F1E1D',
        },
      },
      fontFamily: {
        sans:    ['Calibri', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'ui-serif', 'serif'],
      },
      backgroundColor: {
        cream: '#FAF6EC',
      },
    },
  },
  plugins: [],
}
