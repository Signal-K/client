const withPWA = require("@ducanh2912/next-pwa").default({
	dest: "public",
  });

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		unoptimized: true
	}
};

module.exports = nextConfig;