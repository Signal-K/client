import {
  Telescope,
  Cloud,
  Droplets,
  Sun,
  Bot,
  Satellite,
  Wind,
  Target,
  Disc,
  CloudRain,
} from "lucide-react";
import { ClassificationType } from "../../../types/achievement";

export const getClassificationIcon = (
  classificationType: ClassificationType | string,
  className: string = "w-full h-full text-white"
) => {
  const iconMap: Record<string, JSX.Element> = {
    DiskDetective: <Disc className={className} />,
    "automaton-aiForMars": <Bot className={className} />,
    "balloon-marsCloudShapes": <CloudRain className={className} />,
    cloud: <Cloud className={className} />,
    "lidar-jovianVortexHunter": <Wind className={className} />,
    planet: <Telescope className={className} />,
    "planet-inspection": <Target className={className} />,
    sunspot: <Sun className={className} />,
    "satellite-planetFour": <Satellite className={className} />,
  };

  return iconMap[classificationType] || <Telescope className={className} />;
};

export const getMineralIcon = (className: string = "w-full h-full text-white") => {
  return <Droplets className={className} />;
};

export const getPlanetCompletionIcon = (className: string = "w-full h-full text-white") => {
  return <Target className={className} />;
};
