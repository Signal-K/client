"use client"

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface AtmosphereControlsProps {
  atmosphereOpacity: number
  showAtmosphere: boolean
  atmosphereOffset: number
  splitMeshes: boolean
  storms: number
  onAtmosphereOpacityChange: (value: number) => void
  onShowAtmosphereChange: (value: boolean) => void
  onAtmosphereOffsetChange: (value: number) => void
  onSplitMeshesChange: (value: boolean) => void
  onStormsChange: (value: number) => void
}

export function AtmosphereControls({
  atmosphereOpacity,
  showAtmosphere,
  atmosphereOffset,
  splitMeshes,
  storms,
  onAtmosphereOpacityChange,
  onShowAtmosphereChange,
  onAtmosphereOffsetChange,
  onSplitMeshesChange,
  onStormsChange,
}: AtmosphereControlsProps) {
  return (
    <Card className="w-80">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-atmosphere">Show Atmosphere</Label>
          <Switch id="show-atmosphere" checked={showAtmosphere} onCheckedChange={onShowAtmosphereChange} />
        </div>

        {showAtmosphere && (
          <>
            <div className="space-y-2">
              <Label>Atmosphere Opacity</Label>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[atmosphereOpacity]}
                onValueChange={([value]) => onAtmosphereOpacityChange(value)}
              />
              <div className="text-sm text-muted-foreground">
                {typeof atmosphereOpacity === "number" ? atmosphereOpacity.toFixed(2) : "N/A"}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Atmosphere Offset</Label>
              <Slider
                min={0.08}
                max={0.25}
                step={0.001}
                value={[atmosphereOffset]}
                onValueChange={([value]) => onAtmosphereOffsetChange(value)}
              />
              <div className="text-sm text-muted-foreground">
                {typeof atmosphereOffset === "number" ? atmosphereOffset.toFixed(3) : "N/A"}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Number of Storms</Label>
              <Slider
                min={0}
                max={4}
                step={1}
                value={[storms]}
                onValueChange={([value]) => onStormsChange(Math.round(value))}
              />
              <div className="text-sm text-muted-foreground">{storms}</div>
            </div>

            <Button onClick={() => onSplitMeshesChange(!splitMeshes)} variant={splitMeshes ? "default" : "outline"}>
              {splitMeshes ? "Combine Meshes" : "Split Meshes"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};