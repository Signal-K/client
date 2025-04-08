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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type PlanetStats,
  determinePlanetType,
  isLiquidAvailable,
  mergeWithDefaults,
  type Landmark,
} from "@/lib/planet-physics";
import { Download, Upload, Copy, Palette, Plus, Trash2, AlertCircle } from "lucide-react"
import { getAllBiomes, adjustParametersForBiome, getParameterRange, type BiomeRanges } from "@/lib/biome-data"

interface SettingsPanelProps {
  planetStats: PlanetStats
  setPlanetStats: (stats: PlanetStats) => void
  classificationId?: string
  author?: string
};

export function SettingsPanel({
  planetStats,
  setPlanetStats,
  classificationId = "UNCLASSIFIED",
  author = "UNKNOWN",
}: SettingsPanelProps) {
  const planetType = determinePlanetType(planetStats.mass, planetStats.radius)
  const [importExportText, setImportExportText] = useState("")
  const [selectedBiome, setSelectedBiome] = useState(planetStats.biome || "Rocky Highlands")
  const [customColors, setCustomColors] = useState({
    oceanFloor: planetStats.customColors?.oceanFloor || "",
    beach: planetStats.customColors?.beach || "",
    regular: planetStats.customColors?.regular || "",
    mountain: planetStats.customColors?.mountain || "",
  })
  const [newLandmark, setNewLandmark] = useState<Landmark>({
    classification_id: "",
    type: "",
    visual_effect: "",
    image_link: "",
    coordinates: { x: 0, y: 0, z: 0 },
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

  // Add a new landmark
  const addLandmark = () => {
    if (!newLandmark.classification_id || !newLandmark.type) return

    const landmarks = [...(planetStats.landmarks || []), newLandmark]
    setPlanetStats({ ...planetStats, landmarks })

    // Reset the form
    setNewLandmark({
      classification_id: "",
      type: "",
      visual_effect: "",
      image_link: "",
      coordinates: { x: 0, y: 0, z: 0 },
    })
  }

  // Remove a landmark
  const removeLandmark = (index: number) => {
    const landmarks = [...(planetStats.landmarks || [])]
    landmarks.splice(index, 1)
    setPlanetStats({ ...planetStats, landmarks })
  }

  // Update new landmark field
  const updateNewLandmark = (field: keyof Landmark, value: any) => {
    if (field === "coordinates") {
      setNewLandmark({ ...newLandmark, coordinates: { ...newLandmark.coordinates, ...value } })
    } else {
      setNewLandmark({ ...newLandmark, [field]: value })
    }
  }

  // Export planet configuration
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
          config += `${key}: ${JSON.stringify(value)}\n`
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

  // Get parameter range for the current biome
  const getRange = (parameter: keyof BiomeRanges): [number, number] => {
    return getParameterRange(selectedBiome, parameter)
  }

  return (
    <div className="absolute top-0 left-0 h-full w-96 bg-black/90 text-green-400 p-6 overflow-y-auto font-mono border-r border-green-500/30">
      <h2 className="text-2xl font-bold mb-6 tracking-wider border-b border-green-500/30 pb-2">PLANET SETTINGS</h2>

      <div className="mb-6 p-3 bg-black/60 border border-green-500/30 rounded-md">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-green-500/70">CLASSIFICATION:</div>
          <div>{classificationId}</div>
          <div className="text-green-500/70">AUTHOR:</div>
          <div>{author}</div>
        </div>
      </div>

      <Tabs defaultValue="physical" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-black border border-green-500/30">
          <TabsTrigger
            value="physical"
            className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300"
          >
            PHYSICAL
          </TabsTrigger>
          <TabsTrigger
            value="surface"
            className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300"
          >
            SURFACE
          </TabsTrigger>
          <TabsTrigger value="biome" className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300">
            BIOME
          </TabsTrigger>
          <TabsTrigger
            value="landmarks"
            className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300"
          >
            LANDMARKS
          </TabsTrigger>
          <TabsTrigger
            value="import-export"
            className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300"
          >
            I/O
          </TabsTrigger>
        </TabsList>

        <TabsContent value="physical" className="space-y-6">
          <Card className="bg-black/60 border-green-500/30 text-green-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg tracking-wide">MASS PROPERTIES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-green-300">Mass (Earth masses)</Label>
                  <span className="font-bold">{planetStats.mass.toFixed(2)}</span>
                </div>
                <Slider
                  value={[planetStats.mass]}
                  min={0.1}
                  max={15}
                  step={0.1}
                  onValueChange={(value) => updateStat("mass", value[0])}
                  className="[&_[role=slider]]:bg-green-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-green-300">Radius (Earth radii)</Label>
                  <span className="font-bold">{planetStats.radius.toFixed(2)}</span>
                </div>
                <Slider
                  value={[planetStats.radius]}
                  min={0.1}
                  max={10}
                  step={0.1}
                  onValueChange={(value) => updateStat("radius", value[0])}
                  className="[&_[role=slider]]:bg-green-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-green-300">Density (g/cm³)</Label>
                  <span className="font-bold">{planetStats.density?.toFixed(2) || "N/A"}</span>
                </div>
                <p className="text-xs text-green-500/70">Calculated from mass and radius</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border-green-500/30 text-green-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg tracking-wide">THERMAL PROPERTIES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-green-300">Temperature (K)</Label>
                  <span className="font-bold">
                    {planetStats.temperature} K ({(planetStats.temperature - 273.15).toFixed(1)}°C)
                  </span>
                </div>
                <Slider
                  value={[planetStats.temperature]}
                  min={50}
                  max={700}
                  step={1}
                  onValueChange={(value) => updateStat("temperature", value[0])}
                  className="[&_[role=slider]]:bg-green-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border-green-500/30 text-green-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg tracking-wide">CLASSIFICATION</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-green-300">Planet Type</Label>
                  <span className="text-sm capitalize font-bold">{planetType}</span>
                </div>
                <p className="text-xs text-green-500/70">
                  {planetType === "gaseous"
                    ? "Gas giants have mass > 7 Earth masses or radius > 2.5 Earth radii"
                    : "Terrestrial planets have smaller mass and radius"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-green-300">Has Rings</Label>
                  <Switch
                    checked={planetStats.hasRings}
                    onCheckedChange={(checked) => updateStat("hasRings", checked)}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surface" className="space-y-6">
          <Card className="bg-black/60 border-green-500/30 text-green-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg tracking-wide">SURFACE CONFIGURATION</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-green-300">Surface Preset</Label>
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
                        soilType: "dusty" as "dusty",
                        atmosphereStrength: 0.4,
                        cloudCount: 10,
                        biomassLevel: 0.05,
                        surfaceRoughness: 0.7,
                        temperature: 310,
                        liquidEnabled: false,
                      },
                      volcanic: {
                        waterLevel: 0.3,
                        soilType: "volcanic" as "volcanic",
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
                        ...presets[value as keyof typeof presets],
                      })
                    }
                  }}
                >
                  <SelectTrigger className="bg-black border-green-500/30 text-green-400">
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/30 text-green-400">
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="ocean">Oceanic World</SelectItem>
                    <SelectItem value="desert">Desert World</SelectItem>
                    <SelectItem value="volcanic">Volcanic World</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-green-300">Surface Roughness</Label>
                  <span className="font-bold">{planetStats.surfaceRoughness?.toFixed(2) || "0.00"}</span>
                </div>
                <Slider
                  value={[planetStats.surfaceRoughness || 0]}
                  min={getRange("surfaceRoughness")[0]}
                  max={getRange("surfaceRoughness")[1]}
                  step={0.01}
                  onValueChange={(value) => updateStat("surfaceRoughness", value[0])}
                  className="[&_[role=slider]]:bg-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {planetType === "terrestrial" && (
            <Card className="bg-black/60 border-green-500/30 text-green-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg tracking-wide">TERRAIN COMPOSITION</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-green-300">Soil Type</Label>
                  <Select value={planetStats.soilType} onValueChange={(value) => updateStat("soilType", value)}>
                    <SelectTrigger className="bg-black border-green-500/30 text-green-400">
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-green-500/30 text-green-400">
                      {["rocky", "sandy", "volcanic", "organic", "dusty", "frozen", "muddy"].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-green-300">Soil Texture</Label>
                  <Select value={planetStats.soilTexture} onValueChange={(value) => updateStat("soilTexture", value)}>
                    <SelectTrigger className="bg-black border-green-500/30 text-green-400">
                      <SelectValue placeholder="Select soil texture" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-green-500/30 text-green-400">
                      {["smooth", "rough", "cracked", "layered", "porous", "grainy", "crystalline"].map((texture) => (
                        <SelectItem key={texture} value={texture}>
                          {texture.charAt(0).toUpperCase() + texture.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-green-300">Mountain Height</Label>
                    <span className="font-bold">{planetStats.mountainHeight?.toFixed(2) || "0.00"}</span>
                  </div>
                  <Slider
                    value={[planetStats.mountainHeight || 0]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => updateStat("mountainHeight", value[0])}
                    className="[&_[role=slider]]:bg-green-500"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {planetType === "terrestrial" && (
            <Card className="bg-black/60 border-green-500/30 text-green-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg tracking-wide">HYDROSPHERE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-green-300">Water Level</Label>
                    <span className="font-bold">{planetStats.waterLevel?.toFixed(2) || "0.00"}</span>
                  </div>
                  <Slider
                    value={[planetStats.waterLevel || 0]}
                    min={getRange("waterLevel")[0]}
                    max={getRange("waterLevel")[1]}
                    step={0.01}
                    onValueChange={(value) => updateStat("waterLevel", value[0])}
                    className="[&_[role=slider]]:bg-green-500"
                  />
                  {!liquidAvailable && (
                    <div className="flex items-center gap-2 text-amber-400 text-xs">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        Temperature is not suitable for {planetStats.liquidType || "water"} to exist as a liquid
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-green-300">Enable Liquid</Label>
                    <Switch
                      checked={planetStats.liquidEnabled !== false}
                      onCheckedChange={(checked) => updateStat("liquidEnabled", checked)}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                  <p className="text-xs text-green-500/70">When enabled, liquid will cover at least half the surface</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-green-300">Liquid Type</Label>
                  <Select value={planetStats.liquidType} onValueChange={(value) => updateStat("liquidType", value)}>
                    <SelectTrigger className="bg-black border-green-500/30 text-green-400">
                      <SelectValue placeholder="Select liquid type" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-green-500/30 text-green-400">
                      {["water", "methane", "nitrogen", "ammonia", "ethane"].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-black/60 border-green-500/30 text-green-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg tracking-wide">ATMOSPHERE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-green-300">Atmosphere Strength</Label>
                  <span className="font-bold">{planetStats.atmosphereStrength?.toFixed(2) || "0.00"}</span>
                </div>
                <Slider
                  value={[planetStats.atmosphereStrength || 0]}
                  min={getRange("atmosphereStrength")[0]}
                  max={getRange("atmosphereStrength")[1]}
                  step={0.01}
                  onValueChange={(value) => updateStat("atmosphereStrength", value[0])}
                  className="[&_[role=slider]]:bg-green-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-green-300">Cloud Count</Label>
                  <span className="font-bold">{planetStats.cloudCount || 0}</span>
                </div>
                <Slider
                  value={[planetStats.cloudCount || 0]}
                  min={getRange("cloudCount")[0]}
                  max={getRange("cloudCount")[1]}
                  step={1}
                  onValueChange={(value) => updateStat("cloudCount", value[0])}
                  className="[&_[role=slider]]:bg-green-500"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="biome" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="landmarks" className="space-y-6">
          <Card className="bg-black/60 border-green-500/30 text-green-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg tracking-wide">LANDMARK DATABASE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-green-300">Current Landmarks</Label>
                {!planetStats.landmarks || planetStats.landmarks.length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-green-500/30 rounded-md">
                    <p className="text-green-500/70">No landmarks registered</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {planetStats.landmarks.map((landmark, index) => (
                      <div key={index} className="border border-green-500/30 rounded-md p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-green-300">{landmark.classification_id}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLandmark(index)}
                            className="h-6 w-6 p-0 text-green-400 hover:text-red-400 hover:bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <span className="text-green-500/70">Type:</span>
                          <span>{landmark.type}</span>
                          <span className="text-green-500/70">Visual Effect:</span>
                          <span>{landmark.visual_effect || "None"}</span>
                          <span className="text-green-500/70">Coordinates:</span>
                          <span>
                            X: {landmark.coordinates.x.toFixed(2)}, Y: {landmark.coordinates.y.toFixed(2)}, Z:{" "}
                            {landmark.coordinates.z.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border-green-500/30 text-green-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg tracking-wide">ADD NEW LANDMARK</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-green-300">Classification ID</Label>
                    <Input
                      value={newLandmark.classification_id}
                      onChange={(e) => updateNewLandmark("classification_id", e.target.value)}
                      className="bg-black border-green-500/30 text-green-400"
                      placeholder="LM-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-green-300">Type</Label>
                    <Input
                      value={newLandmark.type}
                      onChange={(e) => updateNewLandmark("type", e.target.value)}
                      className="bg-black border-green-500/30 text-green-400"
                      placeholder="Mountain"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-green-300">Visual Effect</Label>
                  <Input
                    value={newLandmark.visual_effect}
                    onChange={(e) => updateNewLandmark("visual_effect", e.target.value)}
                    className="bg-black border-green-500/30 text-green-400"
                    placeholder="Glowing"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-green-300">Image Link</Label>
                  <Input
                    value={newLandmark.image_link}
                    onChange={(e) => updateNewLandmark("image_link", e.target.value)}
                    className="bg-black border-green-500/30 text-green-400"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-green-300">Coordinates</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">X</Label>
                      <Input
                        type="number"
                        value={newLandmark.coordinates.x}
                        onChange={(e) => updateNewLandmark("coordinates", { x: Number.parseFloat(e.target.value) })}
                        className="bg-black border-green-500/30 text-green-400"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Y</Label>
                      <Input
                        type="number"
                        value={newLandmark.coordinates.y}
                        onChange={(e) => updateNewLandmark("coordinates", { y: Number.parseFloat(e.target.value) })}
                        className="bg-black border-green-500/30 text-green-400"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Z</Label>
                      <Input
                        type="number"
                        value={newLandmark.coordinates.z}
                        onChange={(e) => updateNewLandmark("coordinates", { z: Number.parseFloat(e.target.value) })}
                        className="bg-black border-green-500/30 text-green-400"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={addLandmark} className="w-full mt-2 bg-green-700 hover:bg-green-600 text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Landmark
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};