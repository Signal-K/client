import { useState } from 'react'
import { PlantMapData } from '../types/greenhouse'
import { motion } from 'framer-motion'

interface PlantMapViewProps {
  plants: PlantMapData[];
  onPlantClick: (plant: PlantMapData) => void;
}

export function PlantMapView({ plants, onPlantClick }: PlantMapViewProps) {
  const [hoveredPlant, setHoveredPlant] = useState<string | null>(null)

  return (
    <div className="relative w-full h-[300px] bg-[#85DDA2]/20 rounded-xl overflow-hidden">
      {/* Soil */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-[#85DDA2]/40" />
      
      {/* Walls */}
      <div className="absolute top-0 left-0 bottom-0 w-4 bg-[#2C4F64]/20" />
      <div className="absolute top-0 right-0 bottom-0 w-4 bg-[#2C4F64]/20" />
      <div className="absolute top-0 left-0 right-0 h-4 bg-[#2C4F64]/20" />
      
      {/* Contour lines */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-t border-[#2C4F64]/10"
          style={{ top: `${i * 20}%` }}
        />
      ))}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-[#2C4F64]/10"
          style={{ left: `${i * 20}%` }}
        />
      ))}
      
      {/* Plants */}
      {plants.map((plant) => (
        <motion.div
          key={plant.id}
          className="absolute cursor-pointer"
          style={{
            left: `${plant.position.x}%`,
            top: `${plant.position.y}%`,
            zIndex: Math.floor(plant.position.z * 100),
          }}
          whileHover={{ scale: 1.1 }}
          onClick={() => onPlantClick(plant)}
          onMouseEnter={() => setHoveredPlant(plant.id)}
          onMouseLeave={() => setHoveredPlant(null)}
        >
          <div className="w-8 h-8 bg-[#2C4F64] rounded-full flex items-center justify-center">
            <span className="text-white text-xs">{plant.name[0]}</span>
          </div>
          {hoveredPlant === plant.id && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white p-2 rounded shadow-md">
              <p className="text-xs font-medium text-[#2C4F64]">{plant.name}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

