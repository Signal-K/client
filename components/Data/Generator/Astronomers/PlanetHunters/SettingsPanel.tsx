"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PlanetStats } from "@/lib/planet-physics";
import { PhysicalTab } from "./Settings/physical-tab";
import { SurfaceTab } from "./Settings/surface-tab";
import { BiomeTab } from "./Settings/biome-tab";
import { LandmarksTab } from "./Settings/landmarks-tab";
import { ImportExportTab } from "./Settings/import-export-tab";

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
    <div className="absolute top-0 left-0 h-full w-96 bg-black/90 text-green-400 p-6 overflow-y-auto font-mono border-r border-green-500/30">
      <h2 className="text-2xl font-bold mb-6 tracking-wider border-b border-green-500/30 pb-2">PLANET SETTINGS</h2>

      <div className="mb-6 p-3 bg-black/60 border border-green-500/30 rounded-md">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-green-500/70">CLASSIFICATION:</div>
          <div>{classificationId}</div>
          <div className="text-green-500/70">AUTHOR:</div>
          <div>{author}</div>
        </div>
      </div>

      <Tabs defaultValue="physical" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-black border border-green-500/30">
          <TabsTrigger
            value="physical"
            className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300"
          >
            PHYSICAL
          </TabsTrigger>
          <TabsTrigger
            value="surface"
            className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300"
          >
            SURFACE
          </TabsTrigger>
          <TabsTrigger value="biome" className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300">
            BIOME
          </TabsTrigger>
          <TabsTrigger
            value="landmarks"
            className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300"
          >
            LANDMARKS
          </TabsTrigger>
          <TabsTrigger
            value="import-export"
            className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300"
          >
            I/O
          </TabsTrigger>
        </TabsList>

        <TabsContent value="physical">
          <PhysicalTab planetStats={planetStats} setPlanetStats={setPlanetStats} />
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

        <TabsContent value="import-export">
          <ImportExportTab
            planetStats={planetStats}
            setPlanetStats={setPlanetStats}
            classificationId={classificationId}
            author={author}
            setSelectedBiome={setSelectedBiome}
            setCustomColors={setCustomColors}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
};