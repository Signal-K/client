"use client";

import { useState } from "react";
import { PlanetScene } from "./planet-scene";
import { FullPlanetControls } from "./full-planet-controls";
import { FullPlanetImportExport } from "./full-planet-import-export";
import { calculatePlanetStats, calculateTerrainHeight } from "@/utils/planet-physics";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { PlanetStats } from "@/utils/planet-physics";

export default function AdvancedPlanetGenerator() {
  const [mass, setMass] = useState(1);
  const [radius, setRadius] = useState(1);
  const [temperature, setTemperature] = useState(288);
  const [orbitalPeriod, setOrbitalPeriod] = useState(365);
  const [typeOverride, setTypeOverride] = useState<"terrestrial" | "gaseous" | null>(null);
  const [atmosphereStrength, setAtmosphereStrength] = useState(0.5);
  const [cloudCount, setCloudCount] = useState(50);
  const [waterHeight, setWaterHeight] = useState(0.5);
  const [surfaceRoughness, setSurfaceRoughness] = useState(0.5);
  const [biomeFactor, setBiomeFactor] = useState(1.0);
  const [cloudContribution, setCloudContribution] = useState(1.0);
  const [terrainVariation, setTerrainVariation] = useState<"flat" | "moderate" | "chaotic">("moderate");
  const [terrainErosion, setTerrainErosion] = useState(0.5);
  const [plateTectonics, setPlateTectonics] = useState(0.5);
  const [soilType, setSoilType] = useState<"rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy">(
    "rocky",
  )
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
  )

  const terrainHeight = calculateTerrainHeight(stats)

  const handleBiomeChange = (newBiome: string) => {
    setBiome(newBiome)
    // The parameters will be adjusted by the useEffect in FullPlanetControls
  }

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
    setTypeOverride(null)
  }

  const randomizePlanet = () => {
    // Generate random values within appropriate ranges
    const randomBiomes = Object.keys(require("@/utils/biome-data").biomeData)
    const newBiome = randomBiomes[Math.floor(Math.random() * randomBiomes.length)]
    setBiome(newBiome)

    // Set random values for basic properties
    setMass(Math.random() * 9.9 + 0.1) // 0.1 to 10
    setRadius(Math.random() * 2.9 + 0.1) // 0.1 to 3

    // Other parameters will be adjusted by the biome constraints in useEffect
    setTimeout(() => {
      // Add some randomness within the biome constraints
      const biomeRanges = require("@/utils/biome-data").biomeData[newBiome]

      // Helper function to get random value in range
      const randomInRange = (range: [number, number]) => {
        return Math.random() * (range[1] - range[0]) + range[0]
      }

      setTemperature(randomInRange(biomeRanges.temperature))
      setAtmosphereStrength(randomInRange(biomeRanges.atmosphereStrength))
      setCloudCount(randomInRange(biomeRanges.cloudCount))
      setWaterHeight(randomInRange(biomeRanges.waterHeight))
      setSurfaceRoughness(randomInRange(biomeRanges.surfaceRoughness))
      setPlateTectonics(randomInRange(biomeRanges.plateTectonics))
      setBiomassLevel(randomInRange(biomeRanges.biomassLevel))
      setWaterLevel(randomInRange(biomeRanges.waterLevel))
      setSalinity(randomInRange(biomeRanges.salinity))
      setVolcanicActivity(randomInRange(biomeRanges.volcanicActivity))

      // Randomize other parameters
      setTerrainVariation(
        ["flat", "moderate", "chaotic"][Math.floor(Math.random() * 3)] as "flat" | "moderate" | "chaotic",
      )
      setTerrainErosion(Math.random())

      // const soilTypes = ["rocky", "sandy", "volcanic", "organic", "dusty", "frozen", "muddy"]
      // setSoilType(soilTypes[Math.floor(Math.random() * soilTypes.length)] as any)

      setSubsurfaceWater(Math.random())
      setAtmosphericDensity(Math.random())
      setWeatherVariability(Math.random())
      setStormFrequency(Math.random())

      // Randomize cloud types
      const allCloudTypes = ["Cumulus", "Stratus", "Cirrus", "Cumulonimbus"]
      const numCloudTypes = Math.floor(Math.random() * 4) + 1 // At least one cloud type
      const shuffledCloudTypes = [...allCloudTypes].sort(() => 0.5 - Math.random())
      setCloudTypes(shuffledCloudTypes.slice(0, numCloudTypes))
      setCloudDensity(Math.random())
    }, 100) // Small delay to ensure biome is set first
  }

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <Card className="w-full max-w-7xl mx-auto bg-black/60 text-white border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-[#FF4B39]">Advanced Planet Generator</CardTitle>
            <CardDescription className="text-gray-400">
              Create complex procedural planets with detailed environmental parameters
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#FF4B39] border-[#FF4B39]"
              onClick={randomizePlanet}
            >
              Randomize
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#FF4B39] border-[#FF4B39]">
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
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Planet Visualization */}
            <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-800 bg-[#1E1E1E]">
              <PlanetScene stats={stats} />
            </div>

            {/* Controls Panel */}
            <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#FF4B39] mb-4">Planet Controls</h2>
              <ScrollArea className="h-[550px] pr-4">
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
                  onBiomeChange={handleBiomeChange}
                  onCloudTypesChange={setCloudTypes}
                  onCloudDensityChange={setCloudDensity}
                  onAtmosphereVisibilityChange={setAtmosphereVisibility}
                  onAtmosphereHeightChange={setAtmosphereHeight}
                  showExtendedControls={true}
                />
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};