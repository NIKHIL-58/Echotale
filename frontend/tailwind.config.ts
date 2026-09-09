import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7052C8',
        deep: '#0D0A22',
        soft: '#F0ECF7',
        violet: '#9271E2',
        page: '#F8F7FA',
        text: '#211C30',
        textMain: '#211C30',
        textMuted: '#716A80',
        borderSoft: '#E9E5EE'
      },
      boxShadow: {
        soft: '0 4px 18px rgba(35,27,74,.035)',
        card: '0 12px 32px rgba(35,27,74,.08)'
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


