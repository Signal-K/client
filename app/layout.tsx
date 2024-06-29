"use client";

import "@/styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState, ReactNode } from "react";
import Head from "next/head";
import { ActivePlanetProvider, useActivePlanet } from "@/context/ActivePlanet";
import dynamic from 'next/dynamic';
import { InventoryProvider } from "@/context/InventoryContext";
import { UserAnomaliesProvider } from "@/context/UserAnomalies";
import { bgImage, backgroundImages } from "@/constants/backgrounds";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  const { activePlanet } = useActivePlanet();

  if (activePlanet) {
    useEffect(() => {
      console.log("Active Planet: ", activePlanet);
    }, [activePlanet]);
  }

  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Star Sailors</title>
        <meta name="description" content="Catalogue the Stars" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="mask-icon" href="/icons/mask-icon.svg" color="#FFFFFF" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="https://i.ibb.co/qrSP4gq/Removebg.png" />
        <link
          rel="https://i.ibb.co/qrSP4gq/Removebg.png"
          sizes="152x152"
          href="https://i.ibb.co/qrSP4gq/Removebg.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="https://i.ibb.co/qrSP4gq/Removebg.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="https://i.ibb.co/qrSP4gq/Removebg.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Star Sailors" />
        <meta property="og:image" content="/icons/og.png" />
        <link
          rel="apple-touch-startup-image"
          href="https://i.ibb.co/qrSP4gq/Removebg.png"
          sizes="2048x2732"
        />
        <link
          rel="apple-touch-startup-image"
          href="https://i.ibb.co/qrSP4gq/Removebg.png"
          sizes="1668x2224"
        />
      </Head>
      <body>
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={null}>
          <ActivePlanetProvider>
            <UserAnomaliesProvider>
              <InventoryProvider>
                <FrontendLayout bg={true}>
                  {children}
                </FrontendLayout>
              </InventoryProvider>
            </UserAnomaliesProvider>
          </ActivePlanetProvider>
        </SessionContextProvider>
      </body>
    </html>
  );
};

interface LayoutProps {
  children: ReactNode;
  bg: any;
}

function FrontendLayout({ children }: LayoutProps) {
  // Layout components
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet, updatePlanetLocation } = useActivePlanet();

  const [showSidebar, setShowSidebar] = useState(false);
  const [showFeed, setShowFeed] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showClassificationsFeed, setShowClassificationsFeed] = useState(false);
  const [canChangePlanet, setCanChangePlanet] = useState(false);

  useEffect(() => {
    const checkInventory = async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('owner', session?.user.id);

      if (error) {
        console.error('Error fetching inventory:', error);
        return;
      }

      if (data) {
        const hasSpacecraft = data.some(
          (item) => item.item === 29 && item.anomaly === activePlanet?.id
        );
        const hasLaunchpad = data.some(
          (item) => item.item === 33 && item.anomaly && item.time_of_deploy
        );

        setCanChangePlanet(hasSpacecraft && hasLaunchpad);
      }
    };

    if (session?.user.id && activePlanet?.id) {
      checkInventory();
    }
  }, [session?.user.id, activePlanet?.id]);

  const handleLeftArrowClick = () => {
    if (canChangePlanet && activePlanet?.id && parseInt(activePlanet.id) > 1) {
      const newId = parseInt(activePlanet.id) - 1;
      setShowAnimation(true);
      setTimeout(() => {
        updatePlanetLocation(newId);
        setShowAnimation(false);
      }, 2000);
    }
  };

  const handleRightArrowClick = () => {
    if (canChangePlanet && activePlanet?.id && parseInt(activePlanet.id) < 6) {
      const newId = parseInt(activePlanet.id) + 1;
      setShowAnimation(true);
      setTimeout(() => {
        updatePlanetLocation(newId);
        setShowAnimation(false);
      }, 2000);
    }
  };

  const activePlanetId = activePlanet?.id ? parseInt(activePlanet.id) : null;

  const handleOpenFeed = () => {
    setShowFeed(!showFeed);
  };

  const handleCloseFeed = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'overlay') {
      setShowFeed(false);
    }
  };

  const handleOpenSlideover = () => {
    setShowSidebar(!showSidebar);
  };

  const handleCloseSlideover = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'overlay') {
      setShowSidebar(false);
    }
  };

  const handleOpenClassificationsFeed = () => {
    setShowClassificationsFeed(true);
    document.body.style.overflow = 'hidden'; // Disable body scroll
  };

  const handleCloseClassificationsFeed = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'overlay' || (e.target as HTMLElement).id === 'close-btn') {
      setShowClassificationsFeed(false);
      document.body.style.overflow = 'auto'; // Enable body scroll
    }
  };

  // For background context
  // const { activePlanet } = useActivePlanet(); - already called
  const planetId = Number(activePlanet?.id ?? 1);

  if (!activePlanet || activePlanet == null) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {children}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${(backgroundImages as any)[planetId]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {children}
    </div>
  );
};