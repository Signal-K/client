"use client"

import { useEffect } from "react"
import type { PlanetConfig } from "@/src/components/discovery/planets/planet-config"
import { getLiquidType } from "@/src/components/discovery/planets/physics"
import { Slider } from "@/src/components/ui/slider"
import { Label } from "@/src/components/ui/label"
import { Button } from "@/src/components/ui/button"
import { RefreshCw } from "lucide-react"

interface BasicSettingsProps {
  planetConfig: PlanetConfig
  onChange: (config: Partial<PlanetConfig>) => void
}

export default function BasicSettings({ planetConfig, onChange }: BasicSettingsProps) {
  // Check if planet should be gaseous or terrestrial based on mass and radius
  useEffect(() => {
    if ((planetConfig.mass > 7.5 || planetConfig.radius > 2.5) && planetConfig.type !== "gaseous") {
      onChange({ type: "gaseous" })
    } else if (planetConfig.mass <= 7.5 && planetConfig.radius <= 2.5 && planetConfig.type === "gaseous") {
      onChange({ type: "terrestrial" })
    }
  }, [planetConfig.mass, planetConfig.radius, planetConfig.type, onChange])

  const regenerateSeed = () => {
    onChange({ seed: Math.floor(Math.random() * 10000) })
  }

  // Get current liquid type name
  const liquidType = getLiquidType(planetConfig.temperature)

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 p-4 rounded-md border border-slate-700">
        <h3 className="text-sm font-medium mb-3 text-slate-200">Planet Type</h3>
        <div className="flex gap-2">
          <Button
            variant={planetConfig.type === "terrestrial" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange({ type: "terrestrial" })}
            className="flex-1"
          >
            Terrestrial
          </Button>
          <Button
            variant={planetConfig.type === "gaseous" ? "default" : "outline"}
            size="sm"
            onClick={() => onChange({ type: "gaseous" })}
            className="flex-1"
          >
            Gaseous
          </Button>
        </div>
        {(planetConfig.mass > 7.5 || planetConfig.radius > 2.5) && planetConfig.type === "gaseous" && (
          <p className="text-xs text-amber-400 mt-2">
            Note: High mass or radius has automatically set this to a gas giant
          </p>
        )}
        {planetConfig.mass <= 7.5 && planetConfig.radius <= 2.5 && planetConfig.type === "terrestrial" && (
          <p className="text-xs text-slate-400 mt-2">Note: Values are in Earth radii/mass units</p>
        )}
      </div>

      <div className="bg-slate-800 p-4 rounded-md space-y-4 border border-slate-700">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-slate-200">Seed: {planetConfig.seed}</h3>
          <Button variant="outline" size="icon" onClick={regenerateSeed} className="bg-slate-700 border-slate-600">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="radius" className="text-slate-200">
              Radius (Earth radii)
            </Label>
            <span className="text-sm text-slate-400">{planetConfig.radius.toFixed(1)}</span>
          </div>
          <Slider
            id="radius"
            min={0.5}
            max={5}
            step={0.1}
            value={[planetConfig.radius]}
            onValueChange={(value) => onChange({ radius: value[0] })}
            className="[&_[role=slider]]:bg-slate-200"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="temperature" className="text-slate-200">
              Temperature
            </Label>
            <span className="text-sm text-slate-400">
              {planetConfig.temperature.toFixed(0)}K ({(planetConfig.temperature - 273.15).toFixed(0)}°C)
            </span>
          </div>
          <Slider
            id="temperature"
            min={50}
            max={700}
            step={1}
            value={[planetConfig.temperature]}
            onValueChange={(value) => onChange({ temperature: value[0] })}
            className="[&_[role=slider]]:bg-slate-200"
          />
          <div className="text-xs text-slate-400">Liquid Solvent: {liquidType.name}</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="mass" className="text-slate-200">
              Mass (Earth masses)
            </Label>
            <span className="text-sm text-slate-400">{planetConfig.mass.toFixed(1)} M⊕</span>
          </div>
          <Slider
            id="mass"
            min={0.1}
            max={10}
            step={0.1}
            value={[planetConfig.mass]}
            onValueChange={(value) => onChange({ mass: value[0] })}
            className="[&_[role=slider]]:bg-slate-200"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="biomass" className="text-slate-200">
              Biomass
            </Label>
            <span className="text-sm text-slate-400">{planetConfig.biomass.toFixed(2)}</span>
          </div>
          <Slider
            id="biomass"
            min={0}
            max={1}
            step={0.01}
            value={[planetConfig.biomass]}
            onValueChange={(value) => onChange({ biomass: value[0] })}
            className="[&_[role=slider]]:bg-slate-200"
          />
        </div>

        <div className="pt-2 border-t border-slate-700">
          <div className="flex justify-between">
            <Label className="text-slate-200">Density</Label>
            <span className="text-sm text-slate-400">
              {(planetConfig.mass / ((planetConfig.radius ** 3 * Math.PI * 4) / 3)).toFixed(2)} g/cm³
            </span>
          </div>
        </div>
      </div>
    </div>
  )
};