import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Station } from "@/types/station";
import { BiomePattern } from "./BiomePattern";
import {
  Anchor, 
  Trees,
  Snowflake,
  Sun,
  Waves,
  Fish,
  Turtle,
  Flower2,
  Bird,
  MoonIcon as Monkey,
  Bug,
  BeakerIcon as Bear,
  Cat,
  Rabbit,
  Wand2,
  MapPin,
  ArrowDown,
  ArrowUp,
  Globe,
  CheckCircle,
  Wrench,
} from "lucide-react";

interface StationCardProps {
  station: Station;
  onBuild: (id: string) => void;
  onView: (id: string) => void;
};

export const iconMap = {
  Anchor,
  Trees,
  Snowflake,
  Sun,
  Waves,
  Fish,
  Turtle,
  Flower2,
  Bird,
  Monkey,
  Bug,
  Bear,
  Cat,
  Rabbit,
  Wand2,
};

function GameButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group overflow-hidden
        px-6 py-2 rounded-md
        bg-gradient-to-r from-blue-600 to-blue-500
        disabled:from-gray-700 disabled:to-gray-600
        disabled:cursor-not-allowed
        transition-all duration-300
      `}
    >
      <div className="relative z-10 flex items-center justify-center gap-2 text-white font-medium">{children}</div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" />
      </div>
      <div className="absolute inset-0 rounded-md opacity-50 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 blur-sm" />
      </div>
    </button>
  );
}

export function StationCard({ station, onBuild, onView }: StationCardProps) {
  const router = useRouter(); // Initialize useRouter for navigation
  const StationIcon = iconMap[station.icon as keyof typeof iconMap];

  // Function to handle view redirection based on biome
  const handleView = (id: string, biome: string) => {
    if (biome === "Desert") {
      router.push("/scenes/desert");
    } else if (biome === "Ocean") {
      router.push("/scenes/ocean");
    } else {
      onView(id); // fallback to default onView action if biome is not Desert or Ocean
    }
  };

  return (
    <Card
      className={`
      relative overflow-hidden backdrop-blur-xl 
      bg-black/40 border-gray-800 
      transition-all duration-300
      ${station.built ? "opacity-75" : "hover:shadow-lg hover:shadow-blue-500/20"}
    `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-transparent z-0" />

      <BiomePattern biome={station.biome} className="absolute inset-0 opacity-20" />

      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <div
          className={`
          w-2 h-2 rounded-full 
          ${station.built ? "bg-green-500" : "bg-blue-500"} 
          shadow-lg shadow-blue-500/50
          animate-pulse
        `}
        />
        <span className="text-xs text-gray-400">{station.built ? "Operational" : "Ready to Build"}</span>
      </div>

      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-white">
          {StationIcon && <StationIcon className="w-6 h-6" />}
          {station.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-sm text-blue-400">
          <MapPin className="w-4 h-4" />
          <span> {station.location.coordinates} </span>
          {station.location.depth && (
            <span className="text-blue-500 flex items-center gap-1">
              <ArrowDown className="w-3 h-3" />
              {station.location.depth}
            </span>
          )}
          {station.location.altitude && (
            <span className="text-blue-500 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              {station.location.altitude}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {station.animals.map((animal) => {
            const AnimalIcon = iconMap[animal.icon as keyof typeof iconMap];
            return (
              <Badge
                key={animal.name}
                variant="secondary"
                className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border-blue-500/20"
              >
                {AnimalIcon && <AnimalIcon className="w-4 h-4" />}
                {animal.name}
              </Badge>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-400 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {station.biome.name}
          </span>

          <div className="flex gap-2">
            {station.built && (
              <GameButton onClick={() => handleView(station.id, station.biome.name)}>
                View Station
              </GameButton>
            )}
            <GameButton onClick={() => onBuild(station.id)} disabled={station.built}>
              {station.built ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Built
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4" />
                  Build Station
                </>
              )}
            </GameButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};