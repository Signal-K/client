import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import React, { PropsWithChildren } from "react";
import Bottombar from "../Core/BottomBar";

const Layout: React.FC = () => {
    const isMobile = window.innerWidth <= 768; // Adjust the threshold as needed

  return (
    <>
      {/* <Navbar /> */}
      <div className="flex relative items-start">
        <Sidebar />
        <main className="h-max pb-10 grow"></main>
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