import { Button } from "@/ui/ui/button";
import { ReactNode } from "react";

interface PlanetLayoutProps {
    children: ReactNode;
};

export function PlanetLayout({ children }: PlanetLayoutProps) {
    return (
        <>
            {/* <Header /> */}
            <MainContent>{children}</MainContent>
            <Footer />
        </>
    );
};

interface HeaderProps {
  planetName: string;
};

export function Header({ planetName }: HeaderProps) {
  return (
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between bg-white/80 px-4 shadow-sm backdrop-blur-md dark:bg-gray-950/80 dark:text-gray-50">
          <div className="flex items-center gap-4">
              <Button className="rounded-full p-2" size="icon" variant="outline">
                  <CompassIcon className="h-5 w-5" />
              </Button>
              <Button className="rounded-full p-2" size="icon" variant="outline">
                  <ArrowLeftIcon className="h-5 w-5" />
              </Button>
          </div>
          <div className="flex flex-col items-center">
              <div className="inline-block rounded-lg bg-gray-100/80 px-3 py-1 text-sm backdrop-blur-md dark:bg-gray-800/80">
                  Home
              </div>
              <h1 className="text-lg font-semibold">{planetName}</h1>
          </div>
          <div className="flex items-center gap-4 relative">
              <Button className="rounded-full p-2" size="icon" variant="outline">
                  <ArrowRightIcon className="h-5 w-5" />
              </Button>
              <Button className="rounded-full p-2" size="icon" variant="outline">
                  <BookOpenIcon className="h-5 w-5" />
              </Button>
          </div>
      </header>
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

function ArrowLeftIcon(props: any) {
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
  
  
  function ArrowRightIcon(props: any) {
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
  
  
  function BookOpenIcon(props: any) {
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
  
  
  function CompassIcon(props: any) {
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
  
  
  function HomeIcon(props: any) {
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
  
  
  function SearchIcon(props: any) {
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
  