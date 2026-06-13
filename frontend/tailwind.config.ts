import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C4DF6',
        deep: '#120A3D',
        soft: '#EEE9FF',
        violet: '#8B5CF6',
        page: '#F7F8FC',
        textMain: '#10142D',
        textMuted: '#667085',
        borderSoft: '#EAECF0'
      },
      boxShadow: {
        soft: '0 8px 24px rgba(16,20,45,.08)',
        card: '0 12px 32px rgba(16,20,45,.08)'
      },
      borderRadius: {
        input: '14px',
        card: '16px',
        widget: '24px'
      }
    }
  },
  plugins: []
};
export default config;
