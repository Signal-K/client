import React from "react";
import { Card } from "@/components/ui/card";

interface TechSectionProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  children: React.ReactNode;
};

export const TechSection: React.FC<TechSectionProps> = ({
  title,
  icon,
  color,
  glowColor,
  children,
}) => (
  <div className="relative z-10 flex justify-center mb-24">
    <Card className="bg-[#0f2942] border-[#1e3a5f] p-6 w-full max-w-3xl relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br to-transparent"
        style={{ backgroundImage: `linear-gradient(to bottom right, ${color}0D, transparent)` }} // 0D = ~5% opacity
      ></div>

      <div className="relative z-10">
        <div className="flex items-center mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 15px ${glowColor}`,
            }}
          >
            {icon}
          </div>
          <h2
            className="text-2xl font-bold tracking-wider"
            style={{ color }}
          >
            {title}
          </h2>
        </div>

        {children}
      </div>
    </Card>
  </div>
);