"use client";

import { useActivePlanet } from "@/context/ActivePlanet";
import { Button } from "@/ui/button";
import { ReactNode, useState } from "react";
import Slideover from "../Panels/Anomalies";

interface PlanetLayoutProps {
  children: ReactNode;
};

export function PlanetLayout({ children }: PlanetLayoutProps) {
  const { activePlanet, setActivePlanet, updatePlanetLocation } = useActivePlanet();

  const handleLeftArrowClick = () => {
    if (activePlanet?.id && parseInt(activePlanet.id) > 1) {
      const newId = parseInt(activePlanet.id) - 1;
      updatePlanetLocation(newId);
    }
  };

  const handleRightArrowClick = () => {
    if (activePlanet?.id && parseInt(activePlanet.id) < 6) {
      const newId = parseInt(activePlanet.id) + 1;
      updatePlanetLocation(newId);
    }
  };

  const activePlanetId = activePlanet?.id ? parseInt(activePlanet.id) : undefined;

  const [showSlideover, setShowSlideover] = useState(false);

    const handleOpenSlideover = () => {
        setShowSlideover(true);
    };

    const handleCloseSlideover = () => {
        setShowSlideover(false);
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
                <ArrowLeftIcon className="h-5 w-5" />
            </Button>
        </div>
        <div className="flex flex-col items-center">
            <div className="inline-block rounded-lg bg-gray-100/80 px-3 py-1 text-sm backdrop-blur-md dark:bg-gray-800/80">
                Home
            </div>
            <h1 className="text-lg font-semibold">{activePlanet?.content}</h1>
        </div>
        <div className="flex items-center gap-4">
            <Button 
              className="rounded-full p-2" 
              size="icon" 
              variant="outline" 
              onClick={handleRightArrowClick} 
              style={{ visibility: activePlanetId === 6 ? 'hidden' : 'visible' }}
            >
                <ArrowRightIcon className="h-5 w-5" />
            </Button>
            <Button 
                  className="rounded-full p-2" 
                  size="icon" 
                  variant="outline" 
                  onClick={handleOpenSlideover} 
                >
                    <BookOpenIcon className="h-5 w-5" />
                </Button>
        </div>
    </header>
          <div className="my-8">
            <MainContent>
              {children}
              {showSlideover && <Slideover onClose={handleCloseSlideover} showSlideover={false} />}
            </MainContent>
          </div>
          {/* <Footer /> */}
      </>
  );
};

interface MainContentProps {
    children: ReactNode;
    backgroundImage?: string;
}

export function MainContent({ children, backgroundImage }: MainContentProps) {
    return (
        <main className="pt-20 pb-20 md:pb-0" style={{ backgroundImage }}>
            {children}
        </main>
    );
}

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
  