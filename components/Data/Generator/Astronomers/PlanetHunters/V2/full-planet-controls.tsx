"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { determineLiquidType } from "@/utils/planet-physics";
import type { PlanetStats } from "@/utils/planet-physics";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface FullPlanetControlsProps {
  stats: PlanetStats
  onMassChange: (value: number) => void
  onRadiusChange: (value: number) => void
  onTemperatureChange: (value: number) => void
  onOrbitalPeriodChange: (value: number) => void
  onTypeOverride: (type: "terrestrial" | "gaseous" | null) => void
  onAtmosphereStrengthChange: (value: number) => void
  onCloudCountChange: (value: number) => void
  onWaterHeightChange: (value: number) => void
  onSurfaceRoughnessChange: (value: number) => void
  onBiomeFactorChange: (value: number) => void
  onCloudContributionChange: (value: number) => void
  onTerrainVariationChange: (value: "flat" | "moderate" | "chaotic") => void
  onTerrainErosionChange: (value: number) => void
  onPlateTectonicsChange: (value: number) => void
  onSoilTypeChange: (value: "rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy") => void
  onBiomassLevelChange: (value: number) => void
  onWaterLevelChange: (value: number) => void
  onSalinityChange: (value: number) => void
  onSubsurfaceWaterChange: (value: number) => void
  onAtmosphericDensityChange: (value: number) => void
  onWeatherVariabilityChange: (value: number) => void
  onStormFrequencyChange: (value: number) => void
  onVolcanicActivityChange: (value: number) => void
  onBiomeChange: (value: string) => void
  showExtendedControls: boolean
  onCloudTypesChange: (value: string[]) => void
  onCloudDensityChange: (value: number) => void
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
  onWaterHeightChange,
  onSurfaceRoughnessChange,
  onBiomeFactorChange,
  onCloudContributionChange,
  onTerrainVariationChange,
  onTerrainErosionChange,
  onPlateTectonicsChange,
  onSoilTypeChange,
  onBiomassLevelChange,
  onWaterLevelChange,
  onSalinityChange,
  onSubsurfaceWaterChange,
  onAtmosphericDensityChange,
  onWeatherVariabilityChange,
  onStormFrequencyChange,
  onVolcanicActivityChange,
  onBiomeChange,
  showExtendedControls,
  onCloudTypesChange,
  onCloudDensityChange,
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
              <Label className="text-base text-[#5FCBC3]">Water Height</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">{stats.waterHeight.toFixed(2)}</span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.waterHeight]}
              onValueChange={([value]) => onWaterHeightChange(value)}
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
              max={2}
              step={0.01}
              value={[stats.surfaceRoughness]}
              onValueChange={([value]) => onSurfaceRoughnessChange(value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Terrain Erosion</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">
                {stats.terrainErosion.toFixed(2)}
              </span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.terrainErosion]}
              onValueChange={([value]) => onTerrainErosionChange(value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Plate Tectonics</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">
                {stats.plateTectonics.toFixed(2)}
              </span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.plateTectonics]}
              onValueChange={([value]) => onPlateTectonicsChange(value)}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base text-[#5FCBC3]">Soil Type</Label>
            <Select value={stats.soilType} onValueChange={onSoilTypeChange}>
              <SelectTrigger className="w-full bg-[#2C4F64] text-white border-[#5FCBC3]">
                <SelectValue placeholder="Select soil type" />
              </SelectTrigger>
              <SelectContent className="bg-[#2C4F64] text-white border-[#5FCBC3]">
                <SelectItem value="rocky">Rocky</SelectItem>
                <SelectItem value="sandy">Sandy</SelectItem>
                <SelectItem value="volcanic">Volcanic</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="dusty">Dusty</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="muddy">Muddy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Biomass Level</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">{stats.biomassLevel.toFixed(2)}</span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.biomassLevel]}
              onValueChange={([value]) => onBiomassLevelChange(value)}
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
              <Label className="text-base text-[#5FCBC3]">Salinity</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">{stats.salinity.toFixed(2)}</span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.salinity]}
              onValueChange={([value]) => onSalinityChange(value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Subsurface Water</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">
                {stats.subsurfaceWater.toFixed(2)}
              </span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.subsurfaceWater]}
              onValueChange={([value]) => onSubsurfaceWaterChange(value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Atmospheric Density</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">
                {stats.atmosphericDensity.toFixed(2)}
              </span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.atmosphericDensity]}
              onValueChange={([value]) => onAtmosphericDensityChange(value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Weather Variability</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">
                {stats.weatherVariability.toFixed(2)}
              </span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.weatherVariability]}
              onValueChange={([value]) => onWeatherVariabilityChange(value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Storm Frequency</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">
                {stats.stormFrequency.toFixed(2)}
              </span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.stormFrequency]}
              onValueChange={([value]) => onStormFrequencyChange(value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Volcanic Activity</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">
                {stats.volcanicActivity.toFixed(2)}
              </span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.volcanicActivity]}
              onValueChange={([value]) => onVolcanicActivityChange(value)}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base text-[#5FCBC3]">Biome</Label>
            <Select value={stats.biome} onValueChange={onBiomeChange}>
              <SelectTrigger className="w-full bg-[#2C4F64] text-white border-[#5FCBC3]">
                <SelectValue placeholder="Select biome" />
              </SelectTrigger>
              <SelectContent className="bg-[#2C4F64] text-white border-[#5FCBC3]">
                <SelectItem value="Rocky Highlands">Rocky Highlands</SelectItem>
                <SelectItem value="Basalt Plains">Basalt Plains</SelectItem>
                <SelectItem value="Sediment Flats">Sediment Flats</SelectItem>
                <SelectItem value="Cratered Terrain">Cratered Terrain</SelectItem>
                <SelectItem value="Tundra">Tundra</SelectItem>
                <SelectItem value="Flood Basin">Flood Basin</SelectItem>
                <SelectItem value="Coral Reefs">Coral Reefs</SelectItem>
                <SelectItem value="Dune Fields">Dune Fields</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="space-y-4">
            <Label className="text-base text-[#5FCBC3]">Cloud Types</Label>
            <div className="flex flex-wrap gap-2">
              {["Cumulus", "Stratus", "Cirrus", "Cumulonimbus"].map((type) => (
                <Button
                  key={type}
                  onClick={() => {
                    const newTypes = stats.cloudTypes.includes(type)
                      ? stats.cloudTypes.filter((t) => t !== type)
                      : [...stats.cloudTypes, type]
                    onCloudTypesChange(newTypes)
                  }}
                  variant={stats.cloudTypes.includes(type) ? "default" : "outline"}
                  className={
                    stats.cloudTypes.includes(type)
                      ? "bg-[#5FCBC3] hover:bg-[#5FCBC3]/90"
                      : "border-[#5FCBC3] text-[#5FCBC3] hover:bg-[#5FCBC3] hover:text-white"
                  }
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-[#5FCBC3]">Cloud Density</Label>
              <span className="text-sm text-white bg-[#2C4F64] px-2 py-1 rounded">{stats.cloudDensity.toFixed(2)}</span>
            </div>
            <Slider
              className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
              min={0}
              max={1}
              step={0.01}
              value={[stats.cloudDensity]}
              onValueChange={([value]) => onCloudDensityChange(value)}
            />
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

