"use client";

import "@/styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useEffect, useState, ReactNode } from "react";
import { ActivePlanetProvider, useActivePlanet } from "@/src/core/context/ActivePlanet";
import { UserAnomaliesProvider } from "@/src/core/context/UserAnomalies";
import { Analytics } from "@vercel/analytics/react";
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
                  {/* <div className="sci-fi-overlay"> ... </div> */}
                  <div className="relative min-h-screen w-full flex flex-col">
                    {children}
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