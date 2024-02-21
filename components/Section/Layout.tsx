import Navbar from "./Navbar";
import React, { ReactNode, useEffect, useState } from "react";
import Bottombar from "../Core/BottomBar";
import { useMediaQuery } from "react-responsive";
import FeedOverlay from "../Overlays/1-Feed";

interface DashboardLayoutProps {
  children: ReactNode;
}; 

const Layout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  const [showFeedOverlay, setShowFeedOverlay] = useState(false);
  const handleOpenFeedOverlay = () => {
    setShowFeedOverlay(true);
  };

  useEffect(() => {     // Check if window is defined before accessing it
    if (typeof window !== "undefined") {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      return () => {
        window.removeEventListener("resize", checkIsMobile);
      };
    }
  }, []);

  return (
    <>
        {!isMobile && (
          <main className="h-max pb-10 grow pt-6">
            <Navbar />
            <div className="py-12">
            {children}
            </div>
          </main>
        )}
      {isMobile && (
        <div className="md:hidden overflow-y-auto h-screen p-4">
          <main className="h-max pb-10 grow">{children}</main>
          <Bottombar />
        </div>
      )}
      <div className="mt-20">
             {showFeedOverlay && (
               <>
                 <div className="mt-20">
                   <FeedOverlay onClose={() => setShowFeedOverlay(false)} />
                 </div>
               </>
             )}
           </div>
      {!showFeedOverlay && (
           <button
             onClick={handleOpenFeedOverlay}
             className="fixed bottom-2 left-1/2 transform -translate-x-1/2 mt-4 px-4 py-2 text-white rounded"
           >
             <a
               href="#_"
               className="inline-flex overflow-hidden text-white bg-gray-900 rounded group"
             >
               <span className="px-3.5 py-2 text-white bg-purple-500 group-hover:bg-purple-600 flex items-center justify-center">
                 <svg
                   className="w-5 h-5"
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg"
                 >
                   <path
                     stroke-linecap="round"
                     stroke-linejoin="round"
                     stroke-width="2"
                     d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                   ></path>
                 </svg>
               </span>
               <span className="pl-4 pr-5 py-2.5">Menu</span>
             </a>
           </button>
         )}
    </>
  );
};

export default Layout;

export const InventoryLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('consumables')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      return () => {
        window.removeEventListener('resize', checkIsMobile);
      };
    };
  }, []);

  return (
    <>
      <main className="h-max pb-10 grow pt-6">
        <Navbar />
        <div className="py-12">
          {children}
        </div>
      </main>
      {isMobile && (
        <div className="md:hidden overflow-y-auto h-screen p-4">
          <main className="h-max pb-10 grow">{children}</main>
          <Bottombar />
        </div>
      )}
    </>
  );
};

export const LayoutNoNav: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      return () => {
        window.removeEventListener("resize", checkIsMobile);
      };
    }
  }, []);

  return (
    <div className="flex relative items-start h-screen overflow-hidden">
      <main className="h-max pb-10 grow overflow-y-auto">
        {children}
      </main>
      {/* {isMobile && (
        <div className="w-full md:hidden fixed bottom-0 left-0 z-50">
          <Bottombar />
        </div>
      )} */}
    </div>
  );
};