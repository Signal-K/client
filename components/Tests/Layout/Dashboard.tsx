import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMenu, FiBell, FiUser, FiHome, FiCircle, FiRss, FiFileText, FiBookOpen, FiBarChart2, FiStar } from 'react-icons/fi';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { AccountAvatarV1 } from '../../AccountAvatar';
import { PostCardAvatar } from '../../AccountAvatar';
import AccountAvatar from '../../AccountAvatar';

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

  const session = useSession();
  const supabase = useSupabaseClient();
  const [profile, setProfile] = useState(null);
  const userId = session?.user?.id;

  /*useEffect(() => {
    if (!session) { return; } else { fetchProfile(); };
  }, [session]);*/

  function fetchProfile () {
    supabase.from('profiles')
        .select()
        .eq('id', userId)
        .then(result => {
            if (result.error) { throw result.error; };
            if (result.data) { setProfile(result.data[0]); };
        })
  }

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
  const [sidebarOpen, setSidebarOpen] = useState(!isMobileView); // Closed by default on mobile

  const toggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState);
  };

  useEffect(() => {
    // Update the view mode on initial render and window resize
    const handleWindowResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleWindowResize(); // Set the initial view mode

    // Attach the event listener for window resize
    window.addEventListener('resize', handleWindowResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {isMobileView ? (
        <div
          className={`fixed inset-0 bg-gray-200 w-full z-50 transition-all duration-300 ease-in-out ${
            sidebarOpen ? '' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="p-4">
            <ul className="space-y-4">
              <SidebarItem icon={<FiHome size={20} />} label="Home" href="/" />
              <SidebarItem icon={<FiStar size={20} />} label="Planets" href="/planets" />
              <SidebarItem icon={<FiRss size={20} />} label="Feed" href="/feed" />
              <SidebarItem icon={<FiFileText size={20} />} label="Journals" href="/journal" />
              <SidebarItem icon={<FiBookOpen size={20} />} label="Documentation" href="/docs" />
              <SidebarItem icon={<FiBarChart2 size={20} />} label="Changelog" href="/changelog" />
            </ul>
          </div>
        </div>
      ) : (
        <div className={`bg-gray-200 w-64 flex-shrink-0 ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="p-4">
            <ul className="space-y-4">
              <SidebarItem icon={<FiHome size={20} />} label="Home" href="/" />
              <SidebarItem icon={<FiStar size={20} />} label="Planets" href="/planets" />
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
          {/* <AccountAvatar uid={session?.user?.id} url={profile?.avatar_url} size={45} /> */}
          {/* {profile && (
            <PostCardAvatar
                url={profile?.avatar_url}
                size={64}
            />
          )} */}
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
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