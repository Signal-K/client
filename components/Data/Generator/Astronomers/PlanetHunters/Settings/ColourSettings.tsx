"use client"

import { useEffect } from "react"
import type { PlanetConfig } from "@/app/planets/paint/[id]/planet-config"
import { getLiquidType, getTemperatureAdjustedColors } from "@/app/planets/paint/[id]/planet-config"
import ColorPicker from "@/src/shared/utils/generators/PH/color-picker";

interface ColorSettingsProps {
  planetConfig: PlanetConfig
  onChange: (config: Partial<PlanetConfig>) => void
}

export default function ColorSettings({ planetConfig, onChange }: ColorSettingsProps) {
  // Update liquid type based on temperature
  useEffect(() => {
    const liquidType = getLiquidType(planetConfig.temperature)

    // Only update if the colors don't match the expected liquid type
    if (
      planetConfig.colors.ocean !== liquidType.color ||
      planetConfig.colors.oceanPattern !== liquidType.patternColor
    ) {
      onChange({
        colors: {
          ...planetConfig.colors,
          ocean: liquidType.color,
          oceanPattern: liquidType.patternColor,
        },
      })
    }
  }, [planetConfig.temperature, onChange])

  // Update terrain colors based on temperature
  useEffect(() => {
    const terrainColors = getTemperatureAdjustedColors(planetConfig.temperature, planetConfig.biomass)

    // Only update if colors have changed
    if (
      planetConfig.colors.beach !== terrainColors.beach ||
      planetConfig.colors.lowland !== terrainColors.lowland ||
      planetConfig.colors.midland !== terrainColors.midland ||
      planetConfig.colors.highland !== terrainColors.highland ||
      planetConfig.colors.mountain !== terrainColors.mountain ||
      planetConfig.colors.snow !== terrainColors.snow
    ) {
      onChange({
        colors: {
          ...planetConfig.colors,
          ...terrainColors,
        },
      })
    }
  }, [planetConfig.temperature, planetConfig.biomass, onChange])

  // Get current liquid type name
  const liquidType = getLiquidType(planetConfig.temperature)

  return (
    <div className="bg-slate-800 p-4 rounded-md space-y-4 border border-slate-700">
      <h3 className="text-sm font-medium text-slate-200">Planet Colors</h3>

      <div className="grid grid-cols-2 gap-4">
        <ColorPicker
          label="Atmosphere"
          color={planetConfig.colors.atmosphere}
          onChange={(color) => onChange({ colors: { ...planetConfig.colors, atmosphere: color } })}
        />

        <ColorPicker
          label={`${liquidType.name}`}
          color={planetConfig.colors.ocean}
          onChange={(color) => onChange({ colors: { ...planetConfig.colors, ocean: color } })}
        />

        <ColorPicker
          label={`${liquidType.name} Pattern`}
          color={planetConfig.colors.oceanPattern}
          onChange={(color) => onChange({ colors: { ...planetConfig.colors, oceanPattern: color } })}
        />

        <ColorPicker
          label="Beach"
          color={planetConfig.colors.beach}
          onChange={(color) => onChange({ colors: { ...planetConfig.colors, beach: color } })}
        />

        <ColorPicker
          label="Lowland"
          color={planetConfig.colors.lowland}
          onChange={(color) => onChange({ colors: { ...planetConfig.colors, lowland: color } })}
        />

        <ColorPicker
          label="Midland"
          color={planetConfig.colors.midland}
          onChange={(color) => onChange({ colors: { ...planetConfig.colors, midland: color } })}
        />

        <ColorPicker
          label="Highland"
          color={planetConfig.colors.highland}
          onChange={(color) => onChange({ colors: { ...planetConfig.colors, highland: color } })}
        />

        <ColorPicker
          label="Mountain"
          color={planetConfig.colors.mountain}
          onChange={(color) => onChange({ colors: { ...planetConfig.colors, mountain: color } })}
        />

        <ColorPicker
          label="Snow"
          color={planetConfig.colors.snow}
          onChange={(color) => onChange({ colors: { ...planetConfig.colors, snow: color } })}
        />
      </div>
    </div>
  );
};