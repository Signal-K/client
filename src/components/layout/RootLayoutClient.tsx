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

  return (
    <html lang="en">
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