"\"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { PlanetStats } from "@/utils/planet-physics"

interface FullPlanetImportExportProps {
  stats: PlanetStats
  onImport: (importedStats: Partial<PlanetStats>) => void
}

export function FullPlanetImportExport({ stats, onImport }: FullPlanetImportExportProps) {
  const [importExportText, setImportExportText] = useState("")

  const handleExport = () => {
    const exportText = `mass: ${stats.mass.toFixed(2)}
radius: ${stats.radius.toFixed(2)}
temperature: ${stats.temperature?.toFixed(2) ?? "N/A"}
orbitalPeriod: ${stats.orbitalPeriod?.toFixed(2) ?? "N/A"}
atmosphereStrength: ${stats.atmosphereStrength?.toFixed(2) ?? "N/A"}
cloudCount: ${stats.cloudCount ?? "N/A"}
waterHeight: ${stats.waterHeight?.toFixed(2) ?? "N/A"}
surfaceRoughness: ${stats.surfaceRoughness?.toFixed(2) ?? "N/A"}
biomeFactor: ${stats.biomeFactor?.toFixed(2) ?? "N/A"}
cloudContribution: ${stats.cloudContribution?.toFixed(2) ?? "N/A"}
terrainVariation: ${stats.terrainVariation ?? "N/A"}
terrainErosion: ${stats.terrainErosion?.toFixed(2) ?? "N/A"}
plateTectonics: ${stats.plateTectonics?.toFixed(2) ?? "N/A"}
soilType: ${stats.soilType ?? "N/A"}
biomassLevel: ${stats.biomassLevel?.toFixed(2) ?? "N/A"}
waterLevel: ${stats.waterLevel?.toFixed(2) ?? "N/A"}
salinity: ${stats.salinity?.toFixed(2) ?? "N/A"}
subsurfaceWater: ${stats.subsurfaceWater?.toFixed(2) ?? "N/A"}
atmosphericDensity: ${stats.atmosphericDensity?.toFixed(2) ?? "N/A"}
weatherVariability: ${stats.weatherVariability?.toFixed(2) ?? "N/A"}
stormFrequency: ${stats.stormFrequency?.toFixed(2) ?? "N/A"}
volcanicActivity: ${stats.volcanicActivity?.toFixed(2) ?? "N/A"}
biome: ${stats.biome ?? "N/A"}
cloudTypes: ${JSON.stringify(stats.cloudTypes) ?? "N/A"}
cloudDensity: ${stats.cloudDensity?.toFixed(2) ?? "N/A"}`
    setImportExportText(exportText)
  }

  const handleImport = () => {
    const lines = importExportText.split("\n")
    const importedStats: Partial<PlanetStats> = {}

    lines.forEach((line) => {
      const [key, value] = line.split(":").map((part) => part.trim())
      if (value !== "N/A") {
        if (
          [
            "mass",
            "radius",
            "temperature",
            "orbitalPeriod",
            "atmosphereStrength",
            "cloudCount",
            "waterHeight",
            "surfaceRoughness",
            "biomeFactor",
            "cloudContribution",
            "terrainErosion",
            "plateTectonics",
            "biomassLevel",
            "waterLevel",
            "salinity",
            "subsurfaceWater",
            "atmosphericDensity",
            "weatherVariability",
            "stormFrequency",
            "volcanicActivity",
            "cloudDensity",
          ].includes(key)
        ) {
          const parsedValue = Number.parseFloat(value)
          if (!isNaN(parsedValue)) {
            ;(importedStats as any)[key] = parsedValue
          }
        } else if (key === "terrainVariation") {
          if (value === "flat" || value === "moderate" || value === "chaotic") {
            ;(importedStats as any)[key] = value
          }
        } else if (key === "soilType") {
          if (["rocky", "sandy", "volcanic", "organic", "dusty", "frozen", "muddy"].includes(value)) {
            ;(importedStats as any)[key] = value
          }
        } else if (key === "biome") {
          ;(importedStats as any)[key] = value
        } else if (key === "cloudTypes") {
          try {
            const parsedValue = JSON.parse(value)
            if (Array.isArray(parsedValue)) {
              ;(importedStats as any)[key] = parsedValue
            }
          } catch (e) {
            console.error("Failed to parse cloudTypes", e)
          }
        }
      }
    })

    if (Object.keys(importedStats).length > 0) {
      onImport(importedStats)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={importExportText}
        onChange={(e) => setImportExportText(e.target.value)}
        placeholder="Paste settings here to import, or click Export to get current settings"
        rows={8}
        className="font-mono text-white bg-[#2A2A2A] border-[#3A3A3A]"
      />
      <div className="flex justify-between gap-4">
        <Button onClick={handleExport} className="flex-1 bg-[#FF4B39] hover:bg-[#D64031] text-white">
          Export
        </Button>
        <Button
          onClick={handleImport}
          variant="outline"
          className="flex-1 border-[#FF4B39] text-[#FF4B39] hover:bg-[#FF4B39] hover:text-white"
        >
          Import
        </Button>
      </div>
    </div>
  );
};