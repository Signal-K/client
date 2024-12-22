'use client'

import { useState } from 'react'
import { PlanetScene } from './planet-scene'
import { PlanetControls } from './planet-controls'
import { PlanetImportExport } from './planet-import-export'
import { calculatePlanetStats } from '@/utils/planet-physics'
import type { PlanetStats } from '@/utils/planet-physics'

const TERRESTRIAL_THRESHOLD = 7.5 // Earth masses
const GASEOUS_THRESHOLD = 2.0 // Earth radii

export default function PlanetGenerator() {
  const [mass, setMass] = useState(1)
  const [radius, setRadius] = useState(1)
  const [typeOverride, setTypeOverride] = useState<'terrestrial' | 'gaseous' | null>(null)

  const stats = calculatePlanetStats(mass, radius, typeOverride)

  const handleMassChange = (newMass: number) => {
    if (typeOverride === 'terrestrial' && newMass > TERRESTRIAL_THRESHOLD) {
      setMass(TERRESTRIAL_THRESHOLD)
    } else if (typeOverride === 'gaseous' && newMass <= TERRESTRIAL_THRESHOLD) {
      setMass(TERRESTRIAL_THRESHOLD + 0.1)
    } else {
      setMass(newMass)
    }
  }

  const handleRadiusChange = (newRadius: number) => {
    if (typeOverride === 'terrestrial' && newRadius > GASEOUS_THRESHOLD) {
      setRadius(GASEOUS_THRESHOLD)
    } else if (typeOverride === 'gaseous' && newRadius <= GASEOUS_THRESHOLD) {
      setRadius(GASEOUS_THRESHOLD + 0.1)
    } else {
      setRadius(newRadius)
    }
  }

  const handleTypeOverride = (type: 'terrestrial' | 'gaseous' | null) => {
    setTypeOverride(type)
    if (type === 'terrestrial') {
      if (mass > TERRESTRIAL_THRESHOLD) setMass(TERRESTRIAL_THRESHOLD)
      if (radius > GASEOUS_THRESHOLD) setRadius(GASEOUS_THRESHOLD)
    } else if (type === 'gaseous') {
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
    setTypeOverride(null)
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Procedural Planet Generator</h1>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <PlanetScene stats={stats} />
          <div className="space-y-8">
            <PlanetControls
              stats={stats}
              onMassChange={handleMassChange}
              onRadiusChange={handleRadiusChange}
              onTypeOverride={handleTypeOverride}
            />
            <PlanetImportExport stats={stats} onImport={handleImport} />
          </div>
        </div>
      </div>
    </div>
  );
};