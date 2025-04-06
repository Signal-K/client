"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { type PlanetStats, determinePlanetType, isLiquidAvailable, mergeWithDefaults } from "@/lib/planet-physics"
import { Download, Upload, Copy, Palette } from "lucide-react"
import { getAllBiomes, adjustParametersForBiome, getParameterRange, type BiomeRanges } from "@/lib/biome-data"

export function SettingsPanel({
  planetStats,
  setPlanetStats,
}: {
  planetStats: PlanetStats
  setPlanetStats: (stats: PlanetStats) => void
}) {
  const planetType = determinePlanetType(planetStats.mass, planetStats.radius)
  const [importExportText, setImportExportText] = useState("")
  const [selectedBiome, setSelectedBiome] = useState(planetStats.biome || "Rocky Highlands")
  const [customColors, setCustomColors] = useState({
    oceanFloor: planetStats.customColors?.oceanFloor || "",
    beach: planetStats.customColors?.beach || "",
    regular: planetStats.customColors?.regular || "",
    mountain: planetStats.customColors?.mountain || "",
  })

  const allBiomes = getAllBiomes()
  const liquidAvailable = isLiquidAvailable(planetStats.temperature, planetStats.liquidType || "water")

  // Update a single stat
  const updateStat = (key: keyof PlanetStats, value: any) => {
    setPlanetStats({
      ...planetStats,
      [key]: value,
      ...(key === "liquidEnabled" && value === true ? { waterLevel: Math.max(planetStats.waterLevel || 0, 0.5) } : {}),
    })
  }

  // Apply biome constraints when biome changes
  useEffect(() => {
    if (selectedBiome && selectedBiome !== planetStats.biome) {
      setPlanetStats({
        ...adjustParametersForBiome(selectedBiome, planetStats),
        biome: selectedBiome,
      })
    }
  }, [selectedBiome, planetStats, setPlanetStats])

  // Update custom colors
  const updateCustomColor = (type: string, color: string) => {
    const newCustomColors = { ...customColors, [type]: color }
    setCustomColors(newCustomColors)
    setPlanetStats({ ...planetStats, customColors: newCustomColors })
  }

  // Export planet configuration
  const exportPlanetConfig = () => {
    let config = ""
    Object.entries(planetStats).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "customColors" && value && Object.keys(value).length > 0) {
          config += `${key}: ${JSON.stringify(value)}\n`
        } else if (typeof value === "number") {
          config += `${key}: ${value.toFixed(2)}\n`
        } else if (typeof value === "boolean") {
          config += `${key}: ${value ? "true" : "false"}\n`
        } else if (typeof value === "object" && key !== "customColors") {
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
      const lines = importExportText.split("\n")
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

  // Get parameter range for the current biome
  const getRange = (parameter: keyof BiomeRanges): [number, number] => {
    return getParameterRange(selectedBiome, parameter)
  }

  return (
    <div className="absolute top-0 left-0 h-full w-80 bg-black/80 text-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Planet Settings</h2>

      <Tabs defaultValue="physical">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="physical">Physical</TabsTrigger>
          <TabsTrigger value="surface">Surface</TabsTrigger>
          <TabsTrigger value="biome">Biome</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="physical" className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Mass (Earth masses)</Label>
              <span>{planetStats.mass.toFixed(2)}</span>
            </div>
            <Slider
              value={[planetStats.mass]}
              min={0.1}
              max={15}
              step={0.1}
              onValueChange={(value) => updateStat("mass", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Radius (Earth radii)</Label>
              <span>{planetStats.radius.toFixed(2)}</span>
            </div>
            <Slider
              value={[planetStats.radius]}
              min={0.1}
              max={10}
              step={0.1}
              onValueChange={(value) => updateStat("radius", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Density (g/cm³)</Label>
              <span>{planetStats.density?.toFixed(2) || "N/A"}</span>
            </div>
            <p className="text-xs text-gray-400">Calculated from mass and radius</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Temperature (K)</Label>
              <span>
                {planetStats.temperature} K ({(planetStats.temperature - 273.15).toFixed(1)}°C)
              </span>
            </div>
            <Slider
              value={[planetStats.temperature]}
              min={50}
              max={700}
              step={1}
              onValueChange={(value) => updateStat("temperature", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Planet Type</Label>
              <span className="text-sm capitalize">{planetType}</span>
            </div>
            <p className="text-xs text-gray-400">
              {planetType === "gaseous"
                ? "Gas giants have mass > 7 Earth masses or radius > 2.5 Earth radii"
                : "Terrestrial planets have smaller mass and radius"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Has Rings</Label>
              <Switch checked={planetStats.hasRings} onCheckedChange={(checked) => updateStat("hasRings", checked)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="surface" className="space-y-4">
          <div className="space-y-2">
            <Label>Surface Preset</Label>
            <Select
              onValueChange={(value) => {
                const presets = {
                  ocean: {
                    waterLevel: 0.95,
                    liquidType: "water" as "water",
                    atmosphereStrength: 0.8,
                    cloudCount: 70,
                    biomassLevel: 0.6,
                    surfaceRoughness: 0.3,
                    liquidEnabled: true,
                    customColors: {
                      oceanFloor: "#01579B",
                      beach: "#0288D1",
                      regular: "#29B6F6",
                      mountain: "#81D4FA",
                    },
                  },
                  desert: {
                    waterLevel: 0.1,
                    soilType: "dusty",
                    atmosphereStrength: 0.4,
                    cloudCount: 10,
                    biomassLevel: 0.05,
                    surfaceRoughness: 0.7,
                    temperature: 310,
                    liquidEnabled: false,
                  },
                  volcanic: {
                    waterLevel: 0.3,
                    soilType: "volcanic",
                    atmosphereStrength: 0.7,
                    cloudCount: 40,
                    biomassLevel: 0.1,
                    surfaceRoughness: 0.9,
                    volcanicActivity: 0.8,
                    temperature: 350,
                    liquidEnabled: true,
                  },
                }

                if (value !== "default") {
                  setPlanetStats({
                    ...planetStats,
                    ...presets[value as keyof typeof presets] as PlanetStats,
                  })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="ocean">Oceanic World</SelectItem>
                <SelectItem value="desert">Desert World</SelectItem>
                <SelectItem value="volcanic">Volcanic World</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Surface Roughness</Label>
              <span>{planetStats.surfaceRoughness?.toFixed(2) || "0.00"}</span>
            </div>
            <Slider
              value={[planetStats.surfaceRoughness || 0]}
              min={getRange("surfaceRoughness")[0]}
              max={getRange("surfaceRoughness")[1]}
              step={0.01}
              onValueChange={(value) => updateStat("surfaceRoughness", value[0])}
            />
          </div>

          {planetType === "terrestrial" && (
            <>
              <div className="space-y-2">
                <Label>Soil Type</Label>
                <Select value={planetStats.soilType} onValueChange={(value) => updateStat("soilType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["rocky", "sandy", "volcanic", "organic", "dusty", "frozen", "muddy"].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Soil Texture</Label>
                <Select value={planetStats.soilTexture} onValueChange={(value) => updateStat("soilTexture", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil texture" />
                  </SelectTrigger>
                  <SelectContent>
                    {["smooth", "rough", "cracked", "layered", "porous", "grainy", "crystalline"].map((texture) => (
                      <SelectItem key={texture} value={texture}>
                        {texture.charAt(0).toUpperCase() + texture.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Water Level</Label>
                  <span>{planetStats.waterLevel?.toFixed(2) || "0.00"}</span>
                </div>
                <Slider
                  value={[planetStats.waterLevel || 0]}
                  min={getRange("waterLevel")[0]}
                  max={getRange("waterLevel")[1]}
                  step={0.01}
                  onValueChange={(value) => updateStat("waterLevel", value[0])}
                />
                {!liquidAvailable && (
                  <p className="text-xs text-amber-400">
                    Warning: Temperature is not suitable for {planetStats.liquidType || "water"} to exist as a liquid
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Enable Liquid</Label>
                  <Switch
                    checked={planetStats.liquidEnabled !== false}
                    onCheckedChange={(checked) => updateStat("liquidEnabled", checked)}
                  />
                </div>
                <p className="text-xs text-gray-400">When enabled, liquid will cover at least half the surface</p>
              </div>

              <div className="space-y-2">
                <Label>Liquid Type</Label>
                <Select value={planetStats.liquidType} onValueChange={(value) => updateStat("liquidType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select liquid type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["water", "methane", "nitrogen", "ammonia", "ethane"].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Mountain Height</Label>
                  <span>{planetStats.mountainHeight?.toFixed(2) || "0.00"}</span>
                </div>
                <Slider
                  value={[planetStats.mountainHeight || 0]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => updateStat("mountainHeight", value[0])}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Atmosphere Strength</Label>
              <span>{planetStats.atmosphereStrength?.toFixed(2) || "0.00"}</span>
            </div>
            <Slider
              value={[planetStats.atmosphereStrength || 0]}
              min={getRange("atmosphereStrength")[0]}
              max={getRange("atmosphereStrength")[1]}
              step={0.01}
              onValueChange={(value) => updateStat("atmosphereStrength", value[0])}
            />
          </div>
        </TabsContent>

        <TabsContent value="biome" className="space-y-4">
          <div className="space-y-2">
            <Label>Biome Type</Label>
            <Select value={selectedBiome} onValueChange={setSelectedBiome}>
              <SelectTrigger>
                <SelectValue placeholder="Select biome" />
              </SelectTrigger>
              <SelectContent>
                {allBiomes.map((biome) => (
                  <SelectItem key={biome} value={biome}>
                    {biome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">Selecting a biome will adjust parameters to fit within biome ranges</p>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex justify-between items-center">
              <Label>Custom Colors</Label>
              <Palette className="h-4 w-4" />
            </div>
            <p className="text-xs text-gray-400 mb-2">Customize terrain colors for each height level</p>

            <div className="grid grid-cols-2 gap-2">
              {["oceanFloor", "beach", "regular", "mountain"].map((type) => (
                <React.Fragment key={type}>
                  <Label className="text-xs">
                    {type.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </Label>
                  <Input
                    type="color"
                    value={customColors[type as keyof typeof customColors] || "#5D4037"}
                    onChange={(e) => updateCustomColor(type, e.target.value)}
                    className="h-8 p-1"
                  />
                </React.Fragment>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => setCustomColors({ oceanFloor: "", beach: "", regular: "", mountain: "" })}
            >
              Reset to Biome Default Colors
            </Button>
          </div>

          <div className="space-y-2 pt-4">
            <Label>Volcanic Activity</Label>
            <div className="flex justify-between">
              <span>Level</span>
              <span>{planetStats.volcanicActivity?.toFixed(2) || "0.00"}</span>
            </div>
            <Slider
              value={[planetStats.volcanicActivity || 0]}
              min={getRange("volcanicActivity")[0]}
              max={getRange("volcanicActivity")[1]}
              step={0.01}
              onValueChange={(value) => updateStat("volcanicActivity", value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label>Cloud Count</Label>
            <div className="flex justify-between">
              <span>Count</span>
              <span>{planetStats.cloudCount || 0}</span>
            </div>
            <Slider
              value={[planetStats.cloudCount || 0]}
              min={getRange("cloudCount")[0]}
              max={getRange("cloudCount")[1]}
              step={1}
              onValueChange={(value) => updateStat("cloudCount", value[0])}
            />
          </div>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-4">
          <div className="space-y-2">
            <Label>Planet Configuration</Label>
            <Textarea
              value={importExportText}
              onChange={(e) => setImportExportText(e.target.value)}
              className="h-64 font-mono text-xs"
              placeholder="Export or paste planet configuration here..."
            />
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={exportPlanetConfig}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button variant="outline" size="sm" className="flex-1" onClick={importPlanetConfig}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>

            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(importExportText)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            You can import partial configurations (e.g., just mass and radius). Missing values will be filled with
            defaults.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}

