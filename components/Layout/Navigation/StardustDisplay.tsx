import { Sparkle, Trophy } from "lucide-react"

interface PointsDisplayProps {
  stardust: number
  achievements: number
};

export function PointsDisplay({ stardust, achievements }: PointsDisplayProps) {
  return (
    <div className="flex items-center gap-2 text-white text-sm">
      <div className="flex items-center">
        <Sparkle className="w-4 h-4 mr-1" />
        {stardust}
      </div>
      <div className="flex items-center">
        <Trophy className="w-4 h-4 mr-1" />
        {achievements}
      </div>
    </div>
  );
};