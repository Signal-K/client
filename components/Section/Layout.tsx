import Sidebar, { DesktopSidebar } from "./Sidebar";
import Navbar from "./Navbar";
import React, { ReactNode, useEffect, useState } from "react";
import Bottombar from "../Core/BottomBar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const Layout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined before accessing it
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

export default Layout;

export const LayoutWithSidebar: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined before accessing it
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
      <div className="hidden md:flex relative items-start">
        <DesktopSidebar />
        <main className="h-max pb-10 grow ml-64 pt-6">
          {/* <Navbar /> */}
          {children}
        </main>
      </div>
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
      {isMobile && (
        <div className="w-full md:hidden fixed bottom-0 left-0 z-50">
          <Bottombar />
        </div>
      )}
    </div>
  );
};