import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import RootLayoutClient from "@/src/components/layout/RootLayoutClient";

export const metadata: Metadata = {
  title: "Star Sailors",
  description: "Catalogue the Stars",
  icons: {
    icon: "/favicon.ico",
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
  return <RootLayoutClient>{children}</RootLayoutClient>;
};