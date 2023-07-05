import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMenu, FiBell, FiUser, FiHome, FiCircle, FiRss, FiFileText, FiBookOpen, FiBarChart2, FiStar } from 'react-icons/fi';
import { PostCardAvatar } from '../../AccountAvatar';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { AvatarPostCard } from '../../PostCard';

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
    <Link legacyBehavior href={href}>
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

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
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
        if (result.data.length) {
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
      {/* Sidebar */}
      {isMobileView ? (
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-gray-200 z-50"
              onClick={toggleSidebar}
            ></div>
          )}
          <div
            className={`fixed inset-y-0 left-0 bg-white w-64 z-50 transform duration-300 ease-in-out overflow-y-auto ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-4">
              <ul className="space-y-4">
                <SidebarItem icon={<FiHome size={20} />} label="Home" href="/" />
                <SidebarItem icon={<FiStar size={20} />} label="Planets" href="/tests/planets" />
                <SidebarItem icon={<FiRss size={20} />} label="Feed" href="/feed" />
                <SidebarItem icon={<FiFileText size={20} />} label="Journals" href="/journal" />
                <SidebarItem icon={<FiBookOpen size={20} />} label="Documentation" href="/docs" />
                <SidebarItem icon={<FiBarChart2 size={20} />} label="Changelog" href="/changelog" />
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className={`bg-gray-200 w-64 ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="p-4">
            <ul className="space-y-4">
              <SidebarItem icon={<FiHome size={20} />} label="Home" href="/" />
              <SidebarItem icon={<FiStar size={20} />} label="Planets" href="/tests/planets" />
              <SidebarItem icon={<FiRss size={20} />} label="Feed" href="/feed" />
              <SidebarItem icon={<FiFileText size={20} />} label="Journals" href="/journal" />
              <SidebarItem icon={<FiBookOpen size={20} />} label="Documentation" href="/docs" />
              <SidebarItem icon={<FiBarChart2 size={20} />} label="Changelog" href="/changelog" />
            </ul>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-grow">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center">
          <div className="ml-4 flex items-center space-x-4 flex-grow">
            {isMobileView && (
              <button className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 focus:outline-none" onClick={toggleSidebar}>
                <FiMenu size={20} />
              </button>
            )}
            {!isMobileView && (
              <button className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 focus:outline-none" onClick={toggleSidebar}>
                {sidebarOpen ? <FiMenu size={20} /> : <FiMenu size={20} />}
              </button>
            )}
            <input type="text" className="p-2 rounded-lg border border-gray-300 focus:outline-none" placeholder="Search..." />
            {/* Add other header menu items */}
          </div>
          <div className="flex-grow"></div>
          {session && (<AvatarPostCard profiles={profile} /> )}
          {/* <div className="w-10 h-10 bg-gray-300 rounded-full"></div> */}
        </header>

        {/* Page Content */}
        <main className={`flex-grow p-4 ${isMobileView ? '' : 'overflow-y-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;