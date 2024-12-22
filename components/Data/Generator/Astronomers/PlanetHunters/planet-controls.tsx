import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PlanetStats } from "../utils/planet-physics"

interface PlanetControlsProps {
  stats: PlanetStats
  onMassChange: (value: number) => void
  onRadiusChange: (value: number) => void
  onTypeOverride: (type: 'terrestrial' | 'gaseous' | null) => void
}

function calculateBiomeTemperatures(stats: PlanetStats) {
  const baseTemp = stats.type === 'terrestrial' ? 15 : -150 // Celsius
  const massEffect = (stats.mass - 1) * 10 // Adjust temperature based on mass

  return {
    ocean: Math.round(baseTemp + massEffect - 5),
    beach: Math.round(baseTemp + massEffect),
    ground: Math.round(baseTemp + massEffect + 5),
    mountain: Math.round(baseTemp + massEffect - 15),
  }
}

export function PlanetControls({ stats, onMassChange, onRadiusChange, onTypeOverride }: PlanetControlsProps) {
  const biomeTemperatures = calculateBiomeTemperatures(stats)

  return (
    <Card className="w-80">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>Mass (Earth masses)</Label>
          <Slider
            min={0.1}
            max={10}
            step={0.1}
            value={[stats.mass]}
            onValueChange={([value]) => onMassChange(value)}
          />
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

        <div className="space-y-1">
          <div className="text-sm">Density: {stats.density.toFixed(2)} g/cm³</div>
          <div className="text-sm">Type: {stats.type}</div>
        </div>

        <div className="space-y-1">
          <Label>Biome Temperatures</Label>
          <div className="text-sm">Ocean: {biomeTemperatures.ocean}°C</div>
          <div className="text-sm">Beach: {biomeTemperatures.beach}°C</div>
          <div className="text-sm">Ground: {biomeTemperatures.ground}°C</div>
          <div className="text-sm">Mountain: {biomeTemperatures.mountain}°C</div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={() => onTypeOverride('terrestrial')} variant={stats.type === 'terrestrial' ? 'default' : 'outline'}>
            Terrestrial
          </Button>
          <Button onClick={() => onTypeOverride('gaseous')} variant={stats.type === 'gaseous' ? 'default' : 'outline'}>
            Gaseous
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

