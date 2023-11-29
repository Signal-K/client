import Sidebar from "./Sidebar";
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
      <Navbar />
      <div className="flex relative items-start">
        <Sidebar />
        <main className="h-max pb-10 grow">{children}</main>
        {isMobile && (
          <div className="w-full md:hidden fixed bottom-0 left-0 z-50">
            <Bottombar />
          </div>
        )}
      </div>
    </>
  );
};

export default Layout;

export const LayoutNoNav: React.FC<DashboardLayoutProps> = ({ children }) => {
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
      <div className="flex relative items-start">
        <Sidebar />
        <main className="h-max pb-10 grow">{children}</main>
        {isMobile && (
          <div className="w-full md:hidden fixed bottom-0 left-0 z-50">
            <Bottombar />
          </div>
        )}
      </div>
    </>
  );
};