"use client"

import { useState } from "react"
import { PlanetScene } from "./planet-scene"
import { FullPlanetControls } from "./full-planet-controls"
import { FullPlanetImportExport } from "./full-planet-import-export"
import { calculatePlanetStats, calculateTerrainHeight } from "@/utils/planet-physics"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { PlanetStats } from "@/utils/planet-physics"

const LOW_MASS_THRESHOLD = 0.2
const TERRESTRIAL_THRESHOLD = 7.5 // Earth masses
const GASEOUS_THRESHOLD = 2.0 // Earth radii

export function FullPlanetGenerator() {
  const [mass, setMass] = useState(1)
  const [radius, setRadius] = useState(1)
  const [temperature, setTemperature] = useState(288)
  const [orbitalPeriod, setOrbitalPeriod] = useState(365)
  const [typeOverride, setTypeOverride] = useState<"terrestrial" | "gaseous" | null>(null)
  const [atmosphereStrength, setAtmosphereStrength] = useState(0.5)
  const [cloudCount, setCloudCount] = useState(50)
  const [waterHeight, setWaterHeight] = useState(0.5)
  const [surfaceRoughness, setSurfaceRoughness] = useState(0.5)
  const [biomeFactor, setBiomeFactor] = useState(1.0)
  const [cloudContribution, setCloudContribution] = useState(1.0)
  const [terrainVariation, setTerrainVariation] = useState<"flat" | "moderate" | "chaotic">("moderate")
  const [terrainErosion, setTerrainErosion] = useState(0.5)
  const [plateTectonics, setPlateTectonics] = useState(0.5)
  const [soilType, setSoilType] = useState<"rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy">(
    "rocky",
  );
  const [biomassLevel, setBiomassLevel] = useState(0.0)
  const [waterLevel, setWaterLevel] = useState(0.3)
  const [salinity, setSalinity] = useState(0.5)
  const [subsurfaceWater, setSubsurfaceWater] = useState(0.2)
  const [atmosphericDensity, setAtmosphericDensity] = useState(0.5)
  const [weatherVariability, setWeatherVariability] = useState(0.5)
  const [stormFrequency, setStormFrequency] = useState(0.2)
  const [volcanicActivity, setVolcanicActivity] = useState(0.2)
  const [biome, setBiome] = useState("Rocky Highlands")
  const [cloudTypes, setCloudTypes] = useState<string[]>(["Cumulus"])
  const [cloudDensity, setCloudDensity] = useState(0.5)
  const [atmosphereVisibility, setAtmosphereVisibility] = useState(1)
  const [atmosphereHeight, setAtmosphereHeight] = useState(1)

  const stats = calculatePlanetStats(
    mass,
    radius,
    temperature,
    orbitalPeriod,
    typeOverride,
    atmosphereStrength,
    cloudCount,
    waterHeight,
    surfaceRoughness,
    undefined,
    biomeFactor,
    cloudContribution,
    terrainVariation,
    terrainErosion,
    plateTectonics,
    // soilType,
    biomassLevel,
    waterLevel,
    salinity,
    subsurfaceWater,
    atmosphericDensity,
    weatherVariability,
    stormFrequency,
    volcanicActivity,
    biome,
    // cloudTypes,
    // cloudDensity,
    // atmosphereVisibility,
    // atmosphereHeight,
  )

  const terrainHeight = calculateTerrainHeight(stats);

  const handleImport = (importedStats: Partial<PlanetStats>) => {
    if (importedStats.mass !== undefined) setMass(importedStats.mass)
    if (importedStats.radius !== undefined) setRadius(importedStats.radius)
    if (importedStats.temperature !== undefined) setTemperature(importedStats.temperature)
    if (importedStats.orbitalPeriod !== undefined) setOrbitalPeriod(importedStats.orbitalPeriod)
    if (importedStats.atmosphereStrength !== undefined) setAtmosphereStrength(importedStats.atmosphereStrength)
    if (importedStats.cloudCount !== undefined) setCloudCount(importedStats.cloudCount)
    if (importedStats.waterHeight !== undefined) setWaterHeight(importedStats.waterHeight)
    if (importedStats.surfaceRoughness !== undefined) setSurfaceRoughness(importedStats.surfaceRoughness)
    if (importedStats.biomeFactor !== undefined) setBiomeFactor(importedStats.biomeFactor)
    if (importedStats.cloudContribution !== undefined) setCloudContribution(importedStats.cloudContribution)
    if (importedStats.terrainVariation !== undefined) setTerrainVariation(importedStats.terrainVariation)
    if (importedStats.terrainErosion !== undefined) setTerrainErosion(importedStats.terrainErosion)
    if (importedStats.plateTectonics !== undefined) setPlateTectonics(importedStats.plateTectonics)
    // if (importedStats.soilType !== undefined) setSoilType(importedStats.soilType)
    if (importedStats.biomassLevel !== undefined) setBiomassLevel(importedStats.biomassLevel)
    if (importedStats.waterLevel !== undefined) setWaterLevel(importedStats.waterLevel)
    if (importedStats.salinity !== undefined) setSalinity(importedStats.salinity)
    if (importedStats.subsurfaceWater !== undefined) setSubsurfaceWater(importedStats.subsurfaceWater)
    if (importedStats.atmosphericDensity !== undefined) setAtmosphericDensity(importedStats.atmosphericDensity)
    if (importedStats.weatherVariability !== undefined) setWeatherVariability(importedStats.weatherVariability)
    if (importedStats.stormFrequency !== undefined) setStormFrequency(importedStats.stormFrequency)
    if (importedStats.volcanicActivity !== undefined) setVolcanicActivity(importedStats.volcanicActivity)
    if (importedStats.biome !== undefined) setBiome(importedStats.biome)
    // if (importedStats.cloudTypes !== undefined) setCloudTypes(importedStats.cloudTypes)
    // if (importedStats.cloudDensity !== undefined) setCloudDensity(importedStats.cloudDensity)
    // if (importedStats.atmosphereVisibility !== undefined) setAtmosphereVisibility(importedStats.atmosphereVisibility)
    // if (importedStats.atmosphereHeight !== undefined) setAtmosphereHeight(importedStats.atmosphereHeight)
    setTypeOverride(null)
  }

  return (
    <div className="rounded-lg overflow-hidden bg-[#1E1E1E] border border-[#2A2A2A]">
      <div className="h-[400px] relative">
        <PlanetScene terrainHeight={terrainHeight} stats={stats} classificationId={""} author={""} />
      </div>
      <div className="p-6 space-y-6 max-h-[200px] overflow-visible">
        <FullPlanetControls
          stats={stats}
          onMassChange={setMass}
          onRadiusChange={setRadius}
          onTemperatureChange={setTemperature}
          onOrbitalPeriodChange={setOrbitalPeriod}
          onTypeOverride={setTypeOverride}
          onAtmosphereStrengthChange={setAtmosphereStrength}
          onCloudCountChange={setCloudCount}
          onWaterHeightChange={setWaterHeight}
          onSurfaceRoughnessChange={setSurfaceRoughness}
          onBiomeFactorChange={setBiomeFactor}
          onCloudContributionChange={setCloudContribution}
          onTerrainVariationChange={setTerrainVariation}
          onTerrainErosionChange={setTerrainErosion}
          onPlateTectonicsChange={setPlateTectonics}
          // onSoilTypeChange={setSoilType}
          onBiomassLevelChange={setBiomassLevel}
          onWaterLevelChange={setWaterLevel}
          onSalinityChange={setSalinity}
          onSubsurfaceWaterChange={setSubsurfaceWater}
          onAtmosphericDensityChange={setAtmosphericDensity}
          onWeatherVariabilityChange={setWeatherVariability}
          onStormFrequencyChange={setStormFrequency}
          onVolcanicActivityChange={setVolcanicActivity}
          onBiomeChange={setBiome}
          onCloudTypesChange={setCloudTypes}
          onCloudDensityChange={setCloudDensity}
          onAtmosphereVisibilityChange={setAtmosphereVisibility}
          onAtmosphereHeightChange={setAtmosphereHeight}
          showExtendedControls={mass >= LOW_MASS_THRESHOLD}
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#FF4B39] border-[#FF4B39]"
            >
              Import/Export
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#1E1E1E] text-white">
            <DialogHeader>
              <DialogTitle className="text-[#FF4B39]">Import/Export Planet Settings</DialogTitle>
            </DialogHeader>
            <FullPlanetImportExport stats={stats} onImport={handleImport} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};