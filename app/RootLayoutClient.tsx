"use client";

import "@/styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useEffect, useState, ReactNode } from "react";
import { ActivePlanetProvider, useActivePlanet } from "@/src/core/context/ActivePlanet";
import { UserAnomaliesProvider } from "@/src/core/context/UserAnomalies";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={null}>
          {/* <ThemeProviders attribute="class" defaultTheme="system" enableSystem> */}
          <ActivePlanetProvider>
            {/* <MissionProvider> */}
            <UserAnomaliesProvider>
                <LayoutContent>
                  {/* <div className="sci-fi-overlay">
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
                  </div> */}
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
      </body>
    </html>
  );
};