import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Brand
        emerald: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
          glow: 'rgba(16, 185, 129, 0.25)',
          subtle: 'rgba(16, 185, 129, 0.08)',
        },
        // Background layers
        base: '#080C14',
        surface: '#0F1724',
        elevated: '#1A2332',
        overlay: '#212D3F',
        // Borders
        stroke: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          light: 'rgba(255, 255, 255, 0.10)',
          strong: 'rgba(255, 255, 255, 0.16)',
        },
        // Text
        ink: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#475569',
          disabled: '#334155',
        },
        // Status
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          subtle: 'rgba(16, 185, 129, 0.08)',
          glow: 'rgba(16, 185, 129, 0.25)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
          subtle: 'rgba(245, 158, 11, 0.08)',
          glow: 'rgba(245, 158, 11, 0.25)',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FCA5A5',
          subtle: 'rgba(239, 68, 68, 0.08)',
          glow: 'rgba(239, 68, 68, 0.25)',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#93C5FD',
          subtle: 'rgba(59, 130, 246, 0.08)',
          glow: 'rgba(59, 130, 246, 0.25)',
        },
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)' },
          '50%': { boxShadow: '0 0 35px rgba(16, 185, 129, 0.45)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'modal-in': {
          from: { opacity: '0', transform: 'scale(0.95) translateY(8px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'count-up': 'count-up 400ms ease-out forwards',
        'modal-in': 'modal-in 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-in': 'toast-in 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}

export default config
