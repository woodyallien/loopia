/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1E2A32', forest: '#2E403A', gold: '#C98B3C', clay: '#B65F45',
        cream: '#F7F2E8', paper: '#FAFAF8', muted: '#566260', success: '#3F7D61', danger: '#A54242',
        background: 'rgb(var(--background) / <alpha-value>)', surface: 'rgb(var(--surface) / <alpha-value>)',
        elevated: 'rgb(var(--surface-elevated) / <alpha-value>)', subtle: 'rgb(var(--surface-subtle) / <alpha-value>)',
        primary: 'rgb(var(--text-primary) / <alpha-value>)', secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--text-tertiary) / <alpha-value>)', brand: 'rgb(var(--brand) / <alpha-value>)',
        'brand-hover': 'rgb(var(--brand-hover) / <alpha-value>)', 'brand-subtle': 'rgb(var(--brand-subtle) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)', info: 'rgb(var(--info) / <alpha-value>)'
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 8px 24px rgba(24,32,29,.06)', overlay: '0 24px 64px rgba(10,18,14,.18)' },
      borderRadius: { control:'8px', panel:'12px', feature:'16px' }
    }
  },
  plugins: []
}
