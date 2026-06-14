import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card-bg)',
          border: 'var(--card-border)',
        },
        primary: {
          DEFAULT: '#10b981', // Emerald green
          hover: '#059669',
        },
        secondary: {
          DEFAULT: '#3b82f6', // Cobalt/Sky Blue
          hover: '#2563eb',
        },
        accent: {
          DEFAULT: '#8b5cf6', // Violet
          hover: '#7c3aed',
        },
        muted: {
          DEFAULT: 'var(--text-muted)',
          foreground: 'var(--text-secondary)',
        },
        border: 'var(--border-color)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
