import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMenu, FiBell, FiUser, FiHome, FiCircle, FiRss, FiFileText, FiBookOpen, FiBarChart2, FiStar } from 'react-icons/fi';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, href }) => {
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
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b p-4 flex items-center">
        <div className="ml-4 flex items-center space-x-4 flex-grow">
          {isMobileView && (
            <button className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 focus:outline-none" onClick={toggleMenu}>
              <FiMenu size={20} />
            </button>
          )}
          {/* Add other header menu items */}
          <MenuItem icon={<FiHome size={20} />} label="Home" href="/" />
          <MenuItem icon={<FiStar size={20} />} label="Planets" href="/planets" />
          <MenuItem icon={<FiRss size={20} />} label="Feed" href="/feed" />
          <MenuItem icon={<FiFileText size={20} />} label="Journals" href="/journal" />
          <MenuItem icon={<FiBookOpen size={20} />} label="Documentation" href="/docs" />
          <MenuItem icon={<FiBarChart2 size={20} />} label="Changelog" href="/changelog" />
        </div>
        <div className="flex-grow"></div>
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      </header>

      {/* Menu */}
      {isMobileView && menuOpen && (
        <div className="bg-gray-200 p-4">
          <ul className="space-y-4">
            <MenuItem icon={<FiHome size={20} />} label="Home" href="/" />
            <MenuItem icon={<FiStar size={20} />} label="Planets" href="/planets" />
            <MenuItem icon={<FiRss size={20} />} label="Feed" href="/feed" />
            <MenuItem icon={<FiFileText size={20} />} label="Journals" href="/journal" />
            <MenuItem icon={<FiBookOpen size={20} />} label="Documentation" href="/docs" />
            <MenuItem icon={<FiBarChart2 size={20} />} label="Changelog" href="/changelog" />
          </ul>
        </div>
      )}

      {/* Content */}
      <main className={`flex-grow p-4 ${isMobileView && menuOpen ? 'translate-y-16' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;