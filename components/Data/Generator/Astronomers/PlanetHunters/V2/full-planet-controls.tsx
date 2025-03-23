"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { determineLiquidType } from "@/utils/planet-physics"
import type { PlanetStats } from "@/utils/planet-physics"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { getParameterRange, biomeData } from "@/utils/biome-data"
import { useEffect } from "react"
import { CloudCategories } from "@/utils/cloud-types"
import { LandmarkManager } from "./landmarks/manager"
import type { Landmark } from "@/utils/landmark-types"

interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
}

function SliderControl({ label, value, min, max, step = 0.01, onChange, disabled = false }: SliderControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className={`text-sm ${disabled ? "text-gray-500" : "text-[#5FCBC3]"}`}>{label}</Label>
        <span className="text-xs text-white bg-[#2C4F64] px-2 py-0.5 rounded">{value?.toFixed(2) ?? "N/A"}</span>
      </div>
      <Slider
        className={`w-full ${disabled ? "opacity-50" : ""} [&_[role=slider]]:bg-[#5FCBC3]`}
        min={min}
        max={max}
        step={step}
        value={[value ?? 0]}
        onValueChange={([v]) => onChange(v)}
        disabled={disabled}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

// Add the precipitationCompound property to the FullPlanetControlsProps interface
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
  // onSoilTypeChange: (value: "rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy") => void
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
  onPrecipitationCompoundChange?: (value: "none" | "water" | "co2" | "snow" | "methane") => void
  onLandmarksChange?: (landmarks: Landmark[]) => void
  selectedLandmark?: Landmark
  onLandmarkSelect?: (landmark: Landmark) => void
}

// Add the precipitation compound control to the component
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
  // onSoilTypeChange,
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
  onPrecipitationCompoundChange,
  onLandmarksChange,
  selectedLandmark,
  onLandmarkSelect,
}: FullPlanetControlsProps) {
  const liquidInfo = stats.temperature !== undefined ? determineLiquidType(stats.temperature) : { type: "Unknown" }

  // When biome changes, adjust parameters to fit within biome ranges
  useEffect(() => {
    if (stats.biome) {
      // Get ranges for the current biome
      const temperatureRange = getParameterRange(stats.biome, "temperature")
      const atmosphereRange = getParameterRange(stats.biome, "atmosphereStrength")
      const cloudCountRange = getParameterRange(stats.biome, "cloudCount")
      const waterHeightRange = getParameterRange(stats.biome, "waterHeight")
      const surfaceRoughnessRange = getParameterRange(stats.biome, "surfaceRoughness")
      const plateTectonicsRange = getParameterRange(stats.biome, "plateTectonics")
      const biomassLevelRange = getParameterRange(stats.biome, "biomassLevel")
      const waterLevelRange = getParameterRange(stats.biome, "waterLevel")
      const salinityRange = getParameterRange(stats.biome, "salinity")
      const volcanicActivityRange = getParameterRange(stats.biome, "volcanicActivity")

      // Special handling for oceanic worlds
      if (stats.biome === "Oceanic World") {
        // Force very high water level for oceanic worlds
        onWaterHeightChange(0.95)
        onWaterLevelChange(0.95)
        // Reduce surface roughness for oceanic worlds
        onSurfaceRoughnessChange(Math.min(surfaceRoughnessRange[0], 0.2))
      } else {
        // Normal adjustments for other biomes
        if (stats.waterHeight < waterHeightRange[0] || stats.waterHeight > waterHeightRange[1]) {
          onWaterHeightChange(Math.min(Math.max(stats.waterHeight, waterHeightRange[0]), waterHeightRange[1]))
        }

        if (stats.waterLevel < waterLevelRange[0] || stats.waterLevel > waterLevelRange[1]) {
          onWaterLevelChange(Math.min(Math.max(stats.waterLevel, waterLevelRange[0]), waterLevelRange[1]))
        }

        if (stats.surfaceRoughness < surfaceRoughnessRange[0] || stats.surfaceRoughness > surfaceRoughnessRange[1]) {
          onSurfaceRoughnessChange(
            Math.min(Math.max(stats.surfaceRoughness, surfaceRoughnessRange[0]), surfaceRoughnessRange[1]),
          )
        }
      }

      // Adjust values to fit within ranges
      if (stats.temperature < temperatureRange[0] || stats.temperature > temperatureRange[1]) {
        onTemperatureChange(Math.min(Math.max(stats.temperature, temperatureRange[0]), temperatureRange[1]))
      }

      if (stats.atmosphereStrength < atmosphereRange[0] || stats.atmosphereStrength > atmosphereRange[1]) {
        onAtmosphereStrengthChange(Math.min(Math.max(stats.atmosphereStrength, atmosphereRange[0]), atmosphereRange[1]))
      }

      if (stats.cloudCount < cloudCountRange[0] || stats.cloudCount > cloudCountRange[1]) {
        onCloudCountChange(Math.min(Math.max(stats.cloudCount, cloudCountRange[0]), cloudCountRange[1]))
      }

      if (stats.plateTectonics < plateTectonicsRange[0] || stats.plateTectonics > plateTectonicsRange[1]) {
        onPlateTectonicsChange(Math.min(Math.max(stats.plateTectonics, plateTectonicsRange[0]), plateTectonicsRange[1]))
      };

      if (stats.biomassLevel < biomassLevelRange[0] || stats.biomassLevel > biomassLevelRange[1]) {
        onBiomassLevelChange(Math.min(Math.max(stats.biomassLevel, biomassLevelRange[0]), biomassLevelRange[1]))
      }

      if (stats.salinity < salinityRange[0] || stats.salinity > salinityRange[1]) {
        onSalinityChange(Math.min(Math.max(stats.salinity, salinityRange[0]), salinityRange[1]))
      }

      if (stats.volcanicActivity < volcanicActivityRange[0] || stats.volcanicActivity > volcanicActivityRange[1]) {
        onVolcanicActivityChange(
          Math.min(Math.max(stats.volcanicActivity, volcanicActivityRange[0]), volcanicActivityRange[1]),
        )
      }
    }
  }, [stats.biome])

  return (
    <div className="space-y-4 pb-6">
      <Accordion type="multiple" defaultValue={["basic", "environment", "landmarks"]}>
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
                onChange={(value) => {
                  onMassChange(value)
                  if (value > 7.5) {
                    onTypeOverride("gaseous")
                  } else {
                    onTypeOverride(null) // Let the physics determine type
                  }
                }}
              />
              <SliderControl
                label="Radius (R⊕)"
                value={stats.radius}
                min={0.1}
                max={3}
                step={0.1}
                onChange={(value) => {
                  onRadiusChange(value)
                  if (value > 2) {
                    onTypeOverride("gaseous")
                  } else {
                    onTypeOverride(null) // Let the physics determine type
                  }
                }}
              />
              <div className="space-y-2">
                <Label className="text-sm text-[#5FCBC3]">Planet Type</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      onTypeOverride("terrestrial")
                      onMassChange(1) // Earth-like mass
                      onRadiusChange(1) // Earth-like radius
                    }}
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
                    onClick={() => {
                      onTypeOverride("gaseous")
                      onMassChange(8) // Gas giant mass
                      onRadiusChange(2.5) // Gas giant radius
                    }}
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
            <AccordionItem value="landmarks" className="border-[#2C4F64]">
              <AccordionTrigger className="text-[#5FCBC3] hover:text-[#5FCBC3]/90">Landmarks</AccordionTrigger>
              <AccordionContent>
                {onLandmarksChange && (
                  <LandmarkManager
                    landmarks={stats.landmarks || []}
                    onLandmarksChange={onLandmarksChange}
                    onLandmarkSelect={onLandmarkSelect}
                    selectedLandmarkId={selectedLandmark?.id}
                  />
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="environment" className="border-[#2C4F64]">
              <AccordionTrigger className="text-[#5FCBC3] hover:text-[#5FCBC3]/90">Environment</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-[#5FCBC3]">Biome</Label>
                    <Select 
  value={stats.biome} 
  onValueChange={(newBiome) => {
    // Prevent setting Oceanic World when density > 1.9
    if (newBiome === "Oceanic World" && stats.density && stats.density > 1.9) {
      alert("Oceanic World biome cannot be set when density is greater than 1.9 g/cm³");
      return;
    }
    onBiomeChange(newBiome);
  }}
>
                      <SelectTrigger className="w-full bg-[#2C4F64] text-white border-[#5FCBC3]">
                        <SelectValue placeholder="Select biome" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2C4F64] text-white border-[#5FCBC3]">
                        {Object.keys(biomeData).map((biomeName) => (
                          <SelectItem key={biomeName} value={biomeName}>
                            {biomeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {stats.surfaceDeposits && stats.surfaceDeposits.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-[#5FCBC3]">Surface Deposits</Label>
                      <div className="flex flex-wrap gap-2">
                        {stats.surfaceDeposits.map((deposit) => (
                          <Badge key={deposit} className="bg-[#2C4F64] text-white">
                            {deposit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <SliderControl
                    label="Temperature (K)"
                    value={stats.temperature ?? 50}
                    min={getParameterRange(stats.biome, "temperature")[0]}
                    max={getParameterRange(stats.biome, "temperature")[1]}
                    step={1}
                    onChange={onTemperatureChange}
                  />

                  <SliderControl
                    label="Biomass Level"
                    value={stats.biomassLevel ?? 0}
                    min={getParameterRange(stats.biome, "biomassLevel")[0]}
                    max={getParameterRange(stats.biome, "biomassLevel")[1]}
                    onChange={onBiomassLevelChange}
                  />

                  {/* Add precipitation compound selector */}
                  <div className="space-y-2">
                    <Label className="text-sm text-[#5FCBC3]">Precipitation Compound</Label>
                    <Select
                      value={stats.precipitationCompound || "water"}
                      onValueChange={(value) =>
                        onPrecipitationCompoundChange?.(value as "none" | "water" | "co2" | "snow" | "methane")
                      }
                    >
                      <SelectTrigger className="w-full bg-[#2C4F64] text-white border-[#5FCBC3]">
                        <SelectValue placeholder="Select precipitation compound" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2C4F64] text-white border-[#5FCBC3]">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="water">Water (H₂O)</SelectItem>
                        <SelectItem value="co2">Carbon Dioxide (CO₂)</SelectItem>
                        <SelectItem value="snow">Snow (Frozen H₂O)</SelectItem>
                        <SelectItem value="methane">Liquid Methane (CH₄)</SelectItem>
                      </SelectContent>
                    </Select>
                    {stats.precipitationCompound && stats.precipitationCompound !== "none" && (
                      <div className="mt-2 text-xs text-gray-400">
                        {stats.precipitationCompound === "water" &&
                          "Liquid water precipitation occurs between 273K and 373K"}
                        {stats.precipitationCompound === "co2" && "CO₂ precipitation occurs below 195K"}
                        {stats.precipitationCompound === "snow" && "Snow precipitation occurs below 273K"}
                        {stats.precipitationCompound === "methane" && "Methane precipitation occurs below 112K"}
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="terrain" className="border-[#2C4F64]">
              <AccordionTrigger className="text-[#5FCBC3] hover:text-[#5FCBC3]/90">Terrain</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4">
                  <SliderControl
                    label="Surface Roughness"
                    value={stats.surfaceRoughness ?? 0}
                    min={getParameterRange(stats.biome, "surfaceRoughness")[0]}
                    max={getParameterRange(stats.biome, "surfaceRoughness")[1]}
                    onChange={onSurfaceRoughnessChange}
                  />
                  <SliderControl
                    label="Terrain Erosion"
                    value={stats.terrainErosion ?? 0}
                    min={0}
                    max={1}
                    onChange={onTerrainErosionChange}
                  />
                  <SliderControl
                    label="Plate Tectonics"
                    value={stats.plateTectonics ?? 0}
                    min={getParameterRange(stats.biome, "plateTectonics")[0]}
                    max={getParameterRange(stats.biome, "plateTectonics")[1]}
                    onChange={onPlateTectonicsChange}
                  />
                  {/* <div className="space-y-2">
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
                  </div> */}
                  <SliderControl
                    label="Volcanic Activity"
                    value={stats.volcanicActivity ?? 0}
                    min={getParameterRange(stats.biome, "volcanicActivity")[0]}
                    max={getParameterRange(stats.biome, "volcanicActivity")[1]}
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
                    value={stats.atmosphereStrength ?? 0}
                    min={getParameterRange(stats.biome, "atmosphereStrength")[0]}
                    max={getParameterRange(stats.biome, "atmosphereStrength")[1]}
                    onChange={onAtmosphereStrengthChange}
                  />
                  <SliderControl
                    label="Atmospheric Density"
                    value={stats.atmosphericDensity ?? 0}
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
                  {/* <div className="space-y-2">
                    <Label className="text-sm text-[#5FCBC3]">Cloud Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(CloudCategories).map(([type, cloudInfo]) => (
                        <Button
                          key={type}
                          size="sm"
                          onClick={() => {
                            const newTypes = (stats.cloudTypes ?? []).includes(type)
                              ? (stats.cloudTypes ?? []).filter((t) => t !== type)
                              : [...(stats.cloudTypes ?? []), type]
                            onCloudTypesChange(newTypes)
                          }}
                          variant={(stats.cloudTypes ?? []).includes(type) ? "default" : "outline"}
                          style={{
                            backgroundColor: (stats.cloudTypes ?? []).includes(type) ? cloudInfo.color : "transparent",
                            borderColor: cloudInfo.color,
                            color: (stats.cloudTypes ?? []).includes(type) ? "white" : cloudInfo.color,
                          }}
                          title={cloudInfo.description}
                        >
                          {cloudInfo.name}
                        </Button>
                      ))}
                    </div>
                  </div> */}
                  <SliderControl
                    label="Cloud Count"
                    value={stats.cloudCount ?? 0}
                    min={getParameterRange(stats.biome, "cloudCount")[0]}
                    max={getParameterRange(stats.biome, "cloudCount")[1]}
                    onChange={onCloudCountChange}
                  />
                  {/* <SliderControl
                    label="Cloud Density"
                    value={stats.cloudDensity ?? 0}
                    min={0}
                    max={1}
                    onChange={onCloudDensityChange}
                  /> */}
                  <SliderControl
                    label="Weather Variability"
                    value={stats.weatherVariability ?? 0}
                    min={0}
                    max={1}
                    onChange={onWeatherVariabilityChange}
                  />
                  <SliderControl
                    label="Storm Frequency"
                    value={stats.stormFrequency ?? 0}
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
                    value={stats.waterHeight ?? 0.5}
                    min={getParameterRange(stats.biome, "waterHeight")[0]}
                    max={getParameterRange(stats.biome, "waterHeight")[1]}
                    onChange={onWaterHeightChange}
                  />
                  <SliderControl
                    label="Water Level"
                    value={stats.waterLevel ?? 0.5}
                    min={getParameterRange(stats.biome, "waterLevel")[0]}
                    max={getParameterRange(stats.biome, "waterLevel")[1]}
                    onChange={onWaterLevelChange}
                  />
                  <SliderControl
                    label="Salinity"
                    value={stats.salinity ?? 0.1}
                    min={getParameterRange(stats.biome, "salinity")[0]}
                    max={getParameterRange(stats.biome, "salinity")[1]}
                    onChange={onSalinityChange}
                  />
                  <SliderControl
                    label="Subsurface Water"
                    value={stats.subsurfaceWater ?? 0.02}
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
                  <div className="flex justify-between">
                    <span className="text-[#5FCBC3]">Precipitation:</span>
                    <span className="text-white">{stats.precipitationCompound || "None"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5FCBC3]">Landmarks:</span>
                    <span className="text-white">{stats.landmarks?.length || 0}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </>
        )}
      </Accordion>
    </div>
  );
};