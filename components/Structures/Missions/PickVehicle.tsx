import { Truck, Shield, Users, Gauge, Search, Rocket } from "lucide-react";
import type { Vehicle } from "@/types/Vehicles";
import TotalPoints from "./Stardust/Total";
import { useCallback, useState } from "react";

interface PickAutomatonForPickPlanetProps {
  onSelectVehicle: (vehicleId: string) => void;
};

const automatons: Vehicle[] = [
    {
      id: "1",
      name: "Visual Satellite",
      description: "Use this to find landmarks and sites on the planet you chose. Recommended for Planet Four & Cloudspotting",
      icon: "truck",
      stats: {
        speed: 65,
        armor: 30,
        capacity: 8,
      },
      cost: 1,
      quantity: 0,
    },
    {
      id: "2",
      name: "Scout Rover",
      description: "Help train these rovers to better understand their surroundings and find deposits and terrain. Recommended for AI For Mars",
      icon: "scout",
      stats: {
        speed: 65,
        armor: 30,
        capacity: 8,
      },
      cost: 1,
      quantity: 0,
    },
];

export default function PickAutomatonForPickPlanet({
  onSelectVehicle,
}: PickAutomatonForPickPlanetProps) {
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "truck":
        return <Rocket className="w-24 h-24 text-primary" />;
      case "scout":
        return <Search className="w-24 h-24 text-accent" />;
      default:
        return <Truck className="w-24 h-24 text-muted" />;
    };
  };

  const [pointsData, setPointsData] = useState<{
    planetHuntersPoints: number;
    dailyMinorPlanetPoints: number;
    ai4mPoints: number;
    planetFourPoints: number;
    jvhPoints: number;
    cloudspottingPoints: number;
    totalPoints: number;
  } | null>(null);

  const handleExport = useCallback((points: typeof pointsData) => {
    setPointsData(points);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">Current XP Balance: </h2>
              <TotalPoints onExport={handleExport} />
              <p className="text-3xl font-bold text-primary">{pointsData?.totalPoints}</p>
            </div>
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Gauge className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 rounded-lg shadow">
          <h2 className="font-semibold text-secondary mb-2">Automaton Selection</h2>
          <p className="text-sm text-blue-500 leading-tight">
            Browse and select from available automatons. Each automaton has unique stats and costs XP to acquire. Your
            current XP balance is shown on the left. After selecting one, you can launch it to the planet you chose to acquire the data
            and proceed with your classification mission
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {automatons.map((vehicle) => (
          <div
            key={vehicle.id}
            className="rounded-lg shadow overflow-hidden group hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48 bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center p-6 border-b">
              <div className="transform group-hover:scale-110 transition-transform">
                {renderIcon(vehicle.icon)}
              </div>
            </div>

            <div className="p-6 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{vehicle.name}</h3>
                  <div className="text-sm text-muted-foreground">ID: {vehicle.id}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{vehicle.description}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex flex-col items-center p-2 rounded-md hover:bg-muted transition-colors">
                  <Gauge className="w-6 h-6 mb-1 text-primary" />
                  <span className="text-sm font-medium">{vehicle.stats.speed}</span>
                  <span className="text-xs text-muted-foreground">Speed</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md hover:bg-muted transition-colors">
                  <Shield className="w-6 h-6 mb-1 text-secondary" />
                  <span className="text-sm font-medium">{vehicle.stats.armor}</span>
                  <span className="text-xs text-muted-foreground">Armor</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md hover:bg-muted transition-colors">
                  <Users className="w-6 h-6 mb-1 text-accent" />
                  <span className="text-sm font-medium">{vehicle.stats.capacity}</span>
                  <span className="text-xs text-muted-foreground">Capacity</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="bg-primary/10 px-4 py-2 rounded-full">
                  <span className="text-sm text-primary-foreground">Cost:</span>
                  <span className="ml-2 font-semibold text-primary">{formatNumber(vehicle.cost)} XP</span>
                </div>
                <div className="bg-secondary/10 px-4 py-2 rounded-full">
                  <span className="text-sm text-secondary-foreground">Qty:</span>
                  <span className="ml-2 font-semibold text-secondary">{vehicle.quantity}</span>
                </div>
              </div>
              <div className="p-6">
                <button
                  onClick={() => onSelectVehicle(vehicle.id)}
                  className="w-full bg-primary/20 py-2 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                >
                  Select {vehicle.name}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};