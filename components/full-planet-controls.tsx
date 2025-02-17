"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { determineLiquidType } from "../utils/planet-physics"
import type { PlanetStats } from "../utils/planet-physics"

interface FullPlanetControlsProps {
  stats: PlanetStats
  onMassChange: (value: number) => void
  onRadiusChange: (value: number) => void
  onTemperatureChange: (value: number) => void
  onOrbitalPeriodChange: (value: number) => void
  onTypeOverride: (type: "terrestrial" | "gaseous" | null) => void
  onAtmosphereStrengthChange: (value: number) => void
  onCloudCountChange: (value: number) => void
  onWaterLevelChange: (value: number) => void
  onSurfaceRoughnessChange: (value: number) => void
  showExtendedControls: boolean
}

export function FullPlanetControls({
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
}: FullPlanetControlsProps) {
  const liquidInfo = determineLiquidType(stats.temperature)

  return (
    <div className="grid gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base text-[#5FCBC3]">Mass (M⊕)</Label>
          <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">{stats.mass.toFixed(2)}</span>
        </div>
        <Slider
          className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
          min={0.1}
          max={10}
          step={0.1}
          value={[stats.mass]}
          onValueChange={([value]) => onMassChange(value)}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base text-[#5FCBC3]">Radius (R⊕)</Label>
          <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">{stats.radius.toFixed(2)}</span>
        </div>
        <Slider
          className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
          min={0.1}
          max={3}
          step={0.1}
          value={[stats.radius]}
          onValueChange={([value]) => onRadiusChange(value)}
        />
      </div>

      {showExtendedControls && (
        <>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Temperature (K)</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">{stats.temperature}</span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={50}
              max={400}
              step={1}
              value={[stats.temperature]}
              onValueChange={([value]) => onTemperatureChange(value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Water Level</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">{stats.waterLevel.toFixed(2)}</span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.waterLevel]}
              onValueChange={([value]) => onWaterLevelChange(value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Surface Roughness</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">
                {stats.surfaceRoughness.toFixed(2)}
              </span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.surfaceRoughness]}
              onValueChange={([value]) => onSurfaceRoughnessChange(value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Atmosphere</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">
                {stats.atmosphereStrength.toFixed(2)}
              </span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.atmosphereStrength]}
              onValueChange={([value]) => onAtmosphereStrengthChange(value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Clouds</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">{stats.cloudCount}</span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={100}
              step={1}
              value={[stats.cloudCount]}
              onValueChange={([value]) => onCloudCountChange(value)}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base text-[#5FCBC3]">Planet Type</Label>
            <div className="flex gap-4">
              <Button
                onClick={() => onTypeOverride("terrestrial")}
                variant={stats.type === "terrestrial" ? "default" : "outline"}
                className={
                  stats.type === "terrestrial"
                    ? "bg-[#5FCBC3] hover:bg-[#5FCBC3]/90"
                    : "border-[#5FCBC3] text-[#5FCBC3] hover:bg-[#5FCBC3] hover:text-white"
                }
              >
                Terrestrial
              </Button>
              <Button
                onClick={() => onTypeOverride("gaseous")}
                variant={stats.type === "gaseous" ? "default" : "outline"}
                className={
                  stats.type === "gaseous"
                    ? "bg-[#B9E678] hover:bg-[#B9E678]/90"
                    : "border-[#B9E678] text-[#B9E678] hover:bg-[#B9E678] hover:text-white"
                }
              >
                Gaseous
              </Button>
            </div>
          </div>

          <div className="p-4 bg-[#2C4F64] rounded-lg">
            <div className="text-sm text-white space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5FCBC3]">Density:</span>
                <span>{stats.density.toFixed(2)} g/cm³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5FCBC3]">Type:</span>
                <span>{stats.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5FCBC3]">Liquid:</span>
                <span>{liquidInfo.type}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

