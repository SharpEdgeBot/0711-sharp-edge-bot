import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './src/app/**/*.{ts,tsx,js,jsx}',
    './src/components/**/*.{ts,tsx,js,jsx}',
    './src/pages/**/*.{ts,tsx,js,jsx}',
    './public/**/*.svg',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0b',
        'bg-secondary': '#141419',
        'bg-tertiary': '#1e1e26',
        'bg-quaternary': '#2a2a35',
        'text-primary': '#ffffff',
        'text-secondary': '#a1a1aa',
        'text-muted': '#71717a',
        'accent-primary': '#3b82f6',
        'accent-secondary': '#06d6a0',
        'accent-warning': '#f59e0b',
        'accent-danger': '#ef4444',
        'accent-purple': '#8b5cf6',
        'border-subtle': '#27272a',
        'border-default': '#3f3f46',
        'border-focus': '#3b82f6',
        'sports-soccer': '#00c851',
        'sports-basketball': '#ff6900',
        'sports-football': '#8b4513',
        'sports-baseball': '#ffffff',
        'sports-hockey': '#00bfff',
        gray: {
          950: '#0a0a0b',
          ...defaultTheme.colors.gray
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        glass: '0 20px 60px rgba(0, 0, 0, 0.4)',
        glow: '0 0 8px 2px #3b82f6',
      },
      borderRadius: {
        card: '18px',
        glass: '24px',
        xl: '2rem',
      },
      backdropBlur: {
        glass: '16px',
      },
      backgroundImage: {
        'gradient-sports': 'linear-gradient(120deg, #3b82f6 0%, #8b5cf6 100%)',
        'gradient-team': 'var(--team-gradient)',
      },
      transitionProperty: {
        glass: 'box-shadow, border, background-color, color',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        typing: {
          '0%, 80%, 100%': { opacity: '0.2' },
          '40%': { opacity: '1' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.4s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
        typing: 'typing 1.2s infinite ease-in-out',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.glass-morph': {
          background: 'rgba(26,27,35,0.7)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid #3b82f6',
        },
        '.text-accent-primary': { color: '#3b82f6' },
        '.text-accent-secondary': { color: '#06d6a0' },
        '.text-accent-warning': { color: '#f59e0b' },
        '.text-accent-danger': { color: '#ef4444' },
        '.text-accent-purple': { color: '#8b5cf6' },
        '.bg-accent-primary': { backgroundColor: '#3b82f6' },
        '.bg-accent-secondary': { backgroundColor: '#06d6a0' },
        '.bg-accent-warning': { backgroundColor: '#f59e0b' },
        '.bg-accent-danger': { backgroundColor: '#ef4444' },
        '.bg-accent-purple': { backgroundColor: '#8b5cf6' },
      });
    },
    (await import('@tailwindcss/forms')).default,
    (await import('@tailwindcss/typography')).default,
    (await import('@tailwindcss/aspect-ratio')).default,
    (await import('@tailwindcss/container-queries')).default,
  ],
};
