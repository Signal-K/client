import React from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

// Optionally import your backgrounds here
// import { TelescopeBackground } from "@/src/components/backgrounds/TelescopeBackground";

export interface SectionProps {
  variant?: "viewport" | "default" | "highlight";
  backgroundType?: "stars" | "planets" | "none" | string;
  className?: string;
  children: React.ReactNode;
  sectionId?: string; // unique id for routing
  expanded?: boolean; // if true, show retract icon
}

const Section: React.FC<SectionProps> = ({
  variant = "default",
  backgroundType = "none",
  className,
  children,
  sectionId,
  expanded = false,
}) => {
  const router = useRouter();
  // Example background logic
  const renderBackground = () => {
    if (variant === "viewport" && backgroundType !== "none") {
      // You can swap this for your actual background component
      // return <TelescopeBackground variant={backgroundType} className="absolute inset-0 z-0" />;
      return <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 to-black" />;
    }
    return null;
  };

  // Example variant styling
  const sectionClass = clsx(
    "relative w-full rounded-lg overflow-hidden",
    {
      "bg-card border border-chart-4/30 text-white": variant === "viewport",
      "bg-white dark:bg-zinc-900/80 shadow-md": variant === "default",
      "bg-gradient-to-r from-yellow-100 to-yellow-300": variant === "highlight",
    },
    className
  );

  // Icon SVG (expand/retract)
  const iconStyle = {
    width: 32,
    height: 32,
    cursor: "pointer",
    filter: "drop-shadow(0 0 2px #000)"
};
  const icon = expanded ? (
    // Retract icon (chevron contract)
    <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 12 12 16 16 12" />
      <line x1="12" y1="8" x2="12" y2="16" />
    </svg>
  ) : (
    // Expand icon (chevron expand)
    <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 12 12 8 8 12" />
      <line x1="12" y1="8" x2="12" y2="16" />
    </svg>
  );

  // Navigation handler
  function handleExpandClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!sectionId) return;
    if (expanded) {
      router.push("/");
    } else {
      router.push(`/expand/${sectionId}`);
    }
  }

  return (
    <section className={sectionClass}>
      {renderBackground()}
      {/* Expand/retract icon, always visible, top-right */}
      {sectionId && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            zIndex: 20,
            background: "rgba(0,0,0,0.3)",
            borderRadius: 20,
            padding: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}
          onClick={handleExpandClick}
          title={expanded ? "Close" : "Expand"}
        >
          {icon}
        </div>
      )}
      <div className={variant === "viewport" ? "relative z-10 p-4" : "p-6"}>
        {children}
      </div>
    </section>
  );
};

export default Section;