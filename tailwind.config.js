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
      fontFamily: {
        epilogue: ['Epilogue', 'sans-serif'],
      },
      boxShadow: {
        secondary: '10px 10px 20px rgba(2, 2, 2, 0.25)',
      },
    },
  },
  variants: {},
  plugins: [require('daisyui')],
}
