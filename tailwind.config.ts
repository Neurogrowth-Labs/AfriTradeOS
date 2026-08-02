import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './**/*.{ts,tsx}',
    '!./node_modules/**',
    '!./dist/**',
  ],
  theme: {
    extend: {
      colors: {
        trade: {
          primary: '#070707',
          secondary: '#15110A',
          accent: '#C9A24D',
          success: '#1FA971',
          warning: '#F5A623',
          error: '#D64545',
          bg: '#0B0B0B',
          surface: '#111111',
        },
        slate: {
          750: '#2d3748',
          850: '#1a202c',
          950: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['General Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
