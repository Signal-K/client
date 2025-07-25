"use client"

import { useState, useEffect } from "react"
import SimplePlanetViewer from "./planetViewer-simple"
import { type PlanetConfig, defaultPlanetConfig } from "@/src/features/planets/physics";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function SimplePlanetPage() {
  const [planetConfig, setPlanetConfig] = useState<PlanetConfig>(defaultPlanetConfig)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [importText, setImportText] = useState("")
  const [importError, setImportError] = useState("")

  const handleConfigChange = (newConfig: Partial<PlanetConfig>) => {
    setPlanetConfig((prev) => ({ ...prev, ...newConfig }))
  }

  const handleImport = () => {
    try {
      const config = JSON.parse(importText)
      setPlanetConfig(config)
      setImportDialogOpen(false)
      setImportError("")
      setImportText("")
    } catch (error) {
      setImportError("Invalid JSON configuration")
    }
  }

  // Listen for custom events from the settings panel
  useEffect(() => {
    const handleOpenImport = () => setImportDialogOpen(true)
    const handleOpenExport = () => setExportDialogOpen(true)

    window.addEventListener("open-simple-import-dialog", handleOpenImport)
    window.addEventListener("open-simple-export-dialog", handleOpenExport)

    return () => {
      window.removeEventListener("open-simple-import-dialog", handleOpenImport)
      window.removeEventListener("open-simple-export-dialog", handleOpenExport)
    }
  }, [])

  const exportConfig = JSON.stringify(planetConfig, null, 2)

  return (
    <main className="flex-col">
      <div className="">
        <SimplePlanetViewer planetConfig={planetConfig} onConfigChange={handleConfigChange} />
      </div>
    </main>
  );
};