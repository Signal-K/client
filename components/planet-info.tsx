import { Sun, Thermometer, Droplets } from 'lucide-react'
import { Planet } from '../types/greenhouse'

interface PlanetInfoProps {
  planet: Planet;
}

export function PlanetInfo({ planet }: PlanetInfoProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#2C4F64]">{planet.name}</h2>
          <p className="text-sm text-[#2C4F64]/70">Orbiting {planet.starName}</p>
        </div>
        <Sun className="w-8 h-8 text-[#FFE3BA]" />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#FFE3BA]/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-4 h-4 text-[#2C4F64]" />
            <span className="text-sm text-[#2C4F64]/70">Temperature</span>
          </div>
          <p className="text-lg font-semibold text-[#2C4F64]">{planet.temperature}°C</p>
        </div>
        
        <div className="bg-[#85DDA2]/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-4 h-4 text-[#2C4F64]" />
            <span className="text-sm text-[#2C4F64]/70">Humidity</span>
          </div>
          <p className="text-lg font-semibold text-[#2C4F64]">{planet.humidity}%</p>
        </div>
        
        <div className="bg-[#FFE3BA]/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-4 h-4 text-[#2C4F64]" />
            <span className="text-sm text-[#2C4F64]/70">Atmosphere</span>
          </div>
          <p className="text-lg font-semibold text-[#2C4F64]">{planet.atmosphere}%</p>
        </div>
      </div>
    </div>
  )
}

