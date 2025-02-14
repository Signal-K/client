"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { PlanetStats } from "@/utils/planet-physics"

interface SimplePlanetImportExportProps {
  stats: PlanetStats
  onImport: (importedStats: Partial<PlanetStats>) => void
}

export function SimplePlanetImportExport({ stats, onImport }: SimplePlanetImportExportProps) {
  const [importExportText, setImportExportText] = useState("")

  const handleExport = () => {
    const exportText = `mass: ${stats.mass.toFixed(2)}
radius: ${stats.radius.toFixed(2)}
density: ${stats.density.toFixed(2)}`
    setImportExportText(exportText)
  }

  const handleImport = () => {
    const lines = importExportText.split("\n")
    const importedStats: Partial<PlanetStats> = {}

    lines.forEach((line) => {
      const [key, value] = line.split(":").map((part) => part.trim())
      if (["mass", "radius"].includes(key)) {
        // importedStats[key as keyof PlanetStats] = Number.parseFloat(value)
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
        rows={6}
        className="font-mono text-white bg-[#2A2A2A] border-[#3A3A3A]"
      />
      <div className="flex justify-between gap-4">
        <Button onClick={handleExport} className="flex-1 bg-[#2A9D8F] hover:bg-[#238579] text-white">
          Export
        </Button>
        <Button
          onClick={handleImport}
          variant="outline"
          className="flex-1 border-[#2A9D8F] text-[#2A9D8F] hover:bg-[#2A9D8F] hover:text-white"
        >
          Import
        </Button>
      </div>
    </div>
  )
}

