import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Navbar from "./Navbar";
import MusicPlayer from "./assets/MusicPlayer";
// import Footer from "./Footer";

interface DashboardLayoutProps {
    children: ReactNode;
}
  
interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    href: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href }) => {
    const router = useRouter();
    const isActive = router.pathname === href;
  
    return (
      <Link legacyBehavior href ={href}>
        <a
          className={`flex items-center px-4 py-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 ${
            isActive ? 'bg-green-500 text-white' : ''
          }`}
        >
          {icon}
          <span className="ml-2">{label}</span>
        </a>
      </Link>
    );
};

const CoreLayout: React.FC<DashboardLayoutProps> = ( { children } ) => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on both mobile and desktop
  const supabase = useSupabaseClient();
  const session = useSession();
  const [profile, setProfile] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState);
  };

  useEffect(() => {
    // Update the view mode on initial render and window resize
    const handleWindowResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    supabase
      .from("profiles")
      .select()
      .eq("id", session?.user?.id)
      .then((result) => {
        if (result.data) {
          setProfile(result.data[0]);
        }
    });

    handleWindowResize(); // Set the initial view mode

    // Attach the event listener for window resize
    window.addEventListener('resize', handleWindowResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    // Disable body scrolling when the sidebar is open in desktop view
    if (!isMobileView) {
      document.body.style.overflow = sidebarOpen ? 'hidden' : 'initial';
    } else {
      document.body.style.overflow = 'initial'; // Enable scrolling on mobile view
    }
  }, [isMobileView, sidebarOpen]);

  return (
    <div className="flex h-screen">
      {/* Content */}
      <div className="flex flex-col flex-grow">
        {/* Header */}
        <Navbar />

        {/* Page Content */}
        <main className={`flex-grow p-4 ${isMobileView ? '' : 'overflow-y-auto'}`}>
          {children}
          {/* <MusicPlayer /> */}
        </main>
      </div>
    </div>
  );
};

export default CoreLayout;