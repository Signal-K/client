"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { type PlanetStats, determinePlanetType, isLiquidAvailable, determineLiquidType } from "@/lib/planet-physics"
import { BiomeRanges, getParameterRange } from "@/lib/biome-data"

interface SurfaceTabProps {
  planetStats: PlanetStats
  setPlanetStats: (stats: PlanetStats) => void
  selectedBiome: string
}

export function SurfaceTab({ planetStats, setPlanetStats, selectedBiome }: SurfaceTabProps) {
  const planetType = determinePlanetType(planetStats.mass, planetStats.radius)
  const liquidInfo = determineLiquidType(planetStats.temperature)
  const liquidAvailable = isLiquidAvailable(planetStats.temperature, planetStats.liquidType || liquidInfo.type)

  // Update a single stat
  const updateStat = (key: keyof PlanetStats, value: any) => {
    setPlanetStats({
      ...planetStats,
      [key]: value,
      ...(key === "liquidEnabled" && value === true ? { waterLevel: Math.max(planetStats.waterLevel || 0, 0.5) } : {}),
    })
  }

  // Get parameter range for the current biome
  const getRange = (parameter: keyof BiomeRanges): [number, number] => {
    return getParameterRange(selectedBiome, parameter)
  }

  return (
    <div className="space-y-6">
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
                    liquidType: "water" as "water" | "methane" | "nitrogen" | "ammonia" | "ethane",
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
                    soilType: "dusty" as "dusty" | "volcanic" | "rocky" | "sandy" | "organic" | "frozen" | "muddy",
                    atmosphereStrength: 0.4,
                    cloudCount: 10,
                    biomassLevel: 0.05,
                    surfaceRoughness: 0.7,
                    temperature: 310,
                    liquidEnabled: false,
                  },
                  volcanic: {
                    waterLevel: 0.3,
                    soilType: "volcanic" as "dusty" | "volcanic" | "rocky" | "sandy" | "organic" | "frozen" | "muddy",
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
                  <span>Temperature is not suitable for {planetStats.liquidType || "water"} to exist as a liquid</span>
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
    </div>
  );
};