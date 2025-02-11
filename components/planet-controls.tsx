"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { determineLiquidType } from "../utils/planet-physics"
import type { PlanetStats } from "../utils/planet-physics"

interface PlanetControlsProps {
  stats: PlanetStats
  showLiquid: boolean
  onMassChange: (value: number) => void
  onRadiusChange: (value: number) => void
  onTemperatureChange: (value: number) => void
  onOrbitalPeriodChange: (value: number) => void
  onTypeOverride: (type: "terrestrial" | "gaseous" | null) => void
  onShowLiquidChange: (value: boolean) => void
}

function calculateBiomeTemperatures(stats: PlanetStats) {
  const baseTemp = stats.temperature ?? 300 // Default to 300K if undefined
  const massEffect = (stats.mass - 1) * 10

  return {
    ocean: Math.round(baseTemp - 5),
    beach: Math.round(baseTemp),
    ground: Math.round(baseTemp + 5),
    mountain: Math.round(baseTemp - 15),
  }
}

export function PlanetControls({
  stats,
  showLiquid,
  onMassChange,
  onRadiusChange,
  onTemperatureChange,
  onOrbitalPeriodChange,
  onTypeOverride,
  onShowLiquidChange,
}: PlanetControlsProps) {
  const biomeTemperatures = calculateBiomeTemperatures(stats)
  const liquidInfo = determineLiquidType(stats.temperature ?? 300);

  return (
    <Card className="w-80">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>Mass (Earth masses)</Label>
          <Slider min={0.1} max={10} step={0.1} value={[stats.mass]} onValueChange={([value]) => onMassChange(value)} />
          <div className="text-sm text-muted-foreground">{stats.mass.toFixed(1)} M⊕</div>
        </div>

        <div className="space-y-2">
          <Label>Radius (Earth radii)</Label>
          <Slider
            min={0.1}
            max={3}
            step={0.1}
            value={[stats.radius]}
            onValueChange={([value]) => onRadiusChange(value)}
          />
          <div className="text-sm text-muted-foreground">{stats.radius.toFixed(1)} R⊕</div>
        </div>

        <div className="space-y-2">
          <Label>Temperature (Kelvin)</Label>
          <Slider
            min={50}
            max={400}
            step={1}
            value={[stats.temperature ?? 300]} // Defaults to 300K
            onValueChange={([value]) => onTemperatureChange(value)}
          />
          <div className="text-sm text-muted-foreground">{stats.temperature}K</div>
        </div>

        <div className="space-y-2">
          <Label>Orbital Period (Earth days)</Label>
          <Slider
            min={1}
            max={1000}
            step={1}
            value={[stats.orbitalPeriod ?? 365]} // Defaults to 365 days
            onValueChange={([value]) => onOrbitalPeriodChange(value)}
          />
          <div className="text-sm text-muted-foreground">{stats.orbitalPeriod} days</div>
        </div>

        <div className="space-y-1">
          <div className="text-sm">Density: {stats.density.toFixed(2)} g/cm³</div>
          <div className="text-sm">Type: {stats.type}</div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-liquid">Show Liquid Solvent</Label>
          <Switch id="show-liquid" checked={showLiquid} onCheckedChange={onShowLiquidChange} />
        </div>

        {showLiquid && (
          <div className="space-y-1">
            <div className="text-sm">Liquid Solvent: {liquidInfo.type}</div>
            <div className="text-sm">Temperature Range: {liquidInfo.temperatureRange}</div>
          </div>
        )}

        <div className="space-y-1">
          <Label>Biome Temperatures</Label>
          <div className="text-sm">Ocean: {biomeTemperatures.ocean}K</div>
          <div className="text-sm">Beach: {biomeTemperatures.beach}K</div>
          <div className="text-sm">Ground: {biomeTemperatures.ground}K</div>
          <div className="text-sm">Mountain: {biomeTemperatures.mountain}K</div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => onTypeOverride("terrestrial")}
            variant={stats.type === "terrestrial" ? "default" : "outline"}
          >
            Terrestrial
          </Button>
          <Button onClick={() => onTypeOverride("gaseous")} variant={stats.type === "gaseous" ? "default" : "outline"}>
            Gaseous
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

