"use client";

import "@/styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSession } from "@supabase/auth-helpers-react";
import { subscribeToPushNotifications } from "@/src/shared/utils/usePushNotifications";
import { useEffect, useState, ReactNode } from "react";
import { ActivePlanetProvider, useActivePlanet } from "@/src/core/context/ActivePlanet";
import { UserAnomaliesProvider } from "@/src/core/context/UserAnomalies";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
// import { PostHogProvider } from "@/components/PostHogProvider";

function LayoutContent({ children }: { children: ReactNode }) {
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  useEffect(() => {
    if (activePlanet) {
      console.log("Active Planet: ", activePlanet);
    }
  }, [activePlanet]);

  useEffect(() => {
    if (session?.user?.id) {
      subscribeToPushNotifications({ user: { id: session.user.id } });
    }
  }, [session]);

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