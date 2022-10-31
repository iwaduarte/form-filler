/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        'screen-50': '50vw',
        'screen-25': '25vw',
      },
      zIndex: {
        '1000': '1000',
      }
    },
  },
  plugins: [],
}
