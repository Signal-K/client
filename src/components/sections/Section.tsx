import React from "react";
import clsx from "clsx";

// Optionally import your backgrounds here
// import { TelescopeBackground } from "@/src/components/backgrounds/TelescopeBackground";

export interface SectionProps {
  variant?: "viewport" | "default" | "highlight";
  backgroundType?: "stars" | "planets" | "none" | string;
  className?: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  variant = "default",
  backgroundType = "none",
  className,
  children,
}) => {
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

  return (
    <section className={sectionClass}>
      {renderBackground()}
      <div className={variant === "viewport" ? "relative z-10 p-4" : "p-6"}>
        {children}
      </div>
    </section>
  );
};

export default Section;