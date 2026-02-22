import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import RootLayoutClient from "@/src/components/layout/RootLayoutClient";
import { PostHogProvider } from "@/src/components/providers/PostHogProvider";

export const metadata: Metadata = {
  title: "Star Sailors",
  description: "Catalogue the Stars",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/assets/Captn.jpg",
        sizes: "180x180",
        type: "image/jpeg",
      },
      {
        url: "/assets/Captn.jpg",
        sizes: "152x152",
        type: "image/jpeg",
      },
      {
        url: "/assets/Captn.jpg",
        sizes: "167x167",
        type: "image/jpeg",
      },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Star Sailors",
  },
  applicationName: "Star Sailors",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#78cce2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const posthogApiKey =
    process.env.posthog_api_key ??
    process.env.POSTHOG_API_KEY ??
    process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogProjectId =
    process.env.posthog_project_id ??
    process.env.POSTHOG_PROJECT_ID;
  const posthogRegion =
    process.env.posthog_region ??
    process.env.POSTHOG_REGION ??
    "US Cloud";

  return (
    <PostHogProvider
      apiKey={posthogApiKey}
      projectId={posthogProjectId}
      region={posthogRegion}
    >
      <RootLayoutClient>{children}</RootLayoutClient>
    </PostHogProvider>
  );
};
