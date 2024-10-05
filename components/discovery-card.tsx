'use client'

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Users, Globe } from 'lucide-react'

interface Collaborator {
  name: string
  avatar: string
}

interface KeyStat {
  label: string
  value: string
}

interface DiscoveryCardProps {
  name: string
  type: string
  profileImage?: string
  discoveredOn: string
  collaborators: Collaborator[]
  parentAnomaly: string
  keyStats: KeyStat[]
}

const generateImagePlaceholder = (name: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 200
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = `hsl(${Math.random() * 360}, 70%, 80%)`
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.font = 'bold 80px Arial'
    context.fillStyle = 'white'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText((name && name.length > 0) ? name.charAt(0).toUpperCase() : '?', canvas.width / 2, canvas.height / 2)
  }
  return canvas.toDataURL()
}

export function DiscoveryCardComponent({
  name = 'Unnamed Discovery',
  type = 'Unknown',
  profileImage,
  discoveredOn = 'Unknown',
  collaborators = [],
  parentAnomaly = 'Unknown',
  keyStats = []
}: DiscoveryCardProps) {
  const imageUrl = profileImage || generateImagePlaceholder(name)

  return (
    <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 overflow-hidden relative border-2 border-slate-300 rounded-xl shadow-lg">
      <CardContent className="p-6 flex">
        <div className="w-1/3 pr-4 border-r border-slate-300">
          <div className="aspect-square rounded-lg overflow-hidden mb-4 shadow-md">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{name}</h2>
          <Badge variant="outline" className="bg-slate-800 text-white">
            {type}
          </Badge>
        </div>
        <div className="w-2/3 pl-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-slate-600" />
              <span className="text-sm">Discovered on: {discoveredOn}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-slate-600" />
              <span className="text-sm">Parent Anomaly: {parentAnomaly}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-semibold">Collaborators:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {collaborators.length > 0 ? collaborators.map((collaborator, index) => (
                  <div key={index} className="flex items-center bg-slate-300 rounded-full px-2 py-1">
                    <img src={collaborator.avatar} alt={collaborator.name} className="w-6 h-6 rounded-full mr-2" />
                    <span className="text-xs">{collaborator.name}</span>
                  </div>
                )) : (
                  <span className="text-sm text-slate-600">No collaborators</span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Key Stats</h3>
            <div className="grid grid-cols-2 gap-2">
              {keyStats.length > 0 ? keyStats.map((stat, index) => (
                <div key={index} className="bg-slate-300 p-2 rounded-lg">
                  <p className="text-xs text-slate-600">{stat.label}</p>
                  <p className="text-sm font-semibold">{stat.value}</p>
                </div>
              )) : (
                <div className="col-span-2 bg-slate-300 p-2 rounded-lg">
                  <p className="text-sm text-slate-600">No key stats available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}