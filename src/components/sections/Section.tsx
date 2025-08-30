import React, { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

// Optionally import your backgrounds here
// import { TelescopeBackground } from "@/src/components/backgrounds/TelescopeBackground";

export interface SectionProps {
  variant?: "viewport" | "default" | "highlight" | "minimal";
  backgroundType?: "stars" | "planets" | "rover" | "none" | string;
  className?: string;
  children: React.ReactNode;
  sectionId?: string; // unique id for info text
  infoText?: string; // unique info text for each section
  expandLink?: string | null; // optional link for expansion
};

const Section: React.FC<SectionProps> = ({
  variant = "default",
  backgroundType = "none",
  className,
  children,
  sectionId,
  infoText,
  expandLink = null,
}) => {
  const router = useRouter();
  // Expand icon SVG
  const expandIconStyle = {
    width: 32,
    height: 32,
    cursor: "pointer",
    filter: "drop-shadow(0 0 2px #000)",
    color: variant === "viewport" ? "#78cce2" : "#16213e",
    transition: "color 0.2s",
    display: "block",
  };
  // Arrow points to top right
  const expandIcon = (
    <svg style={expandIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <polyline points="9 9 15 9 15 15" />
      <line x1="9" y1="15" x2="15" y2="9" />
    </svg>
  );
  const [showInfo, setShowInfo] = useState(false);
  // Use TelescopeBackground or RoverBackground for viewport variant
  const TelescopeBackground = require("@/src/components/classification/telescope/telescope-background").TelescopeBackground;
  const RoverBackground = require("@/src/components/classification/telescope/rover-background").RoverBackground;
  const renderBackground = () => {
    if (variant === "minimal") return null;
    if (variant === "viewport" && backgroundType !== "none") {
      if (backgroundType === "rover") {
        return (
          <div className="absolute inset-0 z-0 w-full h-full">
            <RoverBackground />
          </div>
        );
      }
      return (
        <div className="absolute inset-0 z-0 w-full h-full">
          <TelescopeBackground variant={backgroundType} />
        </div>
      );
    }
    return null;
  };

  // Example variant styling
  const sectionClass = clsx(
    "relative w-full rounded-lg overflow-hidden",
    {
      "bg-card border border-chart-4/30 text-white": variant === "viewport",
      "bg-card shadow-md text-zinc-900": variant === "minimal",
      "bg-white dark:bg-zinc-900/80 shadow-md": variant === "default",
      "bg-gradient-to-r from-yellow-100 to-yellow-300": variant === "highlight",
    },
    className
  );

  // Info icon SVG
  const infoIconStyle = {
    width: 32,
    height: 32,
    cursor: "pointer",
    filter: "drop-shadow(0 0 2px #000)",
    color: variant === "viewport" ? "#78cce2" : "#16213e",
    transition: "color 0.2s",
    display: "block",
  };
  const infoIcon = (
    <svg style={infoIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="8" />
    </svg>
  );

  return (
    <section className={sectionClass}>
      {renderBackground()}
      {/* Info icon, always left-aligned; moves up when info is open */}
      {sectionId && variant !== "minimal" && (
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: showInfo ? 72 : 16,
            zIndex: 21,
            background: variant === "viewport" ? "rgba(10,20,40,0.7)" : "rgba(255,255,255,0.7)",
            borderRadius: 20,
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: variant === "viewport" ? "0 2px 8px #78cce2" : "0 2px 8px #16213e",
            backdropFilter: "blur(2px)",
            border: variant === "viewport" ? "1px solid #78cce2" : "1px solid #16213e",
            transition: "bottom 0.2s",
          }}
          onClick={() => setShowInfo((prev) => !prev)}
          title={showInfo ? "Hide info" : "Show info"}
        >
          {infoIcon}
        </div>
      )}
      {/* Expand icon, top-right */}
      {expandLink && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            zIndex: 20,
            background: variant === "viewport" ? "rgba(10,20,40,0.7)" : "rgba(255,255,255,0.7)",
            borderRadius: 20,
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: variant === "viewport" ? "0 2px 8px #78cce2" : "0 2px 8px #16213e",
            backdropFilter: "blur(2px)",
            border: variant === "viewport" ? "1px solid #78cce2" : "1px solid #16213e",
          }}
          onClick={() => router.push(expandLink)}
          title="Expand section"
        >
          {expandIcon}
        </div>
      )}
      <div className={variant === "viewport" ? "relative z-10 p-4" : variant === "minimal" ? "p-4" : "p-6"}>
        {children}
      </div>
      {/* Info area at bottom, responsive */}
      {showInfo && infoText && variant !== "minimal" && (
        <div
          className={clsx(
            "w-full px-4 py-3 text-sm font-medium flex items-center justify-center",
            "border-t",
            variant === "viewport"
              ? "bg-[#0a0a2a]/90 border-[#78cce2] text-[#78cce2]"
              : "bg-white/90 border-[#16213e] text-[#16213e] dark:bg-zinc-900/80 dark:text-white"
          )}
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            zIndex: 15,
            minHeight: 56,
            borderRadius: "0 0 16px 16px",
            boxShadow: variant === "viewport" ? "0 -2px 12px #78cce2" : "0 -2px 12px #16213e",
            backdropFilter: "blur(4px)",
            transition: "all 0.2s",
            maxWidth: "100%",
            textAlign: "center",
          }}
        >
          {infoText}
        </div>
      )}
    </section>
  );
};

export default Section;