import { Globe, Rss, HelpCircle, Star } from "lucide-react";
import { usePathname } from "next/navigation";    
import Link from "next/link";
import { useState } from "react";

const menuItems = [
  { icon: Globe, label: "Planet", href: "/" },
  { icon: Rss, label: "Mining", href: "/scenes/mining" },
  { icon: HelpCircle, label: "Travel", href: "/scenes/travel" },
  // { icon: Star, label: "Starnet", href: "/starnet" },
  {
    icon: Star,
    label: "Guide",
    href: "/tests",
  },
];

export default function BottomMenuLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();    
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-grow">{children}</div>

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <nav className="backdrop-blur-md bg-[#2C4F64]/30 rounded-full px-2 py-1 shadow-lg">
          <ul className="flex items-center space-x-1">
            {menuItems.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <Link legacyBehavior href={href}>
                  <a
                    onMouseEnter={() => setHovered(label)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-all duration-200 ${
                      pathname === href
                        ? "bg-white text-[#2C4F64]"
                        : "text-white hover:bg-white/10"
                    }`}
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5" />
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