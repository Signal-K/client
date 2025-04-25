"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PlanetStats } from "@/lib/planet-physics"
import { PhysicalTab } from "./Settings/physical-tab"
import { SurfaceTab } from "./Settings/surface-tab"
import { BiomeTab } from "./Settings/biome-tab"
import { LandmarksTab } from "./Settings/landmarks-tab"
import { ImportExportTab } from "./Settings/import-export-tab"

interface SettingsPanelProps {
  planetStats: PlanetStats
  setPlanetStats: (stats: PlanetStats) => void
  classificationId?: string
  author?: string
}

export function SettingsPanel({
  planetStats,
  setPlanetStats,
  classificationId = "UNCLASSIFIED",
  author = "UNKNOWN",
}: SettingsPanelProps) {
  const [selectedBiome, setSelectedBiome] = useState(planetStats.biome || "Rocky Highlands")
  const [customColors, setCustomColors] = useState({
    oceanFloor: planetStats.customColors?.oceanFloor || "",
    beach: planetStats.customColors?.beach || "",
    regular: planetStats.customColors?.regular || "",
    mountain: planetStats.customColors?.mountain || "",
  })

  return (
    <div className="absolute top-0 left-0 h-full w-96 bg-slate-800/90 text-blue-100 p-6 overflow-y-auto font-mono border-r border-slate-600/60">
      <h2 className="text-2xl font-bold mb-6 tracking-wider border-b border-slate-600/60 pb-2">PLANET SETTINGS</h2>

      {/* Hidden but not removed */}
      <div className="mb-6 p-3 bg-slate-700/60 border border-slate-600/60 rounded-md hidden">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-slate-400">CLASSIFICATION:</div>
          <div>{classificationId}</div>
          <div className="text-slate-400">AUTHOR:</div>
          <div>{author}</div>
        </div>
      </div>

      <Tabs defaultValue="physical" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-slate-700 border border-slate-600">
          <TabsTrigger value="physical" className="data-[state=active]:bg-cyan-800/40 data-[state=active]:text-cyan-50">
            PHYSICAL
          </TabsTrigger>
          <TabsTrigger value="surface" className="data-[state=active]:bg-cyan-800/40 data-[state=active]:text-cyan-50">
            SURFACE
          </TabsTrigger>
          <TabsTrigger value="biome" className="data-[state=active]:bg-cyan-800/40 data-[state=active]:text-cyan-50">
            BIOME
          </TabsTrigger>
          <TabsTrigger
            value="landmarks"
            className="data-[state=active]:bg-cyan-800/40 data-[state=active]:text-cyan-50"
          >
            LANDMARKS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="physical">
          <PhysicalTab planetStats={planetStats} setPlanetStats={setPlanetStats} />

          {/* Export section moved to Physical tab */}
          <div className="mt-6">
            <ImportExportTab
              planetStats={planetStats}
              setPlanetStats={setPlanetStats}
              classificationId={classificationId}
              author={author}
              setSelectedBiome={setSelectedBiome}
              setCustomColors={setCustomColors}
            />
          </div>
        </TabsContent>

        <TabsContent value="surface">
          <SurfaceTab planetStats={planetStats} setPlanetStats={setPlanetStats} selectedBiome={selectedBiome} />
        </TabsContent>

        <TabsContent value="biome">
          <BiomeTab
            planetStats={planetStats}
            setPlanetStats={setPlanetStats}
            selectedBiome={selectedBiome}
            setSelectedBiome={setSelectedBiome}
            customColors={customColors}
            setCustomColors={setCustomColors}
          />
        </TabsContent>

        <TabsContent value="landmarks">
          <LandmarksTab planetStats={planetStats} setPlanetStats={setPlanetStats} />
        </TabsContent>
      </Tabs>
    </div>
  )
};