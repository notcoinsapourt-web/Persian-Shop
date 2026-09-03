import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        surface: '#18181B',
        primary: '#6366F1',
        accent: '#22D3EE'
      },
      borderRadius: {
        premium: '24px'
      }
    }
  },
  plugins: []
}

export default config
