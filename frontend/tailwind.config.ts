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
          wall: '#E8E1D5',
          floor: '#B9A78E',
          wood: '#76583E',
          metal: '#303238',
          primary: '#FF6B35',
          green: '#7FB069',
          yellow: '#F4C95D',
          blue: '#4D96FF',
          dark: '#1F2328',
          paper: '#F7F3EA',
        },
      },
    },
  },
  plugins: [],
};

export default config;
