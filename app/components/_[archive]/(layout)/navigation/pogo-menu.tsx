import React, { useState } from 'react';
import { HomeIcon, SearchIcon, User2Icon, BellDotIcon, CogIcon, MenuIcon } from 'lucide-react';

const NavigationMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleMenu}
        className="p-4 bg-blue-500 rounded-full shadow-lg text-white hover:bg-blue-600 focus:outline-none"
      >
        <MenuIcon className="h-8 w-8" />
      </button>
      {isOpen && (
        <div className="absolute bottom-16 right-16 w-48 h-48 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <NavigationItem icon={HomeIcon} text="Home" delay="0" />
            <NavigationItem icon={SearchIcon} text="Search" delay="100" />
            <NavigationItem icon={User2Icon} text="Profile" delay="200" />
            <NavigationItem icon={BellDotIcon} text="Notifications" delay="300" />
            <NavigationItem icon={CogIcon} text="Settings" delay="400" />
          </div>
        </div>
      )}
    </div>
  );
};

interface NavigationItemProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  text: string;
  delay: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ icon: Icon, text, delay }) => {
  return (
    <div
      className={`transition-all transform origin-bottom-right delay-${delay}ms`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center mb-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 cursor-pointer">
        <Icon className="h-6 w-6 text-gray-800" />
        <span className="ml-2 text-gray-800">{text}</span>
      </div>
    </div>
  );
};

export default NavigationMenu;
