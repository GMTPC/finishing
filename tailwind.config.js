/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,vue}',
    './shared/**/*.{js,ts}',
    './nuxt.config.ts',
  ],
  theme: {
    extend: {
      colors: {
        // โทนสีจาก Sneat Vuetify Admin Template
        sneat: {
          primary: '#696CFF',
          'primary-hover': '#5F61E6',
          'primary-light': '#E7E7FF',
          secondary: '#8592A3',
          success: '#71DD37',
          info: '#03C3EC',
          warning: '#FFAB00',
          danger: '#FF3E1D',
          dark: '#233446',
          body: '#F5F5F9',
        },
        station: {
          s1: '#2563EB', // blue
          s2: '#059669', // emerald
          s3: '#F59E0B', // amber
          s4: '#EA580C', // orange
          s5: '#DB2777', // pink
        },
        brand: {
          50: '#F0F0FF',
          100: '#E7E7FF',
          500: '#696CFF',
          600: '#5F61E6',
          700: '#4E50D6',
          900: '#233446',
        },
      },
      boxShadow: {
        'sneat': '0 2px 6px 0 rgba(67, 89, 113, 0.08)',
        'sneat-md': '0 4px 12px 0 rgba(67, 89, 113, 0.12)',
        'sneat-lg': '0 8px 24px 0 rgba(67, 89, 113, 0.16)',
        'sneat-primary': '0 4px 14px 0 rgba(105, 108, 255, 0.38)',
      },
    },
  },
  plugins: [],
}

