const withMT = require("@material-tailwind/react/utils/withMT");
 
module.exports = withMT({
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        nord: {
          surface: '#81A1C1',
          frost: '#2E3440',
          'nord-1': '#2E3440',
          'nord-2': '#2E3440',
          'nord-3': '#2E3440',
          'nord-4': '#2E3440',
          'nord-5': '#2E3440',
          'nord-6': '#2E3440',
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("daisyui"),
    // require("@material-tailwind/react/tailwind/plugin"),
  ],
});