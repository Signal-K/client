import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PlanetStats } from '@/utils/planet-physics'

interface PlanetImportExportProps {
  stats: PlanetStats
  onImport: (importedStats: Partial<PlanetStats>) => void
}

export function PlanetImportExport({ stats, onImport }: PlanetImportExportProps) {
  const [importExportText, setImportExportText] = useState('')

  const handleExport = () => {
    const exportText = `radius: ${stats.radius.toFixed(2)}
mass: ${stats.mass.toFixed(2)}`
    setImportExportText(exportText)
  }

  const handleImport = () => {
    const lines = importExportText.split('\n')
    const importedStats: Partial<PlanetStats> = {}

    lines.forEach(line => {
      const [key, value] = line.split(':').map(part => part.trim())
      if (key === 'radius' || key === 'mass') {
        importedStats[key] = parseFloat(value)
      }
    })

    if (Object.keys(importedStats).length > 0) {
      onImport(importedStats)
    }
  }

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Import/Export Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={importExportText}
          onChange={(e) => setImportExportText(e.target.value)}
          placeholder="Paste settings here to import, or click Export to get current settings"
          rows={4}
        />
        <div className="flex justify-between">
          <Button onClick={handleExport}>Export</Button>
          <Button onClick={handleImport}>Import</Button>
        </div>
      </CardContent>
    </Card>
  )
}

