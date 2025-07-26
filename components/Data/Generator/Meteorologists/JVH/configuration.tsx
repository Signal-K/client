'use client'

import { useState } from 'react'
import { SciFiPanel } from '@/components/ui/styles/sci-fi/panel'
import { SciFiButton } from '@/components/ui/styles/sci-fi/button'
import { Textarea } from '@/components/ui/textarea'
import { CloudConfiguration } from '@/types/Generators/JVH/atmosphere'
import { Download, Upload, AlertCircle } from 'lucide-react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface ConfigIOPanelProps {
  currentConfig: CloudConfiguration
  classificationId: string
  onImport: (config: CloudConfiguration) => void
};

export function ConfigIOPanel({ currentConfig, classificationId, onImport }: ConfigIOPanelProps) {
  const supabase = useSupabaseClient()

  const [importText, setImportText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const exportConfig = () => {
    const configString = JSON.stringify(currentConfig, null, 2)
    setImportText(configString)
    setError(null)
  }

  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!classificationId) {
      console.error('Classification ID not found.')
      return
    }

    setExporting(true)
    try {
      const { data, error } = await supabase
        .from("classifications")
        .select('classificationConfiguration')
        .eq('id', classificationId)
        .single()

      if (error) throw error

      const currentConfiguration = data?.classificationConfiguration || {}
      const cloudData = currentConfiguration.cloudData || {}

      // Combine the new fields with cloudData without nested errors
      const updatedConfig = {
        ...cloudData, // Keep the original cloud data
        patterns: currentConfig.patterns || [], // Add patterns
        altitude: currentConfig.altitude || 500, // Add altitude
        timestamp: currentConfig.timestamp || new Date().toISOString(), // Add timestamp
      }

      const { error: updateError } = await supabase
        .from("classifications")
        .update({
          classificationConfiguration: updatedConfig
        })
        .eq('id', classificationId)

      if (updateError) throw updateError

      alert('Cloud data exported successfully!')
    } catch (err) {
      console.error('Error exporting cloud data:', err)
      alert('Failed to export cloud data.')
    } finally {
      setExporting(false)
    }

    const configString = JSON.stringify(currentConfig, null, 2)
    setImportText(configString)
    setError(null)
  }

  const importConfig = () => {
    try {
      const config = JSON.parse(importText) as CloudConfiguration

      if (!config.patterns || !Array.isArray(config.patterns)) {
        throw new Error('Invalid patterns configuration')
      }
      if (typeof config.altitude !== 'number' || config.altitude < 0 || config.altitude > 1000) {
        throw new Error('Invalid altitude value')
      }
      if (!config.timestamp) {
        throw new Error('Missing timestamp')
      }

      onImport(config)
      setError(null)
    } catch (err) {
      setError('Invalid configuration format')
    }
  }

  return (
    <SciFiPanel className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cyan-400">Configuration Transfer</h2>
          <div className="flex gap-2">
            <SciFiButton onClick={handleExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </SciFiButton>
            <SciFiButton
              onClick={importConfig}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </SciFiButton>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm text-cyan-300/70">Current Configuration</h3>
          <pre className="font-mono text-sm bg-slate-900 text-cyan-50 p-4 rounded">
            {JSON.stringify(currentConfig, null, 2)}
          </pre>
        </div>

        <Textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste configuration data here..."
          className="font-mono text-sm h-32 bg-slate-900 border-cyan-500/20 text-cyan-50 placeholder:text-cyan-500/50"
        />

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </SciFiPanel>
  );
};