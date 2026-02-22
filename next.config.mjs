const configuredPosthogRegion = (
  process.env.posthog_region ||
  process.env.POSTHOG_REGION ||
  "US Cloud"
).toLowerCase();
const useEUPosthog = configuredPosthogRegion.includes("eu");
const posthogIngestHost = useEUPosthog
  ? "https://eu.i.posthog.com"
  : "https://us.i.posthog.com";
const posthogAssetsHost = useEUPosthog
  ? "https://eu-assets.i.posthog.com"
  : "https://us-assets.i.posthog.com";

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
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/service-worker.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/citizen/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://flask:5001/:path*"
            : "/citizen/:path*",
      },
      // Only proxy specific API routes to external service, not all /api/*
      // Most /api/gameplay/* routes are handled by Next.js itself
      {
        source: "/api/external/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:5328/api/:path*"
            : "/api/external/:path*",
      },
      { source: "/ingest/static/:path*", destination: `${posthogAssetsHost}/static/:path*` },
      { source: "/ingest/:path*", destination: `${posthogIngestHost}/:path*` },
      { source: "/ingest/flags", destination: `${posthogIngestHost}/flags` },
    ];
  },
  webpack: (config, { isServer }) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
      },
      fallback: {
        ...config.resolve.fallback,
      },
    };

    if (isServer) {
      config.externals = [...(config.externals || []), { konva: "konva", canvas: "canvas" }];
    } else {
      config.node = {
        ...config.node,
      };
    }

    return config;
  },
};

export default nextConfig;
