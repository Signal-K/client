import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

interface PlanetSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planetTargets: { id: number; name: string }[];
  onSelectPlanet: (planetId: number, planetName: string) => void;
}

const PlanetSelectorModal: React.FC<PlanetSelectorModalProps> = ({
  open,
  onOpenChange,
  planetTargets,
  onSelectPlanet,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🛰️</span>
            Deploy Satellite
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Select a planet to deploy your weather satellite to:
          </p>
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {planetTargets.map((planet) => (
              <button
                key={planet.id}
                onClick={() => onSelectPlanet(planet.id, planet.name)}
                className="w-full px-4 py-3 text-left rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-3 group"
              >
                <span className="text-2xl">🌍</span>
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground group-hover:text-foreground">
                    {planet.name}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Deploy weather monitoring satellite
                  </p>
                </div>
              </button>
            ))}
          </div>
          {planetTargets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl block mb-2">🌍</span>
              <p className="text-sm">No planets available for satellite deployment</p>
              <p className="text-xs">Complete a planet classification to unlock satellites</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanetSelectorModal;