/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f2f9f4',
          100: '#e0f1e7',
          200: '#c2e3d1',
          300: '#95cdae',
          400: '#64b086',
          500: '#3f9468',
          600: '#2e7653',
          700: '#265e44',
          800: '#214b37',
          900: '#1b3e2f',
          950: '#0d221a',
        },
        accent: {
          50: '#fdf8ed',
          100: '#f9ecce',
          200: '#f2d694',
          300: '#eaba58',
          400: '#e5a32f',
          500: '#d98618',
          600: '#bd6712',
          700: '#9c4c13',
          800: '#7f3c16',
          900: '#693215',
        },
      },
    },
  },
  plugins: [],
};
