/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#fe7743',
        secondary: '#273f4f',
        light: '#efeeea'
      }
    },
  },
  plugins: [],
}