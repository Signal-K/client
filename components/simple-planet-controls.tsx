"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import type { PlanetStats } from "@/utils/planet-physics"

interface SimplePlanetControlsProps {
  stats: PlanetStats
  onMassChange: (value: number) => void
  onRadiusChange: (value: number) => void
}

export function SimplePlanetControls({ stats, onMassChange, onRadiusChange }: SimplePlanetControlsProps) {
  return (
    <div className="grid gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base text-[#2A9D8F]">Mass (M⊕)</Label>
          <span className="text-sm text-white bg-[#2A2A2A] px-2 py-1 rounded">{stats.mass.toFixed(2)}</span>
        </div>
        <Slider
          className="w-full [&_[role=slider]]:bg-[#2A9D8F]"
          min={0.1}
          max={10}
          step={0.1}
          value={[stats.mass]}
          onValueChange={([value]) => onMassChange(value)}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base text-[#2A9D8F]">Radius (R⊕)</Label>
          <span className="text-sm text-white bg-[#2A2A2A] px-2 py-1 rounded">{stats.radius.toFixed(2)}</span>
        </div>
        <Slider
          className="w-full [&_[role=slider]]:bg-[#2A9D8F]"
          min={0.1}
          max={3}
          step={0.1}
          value={[stats.radius]}
          onValueChange={([value]) => onRadiusChange(value)}
        />
      </div>

      <div className="p-4 bg-[#2A2A2A] rounded-lg">
        <div className="text-sm text-white">
          <div className="flex justify-between mb-2">
            <span className="text-[#2A9D8F]">Density:</span>
            <span>{stats.density.toFixed(2)} g/cm³</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#2A9D8F]">Type:</span>
            <span>{stats.type}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

