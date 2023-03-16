<<<<<<< HEAD
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
/* module.exports = () => {
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
*/
=======
module.exports = () => {
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
};
>>>>>>> 76e5293d5f52c63bc724d7bf0fb6b1325f6e5429
