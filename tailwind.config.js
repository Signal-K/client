/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    typography: ( theme ) => ({}),
    extend: {
      colors: {
        socialBg: '#FFFFFF',
        //socialBg:'#F5F7FB',
        socialBlue: '#218DFA',
        buttonColour: '#F11957',
      },
    },
  },
  variants: {},
  plugins: [require('daisyui')],
}
