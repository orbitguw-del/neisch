/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Earthy accent reflecting NE India construction context
        earth: {
          50:  '#fdf8f0',
          100: '#fbefd8',
          200: '#f6d9a8',
          300: '#efbe6e',
          400: '#e69e3a',
          500: '#d97e1a',
          600: '#b95f12',
          700: '#924512',
          800: '#773815',
          900: '#622f14',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
