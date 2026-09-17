import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BiomePattern } from "@/components/Structures/Missions/Biologists/BiomePattern";
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
  Globe,
} from "lucide-react";
import type { Station } from "@/types/station";

// --- Icon Mapping ---
const iconMap = {
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

// --- Station Config ---
const stationConfig: Station[] = [
  {
    id: "3104001",
    name: "Desert Observatory",
    icon: "Sun",
    biome: {
      name: "Desert",
      color: "rgb(234, 255, 114)",
      accentColor: "rgb(234, 255, 100)",
      darkColor: "rgb(30, 58, 138)",
    },
    animals: [
      {
        name: "Burrowing Owl",
        icon: "Bird",
        biomassType: "Fauna",
        mass: 0.5,
      },
      {
        name: "Iguanas (from above)",
        icon: "Turtle",
        biomassType: "Fauna",
        mass: 0.25,
      },
    ],
    location: {
      coordinates: "23.4162° N, 75.2397° W",
      depth: "+2m",
    },
    built: false,
  },
  {
    id: "3104002",
    name: "Ocean Observatory",
    icon: "Waves",
    biome: {
      name: "Ocean",
      color: "rgb(22, 163, 255)",
      accentColor: "rgb(34, 87, 245)",
      darkColor: "rgb(20, 83, 45)",
    },
    animals: [
      {
        name: "Plankton Portal",
        icon: "Fish",
        biomassType: "Fauna",
        mass: 0.0000001,
      },
    ],
    location: {
      coordinates: "2.4162° S, 54.2397° W",
      altitude: "-10m",
    },
    built: false,
  },
];

// --- Animal-Centric Mapping ---
const animalProjects = (() => {
  const map: Record<string, {
    name: string;
    icon: string;
    biomassType: string;
    mass: number;
    stations: Station[];
  }> = {};

  for (const station of stationConfig) {
    for (const animal of station.animals) {
      if (!map[animal.name]) {
        map[animal.name] = {
          ...animal,
          stations: [],
        };
      }
      map[animal.name].stations.push(station);
    }
  }

  return Object.values(map);
})();

// --- Main Component ---
export default function BiologySectionDeploy() {
  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {animalProjects.map((animal) => (
          <AnimalCard key={animal.name} animal={animal} />
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <Link
          href="/structures/greenhouse"
          className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-all"
        >
          View Greenhouse
        </Link>
      </div>
    </div>
  );
}

// --- Animal Card ---
interface AnimalCardProps {
  animal: {
    name: string;
    icon: string;
    biomassType: string;
    mass: number;
    stations: Station[];
  };
}

function AnimalCard({ animal }: AnimalCardProps) {
  const AnimalIcon = iconMap[animal.icon as keyof typeof iconMap];

  return (
    <Card className="relative overflow-hidden hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
      {/* Blend biome backgrounds from all associated stations */}
      {animal.stations.map((station, index) => (
        <BiomePattern
          key={station.id}
          biome={station.biome}
          className={`absolute inset-0 opacity-10 z-0 ${index > 0 ? "mix-blend-lighten" : ""}`}
        />
      ))}

      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-white">
          {AnimalIcon && <AnimalIcon className="w-6 h-6" />}
          {animal.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 space-y-3">
        <div className="text-sm text-blue-300">
          Biomass: <span className="font-medium">{animal.mass} kg</span>
        </div>

        <div className="text-sm text-blue-300">
          Type: <span className="font-medium">{animal.biomassType}</span>
        </div>

        <div className="text-sm text-blue-400">Stations:</div>
        <ul className="pl-4 list-disc text-sm text-white/80">
          {animal.stations.map((station) => (
            <li key={station.id}>
              <span className="font-semibold">{station.name}</span> —{" "}
              <span className="text-blue-300">{station.biome.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};