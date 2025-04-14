"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { type PlanetStats, determinePlanetType } from "@/lib/planet-physics"

interface PhysicalTabProps {
  planetStats: PlanetStats
  setPlanetStats: (stats: PlanetStats) => void
};

export function PhysicalTab({ planetStats, setPlanetStats }: PhysicalTabProps) {
  const planetType = determinePlanetType(planetStats.mass, planetStats.radius)

  // Update a single stat
  const updateStat = (key: keyof PlanetStats, value: any) => {
    setPlanetStats({
      ...planetStats,
      [key]: value,
    })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 border-green-500/30 text-green-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wide">MASS PROPERTIES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-green-300">Mass (Earth masses)</Label>
              <span className="font-bold">{planetStats.mass.toFixed(2)}</span>
            </div>
            <Slider
              value={[planetStats.mass]}
              min={0.1}
              max={15}
              step={0.1}
              onValueChange={(value) => updateStat("mass", value[0])}
              className="[&_[role=slider]]:bg-green-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-green-300">Radius (Earth radii)</Label>
              <span className="font-bold">{planetStats.radius.toFixed(2)}</span>
            </div>
            <Slider
              value={[planetStats.radius]}
              min={0.1}
              max={10}
              step={0.1}
              onValueChange={(value) => updateStat("radius", value[0])}
              className="[&_[role=slider]]:bg-green-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-green-300">Density (g/cm³)</Label>
              <span className="font-bold">{planetStats.density?.toFixed(2) || "N/A"}</span>
            </div>
            <p className="text-xs text-green-500/70">Calculated from mass and radius</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/60 border-green-500/30 text-green-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wide">THERMAL PROPERTIES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-green-300">Temperature (K)</Label>
              <span className="font-bold">
                {planetStats.temperature} K ({(planetStats.temperature - 273.15).toFixed(1)}°C)
              </span>
            </div>
            <Slider
              value={[planetStats.temperature]}
              min={50}
              max={700}
              step={1}
              onValueChange={(value) => updateStat("temperature", value[0])}
              className="[&_[role=slider]]:bg-green-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/60 border-green-500/30 text-green-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wide">CLASSIFICATION</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-green-300">Planet Type</Label>
              <span className="text-sm capitalize font-bold">{planetType}</span>
            </div>
            <p className="text-xs text-green-500/70">
              {planetType === "gaseous"
                ? "Gas giants have mass > 7 Earth masses or radius > 2.5 Earth radii"
                : "Terrestrial planets have smaller mass and radius"}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-green-300">Has Rings</Label>
              <Switch
                checked={planetStats.hasRings}
                onCheckedChange={(checked) => updateStat("hasRings", checked)}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};