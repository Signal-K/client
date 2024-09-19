'use client';

import { useActivePlanet } from '@/context/ActivePlanet';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Building2 } from 'lucide-react';

interface StructureInfoProps {
  icon?: React.ReactNode
  structureName: string
};

export function StructureInfo({ icon, structureName }: StructureInfoProps = { structureName: 'Space Station' }) {
    const supabase = useSupabaseClient();
    const session = useSession

    const { activePlanet } = useActivePlanet();

  return (
    <div className="flex items-center space-x-4 bg-[#303F51] text-[#F7F5E9] p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex-shrink-0">
        {icon || <Building2 size={24} className="text-[#5FCBC3]" />}
      </div>
      <div>
        <h2 className="text-xl font-semibold">{structureName}</h2>
        <p className="text-sm text-[#5FCBC3]">Planet: {activePlanet?.content}</p>
      </div>
    </div>
  );
};