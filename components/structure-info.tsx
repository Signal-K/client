import { Building2, FlaskRoundIcon as Flask } from 'lucide-react'
import { Structure } from '../types/greenhouse'

interface StructureInfoProps {
  structure: Structure;
}

export function StructureInfo({ structure }: StructureInfoProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <Flask className="w-6 h-6 text-[#2C4F64]" />
        <div>
          <p className="text-lg font-medium text-[#2C4F64]">Biolab</p>
          <p className="text-sm text-[#2C4F64]/70">Level {structure.level}</p>
        </div>
      </div>
      <div className="pl-9">
        {structure.substructures.map((substructure) => (
          <div key={substructure.id} className="flex items-center gap-3 mt-2">
            <Building2 className="w-5 h-5 text-[#85DDA2]" />
            <div>
              <p className="text-sm font-medium text-[#2C4F64]">Greenhouse</p>
              <p className="text-xs text-[#2C4F64]/70">Level {substructure.level}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

