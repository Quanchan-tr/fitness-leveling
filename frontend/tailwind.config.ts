import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF5722',
          'primary-hover': '#E64A19',
          'primary-light': '#FFF3E0',
          orange: '#FF6B35',
          dark: '#0F172A',
          surface: '#FFFFFF',
          'surface-subtle': '#F8FAFC',
          muted: '#64748B',
          border: '#E2E8F0',
          ai: '#0284C7',
          'ai-light': '#E0F2FE',
          success: '#10B981',
          'success-light': '#ECFDF5',
          warning: '#F59E0B',
          'warning-light': '#FEF3C7',
          danger: '#EF4444',
          'danger-light': '#FEF2F2',
          // Legacy aliases preserved for backwards compatibility with existing components
          wall: '#F8FAFC',
          floor: '#E2E8F0',
          wood: '#475569',
          metal: '#1E293B',
          green: '#10B981',
          yellow: '#F59E0B',
          blue: '#0284C7',
          paper: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 8px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04)',
        pedestal: '0 20px 40px -15px rgba(255, 87, 34, 0.15)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
