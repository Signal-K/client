"use client";

import "@/styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useEffect, useState, ReactNode } from "react";
import { ActivePlanetProvider, useActivePlanet } from "@/src/core/context/ActivePlanet";
import { UserAnomaliesProvider } from "@/src/core/context/UserAnomalies";
import { Analytics } from "@vercel/analytics/react";
import Sidebar from "../ui/Panels/Sidebar";
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
        // Always show sidebar on index route
        if (path === "/") {
          setHideSidebar(false);
          return;
        }
        // Hide sidebar for /posts/[id], /next/[id], /planets/paint/[id], /viewports/satellite/deploy, and /activity/deploy/
        setHideSidebar(
          /^\/posts\/[\w-]+$/.test(path) ||
          /^\/next\/[\w-]+$/.test(path) ||
          /^\/planets\/paint\/[\w-]+$/.test(path) ||
          path === "/viewports/satellite/deploy" ||
          path === "/activity/deploy/"
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
                    <div className="hidden sm:block fixed left-0 top-0 h-screen z-40">
                      <Sidebar />
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