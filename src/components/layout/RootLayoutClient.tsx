"use client";

import "@/styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useEffect, useState, ReactNode } from "react";
import { ActivePlanetProvider, useActivePlanet } from "@/src/core/context/ActivePlanet";
import { UserAnomaliesProvider } from "@/src/core/context/UserAnomalies";
import { Analytics } from "@vercel/analytics/react";
import { SectionSidebar } from "@/src/components/ui/Panels/Sidebar";
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

  // Track sidebar collapsed state using a custom event
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get session from supabaseClient
  const [session, setSession] = useState<any>(null);
  // Track current route for sidebar hiding
  const [hideSidebar, setHideSidebar] = useState(false);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data?.session ?? null);
    });
    // Listen for sidebar collapse/expand events
    const handler = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };
    window.addEventListener("sidebar:collapse", handler as EventListener);

    // Listen for route changes
    const checkRoute = () => {
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        // Hide sidebar for /posts/[id] and /next/[id] routes
        setHideSidebar(
          /^\/posts\/[\w-]+$/.test(path) ||
          /^\/next\/[\w-]+$/.test(path)
        );
      }
    };
    checkRoute();
    window.addEventListener("popstate", checkRoute);
    window.addEventListener("pushstate", checkRoute);
    window.addEventListener("replacestate", checkRoute);
    return () => {
      window.removeEventListener("sidebar:collapse", handler as EventListener);
      window.removeEventListener("popstate", checkRoute);
      window.removeEventListener("pushstate", checkRoute);
      window.removeEventListener("replacestate", checkRoute);
    };
  }, [supabaseClient]);

  return (
    <html lang="en">
      <body>
        {/* <PostHogProvider> */}
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={null}>
          {/* <ThemeProviders attribute="class" defaultTheme="system" enableSystem> */}
          <ActivePlanetProvider>
            {/* <MissionProvider> */}
            <UserAnomaliesProvider>
              <LayoutContent>
                {/* Sidebar and main content layout */}
                <div className="flex min-h-screen w-full">
                  {/* Sidebar: fixed to left, does not scroll */}
                  {session && !hideSidebar && (
                    <div className="fixed left-0 top-0 h-screen z-40">
                      <SectionSidebar />
                    </div>
                  )}
                  {/* Main content: margin-left for sidebar width, center if sidebar is collapsed, no margin if sidebar hidden */}
                  <main
                    className={
                      session && !hideSidebar
                        ? (sidebarCollapsed
                            ? "flex-1 min-w-0 ml-16 flex justify-center items-center"
                            : "flex-1 min-w-0 ml-16 md:ml-80")
                        : "flex-1 min-w-0"
                    }
                  >
                    {children}
                  </main>
                </div>
              </LayoutContent>
              <Analytics />
              <SpeedInsights />
            </UserAnomaliesProvider>
            {/* </MissionProvider> */}
          </ActivePlanetProvider>
          {/* </ThemeProviders> */}
        </SessionContextProvider>
        {/* </PostHogProvider> */}
      </body>
    </html>
  );
};