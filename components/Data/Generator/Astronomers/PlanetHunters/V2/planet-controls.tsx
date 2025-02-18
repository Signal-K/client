"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { determineLiquidType } from "@/utils/planet-physics";
import type { PlanetStats } from "@/utils/planet-physics";

interface PlanetControlsProps {
  stats: PlanetStats;
  onMassChange: (value: number) => void;
  onRadiusChange: (value: number) => void;
  onTemperatureChange: (value: number) => void;
  onOrbitalPeriodChange: (value: number) => void;
  onTypeOverride: (type: "terrestrial" | "gaseous" | null) => void;
  onAtmosphereStrengthChange: (value: number) => void;
  onCloudCountChange: (value: number) => void;
  onWaterLevelChange: (value: number) => void;
  onSurfaceRoughnessChange: (value: number) => void;
  showExtendedControls: boolean;
};

export function PlanetControls({
  stats,
  onMassChange,
  onRadiusChange,
  onTemperatureChange,
  onOrbitalPeriodChange,
  onTypeOverride,
  onAtmosphereStrengthChange,
  onCloudCountChange,
  onWaterLevelChange,
  onSurfaceRoughnessChange,
  showExtendedControls,
}: PlanetControlsProps) {
  const liquidInfo = determineLiquidType(stats.temperature);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label className="text-base text-white">Mass (M⊕)</Label>
        <Slider
          className="w-full"
          min={0.1}
          max={10}
          step={0.1}
          value={[stats.mass]}
          onValueChange={([value]) => onMassChange(value)}
        />
        <div className="text-sm text-white">{stats.mass?.toFixed(2) ?? "N/A"}</div>
      </div>

      <div className="space-y-2">
        <Label className="text-base text-white">Radius (R⊕)</Label>
        <Slider
          className="w-full"
          min={0.1}
          max={3}
          step={0.1}
          value={[stats.radius]}
          onValueChange={([value]) => onRadiusChange(value)}
        />
        <div className="text-sm text-white">{stats.radius?.toFixed(2) ?? "N/A"}</div>
      </div>

      {showExtendedControls && (
        <>
          <div className="space-y-2">
            <Label className="text-base text-white">Temp (K)</Label>
            <Slider
              className="w-full"
              min={50}
              max={400}
              step={1}
              value={[stats.temperature]}
              onValueChange={([value]) => onTemperatureChange(value)}
            />
            <div className="text-sm text-white">{stats.temperature ?? "N/A"}</div>
          </div>

          <div className="space-y-2">
            <Label className="text-base text-white">Orbit (days)</Label>
            <Slider
              className="w-full"
              min={1}
              max={1000}
              step={1}
              value={[stats.orbitalPeriod]}
              onValueChange={([value]) => onOrbitalPeriodChange(value)}
            />
            <div className="text-sm text-white">{stats.orbitalPeriod ?? "N/A"}</div>
          </div>

          <div className="space-y-2">
            <Label className="text-base text-white">Atmosphere</Label>
            <Slider
              className="w-full"
              min={0}
              max={1}
              step={0.01}
              value={[stats.atmosphereStrength ?? 0]}
              onValueChange={([value]) => onAtmosphereStrengthChange(value)}
            />
            <div className="text-sm text-white">{stats.atmosphereStrength?.toFixed(2) ?? "N/A"}</div>
          </div>

          <div className="space-y-2">
            <Label className="text-base text-white">Clouds</Label>
            <Slider
              className="w-full"
              min={0}
              max={100}
              step={1}
              value={[stats.cloudCount ?? 0]}
              onValueChange={([value]) => onCloudCountChange(value)}
            />
            <div className="text-sm text-white">{stats.cloudCount ?? "N/A"}</div>
          </div>

          <div className="space-y-2">
            <Label className="text-base text-white">Water Level</Label>
            <Slider
              className="w-full"
              min={0}
              max={1}
              step={0.01}
              value={[stats.waterLevel ?? 0]}
              onValueChange={([value]) => onWaterLevelChange(value)}
            />
            <div className="text-sm text-white">{stats.waterLevel?.toFixed(2) ?? "N/A"}</div>
          </div>

          <div className="space-y-2">
            <Label className="text-base text-white">Roughness</Label>
            <Slider
              className="w-full"
              min={0}
              max={1}
              step={0.01}
              value={[stats.surfaceRoughness ?? 0]}
              onValueChange={([value]) => onSurfaceRoughnessChange(value)}
            />
            <div className="text-sm text-white">{stats.surfaceRoughness?.toFixed(2) ?? "N/A"}</div>
          </div>

          <div className="space-y-2">
            <Label className="text-base text-white">Type</Label>
            <div className="flex space-x-2">
              <Button
                onClick={() => onTypeOverride("terrestrial")}
                variant={stats.type === "terrestrial" ? "default" : "outline"}
                size="sm"
              >
                Terrestrial
              </Button>
              <Button
                onClick={() => onTypeOverride("gaseous")}
                variant={stats.type === "gaseous" ? "default" : "outline"}
                size="sm"
              >
                Gaseous
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base text-white">Info</Label>
            <div className="text-sm text-white">
              <div>Density: {stats.density?.toFixed(2) ?? "N/A"} g/cm³</div>
              <div>Type: {stats.type ?? "N/A"}</div>
              <div>Liquid: {liquidInfo.type}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};