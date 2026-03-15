"use client";

import "@/styles/globals.css";
import { SessionContextProvider } from "@/src/lib/auth/session-context";
import { useEffect, ReactNode, useState } from "react";
import { ActivePlanetProvider } from "@/src/core/context/ActivePlanet";
import { Analytics } from "@vercel/analytics/react";
import { usePostHog } from "posthog-js/react";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import { getOrCreateAnalyticsSessionToken } from "@/src/lib/analytics/session-token";
import { SpeedInsights } from "@vercel/speed-insights/next";

function RootLayoutInner({ children }: { children: ReactNode }) {
  const posthog = usePostHog();
  const { user } = useAuthUser();
  const [sessionToken] = useState<string | null>(() => getOrCreateAnalyticsSessionToken());

  useEffect(() => {
    if (!posthog) return;
    if (!user) { posthog.reset(); return; }
    posthog.identify(user.id, { email: user.email ?? undefined, supabase_uuid: user.id });
  }, [posthog, user]);

  useEffect(() => {
    if (!posthog || !sessionToken) return;
    posthog.register({ starsailors_session_token: sessionToken });
  }, [posthog, sessionToken]);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if ((window as any).Cypress || process.env.NODE_ENV === "test") return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((r) => r.unregister());
      });
      return;
    }

    navigator.serviceWorker
      .register("/service-worker.js?v=20260227-2", { scope: "/" })
      .catch((error) => console.error("Service Worker registration failed:", error));
  }, []);

  return <>{children}</>;
}

export default function RootLayoutClient({ children, fontClassName }: { children: ReactNode; fontClassName?: string }) {
  return (
    <html lang="en" className={fontClassName}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Star Sailors" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/assets/Captn.jpg" />
        <link rel="apple-touch-startup-image" href="/assets/Captn.jpg" />
      </head>
      <body>
        <SessionContextProvider>
          <ActivePlanetProvider>
            <RootLayoutInner>
              <div className="flex min-h-screen w-full">
                <main className="flex-1 min-w-0">
                  {children}
                </main>
              </div>
            </RootLayoutInner>
            <Analytics />
            <SpeedInsights />
          </ActivePlanetProvider>
        </SessionContextProvider>
      </body>
    </html>
  );
}
