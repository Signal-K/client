import React from "react";
import Section from "@/src/components/sections/Section";

interface ResearchSectionProps {
  title: string;
  children: React.ReactNode;
  infoText?: string;
  variant?: "viewport" | "default" | "highlight" | "minimal";
  backgroundType?: "stars" | "planets" | "rover" | "none" | string;
}

const ResearchSection: React.FC<ResearchSectionProps> = ({
  title,
  children,
  infoText,
  variant = "viewport",
  backgroundType = "stars",
}) => {
  return (
    <Section
      variant={variant}
      backgroundType={backgroundType}
      infoText={infoText}
      className="mb-8"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold mb-2 tracking-wide font-mono">
          {title}
        </h2>
        {children}
      </div>
    </Section>
  );
};

export default ResearchSection;
