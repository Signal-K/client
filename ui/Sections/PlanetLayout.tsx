"use client";

import MissionList from "@/app/components/_[archive]/Content/MissionList";
import { useActivePlanet } from "@/context/ActivePlanet";
import { Button } from "@/app/components/_[archive]/ui/button";
import { PaintRollerIcon, ArrowRightIcon as LucideArrowRightIcon, ArrowLeftIcon as LucideArrowLeftIcon, BookOpenIcon as LucideBookOpenIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import GoToYourPlanet from "@/app/components/_[archive]/Gameplay/Travel/InitTravel";
import ClassificationsFeed from "@/app/components/_[archive]/Classifications/ClassificationFeed";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import NavMenu from "@/app/components/_[archive]/(layout)/menu";
import { MainContentProps } from "@/types/Layout/Globals";
import { PostCard } from "@/app/components/_[archive]/(create)/(classifications)/ClassificationByType";
import { PlanetLayoutProps } from "@/types/Layout/Globals";
import { TellUsWhatYouThinkClassificationBlock } from "@/app/components/_[archive]/Tutorial/TextBlocks";
 
export default function PlanetLayout({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet, updatePlanetLocation } = useActivePlanet();
  
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFeed, setShowFeed] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showClassificationsFeed, setShowClassificationsFeed] = useState(false);

  const handleLeftArrowClick = () => {
    if (activePlanet?.id && parseInt(activePlanet.id) > 1) {
      const newId = parseInt(activePlanet.id) - 1;
      setShowAnimation(true);
      setTimeout(() => {
        updatePlanetLocation(newId);
        setShowAnimation(false);
      }, 2000);
    }
  };

  const handleRightArrowClick = () => {
    if (activePlanet?.id && parseInt(activePlanet.id) < 6) {
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

  return (
    <>
      <header className="left-0 right-0 z-50 flex h-16 w-full items-center justify-between bg-white/80 px-4 shadow-sm backdrop-blur-md dark:bg-gray-950/80 dark:text-gray-50">
        <div className="flex items-center gap-4">
          <Button
            className="rounded-full p-2"
            size="icon"
            variant="outline"
            onClick={handleLeftArrowClick}
            style={{ visibility: activePlanetId === 1 ? 'hidden' : 'visible' }}
          >
            <LucideArrowLeftIcon className="h-5 w-5" />
          </Button>
          <Button
            className="rounded-full p-2"
            size="icon"
            variant="outline"
            onClick={handleOpenSlideover}
          >
            <LucideBookOpenIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col items-center">
          <div className="inline-block rounded-lg bg-gray-100/80 px-3 py-1 text-sm backdrop-blur-md dark:bg-gray-800/80">
            {/* Home */}
            <NavMenu onMyDiscoveriesClick={handleOpenClassificationsFeed} />
          </div>
          <h1 className="text-lg font-semibold">{activePlanet?.content}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            className="rounded-full p-2"
            size="icon"
            variant="outline"
            onClick={handleOpenClassificationsFeed}
          >
            <PaintRollerIcon className="h-5 w-5" />
          </Button>
          <Button
            className="rounded-full p-2"
            size="icon"
            variant="outline"
            onClick={handleRightArrowClick}
            style={{ visibility: activePlanetId === 6 ? 'hidden' : 'visible' }}
          >
            <LucideArrowRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </header>
      {showAnimation && activePlanetId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-950">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] animate-spaceship">
              <img
                src="https://i.pinimg.com/originals/f7/be/aa/f7beaa7787bd55e9ac54135566d6af97.gif"
                width={200}
                height={200}
                alt="Spaceship"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">Transitioning...</h3>
              <p className="text-gray-500 dark:text-gray-400">Hold on tight, we're about to jump to hyperspace!</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-8">
          <MainContent>{children}</MainContent>
        </div>
      )}
      {showSidebar && (
        <div
          id="overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleCloseSlideover}
        >
          <div className="relative bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <Button
              className="absolute top-2 right-2 rounded-full p-2"
              size="icon"
              variant="outline"
              onClick={handleOpenSlideover}
            >
              <LucideArrowLeftIcon className="h-5 w-5" />
            </Button>
            <PostCard /> {/* <ClassificationsFeed /> */}
          </div>
        </div>
      )}
      {showClassificationsFeed && (
        <div
          id="overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleCloseClassificationsFeed}
        >
          <div
            className="relative w-4/5 max-w-4xl h-4/5 bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800 overflow-y-auto" // Added overflow-y-auto for scrolling
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              id="close-btn"
              className="absolute top-2 right-2 rounded-full p-2"
              size="icon"
              variant="outline"
              onClick={handleCloseClassificationsFeed}
            >
              ✕
            </Button>
            <TellUsWhatYouThinkClassificationBlock />
          </div>
        </div>
      )}
    </>
  );
}

export function MainContent({ children, backgroundImage }: MainContentProps) {
    return (
        <main className="pt-20 pb-20 md:pb-0" style={{ backgroundImage }}>
            {children}
        </main>
    );
};

export function Footer() {
    return (
      <>
        <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-center bg-white/80 px-4 shadow-sm backdrop-blur-md dark:bg-gray-950/80 dark:text-gray-50 md:hidden">
          <Button className="rounded-full p-2" size="icon" variant="outline">
            <HomeIcon className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
        </footer>
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between bg-white/80 px-4 shadow-sm backdrop-blur-md dark:bg-gray-950/80 dark:text-gray-50 hidden md:flex">
          <div className="flex items-center gap-4">
            <Button className="rounded-full p-2" size="icon" variant="outline">
              <HomeIcon className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Button>
            <Button className="rounded-full p-2" size="icon" variant="outline">
              <SearchIcon className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </nav>
      </>
    );
};

export function ArrowLeftIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
    )
  }
  
  
  export function ArrowRightIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    )
  }
  
  
  export function BookOpenIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    )
  }
  
  
  export function CompassIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    )
  }
  
  
  export function HomeIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  }
  
  
  export function SearchIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    )
  }
  