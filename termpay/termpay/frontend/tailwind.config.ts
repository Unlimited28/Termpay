/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Preserving existing tokens
        primary: {
          navy: "#0D2137",
          hover: "#1B3A5C",
        },
        action: {
          blue: "#1565C0",
        },
        success: {
          green: "#2E7D32",
        },
        warning: {
          amber: "#E65100",
        },
        danger: {
          red: "#B71C1C",
        },
        background: "#F8FAFC",
        surface: "#FFFFFF",
        border: "#E2E8F0",

        // Exact tokens for Slice 3
        navy: "#0D2137",
        brand: {
          blue: "#1565C0",
          green: "#2E7D32",
          amber: "#E65100",
          red: "#B71C1C",
        },
        'surface-bg': "#F8FAFC", // Renamed to avoid collision with existing 'surface'
        'surface-border': "#E2E8F0", // Renamed to avoid collision with existing 'border'
        text: {
          primary: "#0F172A",
          secondary: "#64748B",
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'premium': '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        'fade-in': 'fade-in 0.2s ease-out forwards',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
