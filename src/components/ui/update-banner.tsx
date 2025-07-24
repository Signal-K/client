"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";

interface WeeklyBannerProps {
  message: string;
  buttonLabel: string;
  buttonHref: string;
};

export default function WeeklyBanner({ message, buttonLabel, buttonHref }: WeeklyBannerProps) {
  return (
    <div className="fixed bottom-0 w-full z-50">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4 py-3 bg-gradient-to-r from-[#1a1a2e]/90 to-[#16213e]/90 text-white shadow-md border-t border-white/10 backdrop-blur-sm">
        <span className="text-sm md:text-base font-medium text-center md:text-left">{message}</span>
        <Link href={buttonHref}>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm md:text-base">
            {buttonLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
};