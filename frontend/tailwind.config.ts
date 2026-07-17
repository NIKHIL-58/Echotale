import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7657D3',
        deep: '#0D0A22',
        soft: '#F0ECF7',
        violet: '#9271E2',
        page: '#F4F1F5',
        textMain: '#1C1927',
        textMuted: '#716D79',
        borderSoft: '#E7E1E9'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(35,27,74,.08)',
        card: '0 20px 50px rgba(35,27,74,.12)'
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


