/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

const withNextra = require('nextra')({
  //theme: 'nextra-theme-docs',
  theme: './theme.tsx',
  themeConfig: './theme.config.tsx'
})

module.exports = withNextra()/* () => {
   const rewrites = () => {
     return [
       {
         source: "/hello/:path*",
         destination: "http://localhost:5000/hello/:path*",
       },
     ];
   };
   return {
     rewrites,
    };
}*/