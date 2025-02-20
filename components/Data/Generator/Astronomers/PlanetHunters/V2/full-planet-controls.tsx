"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { determineLiquidType } from "@/utils/planet-physics"
import type { PlanetStats } from "@/utils/planet-physics"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  onAtmosphereVisibilityChange: (value: number) => void
  onAtmosphereHeightChange: (value: number) => void
}

function SliderControl({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-[#5FCBC3]">{label}</Label>
        <span className="text-xs text-white bg-[#2C4F64] px-2 py-0.5 rounded">{value?.toFixed(2) ?? "N/A"}</span>
      </div>
      <Slider
        className="w-full [&_[role=slider]]:bg-[#5FCBC3]"
        min={min}
        max={max}
        step={step}
        value={[value ?? 0]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  )
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
  onAtmosphereVisibilityChange,
  onAtmosphereHeightChange,
}: FullPlanetControlsProps) {
  const liquidInfo = determineLiquidType(stats.temperature)

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        <Accordion type="multiple" defaultValue={["basic"]}>
          <AccordionItem value="basic" className="border-[#2C4F64]">
            <AccordionTrigger className="text-[#5FCBC3] hover:text-[#5FCBC3]/90">Basic Properties</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <SliderControl
                  label="Mass (M⊕)"
                  value={stats.mass}
                  min={0.1}
                  max={10}
                  step={0.1}
                  onChange={onMassChange}
                />
                <SliderControl
                  label="Radius (R⊕)"
                  value={stats.radius}
                  min={0.1}
                  max={3}
                  step={0.1}
                  onChange={onRadiusChange}
                />
                <div className="space-y-2">
                  <Label className="text-sm text-[#5FCBC3]">Planet Type</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onTypeOverride("terrestrial")}
                      variant={stats.type === "terrestrial" ? "default" : "outline"}
                      className={
                        stats.type === "terrestrial"
                          ? "bg-[#5FCBC3] hover:bg-[#5FCBC3]/90 flex-1"
                          : "border-[#5FCBC3] text-[#5FCBC3] hover:bg-[#5FCBC3] hover:text-white flex-1"
                      }
                    >
                      Terrestrial
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onTypeOverride("gaseous")}
                      variant={stats.type === "gaseous" ? "default" : "outline"}
                      className={
                        stats.type === "gaseous"
                          ? "bg-[#B9E678] hover:bg-[#B9E678]/90 flex-1"
                          : "border-[#B9E678] text-[#B9E678] hover:bg-[#B9E678] hover:text-white flex-1"
                      }
                    >
                      Gaseous
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {showExtendedControls && (
            <>
              <AccordionItem value="environment" className="border-[#2C4F64]">
                <AccordionTrigger className="text-[#5FCBC3] hover:text-[#5FCBC3]/90">Environment</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    <SliderControl
                      label="Temperature (K)"
                      value={stats.temperature}
                      min={50}
                      max={400}
                      step={1}
                      onChange={onTemperatureChange}
                    />
                    <div className="space-y-2">
                      <Label className="text-sm text-[#5FCBC3]">Biome</Label>
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
                    <SliderControl
                      label="Biomass Level"
                      value={stats.biomassLevel}
                      min={0}
                      max={1}
                      onChange={onBiomassLevelChange}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="terrain" className="border-[#2C4F64]">
                <AccordionTrigger className="text-[#5FCBC3] hover:text-[#5FCBC3]/90">Terrain</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    <SliderControl
                      label="Surface Roughness"
                      value={stats.surfaceRoughness}
                      min={0}
                      max={2}
                      onChange={onSurfaceRoughnessChange}
                    />
                    <SliderControl
                      label="Terrain Erosion"
                      value={stats.terrainErosion}
                      min={0}
                      max={1}
                      onChange={onTerrainErosionChange}
                    />
                    <SliderControl
                      label="Plate Tectonics"
                      value={stats.plateTectonics}
                      min={0}
                      max={1}
                      onChange={onPlateTectonicsChange}
                    />
                    <div className="space-y-2">
                      <Label className="text-sm text-[#5FCBC3]">Soil Type</Label>
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
                    <SliderControl
                      label="Volcanic Activity"
                      value={stats.volcanicActivity}
                      min={0}
                      max={1}
                      onChange={onVolcanicActivityChange}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="atmosphere" className="border-[#2C4F64]">
                <AccordionTrigger className="text-[#5FCBC3] hover:text-[#5FCBC3]/90">Atmosphere</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    <SliderControl
                      label="Atmosphere Strength"
                      value={stats.atmosphereStrength}
                      min={0}
                      max={1}
                      onChange={onAtmosphereStrengthChange}
                    />
                    {/* <SliderControl
                      label="Atmosphere Visibility"
                      value={stats.atmosphereVisibility}
                      min={0}
                      max={1}
                      onChange={onAtmosphereVisibilityChange}
                    />
                    <SliderControl
                      label="Atmosphere Height"
                      value={stats.atmosphereHeight}
                      min={0}
                      max={2}
                      onChange={onAtmosphereHeightChange}
                    /> */}
                    <SliderControl
                      label="Atmospheric Density"
                      value={stats.atmosphericDensity}
                      min={0}
                      max={1}
                      onChange={onAtmosphericDensityChange}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="weather" className="border-[#2C4F64]">
                <AccordionTrigger className="text-[#5FCBC3] hover:text-[#5FCBC3]/90">Weather</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-[#5FCBC3]">Cloud Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Cumulus", "Stratus", "Cirrus", "Cumulonimbus"].map((type) => (
                          <Button
                            key={type}
                            size="sm"
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
                    <SliderControl
                      label="Cloud Density"
                      value={stats.cloudDensity}
                      min={0}
                      max={1}
                      onChange={onCloudDensityChange}
                    />
                    <SliderControl
                      label="Weather Variability"
                      value={stats.weatherVariability}
                      min={0}
                      max={1}
                      onChange={onWeatherVariabilityChange}
                    />
                    <SliderControl
                      label="Storm Frequency"
                      value={stats.stormFrequency}
                      min={0}
                      max={1}
                      onChange={onStormFrequencyChange}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="water" className="border-[#2C4F64]">
                <AccordionTrigger className="text-[#5FCBC3] hover:text-[#5FCBC3]/90">Water</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    <SliderControl
                      label="Water Height"
                      value={stats.waterHeight}
                      min={0}
                      max={1}
                      onChange={onWaterHeightChange}
                    />
                    <SliderControl
                      label="Water Level"
                      value={stats.waterLevel}
                      min={0}
                      max={1}
                      onChange={onWaterLevelChange}
                    />
                    <SliderControl
                      label="Salinity"
                      value={stats.salinity}
                      min={0}
                      max={1}
                      onChange={onSalinityChange}
                    />
                    <SliderControl
                      label="Subsurface Water"
                      value={stats.subsurfaceWater}
                      min={0}
                      max={1}
                      onChange={onSubsurfaceWaterChange}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="info" className="border-[#2C4F64]">
                <AccordionTrigger className="text-[#5FCBC3] hover:text-[#5FCBC3]/90">Information</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#5FCBC3]">Density:</span>
                      <span className="text-white">{stats.density?.toFixed(2) ?? "N/A"} g/cm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5FCBC3]">Type:</span>
                      <span className="text-white">{stats.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5FCBC3]">Liquid:</span>
                      <span className="text-white">{liquidInfo.type}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </>
          )}
        </Accordion>
      </div>
    </ScrollArea>
  );
};