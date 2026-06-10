/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f4f6fa',
          100: '#e9edf3',
          200: '#c8d3e2',
          300: '#9bb1cb',
          400: '#6b8bb2',
          500: '#486e9b',
          600: '#37577d',
          700: '#2b4462',
          800: '#0f2942', // Primary Brand Blue
          900: '#0b1e33', // Sidebar/Dark Accent Blue
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
