"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea";
import type { PlanetStats } from "@/utils/planet-physics";

interface FullPlanetImportExportProps {
  stats: PlanetStats
  onImport: (importedStats: Partial<PlanetStats>) => void
}

// Type guard to check if a string is a valid key of PlanetStats
function isPlanetStatsKey(key: string): key is keyof PlanetStats {
  return key in ({} as PlanetStats)
}

export function FullPlanetImportExport({ stats, onImport }: FullPlanetImportExportProps) {
  const [importExportText, setImportExportText] = useState("")

  const handleExport = () => {
    const exportText = Object.entries(stats)
      .map(([key, value]) => `${key}: ${typeof value === "number" ? value.toFixed(2) : JSON.stringify(value)}`)
      .join("\n")
    setImportExportText(exportText)
  }

  const handleImport = () => {
    const lines = importExportText.split("\n")
    const importedStats: Partial<PlanetStats> = {}

    lines.forEach((line) => {
      const [key, value] = line.split(":").map((part) => part.trim())

      if (key && value && isPlanetStatsKey(key)) {
        try {
          // Handle different types of values
          if (key === "type") {
            const typeValue = value.replace(/"/g, "") as "terrestrial" | "gaseous"
            if (typeValue === "terrestrial" || typeValue === "gaseous") {
              importedStats.type = typeValue
            }
          } else if (key === "biome") {
            importedStats.biome = value.replace(/"/g, "")
          } else if (key === "cloudTypes") {
            try {
              const cloudTypes = JSON.parse(value)
              if (Array.isArray(cloudTypes)) {
                importedStats.cloudTypes = cloudTypes
              }
            } catch (e) {
              console.warn(`Failed to parse cloud types: ${value}`)
            }
          } else if (key === "soilType") {
            const soilValue = value.replace(/"/g, "") as PlanetStats["soilType"]
            if (["rocky", "sandy", "volcanic", "organic", "dusty", "frozen", "muddy"].includes(soilValue ?? 'sandy')) {
              importedStats.soilType = soilValue
            }
          } else if (key === "terrainVariation") {
            const terrainValue = value.replace(/"/g, "") as PlanetStats["terrainVariation"]
            if (["flat", "moderate", "chaotic"].includes(terrainValue ?? 'flat')) {
              importedStats.terrainVariation = terrainValue
            }
          } else {
            // Handle numeric values
            const numValue = Number.parseFloat(value)
            if (!isNaN(numValue)) {
              importedStats[key] = numValue
            }
          }
        } catch (e) {
          console.warn(`Failed to parse value for ${key}: ${value}`)
        }
      }
    })

    if (Object.keys(importedStats).length > 0) {
      // Ensure minimum required inputs are present
      if (!importedStats.mass) importedStats.mass = 1
      if (!importedStats.radius) importedStats.radius = 1
      if (!importedStats.biome) importedStats.biome = "Rocky Highlands"

      onImport(importedStats)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={importExportText}
        onChange={(e) => setImportExportText(e.target.value)}
        placeholder="Paste settings here to import, or click Export to get current settings"
        rows={12}
        className="font-mono text-white bg-[#2A2A2A] border-[#3A3A3A]"
      />
      <div className="flex justify-between gap-4">
        <Button onClick={handleExport} className="flex-1 bg-[#FF4B39] hover:bg-[#FF4B39]/90 text-white">
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