import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F3A',
          mid: '#152E52',
          dark: '#060F1D',
        },
        blue: {
          brand: '#1A5FA8',
          light: '#2B7FD4',
        },
        gold: {
          DEFAULT: '#C8920A',
          light: '#F0B429',
        },
        cream: '#F7F4EE',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      maxWidth: {
        content: '1200px',
      },
      animation: {
        'float-1': 'float1 8s ease-in-out infinite',
        'float-2': 'float2 10s ease-in-out infinite',
        'ticker': 'ticker 35s linear infinite',
        'fade-slide-in': 'fadeSlideIn 0.6s ease both',
      },
      keyframes: {
        float1: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-30px, 40px)' },
        },
        float2: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, -30px)' },
        },
        ticker: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        fadeSlideIn: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
