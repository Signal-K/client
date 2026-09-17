'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { CloudPattern, CloudConfiguration } from '../../../../../types/Generators/JVH/atmosphere'
import { cloudCompositions } from '../../../../../data/cloud-compositions'
import { Cloud, Wind, TornadoIcon as Hurricane, Waves, Activity } from 'lucide-react'
import { CloudCanvas } from './cloud-canvas'
import { SciFiPanel } from '../../../../ui/styles/sci-fi/panel'
import { SciFiButton } from '../../../../ui/styles/sci-fi/button'
import { ConfigIOPanel } from './configuration'

interface CloudSignalProps {
  classificationConfig?: CloudConfiguration
  classificationId: string
};

export default function CloudClassifier({ classificationConfig, classificationId }: CloudSignalProps) {
  const [selectedPatterns, setSelectedPatterns] = useState<CloudPattern[]>([])
  const [altitude, setAltitude] = useState(500)

  const patterns = [
    { type: 'featureless' as const, icon: <Cloud className="w-5 h-5" />, label: 'Featureless' },
    { type: 'turbulent' as const, icon: <Wind className="w-5 h-5" />, label: 'Turbulent' },
    { type: 'vortex' as const, icon: <Hurricane className="w-5 h-5" />, label: 'Vortex' },
    { type: 'bands' as const, icon: <Waves className="w-5 h-5" />, label: 'Bands' }
  ];

  const togglePattern = (pattern: CloudPattern) => {
    setSelectedPatterns((current) =>
      current.includes(pattern) ? current.filter((p) => p !== pattern) : [...current, pattern]
    );
  };

  const getCompositionAnalysis = () => {
    const analysis = new Set<string>()
    selectedPatterns.forEach((pattern) => {
      switch (pattern) {
        case 'featureless':
          analysis.add('ammonia')
          break
        case 'turbulent':
          analysis.add('ammonia')
          analysis.add('ammoniumHydrosulfide')
          if (altitude > 300) analysis.add('water')
          break
        case 'vortex':
          analysis.add('ammoniumHydrosulfide')
          analysis.add('water')
          break
        case 'bands':
          analysis.add('ammonia')
          analysis.add('ammoniumHydrosulfide')
          break
      }
    })
    return Array.from(analysis)
  }

  const getCurrentConfig = (): CloudConfiguration => ({
    patterns: selectedPatterns,
    altitude,
    timestamp: new Date().toISOString()
  })

  const handleImport = (config: CloudConfiguration) => {
    setSelectedPatterns(config.patterns)
    setAltitude(config.altitude)
  };

  useEffect(() => {
    if (classificationConfig) {
      setSelectedPatterns(classificationConfig.patterns || [])
      setAltitude(classificationConfig.altitude || 500)
    };
  }, [classificationConfig])

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-cyan-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <SciFiPanel className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">Atmospheric Analysis Console</h1>
              <p className="text-sm text-cyan-300/70">Cloud Pattern Classification System v1.0</p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-sm text-cyan-300/70">System Active</span>
            </div>
          </div>
        </SciFiPanel>

        <div className="grid md:grid-cols-2 gap-4">
          <SciFiPanel className="p-4 space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-cyan-400">Pattern Selection</h2>
              <div className="grid grid-cols-2 gap-3">
                {patterns.map(({ type, icon, label }) => (
                  <SciFiButton
                    key={type}
                    active={selectedPatterns.includes(type)}
                    onClick={() => togglePattern(type)}
                    className="flex items-center justify-center gap-2"
                  >
                    {icon}
                    <span>{label}</span>
                  </SciFiButton>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-cyan-400">Altitude Control</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-cyan-300/70">
                  <span>ALT: {altitude} km</span>
                  <span>DEPTH: {altitude > 300 ? 'DEEP' : altitude > 100 ? 'MED' : 'LOW'}</span>
                </div>
                <Slider
                  value={[altitude]}
                  min={0}
                  max={1000}
                  step={10}
                  onValueChange={(value) => setAltitude(value[0])}
                  className="[&>span]:bg-cyan-400"
                />
              </div>
            </div>
          </SciFiPanel>

          <SciFiPanel className="p-4">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">Cloud Formation Display</h2>
            <div className="h-[300px] rounded border border-cyan-500/20 overflow-hidden">
              <CloudCanvas patterns={selectedPatterns} altitude={altitude} />
            </div>
          </SciFiPanel>
        </div>

        <ConfigIOPanel
          currentConfig={getCurrentConfig()}
          onImport={handleImport}
          classificationId={classificationId}
        />

        {selectedPatterns.length > 0 && (
          <SciFiPanel variant="secondary" className="p-4">
            <h2 className="text-lg font-semibold text-red-400 mb-4">Composition Analysis</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {getCompositionAnalysis().map((compositionKey) => {
                  const composition = cloudCompositions[compositionKey]
                  return (
                    <Badge
                      key={compositionKey}
                      variant="outline"
                      className="border-red-500/50 text-red-400"
                    >
                      {composition.name}
                    </Badge>
                  )
                })}
              </div>
              <div className="text-sm text-red-300/70">
                {selectedPatterns.map((pattern) => (
                  <p key={pattern} className="mt-1">
                    {pattern === 'featureless' && 'STATUS: Calm atmospheric region detected'}
                    {pattern === 'turbulent' && 'WARNING: Strong atmospheric activity present'}
                    {pattern === 'vortex' && 'ALERT: Deep storm system identified'}
                    {pattern === 'bands' && 'INFO: Zonal jet streams observed'}
                  </p>
                ))}
              </div>
            </div>
          </SciFiPanel>
        )}
      </div>
    </div>
  );
};