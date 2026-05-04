import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0D2137',
          light: '#1B3A5C',
          dark: '#071424',
        },
        brand: {
          blue: '#1565C0',
          green: '#2E7D32',
          amber: '#E65100',
          red: '#B71C1C',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#F8FAFC',
          border: '#E2E8F0',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          disabled: '#94A3B8',
        }
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
      },
      transitionTimingFunction: {
        'ease-spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-quick': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      animation: {
        'modal-in': 'modal-in 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'modal-out': 'modal-out 150ms cubic-bezier(0.4, 0, 1, 1) forwards',
        'toast-in': 'toast-in 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-out': 'toast-out 200ms cubic-bezier(0.4, 0, 1, 1) forwards',
      },
      keyframes: {
        'modal-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'modal-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-out': {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(110%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
