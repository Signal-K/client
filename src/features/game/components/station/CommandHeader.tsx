"use client";

import { useRouter } from "next/navigation";
import { Bell, User, Zap, ChevronDown, Activity } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MissionClock } from "./MissionClock";

interface CommandHeaderProps {
  stardust: number;
  hasAlerts: boolean;
  onAlertsClick: () => void;
  onProfileClick?: () => void;
  agencyId?: string;
}

export function CommandHeader({
  stardust,
  hasAlerts,
  onAlertsClick,
  onProfileClick,
  agencyId,
}: CommandHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{
        background: "linear-gradient(180deg, rgba(4,10,22,0.97) 0%, rgba(4,10,22,0.93) 100%)",
        borderBottom: "1px solid rgba(136,192,208,0.1)",
        boxShadow: "0 1px 0 rgba(136,192,208,0.05), 0 4px 16px rgba(0,0,0,0.4)",
      }}
    >
      {/* Bottom edge glow — like instrument panel lighting */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(136,192,208,0.25) 25%, rgba(136,192,208,0.35) 50%, rgba(136,192,208,0.25) 75%, transparent 100%)",
        }}
        aria-hidden
      />

      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left: wordmark + agency id */}
        <div>
          <div
            className="text-xs font-black uppercase tracking-[0.3em] leading-none"
            style={{
              color: "rgba(255,255,255,0.9)",
              textShadow: "0 0 12px rgba(136,192,208,0.4)",
            }}
          >
            Star Sailors
          </div>
          {agencyId && (
            <div
              className="font-mono text-[8px] tracking-widest leading-none mt-0.5"
              style={{ color: "rgba(136,192,208,0.3)" }}
            >
              {agencyId}
            </div>
          )}
        </div>

        {/* Center: mission clock with live indicator */}
        <div className="flex flex-col items-center gap-0.5">
          <MissionClock />
          {/* Live signal indicator */}
          <div className="flex items-center gap-1">
            <Activity
              className="h-2.5 w-2.5 animate-pulse-slow"
              style={{ color: "rgba(136,192,208,0.5)" }}
              aria-hidden
            />
            <span
              className="font-mono text-[7px] uppercase tracking-[0.2em]"
              style={{ color: "rgba(136,192,208,0.35)" }}
            >
              LIVE
            </span>
          </div>
        </div>

        {/* Right: credits + alerts + profile */}
        <div className="flex items-center gap-3">
          {/* Stardust credits */}
          <div
            className="flex items-center gap-1 font-mono text-xs tabular-nums"
            style={{ color: "rgba(136,192,208,0.85)" }}
          >
            <Zap className="h-3 w-3" aria-hidden />
            <span>{stardust}</span>
            <span className="text-[9px]" style={{ color: "rgba(136,192,208,0.4)" }}>
              CR
            </span>
          </div>

          {/* Alert bell */}
          <button
            onClick={onAlertsClick}
            aria-label="Open activity feed"
            className="relative rounded p-1 transition-colors"
            style={{ color: hasAlerts ? "rgba(251,191,36,0.8)" : "rgba(255,255,255,0.35)" }}
          >
            <Bell className="h-4 w-4" />
            {hasAlerts && (
              <span
                className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full animate-pulse"
                style={{
                  background: "#fbbf24",
                  boxShadow: "0 0 4px rgba(251,191,36,0.9)",
                }}
                aria-hidden
              />
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Account menu"
              className="flex items-center gap-0.5 rounded p-1 transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              <User className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-lg py-1 z-50"
                style={{
                  background: "rgba(4,10,22,0.97)",
                  border: "1px solid rgba(136,192,208,0.15)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* Menu items */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (onProfileClick) onProfileClick();
                    else router.push("/profile");
                  }}
                  className="w-full px-3 py-2 text-left text-xs transition-colors hover:bg-white/[0.04]"
                  style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-mono, monospace)" }}
                >
                  Profile
                </button>
                {[
                  { label: "Research",     href: "/research" },
                  { label: "Leaderboards", href: "/leaderboards" },
                  { label: "Referrals",    href: "/referrals" },
                  { label: "Sign Out",     href: "/auth/sign-out" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(item.href);
                    }}
                    className="w-full px-3 py-2 text-left text-xs transition-colors hover:bg-white/[0.04]"
                    style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-mono, monospace)" }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
