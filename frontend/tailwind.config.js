/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          darkText: '#0F172A',
          subText: '#475569',
          muted: '#64748B',
          
          // Mint (SHIP)
          mintBg: '#ECFDF5',
          mintBorder: '#A7F3D0',
          mintSolid: '#10B981',
          mintText: '#065F46',

          // Rose (HOLD)
          roseBg: '#FFF1F2',
          roseBorder: '#FECDD3',
          roseSolid: '#F43F5E',
          roseText: '#9F1239',

          // Butter / Amber (ASK)
          amberBg: '#FFFBEB',
          amberBorder: '#FDE68A',
          amberSolid: '#F59E0B',
          amberText: '#92400E',

          // Lavender / Periwinkle (AI & Brand)
          lavenderBg: '#F5F3FF',
          lavenderBorder: '#DDD6FE',
          lavenderSolid: '#8B5CF6',
          lavenderText: '#5B21B6',

          // Sky (PayPal & System)
          skyBg: '#F0F9FF',
          skyBorder: '#BAE6FD',
          skySolid: '#0284C7',
          skyText: '#0369A1',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
