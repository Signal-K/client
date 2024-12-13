"use client";

import "@/styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState, ReactNode } from "react";
import Head from "next/head";
import { ActivePlanetProvider, useActivePlanet } from "@/context/ActivePlanet";
import dynamic from 'next/dynamic';
import { InventoryProvider } from "@/context/InventoryContext";
import { UserAnomaliesProvider } from "@/context/UserAnomalies";
import { bgImage, backgroundImages } from "@/constants/backgrounds";
import { Analytics } from "@vercel/analytics/react"
import { MissionProvider } from "@/context/MissionContext";
import Header from "@/components/ui/Header";

interface RootLayoutProps {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  const { activePlanet } = useActivePlanet();

  if (activePlanet) {
    useEffect(() => {
      console.log("Active Planet: ", activePlanet);
    }, [activePlanet]);
  }

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
          {/* <ThemeProviders attribute="class" defaultTheme="system" enableSystem> */}
            <ActivePlanetProvider>
                {/* <MissionProvider> */}
                    <UserAnomaliesProvider>
                      <InventoryProvider>
                        <div className="sci-fi-overlay">
                    <svg className="sci-fi-shape sci-fi-shape-1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100,10 L190,50 L190,150 L100,190 L10,150 L10,50 Z" fill="none" stroke="#5FCBC3" strokeWidth="2" />
                      <path d="M100,30 L170,60 L170,140 L100,170 L30,140 L30,60 Z" fill="none" stroke="#85DDA2" strokeWidth="2" />
                      <circle cx="100" cy="100" r="40" fill="none" stroke="#B9E678" strokeWidth="2" />
                      <circle cx="100" cy="100" r="20" fill="#FFE3BA" />
                    </svg>
                    <svg className="sci-fi-shape sci-fi-shape-2" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="10" width="180" height="180" rx="20" fill="none" stroke="#5FCBC3" strokeWidth="2" />
                      <rect x="40" y="40" width="120" height="120" rx="10" fill="none" stroke="#85DDA2" strokeWidth="2" />
                      <circle cx="100" cy="100" r="30" fill="none" stroke="#B9E678" strokeWidth="2" />
                      <path d="M70,100 Q100,130 130,100 Q100,70 70,100" fill="#FFE3BA" />
                    </svg>
                    <svg className="sci-fi-shape sci-fi-shape-3" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="100" cy="100" r="90" fill="none" stroke="#5FCBC3" strokeWidth="2" />
                      <path d="M100,20 A80,80 0 0,1 180,100 L100,100 Z" fill="#85DDA2" opacity="0.6" />
                      <path d="M100,100 A80,80 0 0,1 20,100 L100,100 Z" fill="#B9E678" opacity="0.6" />
                      <circle cx="100" cy="100" r="30" fill="#FFE3BA" />
                    </svg>
                    <div className="sci-fi-wire sci-fi-wire-1"></div>
                    <div className="sci-fi-wire sci-fi-wire-2"></div>
                    <div className="sci-fi-signal sci-fi-signal-1"></div>
                    <div className="sci-fi-signal sci-fi-signal-2"></div>
                  </div>
                  <div className="relative min-h-screen w-full flex flex-col">
                          {children}
                          </div>
                    <Analytics />
                  </InventoryProvider>
                </UserAnomaliesProvider>
                {/* </MissionProvider> */}
            </ActivePlanetProvider>
          {/* </ThemeProviders> */}
        </SessionContextProvider>
      </body>
    </html>
  );
};