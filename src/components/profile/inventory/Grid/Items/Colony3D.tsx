import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Structures } from './Structures'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { useState } from 'react'
import Image from 'next/image'
// import { HexColorPicker } from "react-colorful";

export type StructureInfo = {
  id: string
  name: string
  description: string
  level: number
  maxLevel: number
  status: 'operational' | 'upgrading' | 'maintenance'
  color: string
};

export function Colony3D() {
  const [structures, setStructures] = useState<Record<string, StructureInfo>>({
    habitat: {
      id: 'habitat',
      name: "Habitat Dome",
      description: "Primary living quarters for colony inhabitants. Features advanced life support systems and radiation shielding.",
      level: 3,
      maxLevel: 5,
      status: "operational",
      color: "#e0e0e0"
    },
    research: {
      id: 'research',
      name: "Research Station",
      description: "Advanced facility for conducting scientific experiments and analyzing Martian samples.",
      level: 2,
      maxLevel: 5,
      status: "operational",
      color: "#c0c0c0"
    },
    solar: {
      id: 'solar',
      name: "Solar Array",
      description: "High-efficiency solar panels providing primary power generation for the colony.",
      level: 2,
      maxLevel: 5,
      status: "maintenance",
      color: "#4169E1"
    },
    observatory: {
      id: 'observatory',
      name: "Observatory",
      description: "Deep space observation facility with advanced tracking and communication capabilities.",
      level: 2,
      maxLevel: 5,
      status: "operational",
      color: "#d0d0d0"
    },
    launch: {
      id: 'launch',
      name: "Launch Pad",
      description: "Vertical launch and landing facility for interplanetary vessels and supply missions.",
      level: 1,
      maxLevel: 5,
      status: "upgrading",
      color: "#808080"
    }
  })
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleLevelChange = (id: string, change: number) => {
    setStructures(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        level: Math.max(1, Math.min(prev[id].maxLevel, prev[id].level + change))
      }
    }))
  }

  const handleColorChange = (id: string, color: string) => {
    setStructures(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        color
      }
    }))
  }

  return (
    <div className="w-full h-screen relative">
      
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Canvas 
          shadows 
          camera={{ 
            position: [0, 10, 25], 
            fov: 35,
            rotation: [0, 0, 0],
          }}
        >
          {/* <Environment preset="sunset" /> */}
          
          {/* Structures */}
          <Structures 
            structures={structures}
            onSelectStructure={setSelectedStructure} 
          />

          {/* Lighting */}
          <directionalLight
            position={[10, 10, 10]}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            intensity={1.5}
          />
          <ambientLight intensity={0.4} />
        </Canvas>
      </div>

      <Dialog open={!!selectedStructure} onOpenChange={() => setSelectedStructure(null)}>
        <DialogContent className="bg-gray-900/95 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-cyan-400">
              {selectedStructure ? structures[selectedStructure].name : ''}
            </DialogTitle>
          </DialogHeader>
          {selectedStructure && (
            <div className="space-y-6">
              <p className="text-gray-300">{structures[selectedStructure].description}</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Level</p>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLevelChange(selectedStructure, -1)}
                      disabled={structures[selectedStructure].level <= 1}
                    >
                      -
                    </Button>
                    <span className="text-lg font-semibold text-cyan-400">
                      {structures[selectedStructure].level} / {structures[selectedStructure].maxLevel}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLevelChange(selectedStructure, 1)}
                      disabled={structures[selectedStructure].level >= structures[selectedStructure].maxLevel}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="text-lg font-semibold text-cyan-400">
                    {structures[selectedStructure].status}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Accent Color</p>
                  <div className="relative">
                    <Button 
                      variant="outline"
                      className="w-full h-10"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      style={{ backgroundColor: structures[selectedStructure].color }}
                    />
                    {/* {showColorPicker && (
                      <div className="absolute top-full mt-2 z-50">
                        <HexColorPicker 
                          color={structures[selectedStructure].color} 
                          onChange={(color) => handleColorChange(selectedStructure, color)}
                        />
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

