import { useState } from 'react'
import { Card } from '@/src/components/ui/card'

interface Structure {
  id: string
  name: string
  maxLevel: number
  type: 'dome' | 'telescope' | 'launcher' | 'solar' | 'hab'
}

const structures: Structure[] = [
  { id: '1', name: 'Habitat Dome', maxLevel: 3, type: 'dome' },
  { id: '2', name: 'Research Station', maxLevel: 3, type: 'hab' },
  { id: '3', name: 'Launch Pad', maxLevel: 3, type: 'launcher' },
  { id: '4', name: 'Solar Array', maxLevel: 3, type: 'solar' },
  { id: '5', name: 'Observatory', maxLevel: 3, type: 'telescope' },
]

export function ColonyStructures() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-900/90 to-orange-950/90 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-orange-100 mb-6">Mars Colony Structures</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {structures.map((structure) => (
            <div key={structure.id} className="space-y-4">
              <h2 className="text-xl font-semibold text-orange-100 text-center">{structure.name}</h2>
              <div className="space-y-4">
                {Array.from({ length: structure.maxLevel }, (_, i) => i + 1).map((level) => (
                  <Card 
                    key={`${structure.id}-${level}`}
                    className="bg-orange-950/50 border-orange-900/50 backdrop-blur-sm hover:bg-orange-950/70 transition-colors"
                  >
                    <div className="p-4">
                      <div className="aspect-square w-full relative mb-4">
                        <StructureIcon type={structure.type} level={level} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-orange-100 font-medium text-center">Level {level}</h3>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-orange-900/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-400 rounded-full"
                              style={{ width: `${(level / structure.maxLevel) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StructureIcon({ type, level }: { type: Structure['type'], level: number }) {
  const scale = 1 + (level - 1) * 0.2

  switch (type) {
    case 'dome':
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-cyan-400">
          <path 
            d={`M10,70 A40,40 0 0,1 90,70`} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={3} 
            style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
          />
          <rect x="15" y="70" width="70" height="20" fill="currentColor" opacity="0.5" />
          <line x1="50" y1="70" x2="50" y2="90" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case 'launcher':
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-cyan-400">
          <path 
            d="M40,90 L50,20 L60,90 Z" 
            fill="currentColor" 
            style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
          />
          <rect x="35" y="85" width="30" height="5" fill="currentColor" opacity="0.5" />
        </svg>
      )
    case 'solar':
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-cyan-400">
          <g style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
            {Array.from({ length: level }, (_, i) => (
              <rect 
                key={i}
                x={25 + i * 20 / level} 
                y="40" 
                width={15 / level} 
                height="40" 
                fill="currentColor" 
                opacity="0.8"
              />
            ))}
          </g>
          <rect x="20" y="80" width="60" height="5" fill="currentColor" />
        </svg>
      )
    case 'telescope':
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-cyan-400">
          {level >= 1 && (
            <g style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
              <circle cx="50" cy="40" r="15" fill="currentColor" opacity="0.8" />
              <line x1="50" y1="55" x2="50" y2="90" stroke="currentColor" strokeWidth="3" />
            </g>
          )}
          {level >= 2 && (
            <path d="M20,60 Q50,20 80,60" fill="none" stroke="currentColor" strokeWidth="2" />
          )}
          {level >= 3 && (
            <>
              <circle cx="20" cy="70" r="10" fill="currentColor" opacity="0.6" />
              <circle cx="80" cy="70" r="10" fill="currentColor" opacity="0.6" />
            </>
          )}
          <rect x="45" y="85" width="10" height="10" fill="currentColor" />
        </svg>
      )
    case 'hab':
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-cyan-400">
          <g style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
            <rect x="30" y="50" width="40" height="30" fill="currentColor" opacity="0.8" />
            <polygon points="30,50 50,30 70,50" fill="currentColor" />
            {level >= 2 && <rect x="10" y="60" width="20" height="20" fill="currentColor" opacity="0.6" />}
            {level >= 3 && <rect x="70" y="60" width="20" height="20" fill="currentColor" opacity="0.6" />}
          </g>
          <rect x="25" y="80" width="50" height="5" fill="currentColor" />
        </svg>
      )
    default:
      return null
  }
}

