/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Medical green palette (already defined)
        'medical-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Primary green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        // Medical white/gray palette (already defined)
        'medical-white': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373'
        },
        // Blue shades from the logo
        'logo-blue': {
          50: '#ebf8ff',
          100: '#d1e7ff',
          200: '#9ecaff',
          300: '#6daeff',
          400: '#358bff',
          500: '#0066ff', // Primary blue from logo
          600: '#005ce6',
          700: '#004dbf',
          800: '#003d99',
          900: '#002b73'
        },
        // Red shades from the logo
        'logo-red': {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffb8b8',
          300: '#ff8c8c',
          400: '#ff5c5c',
          500: '#ff2626', // Primary red from logo
          600: '#e62020',
          700: '#bf1a1a',
          800: '#991313',
          900: '#730d0d'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'], // Default sans-serif
        'medical': ['Inter', 'Arial', 'sans-serif']      // Medical-focused font
      },
      boxShadow: {
        'medical': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Medical shadow
        'logo': '0 6px 12px rgba(0, 0, 0, 0.15)' // Logo-specific shadow
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'), // Tailwind plugin for styling forms
    require('@tailwindcss/typography') // Typography plugin for rich text
  ]
};

