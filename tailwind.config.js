/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    typography: ( theme ) => ({}),
    extend: {
      colors: {
        socialBg: '#FFFFFF',
        //socialBg:'#F5F7FB',
        socialBlue: '#218DFA',
        buttonColour: '#F11957',
        primary: "#4F46E5",
        secondary: "#FFC700",
        accent: "#00BFA6",
        gray: {
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
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
  plugins: [require('daisyui'),
  require('flowbite/plugin')],
}
