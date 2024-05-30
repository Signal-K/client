"use client";

import "@/styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs"; // Updated import
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";
import Head from "next/head";
import { ActivePlanetProvider } from "@/context/ActivePlanet";
import dynamic from 'next/dynamic';
import { InventoryProvider } from "@/context/InventoryContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient()); // Updated function

  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Star Sailors</title>
        <meta name="description" content="Catalogue the Stars" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="mask-icon" href="/icons/mask-icon.svg" color="#FFFFFF" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="https://i.ibb.co/qrSP4gq/Removebg.png" />
        <link
          rel="https://i.ibb.co/qrSP4gq/Removebg.png"
          sizes="152x152"
          href="https://i.ibb.co/qrSP4gq/Removebg.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="https://i.ibb.co/qrSP4gq/Removebg.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="https://i.ibb.co/qrSP4gq/Removebg.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Star Sailors" />
        <meta property="og:image" content="/icons/og.png" />
        <link
          rel="apple-touch-startup-image"
          href="https://i.ibb.co/qrSP4gq/Removebg.png"
          sizes="2048x2732"
        />
        <link
          rel="apple-touch-startup-image"
          href="https://i.ibb.co/qrSP4gq/Removebg.png"
          sizes="1668x2224"
        />
      </Head>
      <body>
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={null}>
          <ActivePlanetProvider>
            <InventoryProvider>
                {children}
            </InventoryProvider>
          </ActivePlanetProvider>
        </SessionContextProvider>
      </body>
    </html>
  );
}
