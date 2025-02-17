"use client"

import { useState } from "react"
import { PlanetScene } from "./planet-scene"
import { FullPlanetControls } from "./full-planet-controls"
import { FullPlanetImportExport } from "./full-planet-import-export"
import { calculatePlanetStats } from "@/utils/planet-physics"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { PlanetStats } from "@/utils/planet-physics"

const LOW_MASS_THRESHOLD = 0.2

export function FullPlanetGenerator() {
  const [mass, setMass] = useState(1)
  const [radius, setRadius] = useState(1)
  const [temperature, setTemperature] = useState(288)
  const [orbitalPeriod, setOrbitalPeriod] = useState(365)
  const [typeOverride, setTypeOverride] = useState<"terrestrial" | "gaseous" | null>(null)
  const [atmosphereStrength, setAtmosphereStrength] = useState(0.5)
  const [cloudCount, setCloudCount] = useState(50)
  const [waterLevel, setWaterLevel] = useState(0.5)
  const [surfaceRoughness, setSurfaceRoughness] = useState(0.5)

  const stats = calculatePlanetStats(
    mass,
    radius,
    temperature,
    orbitalPeriod,
    typeOverride,
    atmosphereStrength,
    cloudCount,
    waterLevel,
    surfaceRoughness,
  )

  const handleImport = (importedStats: Partial<PlanetStats>) => {
    if (importedStats.mass !== undefined) setMass(importedStats.mass)
    if (importedStats.radius !== undefined) setRadius(importedStats.radius)
    if (importedStats.temperature !== undefined) setTemperature(importedStats.temperature)
    if (importedStats.orbitalPeriod !== undefined) setOrbitalPeriod(importedStats.orbitalPeriod)
    if (importedStats.atmosphereStrength !== undefined) setAtmosphereStrength(importedStats.atmosphereStrength)
    if (importedStats.cloudCount !== undefined) setCloudCount(importedStats.cloudCount)
    if (importedStats.waterLevel !== undefined) setWaterLevel(importedStats.waterLevel)
    if (importedStats.surfaceRoughness !== undefined) setSurfaceRoughness(importedStats.surfaceRoughness)
    setTypeOverride(null)
  }

  return (
    <div className="rounded-lg overflow-hidden bg-[#1E1E1E] border border-[#2A2A2A]">
      <div className="h-[400px] relative">
        <PlanetScene stats={stats} />
      </div>
      <div className="p-6 space-y-6">
        <FullPlanetControls
          stats={stats}
          onMassChange={setMass}
          onRadiusChange={setRadius}
          onTemperatureChange={setTemperature}
          onOrbitalPeriodChange={setOrbitalPeriod}
          onTypeOverride={setTypeOverride}
          onAtmosphereStrengthChange={setAtmosphereStrength}
          onCloudCountChange={setCloudCount}
          onWaterLevelChange={setWaterLevel}
          onSurfaceRoughnessChange={setSurfaceRoughness}
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
  )
}

