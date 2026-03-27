/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mori: ['"Space Grotesk"', 'sans-serif'],
        editorial: ['"Cormorant Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
}
