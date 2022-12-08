import React from "react";

interface ResearchSectionModernProps {
  title: string;
  children: React.ReactNode;
  infoText?: string;
  backgroundType?: "stars" | "planets" | "rover" | "none" | string;
}

const bgMap: Record<string, string> = {
  stars: "bg-gradient-to-br from-[#232a36] via-[#1e293b] to-[#0f172a]",
  planets: "bg-gradient-to-br from-[#2E3440] via-[#5E81AC] to-[#232a36]",
  rover: "bg-gradient-to-br from-[#232a36] via-[#b48ead] to-[#2E3440]",
  none: "bg-transparent",
};

const ResearchSectionModern: React.FC<ResearchSectionModernProps> = ({
  title,
  children,
  infoText,
  backgroundType = "none",
}) => {
  return (
    <section
      className={`relative w-full py-10 px-6 md:px-12 lg:px-20 xl:px-32 ${bgMap[backgroundType] || bgMap.none} rounded-3xl shadow-xl mb-12 flex flex-col justify-center items-start`}
      style={{ minHeight: "340px" }}
    >
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide font-mono text-[#81A1C1] drop-shadow-lg">
            {title}
          </h2>
          {infoText && (
            <span className="ml-2 px-3 py-1 rounded-full bg-[#1e293b]/80 text-xs text-[#cdd6f4] font-mono shadow">
              {infoText}
            </span>
          )}
        </div>
        <div className="w-full flex flex-col gap-6">
          {children}
        </div>
      </div>
    </section>
  );
};

export default ResearchSectionModern;
