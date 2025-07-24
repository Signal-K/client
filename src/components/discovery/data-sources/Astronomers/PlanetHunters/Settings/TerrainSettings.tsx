"use client"

import type { PlanetConfig } from "@/src/components/discovery/planets/planet-config"
import { Slider } from "@/src/components/ui/slider"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
import { Checkbox } from "@/src/components/ui/checkbox"

interface TerrainSettingsProps {
  planetConfig: PlanetConfig
  onChange: (config: Partial<PlanetConfig>) => void
}

export default function TerrainSettings({ planetConfig, onChange }: TerrainSettingsProps) {
  return (
    <div className="space-y-6">
      {planetConfig.type === "terrestrial" && (
        <div className="bg-slate-800 p-4 rounded-md space-y-4 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-200">Terrain Properties</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="terrainRoughness" className="text-slate-200">
                Terrain Roughness
              </Label>
              <span className="text-sm text-slate-400">{planetConfig.terrainRoughness.toFixed(2)}</span>
            </div>
            <Slider
              id="terrainRoughness"
              min={0.1}
              max={1}
              step={0.01}
              value={[planetConfig.terrainRoughness]}
              onValueChange={(value) => onChange({ terrainRoughness: value[0] })}
              className="[&_[role=slider]]:bg-slate-200"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="liquidHeight" className="text-slate-200">
                Ocean Level
              </Label>
              <span className="text-sm text-slate-400">{planetConfig.liquidHeight.toFixed(2)}</span>
            </div>
            <Slider
              id="liquidHeight"
              min={0.3}
              max={0.8}
              step={0.01}
              value={[planetConfig.liquidHeight]}
              onValueChange={(value) => onChange({ liquidHeight: value[0] })}
              className="[&_[role=slider]]:bg-slate-200"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="continentSize" className="text-slate-200">
                Continent Size
              </Label>
              <span className="text-sm text-slate-400">{planetConfig.continentSize.toFixed(2)}</span>
            </div>
            <Slider
              id="continentSize"
              min={0.1}
              max={1}
              step={0.01}
              value={[planetConfig.continentSize]}
              onValueChange={(value) => onChange({ continentSize: value[0] })}
              className="[&_[role=slider]]:bg-slate-200"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="continentCount" className="text-slate-200">
                Continent Count
              </Label>
              <span className="text-sm text-slate-400">{planetConfig.continentCount.toFixed(0)}</span>
            </div>
            <Slider
              id="continentCount"
              min={1}
              max={10}
              step={1}
              value={[planetConfig.continentCount]}
              onValueChange={(value) => onChange({ continentCount: value[0] })}
              className="[&_[role=slider]]:bg-slate-200"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="noiseScale" className="text-slate-200">
                Detail Level
              </Label>
              <span className="text-sm text-slate-400">{planetConfig.noiseScale.toFixed(2)}</span>
            </div>
            <Slider
              id="noiseScale"
              min={0.5}
              max={2}
              step={0.1}
              value={[planetConfig.noiseScale]}
              onValueChange={(value) => onChange({ noiseScale: value[0] })}
              className="[&_[role=slider]]:bg-slate-200"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="volcanicActivity" className="text-slate-200">
                Volcanic Activity
              </Label>
              <span className="text-sm text-slate-400">{planetConfig.volcanicActivity.toFixed(2)}</span>
            </div>
            <Slider
              id="volcanicActivity"
              min={0}
              max={1}
              step={0.01}
              value={[planetConfig.volcanicActivity]}
              onValueChange={(value) => onChange({ volcanicActivity: value[0] })}
              className="[&_[role=slider]]:bg-slate-200"
            />
          </div>
        </div>
      )}

      <div className="bg-slate-800 p-4 rounded-md space-y-4 border border-slate-700">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-slate-200">Debug Mode</h3>
          <Switch
            checked={planetConfig.debugMode || false}
            onCheckedChange={(checked) => onChange({ debugMode: checked })}
          />
        </div>

        {planetConfig.debugMode && (
          <div className="pt-2 border-t border-slate-700 space-y-2">
            <p className="text-xs text-slate-400">Show/hide specific terrain types:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-ocean"
                  checked={planetConfig.visibleTerrains.ocean}
                  onCheckedChange={(checked) =>
                    onChange({
                      visibleTerrains: {
                        ...planetConfig.visibleTerrains,
                        ocean: !!checked,
                      },
                    })
                  }
                />
                <Label htmlFor="show-ocean" className="text-xs cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: planetConfig.colors.ocean }}></div>
                    <span>Ocean</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-beach"
                  checked={planetConfig.visibleTerrains.beach}
                  onCheckedChange={(checked) =>
                    onChange({
                      visibleTerrains: {
                        ...planetConfig.visibleTerrains,
                        beach: !!checked,
                      },
                    })
                  }
                />
                <Label htmlFor="show-beach" className="text-xs cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: planetConfig.colors.beach }}></div>
                    <span>Beach</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-lowland"
                  checked={planetConfig.visibleTerrains.lowland}
                  onCheckedChange={(checked) =>
                    onChange({
                      visibleTerrains: {
                        ...planetConfig.visibleTerrains,
                        lowland: !!checked,
                      },
                    })
                  }
                />
                <Label htmlFor="show-lowland" className="text-xs cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: planetConfig.colors.lowland }}
                    ></div>
                    <span>Lowland</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-midland"
                  checked={planetConfig.visibleTerrains.midland}
                  onCheckedChange={(checked) =>
                    onChange({
                      visibleTerrains: {
                        ...planetConfig.visibleTerrains,
                        midland: !!checked,
                      },
                    })
                  }
                />
                <Label htmlFor="show-midland" className="text-xs cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: planetConfig.colors.midland }}
                    ></div>
                    <span>Midland</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-highland"
                  checked={planetConfig.visibleTerrains.highland}
                  onCheckedChange={(checked) =>
                    onChange({
                      visibleTerrains: {
                        ...planetConfig.visibleTerrains,
                        highland: !!checked,
                      },
                    })
                  }
                />
                <Label htmlFor="show-highland" className="text-xs cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: planetConfig.colors.highland }}
                    ></div>
                    <span>Highland</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-mountain"
                  checked={planetConfig.visibleTerrains.mountain}
                  onCheckedChange={(checked) =>
                    onChange({
                      visibleTerrains: {
                        ...planetConfig.visibleTerrains,
                        mountain: !!checked,
                      },
                    })
                  }
                />
                <Label htmlFor="show-mountain" className="text-xs cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: planetConfig.colors.mountain }}
                    ></div>
                    <span>Mountain</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-snow"
                  checked={planetConfig.visibleTerrains.snow}
                  onCheckedChange={(checked) =>
                    onChange({
                      visibleTerrains: {
                        ...planetConfig.visibleTerrains,
                        snow: !!checked,
                      },
                    })
                  }
                />
                <Label htmlFor="show-snow" className="text-xs cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: planetConfig.colors.snow }}></div>
                    <span>Snow</span>
                  </div>
                </Label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
};