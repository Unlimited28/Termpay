/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        text: {
          primary: "#0F172A",
          secondary: "#64748B",
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}
