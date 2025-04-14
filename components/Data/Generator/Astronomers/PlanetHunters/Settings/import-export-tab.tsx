"use client";

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Download, Upload, Copy } from "lucide-react"
import { type PlanetStats, mergeWithDefaults } from "@/lib/planet-physics"

interface ImportExportTabProps {
  planetStats: PlanetStats
  setPlanetStats: (stats: PlanetStats) => void
  classificationId: string
  author: string
  setSelectedBiome: (biome: string) => void
  setCustomColors: (colors: {
    oceanFloor: string
    beach: string
    regular: string
    mountain: string
  }) => void
}

export function ImportExportTab({
  planetStats,
  setPlanetStats,
  classificationId,
  author,
  setSelectedBiome,
  setCustomColors,
}: ImportExportTabProps) {
  const [importExportText, setImportExportText] = useState("")

  // Update the exportPlanetConfig function to ensure all landmark data is included
  const exportPlanetConfig = () => {
    // Create a metadata object with classification info
    const metadata = {
      classificationId,
      author,
      type: planetStats.type || "Unknown",
      biome: planetStats.biome || "Unknown",
      exportDate: new Date().toISOString(),
    }

    // Start with metadata
    let config = `// Planet Configuration Export\n`
    config += `// Classification: ${metadata.classificationId}\n`
    config += `// Author: ${metadata.author}\n`
    config += `// Export Date: ${metadata.exportDate}\n\n`

    // Add planet stats
    Object.entries(planetStats).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "customColors" && value && Object.keys(value).length > 0) {
          config += `${key}: ${JSON.stringify(value)}\n`
        } else if (key === "landmarks" && Array.isArray(value) && value.length > 0) {
          // Ensure complete landmark data is exported
          const landmarksJson = JSON.stringify(value, null, 2)
            .split("\n")
            .map((line, i) => (i === 0 ? line : "  " + line))
            .join("\n")
          config += `${key}: ${landmarksJson}\n`
        } else if (typeof value === "number") {
          config += `${key}: ${value.toFixed(2)}\n`
        } else if (typeof value === "boolean") {
          config += `${key}: ${value ? "true" : "false"}\n`
        } else if (typeof value === "object" && key !== "customColors" && key !== "landmarks") {
          config += `${key}: ${JSON.stringify(value)}\n`
        } else if (typeof value !== "object") {
          config += `${key}: ${value}\n`
        }
      }
    })
    setImportExportText(config)
  }

  // Import planet configuration
  const importPlanetConfig = () => {
    try {
      // Filter out comment lines
      const lines = importExportText.split("\n").filter((line) => !line.trim().startsWith("//") && line.trim() !== "")
      const newConfig: Partial<PlanetStats> = {}

      lines.forEach((line) => {
        if (!line.trim()) return
        const colonIndex = line.indexOf(":")
        if (colonIndex === -1) return

        const key = line.substring(0, colonIndex).trim()
        const valueStr = line.substring(colonIndex + 1).trim()
        let value: any

        if (valueStr === "true" || valueStr === "false") value = valueStr === "true"
        else if (valueStr.startsWith("[") || valueStr.startsWith("{")) {
          try {
            value = JSON.parse(valueStr)
          } catch {
            value = valueStr
          }
        } else if (!isNaN(Number(valueStr))) value = Number(valueStr)
        else value = valueStr

        newConfig[key as keyof PlanetStats] = value
      })

      // Merge with defaults and update
      const completeStats = mergeWithDefaults(newConfig)
      setPlanetStats(completeStats)

      // Update UI state
      if (completeStats.biome) setSelectedBiome(completeStats.biome)
      if (completeStats.customColors) setCustomColors(completeStats.customColors as any)
    } catch (error) {
      console.error("Error importing planet configuration:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 border-green-500/30 text-green-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wide">DATA TRANSFER</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-green-300">Planet Configuration</Label>
            <Textarea
              value={importExportText}
              onChange={(e) => setImportExportText(e.target.value)}
              className="h-64 font-mono text-xs bg-black border-green-500/30 text-green-400"
              placeholder="Export or paste planet configuration here..."
            />
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-green-500/30 text-green-400 hover:bg-green-900/20"
              onClick={exportPlanetConfig}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-green-500/30 text-green-400 hover:bg-green-900/20"
              onClick={importPlanetConfig}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-green-500/30 text-green-400 hover:bg-green-900/20"
              onClick={() => navigator.clipboard.writeText(importExportText)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-green-500/70 mt-2">
            You can import partial configurations (e.g., just mass and radius). Missing values will be filled with
            defaults.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};