import { fileURLToPath } from "node:url";

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

async function headers() {
  return [
    {
      source: "/service-worker.js",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
      ],
    },
  ];
}

async function rewrites() {
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
}

// SSC-31: `yarn cf:build` (scripts/cloudflare/build-static.mjs) sets
// NEXT_STATIC_EXPORT=1 and exports every page to static HTML (`out/`) for
// Workers Static Assets. It sets src/app/api and src/middleware.ts aside for
// the export: the Worker (workers/app) serves those routes, and the
// middleware's redirects happen in the browser. `next dev` keeps both.
const staticExport = process.env.NEXT_STATIC_EXPORT === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(staticExport ? { output: "export" } : {}),
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // The export build runs with src/app/api set aside, which would break the
  // Worker's imports of it; build-static.mjs type-checks the whole tree first.
  typescript: {
    ignoreBuildErrors: staticExport,
  },
  skipTrailingSlashRedirect: true,
  // Static exports cannot use headers()/rewrites(); in production the same
  // rules live in public/_headers and workers/app/src/index.ts (/ingest).
  ...(staticExport ? {} : { headers, rewrites }),
  webpack: (config, { isServer, webpack }) => {
    if (staticExport) {
      // @clerk/nextjs ships two internal server-action modules; a static
      // export rejects any server action, so swap in client no-ops.
      const stubs = {
        "server-actions.js": "clerk-server-actions.static.js",
        "keyless-actions.js": "clerk-keyless-actions.static.js",
      };
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /@clerk[\\/]nextjs[\\/]dist[\\/]esm[\\/]app-router[\\/](server|keyless)-actions\.js$/,
          (resource) => {
            const file = resource.createData?.resource ?? resource.resource ?? "";
            const stub = stubs[file.split(/[\\/]/).pop()];
            if (!stub) return;
            const target = fileURLToPath(new URL(`./src/lib/cloudflare/${stub}`, import.meta.url));
            if (resource.createData) resource.createData.resource = target;
            else resource.resource = target;
          },
        ),
      );
    }

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
