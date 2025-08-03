"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";

interface WeeklyBannerProps {
  message: string;
  buttonLabel: string;
  buttonHref: string;
};

export default function WeeklyBanner({ message, buttonLabel, buttonHref }: WeeklyBannerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="md:hidden fixed bottom-4 right-4 z-50">
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isHovered 
            ? 'w-80 p-4' 
            : 'w-20 h-12 p-2'
        } bg-gradient-to-r from-[#1a1a2e]/95 to-[#16213e]/95 text-white shadow-lg rounded-lg border border-white/20 backdrop-blur-sm`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!isHovered ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs font-medium text-center">Full<br/>Version</span>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-sm font-medium block">{message}</span>
            <Link href={buttonHref}>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 text-sm">
                {buttonLabel}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};