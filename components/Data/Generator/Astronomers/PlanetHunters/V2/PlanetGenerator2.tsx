"use client"

import { useState } from "react"
import { PlanetScene } from "./planet-scene"
import { PlanetControls } from "./planet-controls"
import { PlanetImportExport } from "./planet-import-export"
import { calculatePlanetStats } from "@/utils/planet-physics"
import type { PlanetStats } from "@/utils/planet-physics"
import { AtmosphereControls } from "./AtmosphereControls"

const TERRESTRIAL_THRESHOLD = 7.5 // Earth masses
const GASEOUS_THRESHOLD = 2.0 // Earth radii

export default function PlanetGenerator2() {
  const [mass, setMass] = useState(1)
  const [radius, setRadius] = useState(1)
  const [temperature, setTemperature] = useState(288) // Earth average temperature in Kelvin
  const [orbitalPeriod, setOrbitalPeriod] = useState(365)
  const [typeOverride, setTypeOverride] = useState<"terrestrial" | "gaseous" | null>(null)
  const [atmosphereOpacity, setAtmosphereOpacity] = useState(0.3)
  const [showAtmosphere, setShowAtmosphere] = useState(true)
  const [showLiquid, setShowLiquid] = useState(true)
  const [atmosphereOffset, setAtmosphereOffset] = useState(0.01)
  const [splitMeshes, setSplitMeshes] = useState(false)
  const [storms, setStorms] = useState(0)

  const stats = calculatePlanetStats(mass, radius, temperature, orbitalPeriod, typeOverride)

  const handleMassChange = (newMass: number) => {
    if (typeOverride === "terrestrial" && newMass > TERRESTRIAL_THRESHOLD) {
      setMass(TERRESTRIAL_THRESHOLD)
    } else if (typeOverride === "gaseous" && newMass <= TERRESTRIAL_THRESHOLD) {
      setMass(TERRESTRIAL_THRESHOLD + 0.1)
    } else {
      setMass(newMass)
    }
  }

  const handleRadiusChange = (newRadius: number) => {
    if (typeOverride === "terrestrial" && newRadius > GASEOUS_THRESHOLD) {
      setRadius(GASEOUS_THRESHOLD)
    } else if (typeOverride === "gaseous" && newRadius <= GASEOUS_THRESHOLD) {
      setRadius(GASEOUS_THRESHOLD + 0.1)
    } else {
      setRadius(newRadius)
    }
  }

  const handleTypeOverride = (type: "terrestrial" | "gaseous" | null) => {
    setTypeOverride(type)
    if (type === "terrestrial") {
      if (mass > TERRESTRIAL_THRESHOLD) setMass(TERRESTRIAL_THRESHOLD)
      if (radius > GASEOUS_THRESHOLD) setRadius(GASEOUS_THRESHOLD)
    } else if (type === "gaseous") {
      if (mass <= TERRESTRIAL_THRESHOLD) setMass(TERRESTRIAL_THRESHOLD + 0.1)
      if (radius <= GASEOUS_THRESHOLD) setRadius(GASEOUS_THRESHOLD + 0.1)
    }
  }

  const handleImport = (importedStats: Partial<PlanetStats>) => {
    if (importedStats.mass !== undefined) {
      setMass(importedStats.mass)
    }
    if (importedStats.radius !== undefined) {
      setRadius(importedStats.radius)
    }
    if (importedStats.temperature !== undefined) {
      setTemperature(importedStats.temperature)
    }
    if (importedStats.orbitalPeriod !== undefined) {
      setOrbitalPeriod(importedStats.orbitalPeriod)
    }
    setTypeOverride(null)
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Procedural Planet Generator</h1>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <PlanetScene
            stats={stats}
            atmosphereOpacity={atmosphereOpacity}
            showAtmosphere={showAtmosphere}
            showLiquid={showLiquid}
            atmosphereOffset={atmosphereOffset}
            splitMeshes={splitMeshes}
            storms={storms}
          />
          <div className="space-y-8">
            <PlanetControls
              stats={stats}
              showLiquid={showLiquid}
              onMassChange={handleMassChange}
              onRadiusChange={handleRadiusChange}
              onTemperatureChange={setTemperature}
              onOrbitalPeriodChange={setOrbitalPeriod}
              onTypeOverride={handleTypeOverride}
              onShowLiquidChange={setShowLiquid}
            />
            <AtmosphereControls
              atmosphereOpacity={atmosphereOpacity}
              showAtmosphere={showAtmosphere}
              atmosphereOffset={atmosphereOffset}
              splitMeshes={splitMeshes}
              storms={storms}
              onAtmosphereOpacityChange={setAtmosphereOpacity}
              onShowAtmosphereChange={setShowAtmosphere}
              onAtmosphereOffsetChange={setAtmosphereOffset}
              onSplitMeshesChange={setSplitMeshes}
              onStormsChange={setStorms}
            />
            <PlanetImportExport stats={stats} onImport={handleImport} />
          </div>
        </div>
      </div>
    </div>
  )
};