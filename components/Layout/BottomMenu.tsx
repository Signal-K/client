import { Globe, Rss, HelpCircle, Star } from "lucide-react";
import { usePathname } from "next/navigation";    
import Link from "next/link";
import { useState } from "react";

const menuItems = [
  { icon: Globe, label: "Planet", href: "/" },
  { icon: Rss, label: "Mining", href: "/scenes/mining" },
  { icon: Star, label: "Travel", href: "/scenes/travel" },
  {
    icon: HelpCircle,
    label: "Guide",
    href: "/starnet",
  },
];

export default function BottomMenuLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();    
  const [hovered, setHovered] = useState<string | null>(null);

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
          </ul>
        </nav>
      </div>
    </div>
  );
};