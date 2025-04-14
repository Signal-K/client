"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Palette } from "lucide-react"
import type { PlanetStats } from "@/lib/planet-physics"
import { BiomeRanges, getAllBiomes, getParameterRange } from "@/lib/biome-data"

interface BiomeTabProps {
  planetStats: PlanetStats
  setPlanetStats: (stats: PlanetStats) => void
  selectedBiome: string
  setSelectedBiome: (biome: string) => void
  customColors: {
    oceanFloor: string
    beach: string
    regular: string
    mountain: string
  }
  setCustomColors: (colors: {
    oceanFloor: string
    beach: string
    regular: string
    mountain: string
  }) => void
}

export function BiomeTab({
  planetStats,
  setPlanetStats,
  selectedBiome,
  setSelectedBiome,
  customColors,
  setCustomColors,
}: BiomeTabProps) {
  const allBiomes = getAllBiomes()

  // Update a single stat
  const updateStat = (key: keyof PlanetStats, value: any) => {
    setPlanetStats({
      ...planetStats,
      [key]: value,
    })
  }

  // Update custom colors
  const updateCustomColor = (type: string, color: string) => {
    const newCustomColors = { ...customColors, [type]: color }
    setCustomColors(newCustomColors)
    setPlanetStats({ ...planetStats, customColors: newCustomColors })
  }

  // Get parameter range for the current biome
  const getRange = (parameter: keyof BiomeRanges): [number, number] => {
    return getParameterRange(selectedBiome, parameter)
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 border-green-500/30 text-green-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wide">BIOME SELECTION</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-green-300">Biome Type</Label>
            <Select value={selectedBiome} onValueChange={setSelectedBiome}>
              <SelectTrigger className="bg-black border-green-500/30 text-green-400">
                <SelectValue placeholder="Select biome" />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-500/30 text-green-400">
                {allBiomes.map((biome) => (
                  <SelectItem key={biome} value={biome}>
                    {biome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-green-500/70">
              Selecting a biome will adjust parameters to fit within biome ranges
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/60 border-green-500/30 text-green-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wide">COLOR CUSTOMIZATION</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-green-300">Custom Colors</Label>
              <Palette className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-xs text-green-500/70 mb-2">Customize terrain colors for each height level</p>

            <div className="grid grid-cols-2 gap-3">
              {["oceanFloor", "beach", "regular", "mountain"].map((type) => (
                <React.Fragment key={type}>
                  <Label className="text-xs text-green-300">
                    {type.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </Label>
                  <Input
                    type="color"
                    value={customColors[type as keyof typeof customColors] || "#5D4037"}
                    onChange={(e) => updateCustomColor(type, e.target.value)}
                    className="h-8 p-1 bg-black border-green-500/30"
                  />
                </React.Fragment>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full border-green-500/30 text-green-400 hover:bg-green-900/20"
              onClick={() => setCustomColors({ oceanFloor: "", beach: "", regular: "", mountain: "" })}
            >
              Reset to Biome Default Colors
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/60 border-green-500/30 text-green-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wide">GEOLOGICAL ACTIVITY</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-green-300">Volcanic Activity</Label>
              <span className="font-bold">{planetStats.volcanicActivity?.toFixed(2) || "0.00"}</span>
            </div>
            <Slider
              value={[planetStats.volcanicActivity || 0]}
              min={getRange("volcanicActivity")[0]}
              max={getRange("volcanicActivity")[1]}
              step={0.01}
              onValueChange={(value) => updateStat("volcanicActivity", value[0])}
              className="[&_[role=slider]]:bg-green-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};