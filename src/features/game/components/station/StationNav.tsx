"use client";

import { Telescope, Satellite, Home, Car, Sun } from "lucide-react";
import { cn } from "@/src/shared/utils";
import { useState } from "react";

type NavItem = "base" | "telescope" | "satellite" | "rover" | "solar" | "inventory";

interface StationNavProps {
  active: NavItem;
  onSelect: (item: NavItem) => void;
  alerts: Partial<Record<NavItem, boolean>>;
}

const sideItems: Array<{ id: NavItem; icon: React.ReactNode; label: string; color: string; glow: string }> = [
  { id: "telescope", icon: <Telescope className="h-4 w-4" />, label: "SCOPE",  color: "text-teal-300",   glow: "rgba(136,192,208,0.8)" },
  { id: "satellite", icon: <Satellite className="h-4 w-4" />, label: "SAT",    color: "text-sky-300",    glow: "rgba(56,189,248,0.8)"  },
  { id: "rover",     icon: <Car className="h-4 w-4" />,       label: "ROVER",  color: "text-amber-300",  glow: "rgba(251,191,36,0.8)"  },
  { id: "solar",     icon: <Sun className="h-4 w-4" />,       label: "SOLAR",  color: "text-orange-300", glow: "rgba(251,146,60,0.8)"  },
];

// Single physical console button
function ConsoleButton({
  id,
  icon,
  label,
  color,
  glow,
  isActive,
  hasAlert,
  isHome = false,
  onClick,
}: {
  id: NavItem;
  icon: React.ReactNode;
  label: string;
  color: string;
  glow: string;
  isActive: boolean;
  hasAlert: boolean;
  isHome?: boolean;
  onClick: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 transition-all duration-100 outline-none",
        isHome ? "w-14 h-14 rounded-full" : "flex-1 py-2.5 rounded-lg",
      )}
      style={{
        // Physical bevel effect — lighter top-left, darker bottom-right
        background: isActive
          ? `radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.4) 100%)`
          : `linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.3) 100%)`,
        boxShadow: pressed
          ? `inset 2px 2px 4px rgba(0,0,0,0.7), inset -1px -1px 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.06)`
          : isActive
            ? `2px 2px 4px rgba(0,0,0,0.6), -1px -1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(255,255,255,0.1), inset 0 0 12px ${glow.replace("0.8", "0.12")}`
            : `2px 2px 4px rgba(0,0,0,0.5), -1px -1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.05)`,
        border: "none",
        transform: pressed ? "translateY(1px)" : "translateY(0)",
      }}
    >
      {/* Status LED — top edge of button */}
      <div
        className={cn(
          "absolute top-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full transition-all duration-200",
          hasAlert
            ? "bg-amber-400 animate-pulse shadow-[0_0_4px_rgba(251,191,36,0.9)]"
            : isActive
              ? cn("shadow-[0_0_4px]", color.replace("text-", "bg-").replace("-300", "-400"))
              : "bg-white/10",
        )}
        style={
          isActive && !hasAlert
            ? { background: glow.replace("0.8", "1"), boxShadow: `0 0 5px ${glow}` }
            : undefined
        }
        aria-hidden
      />

      {/* Icon */}
      <div
        className={cn(
          "transition-colors duration-150 mt-1",
          isActive ? color : "text-muted-foreground/40",
        )}
      >
        {icon}
      </div>

      {/* Label */}
      {!isHome && (
        <span
          className={cn(
            "font-mono text-[7px] uppercase tracking-[0.15em] leading-none transition-colors duration-150",
            isActive ? color : "text-muted-foreground/25",
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
}

export function StationNav({ active, onSelect, alerts }: StationNavProps) {
  return (
    <nav
      aria-label="Station navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
    >
      {/* Console housing */}
      <div
        className="mx-2 mb-2 rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(20,28,42,0.97) 0%, rgba(12,18,28,0.99) 100%)",
          boxShadow: "0 -1px 0 rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04), 0 -8px 32px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Top rule — console edge light */}
        <div
          className="h-px w-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(136,192,208,0.3) 20%, rgba(136,192,208,0.3) 80%, transparent)" }}
        />

        {/* Button row */}
        <div className="flex items-stretch gap-1.5 px-2 pt-2 pb-safe-bottom pb-2">
          {/* Left cluster: scope + satellite */}
          {sideItems.slice(0, 2).map((item) => (
            <ConsoleButton
              key={item.id}
              {...item}
              isActive={active === item.id}
              hasAlert={!!alerts[item.id]}
              onClick={() => onSelect(item.id)}
            />
          ))}

          {/* Center: HOME — raised elevated button */}
          <div className="flex items-end justify-center pb-0.5 px-1">
            <button
              onClick={() => onSelect("base")}
              onPointerDown={(e) => (e.currentTarget.style.transform = "translateY(2px)")}
              onPointerUp={(e) => (e.currentTarget.style.transform = "")}
              onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
              aria-label="Base"
              aria-pressed={active === "base"}
              className={cn(
                "relative w-14 h-14 rounded-full flex items-center justify-center -mt-4 transition-all duration-100",
              )}
              style={{
                background:
                  active === "base"
                    ? "radial-gradient(ellipse at 40% 30%, rgba(136,192,208,0.25) 0%, rgba(5,20,35,0.95) 70%)"
                    : "radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.08) 0%, rgba(10,18,30,0.98) 70%)",
                boxShadow: active === "base"
                  ? "3px 3px 6px rgba(0,0,0,0.7), -1px -1px 0 rgba(255,255,255,0.12), 0 0 0 2px rgba(136,192,208,0.3), 0 0 16px rgba(136,192,208,0.2)"
                  : "3px 3px 6px rgba(0,0,0,0.6), -1px -1px 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(255,255,255,0.08)",
                border: "none",
              }}
            >
              <Home
                className={cn(
                  "h-5 w-5 transition-colors",
                  active === "base" ? "text-teal-300" : "text-muted-foreground/50",
                )}
              />
              {/* Ring around home button */}
              <div
                className={cn(
                  "absolute inset-[-3px] rounded-full border transition-all",
                  active === "base" ? "border-teal-400/40" : "border-white/5",
                )}
              />
            </button>
          </div>

          {/* Right cluster: rover + solar */}
          {sideItems.slice(2, 4).map((item) => (
            <ConsoleButton
              key={item.id}
              {...item}
              isActive={active === item.id}
              hasAlert={!!alerts[item.id]}
              onClick={() => onSelect(item.id)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
