/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./pages/**/*.js", "./components/**/*.js"],
  theme: {
    extend: {
      colors: {
        socialBg:'#F5F7FB',
        socialBlue: '#218DFA',
      },
    },
  },
  plugins: [],
}