"use client"
import { useState } from "react"
import type { PlanetConfig } from "@/app/planets/paint/[id]/planet-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Download, Upload, Save } from "lucide-react"
import BasicSettings from "./Settings/BasicSettings";
import TerrainSettings from "./Settings/TerrainSettings";
import ColorSettings from "./Settings/ColourSettings";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface SettingsPanelProps {
  planetConfig: PlanetConfig
  onChange: (config: Partial<PlanetConfig>) => void
  classificationId?: number
}

export default function SettingsPanel({ planetConfig, onChange, classificationId }: SettingsPanelProps) {
  const supabase = useSupabaseClient();

  const [importText, setImportText] = useState("")
  const [importError, setImportError] = useState("")
  const [showExport, setShowExport] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const handleImport = () => {
    if (!importText.trim()) return

    try {
      const config = JSON.parse(importText)
      onChange(config)
      setImportText("")
      setImportError("")
    } catch (error) {
      setImportError("Invalid JSON configuration")
    }
  }

  const handleSave = async () => {
    if (!classificationId) return

    setSaveStatus("saving")

    try {
      // First, fetch the existing classification configuration
      const { data: existingData, error: fetchError } = await supabase
        .from("classifications")
        .select("classificationConfiguration")
        .eq("id", classificationId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      // Merge the planet configuration with existing configuration
      const updatedConfig = {
        ...existingData.classificationConfiguration,
        planetConfiguration: planetConfig,
      }

      // Update the classification with the merged configuration
      const { error: updateError } = await supabase
        .from("classifications")
        .update({ classificationConfiguration: updatedConfig })
        .eq("id", classificationId)

      if (updateError) {
        throw updateError
      }

      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (error) {
      console.error("Error saving planet configuration:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  const exportConfig = JSON.stringify(planetConfig, null, 2)

  return (
    <div className="space-y-6 bg-slate-900 text-slate-100">
      {/* Import/Export/Save Buttons */}
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-2 bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          {classificationId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="flex items-center gap-2 bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
            >
              <Save className="h-4 w-4" />
              {saveStatus === "saving" ? "Saving..." : "Save"}
            </Button>
          )}

          {saveStatus === "saved" && <span className="text-green-400 text-sm">Saved!</span>}
          {saveStatus === "error" && <span className="text-red-400 text-sm">Error saving</span>}
        </div>

        {/* Import Section */}
        <div className="bg-slate-800 p-4 rounded-md border border-slate-700">
          <Label className="text-slate-200 text-sm font-medium">Import Configuration</Label>
          <div className="mt-2 space-y-2">
            <Textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value)
                setImportError("")
              }}
              placeholder="Paste JSON configuration here..."
              className="min-h-[100px] bg-slate-700 border-slate-600 text-slate-100"
            />
            {importError && <p className="text-red-400 text-xs">{importError}</p>}
            <Button onClick={handleImport} disabled={!importText.trim()} size="sm" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Export Section */}
        {showExport && (
          <div className="bg-slate-800 p-4 rounded-md border border-slate-700">
            <Label className="text-slate-200 text-sm font-medium">Export Configuration</Label>
            <div className="mt-2 space-y-2">
              <Textarea
                value={exportConfig}
                readOnly
                className="min-h-[150px] font-mono text-xs bg-slate-700 border-slate-600 text-slate-100"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(exportConfig)
                  setShowExport(false)
                }}
                size="sm"
                className="w-full"
              >
                Copy & Close
              </Button>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4 bg-slate-800">
          <TabsTrigger value="basic" className="data-[state=active]:bg-slate-700">
            Basic
          </TabsTrigger>
          <TabsTrigger value="terrain" className="data-[state=active]:bg-slate-700">
            Terrain
          </TabsTrigger>
          <TabsTrigger value="colors" className="data-[state=active]:bg-slate-700">
            Colors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <BasicSettings planetConfig={planetConfig} onChange={onChange} />
        </TabsContent>

        <TabsContent value="terrain" className="space-y-6">
          <TerrainSettings planetConfig={planetConfig} onChange={onChange} />
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <ColorSettings planetConfig={planetConfig} onChange={onChange} />
        </TabsContent>
      </Tabs>
    </div>
  )
};