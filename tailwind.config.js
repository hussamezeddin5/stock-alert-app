/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: '#1a1a1a',
        'surface-2': '#242424',
        accent: '#00ff88',
        'accent-dim': '#00cc6a',
        'accent-glow': 'rgba(0,255,136,0.15)',
        muted: '#6b7280',
        danger: '#ff4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        accent: '0 0 20px rgba(0,255,136,0.3)',
        'accent-sm': '0 0 10px rgba(0,255,136,0.2)',
      },
      animation: {
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'ticker-scroll': 'ticker-scroll 30s linear infinite',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,255,136,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0,255,136,0.6)' },
        },
        'ticker-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
