/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
	  unoptimized: true,
	},
	async rewrites() {
	  return [
		// Rewrite /citizen requests to the Flask API
		{
		  source: '/citizen/:path*',
		  destination:
			process.env.NODE_ENV === 'development'
			  ? 'http://flask:5001/:path*' // Use service name 'flask' here
			  : '/citizen/:path*', // Production route for Flask (if different from dev)
		},
		// Keep the original API route for Next.js
		{
		  source: '/api/:path*',
		  destination:
			process.env.NODE_ENV === 'development'
			  ? 'http://127.0.0.1:5328/api/:path*' // Next.js API during development
			  : '/api/', // Next.js API in production
		},
	  ];
	},
	webpack: (config, { isServer }) => {
	  config.resolve = {
		...config.resolve,
		alias: {
		  ...config.resolve.alias,
		},
	  };
	  
	  if (isServer) {
		// Exclude `konva` and `canvas` from server-side builds
		config.externals = [
		  ...(config.externals || []),
		  { 'konva': 'konva', 'canvas': 'canvas' }
		];
	  } else {
		// Adjust node configuration for client-side
		config.node = {
		  ...config.node,
		};
	  }
	  
	  return config;
	},
};
  
module.exports = nextConfig;