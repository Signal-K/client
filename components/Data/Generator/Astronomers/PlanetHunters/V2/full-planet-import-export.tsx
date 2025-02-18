"use client"

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
waterLevel: ${stats.waterLevel?.toFixed(2) ?? "N/A"}
density: ${stats.density?.toFixed(2) ?? "N/A"}`
    setImportExportText(exportText)
  }

  const handleImport = () => {
    const lines = importExportText.split("\n")
    const importedStats: Partial<PlanetStats> = {}

    lines.forEach((line) => {
      const [key, value] = line.split(":").map((part) => part.trim())
      if (
        value !== "N/A" &&
        ["mass", "radius", "temperature", "orbitalPeriod", "atmosphereStrength", "cloudCount", "waterLevel"].includes(
          key,
        )
      ) {
        const parsedValue = Number.parseFloat(value)
        if (!isNaN(parsedValue)) {
          ;(importedStats as any)[key] = parsedValue
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
  )
}

