import Image from 'next/image'
import { useState } from 'react'
import { ArrowLeft, Droplets, Sun, Wind, MessageSquare, Image as ImageIcon, PlusCircle } from 'lucide-react'
import { Plant } from '../types/greenhouse'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from 'framer-motion'

interface PlantDetailsProps {
  plant: Plant;
  onBack: () => void;
  onWater: (plantId: string) => void;
  onAddStat: (plantId: string, statName: string, statValue: number) => void;
}

export function PlantDetails({ plant, onBack, onWater, onAddStat }: PlantDetailsProps) {
  const [isWatering, setIsWatering] = useState(false)
  const [newStatName, setNewStatName] = useState('')
  const [newStatValue, setNewStatValue] = useState('')

  const handleWater = () => {
    setIsWatering(true)
    onWater(plant.id)
    setTimeout(() => setIsWatering(false), 2000)
  }

  const handleAddStat = () => {
    if (newStatName && newStatValue) {
      onAddStat(plant.id, newStatName, parseFloat(newStatValue))
      setNewStatName('')
      setNewStatValue('')
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Plants
      </Button>
      
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="relative h-48">
          <Image
            src={plant.image}
            alt={plant.name}
            fill
            className="object-cover"
          />
          <AnimatePresence>
            {isWatering && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute inset-0 bg-blue-500/30 flex items-center justify-center"
              >
                <Droplets className="w-16 h-16 text-blue-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-[#2C4F64] mb-1">{plant.name}</h2>
          <p className="text-[#2C4F64]/70 mb-4">{plant.species}</p>
          
          <Tabs defaultValue="stats" className="w-full">
            <TabsList>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>
            <TabsContent value="stats">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#FFE3BA]/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sun className="w-4 h-4 text-[#2C4F64]" />
                    <span className="text-sm text-[#2C4F64]/70">Oxygen Production</span>
                  </div>
                  <p className="text-lg font-semibold text-[#2C4F64]">{plant.oxygenProduction} units/day</p>
                </div>
                
                <div className="bg-[#85DDA2]/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-[#2C4F64]" />
                    <span className="text-sm text-[#2C4F64]/70">Last Watered</span>
                  </div>
                  <p className="text-lg font-semibold text-[#2C4F64]">{plant.lastWatered}</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-[#2C4F64]">Health</span>
                    <span className="text-sm font-medium text-[#2C4F64]">
                      {plant.status === 'healthy' ? 'Good' : plant.status === 'warning' ? 'Fair' : 'Poor'}
                    </span>
                  </div>
                  <Progress 
                    value={plant.status === 'healthy' ? 100 : plant.status === 'warning' ? 50 : 25} 
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-[#2C4F64]">Water Level</span>
                    <span className="text-sm font-medium text-[#2C4F64]">{plant.waterLevel}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={plant.waterLevel} className="h-2" />
                    <AnimatePresence>
                      {isWatering && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          exit={{ width: 0 }}
                          transition={{ duration: 1 }}
                          className="absolute inset-0 bg-blue-500/50 rounded-full"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="New stat name"
                  value={newStatName}
                  onChange={(e) => setNewStatName(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Value"
                  value={newStatValue}
                  onChange={(e) => setNewStatValue(e.target.value)}
                />
                <Button onClick={handleAddStat}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="comments">
              <div className="space-y-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-[#2C4F64]">This plant is growing well!</p>
                  <p className="text-xs text-[#2C4F64]/70 mt-1">User123 - 2 days ago</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-[#2C4F64]">Needs more water.</p>
                  <p className="text-xs text-[#2C4F64]/70 mt-1">Gardener456 - 1 day ago</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="media">
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 space-y-2">
            <Button 
              className="w-full bg-[#85DDA2] text-white hover:bg-[#85DDA2]/90"
              onClick={handleWater}
              disabled={isWatering}
            >
              <Droplets className="w-4 h-4 mr-2" />
              {isWatering ? 'Watering...' : 'Water Plant'}
            </Button>
            
            <Button variant="outline" className="w-full">
              <Wind className="w-4 h-4 mr-2" />
              Toggle Weather Simulation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

