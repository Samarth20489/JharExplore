import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D6A4F',
          light: '#52B788',
          dark: '#1B4332',
          50: '#F0FFF4',
          100: '#C6F6D5',
          200: '#9AE6B4',
          300: '#68D391',
          400: '#48BB78',
          500: '#2D6A4F',
          600: '#276749',
          700: '#1B4332',
          800: '#143D2B',
          900: '#0D3321',
        },
        accent: {
          DEFAULT: '#D4A017',
          warm: '#E76F51',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4A017',
          600: '#B8860B',
          700: '#92400E',
        },
        surface: {
          DEFAULT: '#F8F5F0',
          50: '#FDFCFB',
          100: '#F8F5F0',
          200: '#F0EBE3',
          300: '#E8E0D5',
        },
        dark: {
          DEFAULT: '#1B2B1F',
          50: '#2D3B31',
          100: '#243028',
          200: '#1B2B1F',
          300: '#152218',
          400: '#0F1A12',
        },
        terracotta: '#E76F51',
        forest: '#2D6A4F',
        gold: '#D4A017',
        sandstone: '#F8F5F0',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
        accent: ['"Tiro Devanagari Hindi"', 'serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
        card: '16px',
        button: '8px',
        pill: '9999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 3s ease-in-out infinite',
        'typewriter': 'typewriter 0.05s steps(1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2D6A4F 0%, #52B788 100%)',
        'gradient-accent': 'linear-gradient(135deg, #D4A017 0%, #E76F51 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1B2B1F 0%, #2D6A4F 100%)',
        'gradient-hero': 'linear-gradient(180deg, rgba(27,43,31,0.7) 0%, rgba(27,43,31,0.3) 50%, rgba(27,43,31,0.8) 100%)',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.15)',
        'glow-primary': '0 0 20px rgba(45, 106, 79, 0.3)',
        'glow-accent': '0 0 20px rgba(212, 160, 23, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
