'use client';

import { Building2Icon, Construction, CloudDrizzleIcon, HandMetalIcon, Settings } from "lucide-react";
import { usePathname } from "next/navigation";    
import Link from "next/link";
import { useState } from "react";
import TutorialPopup from "@/content/Dialogue/helpButton";

const menuItems = [
  { icon: Building2Icon, label: "Structures", href: "/" },
  { icon: Construction, label: "Mining", href: "/#" },
  { icon: CloudDrizzleIcon, label: "Weather", href: "/#" },
  { icon: HandMetalIcon, label: "Topography", href: "/#" },
];

export default function VerticalToolbar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="z-50">
      {/* Desktop Toolbar */}
      <div className="hidden md:block fixed left-4 top-1/4 transform -translate-y-1/2">
        <nav className="bg-[#1E3A4C] rounded-xl shadow-lg backdrop-blur-md bg-opacity-80 p-2">
          <ul className="flex flex-col space-y-4">
            {menuItems.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <Link legacyBehavior href={href}>
                  <a
                    onMouseEnter={() => setHovered(label)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-full transition-all duration-300 
                      ${pathname === href
                        ? "bg-white text-[#1E3A4C] shadow-md"
                        : "text-white hover:bg-white/10"}`}
                    aria-label={label}
                  >
                    <Icon className="w-6 h-6" />
                    {(pathname === href || hovered === label) && (
                      <span className="text-sm font-medium">{label}</span>
                    )}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <center>
              <TutorialPopup />
            </center>
          </div>
        </nav>
      </div>

      {/* Mobile Toolbar with Gear Icon */}
      <div className="block md:hidden fixed left-4 bottom-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-[#1E3A4C] p-4 rounded-full shadow-lg text-white focus:outline-none"
          aria-label="Open menu"
        >
          <Settings className="w-6 h-6" />
        </button>

        {isMenuOpen && (
          <div className="absolute left-0 bottom-16 bg-[#1E3A4C] rounded-xl shadow-lg backdrop-blur-md bg-opacity-80 p-2">
            <ul className="flex flex-col space-y-4">
              {menuItems.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link legacyBehavior href={href}>
                    <a
                      onClick={() => setIsMenuOpen(false)}  // Close menu after selection
                      className={`flex items-center space-x-2 px-4 py-3 rounded-full transition-all duration-300 
                        ${pathname === href
                          ? "bg-white text-[#1E3A4C] shadow-md"
                          : "text-white hover:bg-white/10"}`}
                      aria-label={label}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{label}</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};