import TotalPoints from "@/components/Structures/Missions/Stardust/Total";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sparkle, Star, Trophy } from "lucide-react"

interface PointsDisplayProps {
  stardust: number
  achievements: number
};

export function StardustDropdown() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' className="relative group">
          <Star className="h-5 w-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
          <span className="text-yellow-100 font-medium">Your stardust: <TotalPoints /></span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-black/80 backdrop-blur-md border border-yellow-500/20">
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-bold text-purple-400">
            Points breakdown
          </h3>
        </div>
      </PopoverContent>
    </Popover>
  );
};