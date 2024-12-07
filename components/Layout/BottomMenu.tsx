import { Globe, HelpCircle, Star, Pickaxe } from "lucide-react";
import { usePathname } from "next/navigation";    
import Link from "next/link";
import { useState } from "react";
import { MiningComponentComponent } from "../(scenes)/mining/mining-component";
import { StructureMissionGuideMobile } from "./Guide";
import DiscoveriesPage from "@/content/Classifications/minimalDiscoveries";

const menuItems = [
  { icon: Globe, label: "Planet", href: "/" },
  { icon: Star, label: "Discoveries", href: "/starnet/feed" },
];

const ModalContent = ({ onClose }: { onClose: () => void }) => (
  <div className="flex flex-col h-full w-full bg-white p-4 rounded-md">
    <button
      onClick={onClose}
      className="self-end text-gray-500 hover:text-gray-800 text-lg"
    >
      ✕
    </button>
    <MiningComponentComponent />
  </div>
);

const ModalContentGuide = ({ onClose }: { onClose: () => void }) => (
  <div className="flex flex-col h-full w-full p-4 rounded-md">
    <button
      onClick={onClose}
      className="self-end text-gray-500 hover:text-gray-800 text-lg"
    >
      ✕
    </button>
    <StructureMissionGuideMobile />
  </div>
);

const ModalContentPosts = ({ onClose }: { onClose: () => void }) => (
  <div className="flex flex-col h-full w-full p-4 rounded-md">
    <button
      onClick={onClose}
      className="self-end text-gray-500 hover:text-gray-800 text-lg"
    >
      ✕
    </button>
    <DiscoveriesPage />
  </div>
);

export default function BottomMenuLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();    
  const [hovered, setHovered] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuideOpen, setGuideOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const openModalGuide = () => setGuideOpen(true);
  const closeModalGuide = () => setGuideOpen(false);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-grow">{children}</div>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <nav className="bg-[#1E3A4C] rounded-full shadow-lg backdrop-blur-md bg-opacity-80 px-4 py-2">
          <ul className="flex items-center space-x-4">
            {menuItems.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <Link legacyBehavior href={href}>
                  <a
                    onMouseEnter={() => setHovered(label)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 
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
            <li>
              <button
                onMouseEnter={() => setHovered("Mining")}
                onMouseLeave={() => setHovered(null)}
                onClick={openModal}
                className="relative flex items-center justify-center w-10 h-10 text-white hover:bg-white/10 rounded-full transition-all duration-300"
              >
                <Pickaxe className="w-6 h-6" />
                {hovered === "Mining" && (
                  <span className="absolute top-full mt-1 text-sm font-medium text-white bg-black bg-opacity-80 rounded px-2 py-1">
                    Mining
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onMouseEnter={() => setHovered("Help")}
                onMouseLeave={() => setHovered(null)}
                onClick={openModalGuide}
                className="flex items-center justify-center w-10 h-10 text-white hover:bg-white/10 rounded-full transition-all duration-300"
              >
                <HelpCircle className="w-6 h-6" />
                {hovered === "Help" && (
                  <span className="absolute top-full mt-1 text-sm font-medium text-white bg-black bg-opacity-80 rounded px-2 py-1">
                    My discoveries
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Modal for Mining */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[90%] h-[90%] bg-white rounded-lg shadow-lg">
            <ModalContent onClose={closeModal} />
          </div>
        </div>
      )}

      {/* Modal for Guide */}
      {isGuideOpen && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="w-[90%] h-[90%] rounded-lg">
            {/* <ModalContentGuide onClose={closeModalGuide} /> */}
            <ModalContentPosts onClose={closeModalGuide} />
          </div>
        </div>
      )}
    </div>
  );
};