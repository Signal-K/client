"use client";

import { useEffect, useState } from "react";
import {
  Star,
  Telescope,
  CloudSun,
  FlaskConical,
  Rocket,
  Eye,
  Database,
  CloudRain,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/src/components/ui/popover";
import TotalPoints from "@/src/components/deployment/missions/structures/Stardust/Total";
import MilestoneHistoryList from "@/src/components/deployment/missions/structures/Milestones/Completed";


export function StardustDropdown() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const Label = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
    <div className="flex items-center gap-2 text-sm text-yellow-100 font-medium">
      <Icon className="h-4 w-4 text-yellow-400" />
      {text}
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col items-start w-full px-4 py-2">
        <Button variant="ghost" className="text-yellow-100 font-semibold">
          <Star className="h-5 w-5 text-yellow-400 mr-2" />
          <TotalPoints />
        </Button>
      </div>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative group flex items-center h-8">
          <Star className="h-4 w-4 text-yellow-400 group-hover:text-yellow-300 transition-colors flex-shrink-0" />
          <span className="text-yellow-100 font-semibold ml-1 text-sm whitespace-nowrap">
            <TotalPoints />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-black/80 text-white border border-white/10 backdrop-blur-md p-4 rounded-xl space-y-4 w-[300px]">
        <div>
          <h2 className="text-lg font-semibold mb-2">🔭 Astronomy Missions</h2>
          <div className="space-y-1 text-sm">
            <Label icon={Telescope} text="Asteroids sighted:" />
            <TotalPoints type="dailyMinorPlanetPoints" />

            <Label icon={Star} text="Planet candidates:" />
            <TotalPoints type="planetHuntersPoints" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">🌌 Climate & Rover Missions</h2>
          <div className="space-y-1 text-sm">
            <Label icon={Rocket} text="Rover classifications:" />
            <TotalPoints type="ai4mPoints" />

            <Label icon={Eye} text="Surface features:" />
            <TotalPoints type="planetFourPoints" />

            <Label icon={CloudRain} text="Martian clouds:" />
            <TotalPoints type="cloudspottingPoints" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">🧪 Research</h2>
          <div className="flex items-center justify-between text-sm text-red-300">
            <Label icon={FlaskConical} text="Stardust spent:" />
            <TotalPoints type="researchedPenalty" />
          </div>
        </div>

        <div>
          <MilestoneHistoryList />
          {/* <TotalPoints type='groups' /> */}
        </div>
      </PopoverContent>
    </Popover>
  );
};