/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        ink: {
          50: '#1a1a1a',
          100: '#141414',
          200: '#0f0f0f',
          300: '#0a0a0a',
          400: '#050505',
        },
        blood: {
          DEFAULT: '#B91C1C',
          light: '#DC2626',
          dark: '#991B1B',
        },
        gold: {
          DEFAULT: '#D4A574',
          light: '#E5B98A',
          dark: '#B8956A',
        },
        graphite: {
          DEFAULT: '#1F1F1F',
          light: '#2A2A2A',
          dark: '#151515',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(185, 28, 28, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(185, 28, 28, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
