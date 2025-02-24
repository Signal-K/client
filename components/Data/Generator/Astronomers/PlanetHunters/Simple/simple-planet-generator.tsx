"use client";

import { useState } from "react";
import { SimplePlanetScene } from "./simple-planet-scene";
import { SimplePlanetControls } from "./simple-planet-controls";
import { SimplePlanetImportExport } from "./simple-planet-import-export";
import { calculatePlanetStats } from "@/utils/planet-physics";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { PlanetStats } from "@/utils/planet-physics";

export function SimplePlanetGenerator() {
  const [mass, setMass] = useState(1);
  const [radius, setRadius] = useState(1);

  const stats = calculatePlanetStats(mass, radius, 288, 365);

  const handleImport = (importedStats: Partial<PlanetStats>) => {
    if (importedStats.mass !== undefined) setMass(importedStats.mass);
    if (importedStats.radius !== undefined) setRadius(importedStats.radius);
    // If density is not provided, it will be calculated in calculatePlanetStats
  };

  return (
    <div className="rounded-lg overflow-hidden bg-[#1E1E1E] border border-[#2A2A2A]">
      <div className="h-[400px] relative">
        <SimplePlanetScene stats={stats} />
      </div>
      <div className="p-6 space-y-6">
        <SimplePlanetControls stats={stats} onMassChange={setMass} onRadiusChange={setRadius} />
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#2A9D8F] border-[#2A9D8F]"
            >
              Import/Export
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#1E1E1E] text-white">
            <DialogHeader>
              <DialogTitle className="text-[#2A9D8F]">Import/Export Planet Settings</DialogTitle>
            </DialogHeader>
            <SimplePlanetImportExport stats={stats} onImport={handleImport} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};