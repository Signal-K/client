"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ActivePlanetProvider } from "@/src/core/context/ActivePlanet";
import Sidebar from "@/src/components/ui/Panels/Sidebar";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function ActivityLayout({ children }: { children: ReactNode }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());
  const [session, setSession] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data?.session ?? null);
    });
    // Listen for sidebar collapse/expand events
    const handler = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };
    window.addEventListener("sidebar:collapse", handler as EventListener);
    return () => {
      window.removeEventListener("sidebar:collapse", handler as EventListener);
    };
  }, [supabaseClient]);

  return (
    <html lang="en">
      <body>
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={null}>
          <ActivePlanetProvider>
            {/* <UserAnomaliesProvider> */}
              <div className="flex min-h-screen w-full">
                {/* Sidebar: fixed to left, does not scroll, desktop only */}
                {session && (
                  <div className="hidden sm:block fixed left-0 top-0 h-screen z-40">
                    <Sidebar />
                  </div>
                )}
                {/* Main content: margin-left for sidebar width, center if sidebar is collapsed, no margin if sidebar hidden */}
                <main
                  className={
                    session
                      ? (sidebarCollapsed
                          ? "flex-1 min-w-0 ml-16 flex justify-center items-center"
                          : "flex-1 min-w-0 ml-16 md:ml-80")
                      : "flex-1 min-w-0"
                  }
                >
                  {children}
                </main>
              </div>
              <Analytics />
              <SpeedInsights />
            {/* </UserAnomaliesProvider> */}
          </ActivePlanetProvider>
        </SessionContextProvider>
      </body>
    </html>
  );
}
