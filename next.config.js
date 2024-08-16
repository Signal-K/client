const withPWA = require("@ducanh2912/next-pwa").default({
	dest: "public",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		unoptimized: true,
	},
	webpack: (config, { isServer }) => {
		// Add the node: scheme to the Webpack configuration
		config.resolve = {
			...config.resolve,
			alias: {
				...config.resolve.alias,
				// Add any necessary aliases here
			},
		};
		if (!isServer) {
			// To prevent errors related to `node:` imports on the client-side
			config.node = {
				...config.node,
				// Add any necessary node configuration here
			};
		}
		return config;
	},
};

module.exports = withPWA(nextConfig);
