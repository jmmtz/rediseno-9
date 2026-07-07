import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    resolve(__dirname, 'index.html'),
    resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        'serif-display': ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        beige: {
          50: '#FAF9F6',
          100: '#F5F2EE',
          200: '#F0EBE3',
          300: '#E8DDD0',
          400: '#D4C4B0',
        },
        taupe: {
          DEFAULT: '#8B7355',
          light: '#C9A96E',
          dark: '#5a4a35',
        },
        gold: {
          DEFAULT: '#8B7355',
          light: '#C9A96E',
          dark: '#5a4a35',
        },
      },
    },
  },
  plugins: [],
};
