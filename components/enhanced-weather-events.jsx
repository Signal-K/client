'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Cloud, Sun, Zap, Droplets, Bird, Mountain, Star, Settings } from 'lucide-react'
import { PlanetarySystem } from './(scenes)/planetScene/orbitals/system'

const cloudTypes = ['cumulus', 'vortex', 'turbulent', 'bands', 'martian']

const initialEventTypes = {
  rain: { active: true, amount: 50, speed: 1, color: '#68a9ff' },
  lightning: { active: false, frequency: 0.2, color: '#ffff00', width: 2 },
  clouds: { active: false, amount: 5, type: 'cumulus', color: '#ffffff' },
  clearSky: { active: false },
  birds: { active: false, amount: 3, speed: 1 },
  volcano: { active: false, amount: 3, intensity: 0.5 },
  asteroid: { active: false, frequency: 0.1, size: 1 },
  shootingStar: { active: false, frequency: 0.3 }
};

const CloudShape = ({ type, color }) => {
  switch (type) {
    case 'vortex':
      return (
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10C30 10 10 30 10 50C10 70 30 90 50 90C70 90 90 70 90 50C90 30 70 10 50 10ZM50 80C35 80 20 65 20 50C20 35 35 20 50 20C65 20 80 35 80 50C80 65 65 80 50 80Z" fill={color}/>
        </svg>
      )
    case 'turbulent':
      return (
        <svg width="100" height="50" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 25C20 0 40 50 60 25C80 0 100 50 100 25" stroke={color} strokeWidth="10"/>
        </svg>
      )
    case 'bands':
      return (
        <svg width="100" height="50" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="10" fill={color}/>
          <rect y="20" width="100" height="10" fill={color}/>
          <rect y="40" width="100" height="10" fill={color}/>
        </svg>
      )
    case 'martian':
      return (
        <svg width="100" height="50" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 25C30 15 70 35 90 25" stroke={color} strokeWidth="2"/>
          <path d="M0 40C20 30 80 50 100 40" stroke="#FFD700" strokeWidth="2"/>
          <path d="M20 10C40 0 60 20 80 10" stroke="#87CEEB" strokeWidth="2"/>
        </svg>
      )
    default: // cumulus
      return <Cloud size={80} color={color} />
  }
}

export default function EnhancedWeatherEvents() {
  const [events, setEvents] = useState(initialEventTypes)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [importExportText, setImportExportText] = useState('')
  const [cloudPositions, setCloudPositions] = useState([])
  const [pooledWater, setPooledWater] = useState(0)

  const updateEvent = (type, property, value) => {
    setEvents(prev => ({
      ...prev,
      [type]: { ...prev[type], [property]: value }
    }))
  }

  const exportSettings = () => {
    setImportExportText(JSON.stringify(events, null, 2))
  }

  const importSettings = () => {
    try {
      const importedSettings = JSON.parse(importExportText)
      setEvents(importedSettings)
    } catch (error) {
      console.error("Error parsing imported settings:", error)
      alert("Invalid JSON format. Please check your input.")
    }
  }

  useEffect(() => {
    // Generate cloud positions when cloud settings change
    if (events.clouds.active) {
      const newPositions = Array.from({ length: events.clouds.amount }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 80 // Reduced to 80% to keep clouds mostly in the upper part
      }))
      setCloudPositions(newPositions)
    }
  }, [events.clouds.active, events.clouds.amount])

  useEffect(() => {
    // Simulate water pooling
    if (events.rain.active) {
      const poolingInterval = setInterval(() => {
        setPooledWater(prev => Math.min(prev + 0.1, 4))
      }, 1000)
      return () => clearInterval(poolingInterval)
    } else {
      const drainInterval = setInterval(() => {
        setPooledWater(prev => Math.max(prev - 0.1, 0))
      }, 1000)
      return () => clearInterval(drainInterval)
    }
  }, [events.rain.active])

  return (
    <div className="relative w-full h-full mt-3 overflow-hidden">
      <PlanetarySystem />

      {/* Clear sky (sun) */}
      {events.clearSky.active && (
        <motion.div
          className="absolute top-[5%] right-[5%] w-[10%] h-[10%] bg-yellow-300 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Clouds */}
      {events.clouds.active && (
        <AnimatePresence>
          {cloudPositions.map((position, i) => (
            <motion.div
              key={`cloud-${i}`}
              className="absolute"
              initial={{ x: `${position.x}%`, y: `${position.y}%`, opacity: 0 }}
              animate={{ 
                x: [`${position.x}%`, `${(position.x + 100) % 200}%`],
                opacity: 1
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              }}
              style={{
                filter: `blur(${Math.random() * 2 + 1}px)`,
              }}
            >
              <CloudShape type={events.clouds.type} color={events.clouds.color} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Rain */}
      {events.rain.active && (
        <div className="absolute inset-0">
          {[...Array(events.rain.amount)].map((_, i) => (
            <motion.div
              key={`raindrop-${i}`}
              className="absolute w-[0.1%] h-[2%]"
              initial={{ top: '-2%', left: `${Math.random() * 100}%` }}
              animate={{ top: '100%' }}
              transition={{
                duration: 1 / events.rain.speed,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * (1 / events.rain.speed)
              }}
              style={{ backgroundColor: events.rain.color }}
            />
          ))}
        </div>
      )}

      {/* Lightning */}
      {events.lightning.active && (
        <AnimatePresence>
          {Math.random() < events.lightning.frequency && (
            <motion.svg
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, repeat: 1, repeatType: "reverse" }}
            >
              <motion.path
                d={`M${50 + Math.random() * 20},${ Math.random() * 20} 
                   Q${55 + Math.random() * 10},${20 + Math.random() * 20} ${60 + Math.random() * 20},${40 + Math.random() * 20}
                   T${70 + Math.random() * 20},${60 + Math.random() * 20}
                   L${65 + Math.random() * 30},${100 + Math.random() * 20}`}
                stroke={events.lightning.color}
                strokeWidth={events.lightning.width}
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      )}

      {/* Birds */}
      {events.birds.active && (
        <AnimatePresence>
          {[...Array(events.birds.amount)].map((_, i) => (
            <motion.div
              key={`bird-${i}`}
              className="absolute"
              initial={{ x: -50, y: Math.random() * window.innerHeight }}
              animate={{ 
                x: ['-10%', '110%'],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight + 50,
                  Math.random() * window.innerHeight - 50,
                  Math.random() * window.innerHeight
                ]
              }}
              transition={{
                duration: 20 / events.birds.speed,
                repeat: Infinity,
                delay: i * (5 / events.birds.speed),
                ease: "linear"
              }}
            >
              <Bird size={20} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Volcano */}
      {events.volcano.active && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-around" style={{ height: '20%' }}>
          {[...Array(events.volcano.amount)].map((_, i) => (
            <div key={`volcano-${i}`} className="relative h-full">
              <div className="absolute bottom-0 w-full aspect-square bg-gray-700 rounded-full transform translate-y-1/2" />
              <motion.div
                className="absolute bottom-full left-1/2 w-[10%] bg-red-500 origin-bottom"
                style={{ height: '100%', translateX: '-50%' }}
                animate={{ scaleY: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Asteroid */}
      {events.asteroid.active && (
        <AnimatePresence>
          {Math.random() < events.asteroid.frequency && (
            <motion.div
              className="absolute"
              initial={{ top: -20, left: Math.random() * 100 + '%' }}
              animate={{ top: '100%', left: Math.random() * 100 + '%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              style={{ 
                width: `${events.asteroid.size * 5}%`,
                height: `${events.asteroid.size * 5}%`,
                backgroundColor: ['#8B4513', '#A0522D', '#D2691E'][Math.floor(Math.random() * 3)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                boxShadow: 'inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -2px -2px 5px rgba(0, 0, 0, 0.5)'
              }}
            />
          )}
        </AnimatePresence>
      )}

      {/* Shooting Star */}
      {events.shootingStar.active && (
        <AnimatePresence>
          {Math.random() < events.shootingStar.frequency && (
            <motion.div
              className="absolute w-0.5 h-0.5 bg-white"
              initial={{ top: 0, left: Math.random() * 100 + '%' }}
              animate={{
                top: ['0%', '30%'],
                left: [null, `${Math.random() * 30 + 70}%`],
                width: ['2px', '0px'],
                height: ['2px', '0px']
              }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
      )}

      {/* Control Button */}
      <Button
        className="absolute bottom-[2%] right-[2%] p-2 rounded-full"
        onClick={() => setIsModalOpen(true)}
        variant="outline"
      >
        <Settings className="w-6 h-6" />
        <span className="sr-only">Open Control Panel</span>
      </Button>

      {/* Control Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2  left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-bold mb-4">Weather & Event Controls</Dialog.Title>
            {Object.entries(events).map(([type, settings]) => (
              <div key={type} className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="capitalize">{type}</span>
                  <Switch
                    checked={settings.active}
                    onCheckedChange={(checked) => updateEvent(type, 'active', checked)}
                  />
                </div>
                {Object.entries(settings).map(([prop, value]) => {
                  if (prop === 'active') return null
                  if (typeof value === 'number') {
                    return (
                      <div key={prop} className="mt-2">
                        <span className="text-sm capitalize">{prop}</span>
                        <Slider
                          value={[value]}
                          onValueChange={([newValue]) => updateEvent(type, prop, newValue)}
                          min={0}
                          max={prop === 'frequency' ? 1 : 100}
                          step={prop === 'frequency' ? 0.1 : 1}
                        />
                      </div>
                    )
                  }
                  if (prop === 'color') {
                    return (
                      <div key={prop} className="mt-2">
                        <span className="text-sm capitalize">{prop}</span>
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => updateEvent(type, prop, e.target.value)}
                          className="w-full h-8 rounded"
                        />
                      </div>
                    )
                  }
                  if (prop === 'type' && type === 'clouds') {
                    return (
                      <div key={prop} className="mt-2">
                        <span className="text-sm capitalize">{prop}</span>
                        <Select
                          value={value}
                          onValueChange={(newValue) => updateEvent(type, prop, newValue)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {cloudTypes.map((cloudType) => (
                              <SelectItem key={cloudType} value={cloudType}>
                                {cloudType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            ))}
            <div className="mt-4">
              <Textarea
                value={importExportText}
                onChange={(e) => setImportExportText(e.target.value)}
                placeholder="Paste settings JSON here..."
                rows={5}
              />
            </div>
            <div className="flex justify-between mt-4">
              <Button onClick={exportSettings}>
                Export Settings
              </Button>
              <Button onClick={importSettings}>
                Import Settings
              </Button>
            </div>
            <Dialog.Close asChild>
              <Button className="mt-4 w-full">Close</Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}