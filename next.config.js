const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const configuredPosthogRegion = (process.env.posthog_region || process.env.POSTHOG_REGION || 'US Cloud').toLowerCase();
const useEUPosthog = configuredPosthogRegion.includes('eu');
const posthogIngestHost = useEUPosthog ? 'https://eu.i.posthog.com' : 'https://us.i.posthog.com';
const posthogAssetsHost = useEUPosthog ? 'https://eu-assets.i.posthog.com' : 'https://us-assets.i.posthog.com';

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	experimental: {
	  optimizePackageImports: ["lucide-react", "date-fns"],
	},
	images: {
	  unoptimized: true,
	},
	eslint: {
	  ignoreDuringBuilds: true,
	},
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
	// Ensure service worker is copied to build
	async headers() {
		return [
		  {
			source: '/sw.js',
			headers: [
			  {
				key: 'Cache-Control',
				value: 'public, max-age=0, must-revalidate'
			  },
			  {
				key: 'Service-Worker-Allowed',
				value: '/'
			  }
			]
		  },
		  {
			source: '/service-worker.js',
			headers: [
			  {
				key: 'Cache-Control',
				value: 'public, max-age=0, must-revalidate'
			  },
			  {
				key: 'Service-Worker-Allowed',
				value: '/'
			  },
			  {
				key: 'Content-Type',
				value: 'application/javascript; charset=utf-8'
			  }
			]
		  }
		];
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
		// PostHog rewrites to support local ingest proxy by region
		{
		  source: '/ingest/static/:path*',
		  destination: `${posthogAssetsHost}/static/:path*`,
		},
		{
		  source: '/ingest/:path*',
		  destination: `${posthogIngestHost}/:path*`,
		},
		{
		  source: '/ingest/flags',
		  destination: `${posthogIngestHost}/flags`,
		},
	  ];
	},
	webpack: (config, { isServer }) => {
	  config.resolve = {
		...config.resolve,
		alias: {
		  ...config.resolve.alias,
		},
		// Ensure proper module resolution for camera-controls
		fallback: {
		  ...config.resolve.fallback,
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
  
module.exports = withPWA(nextConfig);
