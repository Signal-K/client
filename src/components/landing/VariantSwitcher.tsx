"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const variants = [
  { label: "V1 Light",       href: "/apt"     },
  { label: "V2 Dark",        href: "/apt/v2"  },
  { label: "V3 Editorial",   href: "/apt/v3"  },
  { label: "V4 Cinematic",   href: "/apt/v4"  },
  { label: "V5 Interactive", href: "/apt/v5"  },
  { label: "V6 Warm",        href: "/apt/v6"  },
];

export function VariantSwitcher() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-5 left-1/2 z-[9999] -translate-x-1/2">
      <nav
        aria-label="Landing page variant switcher"
        className="flex items-center gap-1 rounded-full border border-gray-200 bg-white/90 px-2 py-2 shadow-xl backdrop-blur-md"
      >
        {variants.map(({ label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
