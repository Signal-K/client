import Sidebar, { DesktopSidebar } from "./Sidebar";
import Navbar from "./Navbar";
import React, { ReactNode, useEffect, useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const Layout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

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
        <main className="h-max pb-10 grow pt-6">
          <Navbar />
          <div className="py-12">
            {children}
          </div>
        </main>
      {isMobile && (
        <div className="md:hidden overflow-y-auto h-screen p-4">
          <main className="h-max pb-10 grow">{children}</main>
        </div>
      )}
    </>
  );
};

export default Layout;