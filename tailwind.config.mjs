const defaultTheme = require('tailwindcss/defaultTheme');

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
        charcoal: '#1a1a1a',
        electric: '#00d4ff',
        orange: '#ff6b35',
        neon: '#39ff14',
        gold: '#ffd700',
        glass: 'rgba(26,27,35,0.7)',
        card: '#1a1b23',
        success: '#39ff14',
        warning: '#ffd700',
        accent: {
          blue: '#00d4ff',
          orange: '#ff6b35',
          green: '#39ff14',
          yellow: '#ffd700',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0,212,255,0.08)',
        glow: '0 0 8px 2px #00d4ff',
      },
      borderRadius: {
        card: '18px',
        glass: '24px',
      },
      backdropBlur: {
        glass: '16px',
      },
      backgroundImage: {
        'gradient-sports': 'linear-gradient(120deg, #00d4ff 0%, #ff6b35 100%)',
        'gradient-team': 'var(--team-gradient)',
      },
      transitionProperty: {
        glass: 'box-shadow, border, background-color, color',
      },
      keyframes: {
        typing: {
          '0%, 80%, 100%': { opacity: '0.2' },
          '40%': { opacity: '1' },
        },
      },
      animation: {
        typing: 'typing 1.2s infinite ease-in-out',
      },
    },
  },
plugins: [
  function ({ addUtilities }) {
    addUtilities({
      '.glass-morph': {
        background: 'rgba(26,27,35,0.7)',
        boxShadow: '0 8px 32px 0 rgba(0,212,255,0.08)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(0,212,255,0.12)',
      },
      '.text-electric-blue': { color: '#00d4ff' },
      '.text-neon-green': { color: '#39ff14' },
      '.text-golden-yellow': { color: '#ffd700' },
      '.bg-electric-blue': { backgroundColor: '#00d4ff' },
      '.bg-orange-500': { backgroundColor: '#ff6b35' },
      '.bg-neon-green': { backgroundColor: '#39ff14' },
      '.bg-golden-yellow': { backgroundColor: '#ffd700' },
    });
  },
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography'),
  require('@tailwindcss/aspect-ratio'),
  require('@tailwindcss/container-queries'),
],
};
