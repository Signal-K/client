"use client"
import { useState, useEffect } from "react"
import type { PlanetConfig } from "@/utils/planet-physics"
import { getLiquidType, getTemperatureAdjustedColors } from "@/utils/planet-physics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Upload, RefreshCw } from "lucide-react"
import ColorPicker from "@/utils/Generators/PH/color-picker"
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface SettingsPanelProps {
  planetConfig: PlanetConfig;
  onChange: (config: Partial<PlanetConfig>) => void;
  classificationId?: number;
};

export default function SettingsPanel({ planetConfig, onChange, classificationId }: SettingsPanelProps) {
  const supabase = useSupabaseClient();

  const [showImportExport, setShowImportExport] = useState(false);

useEffect(() => {
  async function loadPlanetConfigFromClassification() {
    if (!classificationId) return

    try {
      const { data, error } = await supabase
        .from("classifications")
        .select("id, classificationConfiguration")
        .eq("id", classificationId)
        .single();

      if (error) {
        console.error("Failed to fetch classification:", error)
        return
      };

      const planetConfig = data?.classificationConfiguration?.planetConfiguration

      if (planetConfig) {
        onChange(planetConfig)
      } else {
        console.warn("No planetConfiguration found in classification")
      }
    } catch (err) {
      console.error("Error loading classification:", err)
    };
  };

  loadPlanetConfigFromClassification()
}, [classificationId])

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
  }, [planetConfig.temperature])

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
  }, [planetConfig.temperature, planetConfig.biomass])

  // Check if planet should be gaseous or terrestrial based on mass and radius
  useEffect(() => {
    if ((planetConfig.mass > 7.5 || planetConfig.radius > 2.5) && planetConfig.type !== "gaseous") {
      onChange({ type: "gaseous" })
    } else if (planetConfig.mass <= 7.5 && planetConfig.radius <= 2.5 && planetConfig.type === "gaseous") {
      onChange({ type: "terrestrial" })
    }
  }, [planetConfig.mass, planetConfig.radius, planetConfig.type])

  const regenerateSeed = () => {
    onChange({ seed: Math.floor(Math.random() * 10000) })
  }

  // Get current liquid type name
  const liquidType = getLiquidType(planetConfig.temperature)

  return (
    <div className="space-y-6 bg-gray-100 text-slate-100">
              <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImportExport(!showImportExport)}
          className="flex items-center gap-2 bg-gray-50 text-gray-900 border-gray-300 p-5 hover:bg-gray-300"
        >
          {showImportExport ? "Hide" : "Save"} 
          {/* Import/Export */}
          {showImportExport ? <Download className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        </Button>
      <div className="py-10">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4 bg-gray-50">
          <TabsTrigger value="basic" className="data-[state=active]:bg-gray-300">
            Basic
          </TabsTrigger>
          <TabsTrigger value="terrain" className="data-[state=active]:bg-gray-300">
            Terrain
          </TabsTrigger>
          <TabsTrigger value="colors" className="data-[state=active]:bg-gray-300">
            Colors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
              <h3 className="text-sm font-medium mb-3 text-gray-900">Planet Type</h3>
                            <div className="flex justify-between items-center p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImportExport(!showImportExport)}
          className="flex items-center gap-2 bg-gray-50 text-gray-900 border-gray-300 p-5 hover:bg-gray-300"
        >
          {showImportExport ? "Hide" : "Save"} 
          {/* Import/Export */}
          {showImportExport ? <Download className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        </Button>
      </div>

      {showImportExport && (
        <div className="p-4 bg-gray-50 rounded-md space-y-4 border border-gray-300">
          <h3 className="text-sm font-medium text-gray-900">Import/Export Configuration</h3>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const event = new CustomEvent("open-import-dialog")
                window.dispatchEvent(event)
              }}
              className="flex-1 bg-gray-300 text-gray-900 hover:bg-slate-600"
            >
              Import
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const event = new CustomEvent("open-export-dialog")
                window.dispatchEvent(event)
              }}
              className="flex-1 bg-gray-300 text-gray-900 hover:bg-slate-600"
            >
              Save
            </Button>
          </div>
        </div>
      )}
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
                <p className="text-xs text-gray-500 mt-2">Note: Values are in Earth radii/mass units</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md space-y-4 border border-gray-300">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Seed: {planetConfig.seed}</h3>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={regenerateSeed}
                  className="bg-slate-700 border-slate-600"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="radius" className="text-gray-900">
                    Radius (Earth radii)
                  </Label>
                  <span className="text-sm text-gray-500">{planetConfig.radius.toFixed(1)}</span>
                </div>
                <Slider
                  id="radius"
                  min={0.5}
                  max={5}
                  step={0.1}
                  value={[planetConfig.radius]}
                  onValueChange={(value) => onChange({ radius: value[0] })}
                  className="[&_[role=slider]]:bg-blue-300"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="temperature" className="text-gray-900">
                    Temperature
                  </Label>
                  <span className="text-sm text-gray-500">
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
                  className="[&_[role=slider]]:bg-blue-300"
                />
                <div className="text-xs text-gray-500">Liquid Solvent: {liquidType.name}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="mass" className="text-gray-900">
                    Mass (Earth masses)
                  </Label>
                  <span className="text-sm text-gray-500">{planetConfig.mass.toFixed(1)} M⊕</span>
                </div>
                <Slider
                  id="mass"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={[planetConfig.mass]}
                  onValueChange={(value) => onChange({ mass: value[0] })}
                  className="[&_[role=slider]]:bg-blue-300"
                />
              </div>

              <div className="pt-2 border-t border-gray-300">
                <div className="flex justify-between">
                  <Label className="text-gray-900">Density</Label>
                  <span className="text-sm text-gray-500">
                    {(planetConfig.mass / ((planetConfig.radius ** 3 * Math.PI * 4) / 3)).toFixed(2)} g/cm³
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="terrain" className="space-y-6">
          {planetConfig.type === "terrestrial" && (
            <div className="bg-gray-50 p-4 rounded-md space-y-4 border border-gray-300">
              <h3 className="text-sm font-medium text-gray-900">Terrain Properties</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="terrainRoughness" className="text-gray-900">
                    Terrain Roughness
                  </Label>
                  <span className="text-sm text-gray-500">{planetConfig.terrainRoughness.toFixed(2)}</span>
                </div>
                <Slider
                  id="terrainRoughness"
                  min={0.1}
                  max={1}
                  step={0.01}
                  value={[planetConfig.terrainRoughness]}
                  onValueChange={(value) => onChange({ terrainRoughness: value[0] })}
                  className="[&_[role=slider]]:bg-blue-300"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="liquidHeight" className="text-gray-900">
                    Ocean Level
                  </Label>
                  <span className="text-sm text-gray-500">{planetConfig.liquidHeight.toFixed(2)}</span>
                </div>
                <Slider
                  id="liquidHeight"
                  min={0.3}
                  max={0.8}
                  step={0.01}
                  value={[planetConfig.liquidHeight]}
                  onValueChange={(value) => onChange({ liquidHeight: value[0] })}
                  className="[&_[role=slider]]:bg-blue-300"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="continentSize" className="text-gray-900">
                    Continent Size
                  </Label>
                  <span className="text-sm text-gray-500">{planetConfig.continentSize.toFixed(2)}</span>
                </div>
                <Slider
                  id="continentSize"
                  min={0.1}
                  max={1}
                  step={0.01}
                  value={[planetConfig.continentSize]}
                  onValueChange={(value) => onChange({ continentSize: value[0] })}
                  className="[&_[role=slider]]:bg-blue-300"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="continentCount" className="text-gray-900">
                    Continent Count
                  </Label>
                  <span className="text-sm text-gray-500">{planetConfig.continentCount.toFixed(0)}</span>
                </div>
                <Slider
                  id="continentCount"
                  min={1}
                  max={10}
                  step={1}
                  value={[planetConfig.continentCount]}
                  onValueChange={(value) => onChange({ continentCount: value[0] })}
                  className="[&_[role=slider]]:bg-blue-300"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="noiseScale" className="text-gray-900">
                    Detail Level
                  </Label>
                  <span className="text-sm text-gray-500">{planetConfig.noiseScale.toFixed(2)}</span>
                </div>
                <Slider
                  id="noiseScale"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[planetConfig.noiseScale]}
                  onValueChange={(value) => onChange({ noiseScale: value[0] })}
                  className="[&_[role=slider]]:bg-blue-300"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="volcanicActivity" className="text-gray-900">
                    Volcanic Activity
                  </Label>
                  <span className="text-sm text-gray-500">{planetConfig.volcanicActivity.toFixed(2)}</span>
                </div>
                <Slider
                  id="volcanicActivity"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[planetConfig.volcanicActivity]}
                  onValueChange={(value) => onChange({ volcanicActivity: value[0] })}
                  className="[&_[role=slider]]:bg-blue-300"
                />
                <div className="text-xs text-gray-500 italic">Note: Volcanic activity is currently a static value</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="biomass" className="text-gray-900">
                    Biomass
                  </Label>
                  <span className="text-sm text-gray-500">{planetConfig.biomass.toFixed(2)}</span>
                </div>
                <Slider
                  id="biomass"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[planetConfig.biomass]}
                  onValueChange={(value) => onChange({ biomass: value[0] })}
                  className="[&_[role=slider]]:bg-blue-300"
                />
                <div className="text-xs text-gray-500 italic">Note: Biomass is currently a static value</div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md space-y-4 border border-gray-300">
            <h3 className="text-sm font-medium text-gray-900">Planet Colors</h3>

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
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
};


/*
          <div className="bg-gray-50 p-4 rounded-md space-y-4 border border-gray-300">
            {/* <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Debug Mode</h3>
              <Switch
                checked={planetConfig.debugMode || false}
                onCheckedChange={(checked) => onChange({ debugMode: checked })}
              />
            </div> 

            {/* {planetConfig.debugMode && (
              <div className="pt-2 border-t border-gray-300 space-y-2">
                <p className="text-xs text-gray-500">Show/hide specific terrain types:</p>
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
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: planetConfig.colors.ocean }}
                        ></div>
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
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: planetConfig.colors.beach }}
                        ></div>
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
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: planetConfig.colors.snow }}
                        ></div>
                        <span>Snow</span>
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
            )} 
          </div>
*/