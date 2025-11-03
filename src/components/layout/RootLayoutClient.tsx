"use client";

import "@/styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useEffect, useState, ReactNode } from "react";
import { ActivePlanetProvider, useActivePlanet } from "@/src/core/context/ActivePlanet";
import { Analytics } from "@vercel/analytics/react";
// import Sidebar from "../ui/Panels/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next";
// import { PostHogProvider } from "@/components/PostHogProvider";

function LayoutContent({ children }: { children: ReactNode }) {
  const { activePlanet } = useActivePlanet();

  useEffect(() => {
    if (activePlanet) {
      console.log("Active Planet: ", activePlanet);
    }
  }, [activePlanet]);

  return <>{children}</>;
}

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  // Get session from supabaseClient
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data?.session ?? null);
    });
  }, [supabaseClient]);

  // Register service worker for offline access
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // First, try to register our custom service worker
      navigator.serviceWorker
        .register("/service-worker.js", { scope: "/" })
        .then((registration) => {
          console.log("Custom Service Worker registered:", registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, prompt user to reload
                  console.log('New service worker available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
          
          // Fallback to next-pwa generated service worker
          navigator.serviceWorker
            .register("/sw.js", { scope: "/" })
            .then((registration) => {
              console.log("Fallback Service Worker registered:", registration);
            })
            .catch((error) => {
              console.error("Fallback Service Worker also failed:", error);
            });
        });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        {/* iOS PWA specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Star Sailors" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/assets/Captn.jpg" />
        <link rel="apple-touch-startup-image" href="/assets/Captn.jpg" />
      </head>
      <body>
        {/* <PostHogProvider> */}
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={null}>
          {/* <ThemeProviders attribute="class" defaultTheme="system" enableSystem> */}
          <ActivePlanetProvider>
            {/* <MissionProvider> */}
              <LayoutContent>
                {/* Main content layout without sidebar */}
                <div className="flex min-h-screen w-full">
                  <main className="flex-1 min-w-0">
                    {children}
                  </main>
                </div>
              </LayoutContent>
              <Analytics />
              <SpeedInsights />
            {/* </MissionProvider> */}
          </ActivePlanetProvider>
          {/* </ThemeProviders> */}
        </SessionContextProvider>
        {/* </PostHogProvider> */}
      </body>
    </html>
  );
};