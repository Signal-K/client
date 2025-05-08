import { ReactNode } from "react";
import type { Metadata } from "next";
import RootLayoutClient from "./RootLayoutClient";

export const metadata: Metadata = {
  title: "Star Sailors",
  description: "Catalogue the Stars",
  themeColor: "#ffffff",
  icons: {
    icon: "/favicon.ico",
    apple: [
      {
        url: "https://i.ibb.co/qrSP4gq/Removebg.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
};