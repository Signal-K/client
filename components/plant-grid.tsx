import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import { Plant } from '../types/greenhouse'

interface PlantGridProps {
  plants: Plant[];
  onPlantClick: (plant: Plant) => void;
};

export function PlantGrid({ plants, onPlantClick }: PlantGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {plants.map((plant) => (
        <div 
          key={plant.id} 
          className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer transition-transform hover:scale-105"
          onClick={() => onPlantClick(plant)}
        >
          <div className="relative h-48">
            <Image
              src={plant.image}
              alt={plant.name}
              fill
              className="object-cover"
            />
            {plant.status !== 'healthy' && (
              <div className="absolute top-2 right-2">
                <AlertCircle className={`w-5 h-5 ${
                  plant.status === 'warning' ? 'text-[#FFE3BA]' : 'text-red-500'
                }`} />
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="font-medium text-[#2C4F64]">{plant.name}</h3>
            <p className="text-sm text-[#2C4F64]/70">{plant.location}</p>
          </div>
        </div>
      ))}
    </div>
  );
};