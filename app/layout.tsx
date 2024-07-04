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
import { RefreshProvider } from "@/context/RefreshState";
import CraftStructure from "@/components/Gameplay/Inventory/Actions/CraftStructure";
// import { CreateStructureWithItemRequirementinfo } from "@/components/Gameplay/Inventory/Structures/Structure";

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
            <RefreshProvider>
              <UserAnomaliesProvider>
                <InventoryProvider>
                  <FrontendLayout bg={true}>
                    {children}
                  </FrontendLayout>
                </InventoryProvider>
              </UserAnomaliesProvider>
            </RefreshProvider>
          </ActivePlanetProvider>
        </SessionContextProvider>
      </body>
    </html>
  );
};

interface LayoutProps {
  children: ReactNode;
  bg: any;
};

interface ResponsiveLayoutProps {
  leftContent: React.ReactNode;
  middleContent: React.ReactNode;
  // rightContent: React.ReactNode;
};

interface SectionProps {
  background: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ background, children }) => (
  <div
    className="flex items-center justify-center h-full w-full"
    style={{
      backgroundImage: background,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100%',
      width: '100%',
    }}
  >
    {children}
  </div>
);

export const SidebarLayout: React.FC<ResponsiveLayoutProps> = ({
  leftContent,
  middleContent,
  // rightContent
}) => {
  return (
    <div className="min-h-screen h-screen w-screen">
      {/* Desktop layout */}
      <div className="hidden md:flex md:flex-row h-full w-full">
        <div className="w-1/3 h-full">
          <Section background="url('https://cdn.cloud.scenario.com/assets/asset_W9ntQkasoZdEWHBKki2aczui?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9XOW50UWthc29aZEVXSEJLa2kyYWN6dWk~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzIwMzk2Nzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=fg079eZKhY1JGCnYCFvczY3QNzQEDUFGsVoyl1S8jMK563Gq9x7uC~2y-BLouaKeXpUMZ~3koWD7XT8yhNTgFgZ3K9jNiZTyLW-HoCeyUxo~ZiR6tjDqSXbFsgAt7OY1A9E6oo5ENTPG7z0kseEQ6~hcpki9h~LmlT2mMl9cakFvIsvXfsOystd5tZK-deaQw-werQiQBO7pmXrv5jAoviMOQlivWrS5AqQ~Pxf1Y6UVAnumSCGazVJ9~neSYWq1ZSMT-u9NKcvb5cRqXClcuRfILmc18Cv5BkY3j0kXLTXTOHjSxPGMGwOmwJ-fwd4YrK5sesuNgK6rnMWgL38aAQ__')">
            {leftContent}
          </Section>
        </div>
        <div className="w-2/3 h-full py-8">
          <Section background="url('https://cdn.cloud.scenario.com/assets/asset_un7QCUWx8HnH4bKqtjYs9XFs?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF91bjdRQ1VXeDhIbkg0YktxdGpZczlYRnM~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzIwMzk2Nzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=rN0zru~9DMAHya9Vmw~NySElneuz43yi~~X1g-rYjusvuAv98fAZc78cL11SCtWZuVYfTg1es0h4LCvnGA8fWlug~UTKboDT4grVIMRL~o0UhVkDY3ZYEji8dzjSaUjewSHCOfMpJ3gSwXBxGOYV2EnBCan0z8sZPETQCNAqV-n6y2GndbkL~VOx2iSdDKQFO27sh-XQ7xsOZ8XFoD6iuOHILnLBNuFqng8Ak8pzPyQeU2Y51uA2WJbnUCRwv2vSJ4F~g1ATsthjhWs3OWiyr0x8EDxA483QYcTcOvB5Wdc8u0pyuewjqUtf9qNgn1Qn1GWCD3HfHLe~-adEZFok9Q__')">
            {middleContent}
          </Section>
        </div>
      </div>

      {/* Mobile layout */}      
      <div className="md:hidden flex flex-col min-h-screen h-screen relative">
        <div className="h-1/4">
          <Section background="url('https://cdn.cloud.scenario.com/assets/asset_W9ntQkasoZdEWHBKki2aczui?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9XOW50UWthc29aZEVXSEJLa2kyYWN6dWk~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzIwMzk2Nzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=fg079eZKhY1JGCnYCFvczY3QNzQEDUFGsVoyl1S8jMK563Gq9x7uC~2y-BLouaKeXpUMZ~3koWD7XT8yhNTgFgZ3K9jNiZTyLW-HoCeyUxo~ZiR6tjDqSXbFsgAt7OY1A9E6oo5ENTPG7z0kseEQ6~hcpki9h~LmlT2mMl9cakFvIsvXfsOystd5tZK-deaQw-werQiQBO7pmXrv5jAoviMOQlivWrS5AqQ~Pxf1Y6UVAnumSCGazVJ9~neSYWq1ZSMT-u9NKcvb5cRqXClcuRfILmc18Cv5BkY3j0kXLTXTOHjSxPGMGwOmwJ-fwd4YrK5sesuNgK6rnMWgL38aAQ__')">
            {leftContent}
          </Section>
        </div>
        <div className="h-3/4 py-4">
          <Section background="url('https://cdn.cloud.scenario.com/assets/asset_g3k2hJwrN9TZGwzvA9tMwnSi?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9nM2syaEp3ck45VFpHd3p2QTl0TXduU2k~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzIwMzk2Nzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=Him5jIqdVzqb8Hua3qLfpxBg9PPuTx9lfyqSHP7C2xzaGpe2psRTYZqpW8noslbKZ8ghlhFi4ETYpGcLLnHuY71LDSZTOcvQWOWd-F4ePaj4bekU3H-ai08rwGPVeEAxJZzkFuEeY8BjR9UPt3yReXDRU19JMfP0KfMTmsputxPs5aq1aftz8aQhLfQVkHobgTOkCZ7lSf3YkoF4zKSDYFEKHthO5AwvwYQcvHZebhmzfQwnESX7LrroPoV1AKYw5yNq~jkItS3ic5KdjHMVepJFDYMgyGRWFli~zhKLoCmiOgwnOcEcjq87WAhH1lq9zMwiYr09WuUCuvi6Y5gKLw__')">
            {middleContent}
          </Section>
        </div>
        {/* <Section background="url('/path/to/right-image.jpg')">
          {rightContent}
        </Section> */}
      </div>
    </div>
  );
};

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
          // backgroundImage: `url(${bgImage})`,
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
      {/* <CreateStructureWithItemRequirementinfo craftingItemId={30} /> */}
    </div>
  );
};