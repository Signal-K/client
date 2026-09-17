"use client"

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Rocket, FileQuestion, Compass, User, Users } from 'lucide-react';

const menuItems = [
  { icon: FileQuestion, label: 'Requests', route: '/starnet/requests' },
  { icon: Compass, label: 'Discovery feed', route: '/starnet/feed' },
  { icon: Rocket, label: 'My missions', route: '/starnet' },
  { icon: User, label: 'Profile', route: '/starnet/profile' },
  { icon: Users, label: 'Consensus', route: '/starnet/consensus' },
];

export default function StarnetLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(0);

  useEffect(() => {
    const currentItem = menuItems.findIndex(item => item.route === pathname);
    setActiveItem(currentItem !== -1 ? currentItem : 0);
  }, [pathname]);

  const MenuIcon = ({ Icon, label, isActive, onClick }: { Icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }) => (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div className={`p-2 rounded-full ${isActive ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
        <Icon className={`w-8 h-8 ${isActive ? 'text-blue-500' : 'text-gray-600'}`} />
      </div>
      <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
        {label}
      </span>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full flex">
      <img
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/assets/Backdrops/Earth.png"
        alt="Earth Background"
      />

      <div className="relative flex flex-1 z-10 squiggly-bg bg-background text-foreground h-[99vh] w-[99vw] shadow-lg"> {/* [m-3%] */}
        <aside className="hidden md:flex flex-col items-center justify-center w-16 bg-squiggly py-4 space-y-8 border-r border-gray-200">
          {menuItems.map((item, index) => (
            <MenuIcon 
              key={index} 
              Icon={item.icon} 
              label={item.label} 
              isActive={index === activeItem}
              onClick={() => router.push(item.route)}
            />
          ))}
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full">
          <header className="bg-squiggly border-b border-gray-200 p-4">
            <h1 className="text-xl font-bold text-gray-100 text-center md:text-left">Starnet</h1>
          </header>

          <nav className="md:hidden bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              {menuItems.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex-1 p-2 flex flex-col items-center justify-center ${index === activeItem ? 'text-blue-500' : 'text-gray-600'}`}
                  onClick={() => router.push(item.route)}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </nav>

          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};