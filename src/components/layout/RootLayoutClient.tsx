"use client";

import "@/styles/globals.css";
import { SessionContextProvider } from "@/src/lib/auth/session-context";
import { useEffect, ReactNode } from "react";
import { ActivePlanetProvider, useActivePlanet } from "@/src/core/context/ActivePlanet";
import { Analytics } from "@vercel/analytics/react";
import { usePostHog } from "posthog-js/react";
import { useAuthUser } from "@/src/hooks/useAuthUser";
// import Sidebar from "../ui/Panels/Sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next";
// import { PostHogProvider } from "@/components/PostHogProvider";

function LayoutContent({ children }: { children: ReactNode }) {
  const { activePlanet } = useActivePlanet();

  useEffect(() => {
    if (activePlanet) {
      // activePlanet updated
    }
  }, [activePlanet]);

  return <>{children}</>;
}

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  const posthog = usePostHog();
  const { user } = useAuthUser();

  useEffect(() => {
    if (!posthog) return;

    if (!user) {
      posthog.reset();
      return;
    }

    posthog.identify(user.id, {
      email: user.email ?? undefined,
      supabase_uuid: user.id,
    });
  }, [posthog, user]);

  // Register service worker only in production to avoid stale chunk/HMR issues in dev.
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if ((window as any).Cypress || process.env.NODE_ENV === "test") return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    navigator.serviceWorker.register("/service-worker.js", { scope: "/" }).catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
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
        <SessionContextProvider>
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
