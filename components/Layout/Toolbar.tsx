'use client';

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Building2Icon,
  Construction,
  CloudDrizzleIcon,
  HandMetalIcon,
  Settings,
} from "lucide-react";
import TutorialPopup from "@/content/Dialogue/helpButton";
import { MiningComponentComponent } from "../mining-component";

const menuItems = [
  { icon: Building2Icon, label: "Structures", content: "Structures Content" },
  { icon: Construction, label: "Mining", content: <MiningComponentComponent /> },
  { icon: CloudDrizzleIcon, label: "Weather", content: "Weather Content" },
  { icon: HandMetalIcon, label: "Topography", content: <TutorialPopup /> },
];

export default function VerticalToolbar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="z-50">
      {/* Vertical Toolbar for larger screens */}
      <div className="hidden md:block fixed left-4 top-1/4 transform -translate-y-1/2">
        <nav className="bg-[#1E3A4C] rounded-xl shadow-lg backdrop-blur-md bg-opacity-80 p-2">
          <ul className="flex flex-col space-y-4">
            {menuItems.map(({ icon: Icon, label }) => (
              <li key={label}>
                <button
                  onMouseEnter={() => setHovered(label)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setActiveModal(label)}
                  className={`flex items-center px-4 py-3 rounded-full transition-all duration-300 relative 
                    ${
                      pathname === label
                        ? "bg-white text-[#1E3A4C] shadow-md"
                        : "text-white hover:bg-white/10"
                    }`}
                  aria-label={label}
                >
                  <Icon className="w-6 h-6" />
                  <span
                    className={`absolute left-12 opacity-0 transition-opacity duration-300 ${
                      hovered === label || pathname === label ? "opacity-100" : ""
                    } text-sm font-medium whitespace-nowrap bg-[#1E3A4C] bg-opacity-90 text-white px-2 py-1 rounded-md`}
                  >
                    {label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Modal for Popups */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="w-[90vw] max-w-3xl h-[90vh] bg-white rounded-lg p-4 overflow-y-auto relative"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">{activeModal}</h2>
            <div className="text-gray-800">
              {menuItems.find((item) => item.label === activeModal)?.content}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Menu for smaller screens */}
      <div className="block md:hidden fixed left-4 bottom-4">
        <button
          onClick={() => setActiveModal("Menu")}
          className="bg-[#1E3A4C] p-4 rounded-full shadow-lg text-white focus:outline-none"
          aria-label="Open menu"
        >
          <Settings className="w-6 h-6" />
        </button>

        {activeModal === "Menu" && (
          <div className="absolute left-0 bottom-16 bg-[#1E3A4C] rounded-xl shadow-lg backdrop-blur-md bg-opacity-80 p-2">
            <ul className="flex flex-col space-y-4">
              {menuItems.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <button
                    onClick={() => setActiveModal(label)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-full transition-all duration-300 
                      ${
                        pathname === label
                          ? "bg-white text-[#1E3A4C] shadow-md"
                          : "text-white hover:bg-white/10"
                      }`}
                    aria-label={label}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};