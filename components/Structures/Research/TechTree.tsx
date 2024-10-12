'use client'

import React, { useEffect, useState } from 'react'
import { Building, Cpu } from 'lucide-react'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import { useActivePlanet } from '@/context/ActivePlanet'
import { InventoryItem } from '@/types/Items'

type TechCategory = 'Structures' | 'Automatons'
 
type Technology = {
  id: number
  name: string
  description: string
  icon: React.ReactNode
  requiredTech: number | null
  category: TechCategory
  requiresMission?: number
  item?: number
}

type Structure = {
  id: number
  name: string
  icon: React.ReactNode
};

type ResearchData = {
  tech_id: any
  tech_type: number; 
  item?: number; 
};

export function AdvancedTechTreeComponent() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const userId = session?.user?.id
  const { activePlanet } = useActivePlanet()

  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [unlockedTechs, setUnlockedTechs] = useState<number[]>([])
  const [userStructures, setUserStructures] = useState<Structure[]>([])
  const [classificationPoints, setClassificationPoints] = useState<number>(0)

  // Fetch all technologies data from API routes
  const fetchTechnologies = async () => {
    const structuresRes = await fetch('/api/gameplay/research/structures')
    const structuresData = await structuresRes.json()

    const automatonsRes = await fetch('/api/gameplay/research/automatons')
    const automatonsData = await automatonsRes.json()

    const combinedTechnologies = [
      ...structuresData.map((structure: any) => ({
        id: structure.id,
        name: structure.name,
        description: structure.description || 'No description available',
        icon: <Building className="w-6 h-6" />,
        requiredTech: structure.requires || null,
        category: 'Structures' as TechCategory,
        requiresMission: structure.requiresMission || null,
        item: structure.item,  // Add the `item` field here
      })),
      ...automatonsData.map((automaton: any) => ({
        id: automaton.id,
        name: automaton.name,
        description: 'Automaton component or ability',
        icon: <Cpu className="w-6 h-6" />,
        requiredTech: automaton.requires || null,
        category: 'Automatons' as TechCategory,
        requiresMission: automaton.requiresMission || null,
      })),
    ]

    setTechnologies(combinedTechnologies)
  }

  const fetchUserStructures = async () => {
    if (!userId || !activePlanet?.id) return;
  
    const { data: researchData, error: researchError } = await supabase
      .from('researched')
      .select('tech_type, tech_id')
      .eq('user_id', userId);
  
    if (researchError) {
      console.error('Error fetching user structures:', researchError);
      return;
    }
  
    console.log('Research Data:', researchData); // Log research data for debugging
  
    const structuresRes = await fetch('/api/gameplay/research/structures');
    const structuresData = await structuresRes.json();
  
    const structureIds = researchData
      .filter((item: ResearchData) => item.tech_type) // Ensure tech_type is valid
      .map((item: ResearchData) => item.tech_id); // Use tech_id to match structures
  
    const userStructures = structuresData
      .filter((structure: any) => structure.item && structureIds.includes(structure.id)) // Match by structure ID
      .map((structure: any) => ({
        id: structure.id,
        name: structure.name,
        icon: <Building className="w-6 h-6" />,
      }));
  
    console.log('User Structures:', userStructures); // Log user structures for debugging
  
    // Ensure unique structures
    const uniqueStructures = userStructures.filter(
      (structure: Structure, index: number, self: Structure[]) =>
        index === self.findIndex((s: Structure) => s.id === structure.id)
    );
  
    setUserStructures(uniqueStructures);
  
    const ownedStructureIds = uniqueStructures.map((structure: { id: any }) => structure.id);
    setUnlockedTechs((prevUnlockedTechs) => [
      ...prevUnlockedTechs,
      ...ownedStructureIds.filter((id: number) => !prevUnlockedTechs.includes(id)),
    ]);
  };  

  const fetchClassificationPoints = async () => {
    if (!userId) return;

    console.log('test session', session.user.id);

    const { data, error } = await supabase
      .from('profiles')
      .select('classificationPoints')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching classification points:', error);
      return;
    };

    setClassificationPoints(data?.classificationPoints || 0);
  };
  
  useEffect(() => {
    fetchTechnologies()
    fetchUserStructures()
    fetchClassificationPoints()  // Fetch classification points on mount
  }, [userId, activePlanet])

  const handleUnlock = async (techId: number, techCategory: TechCategory, techItem?: number) => {
    if (userId && canUnlock(techId)) {
      if (classificationPoints < 1) {
        alert('You need at least 1 classification point to unlock a new technology.');
        return;
      }
  
      // Fetch the item name from the API
      const itemResponse = await fetch(`/api/gameplay/inventory`);
      const inventoryItems = await itemResponse.json();
      const item = inventoryItems.find((i: InventoryItem) => i.id === techItem);
  
      // If the item was not found, handle accordingly
      if (!item) {
        console.error('Item not found for techItem:', techItem);
        return;
      }
  
      // Add entry to inventory in Supabase (for structures)
      // if (techCategory === 'Structures' && techItem) {
      //   const { error: inventoryError } = await supabase
      //     .from('inventory')
      //     .insert([{ 
      //       owner: userId, 
      //       anomaly: activePlanet?.id, 
      //       item: techItem,  // Use the `item` value instead of `techId`
      //       configuration: { "Uses": 1 },  // Pass as an object 
      //       quantity: 1 
      //     }]);
  
      //   if (inventoryError) {
      //     console.error('Error adding structure to inventory:', inventoryError);
      //     return;
      //   }
      // }
  
      // Deduct 1 classification point after successful unlock
      const { error: updatePointsError } = await supabase
        .from('profiles')
        .update({ classificationPoints: classificationPoints - 1 })
        .eq('id', userId);
  
      if (updatePointsError) {
        console.error('Error updating classification points:', updatePointsError);
        return;
      }
  
      // Insert into the `researched` table to track the research event
      const { error: researchedError } = await supabase
        .from('researched')
        .insert([{ 
          user_id: userId, 
          tech_type: item.id, // Use the item's name instead of the category
          tech_id: techId,         // Insert the technology ID
        }]);
  
      if (researchedError) {
        console.error('Error inserting research data:', researchedError);
        return;
      }
  
      // Update local state
      setClassificationPoints(prevPoints => prevPoints - 1);
      setUnlockedTechs(prevUnlockedTechs => [...prevUnlockedTechs, techId]);
    }
  };

  const canUnlock = (techId: number) => {
    const tech = technologies.find((t) => t.id === techId)
    return tech?.requiredTech === null || (tech?.requiredTech && unlockedTechs.includes(tech.requiredTech))
  }

  const TechItem = ({ tech }: { tech: Technology }) => {
    const isUnlocked = unlockedTechs.includes(tech.id)
    const isAvailable = canUnlock(tech.id)

    return (
      <div
        className={`p-4 rounded-lg shadow-md ${
          isUnlocked
            ? 'border-2 border-green-500'
            : isAvailable
            ? 'border-2 border-purple-500'
            : 'border-2 border-red-500'
        }`}
      >
        <div className="flex items-center mb-2">
          {tech.icon}
          <h3 className="text-lg font-semibold ml-2">{tech.name}</h3>
        </div>
        <p className="text-sm text-gray-300 mb-2">{tech.description}</p>
        {tech.requiredTech && (
          <p className="text-xs text-gray-300 mb-2">
            Required: {technologies.find((t) => t.id === tech.requiredTech)?.name ?? 'Unknown'}
          </p>
        )}
        <button
          onClick={() => handleUnlock(tech.id, tech.category, tech.item)}
          disabled={isUnlocked || !isAvailable}
          className={`px-3 py-1 text-sm rounded ${
            isUnlocked
              ? 'bg-green-500 text-white'
              : isAvailable
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-[#2C3A4A] text-gray-300 cursor-not-allowed'
          }`}
        >
          {isUnlocked ? 'Researched' : 'Research'}
        </button>
      </div>
    )
  }

  const TechCategory = ({ category }: { category: TechCategory }) => (
    <div className="mb-8">
      {/* <h2 className="text-2xl font-bold mb-4">{category}</h2> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {technologies
          .filter((tech) => tech.category === category)
          .map((tech) => (
            <TechItem key={tech.id} tech={tech} />
          ))}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-4 bg-white/10">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-4">Your Structures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
          {userStructures.map((structure) => (
            <div key={structure.id} className="p-2 rounded-lg shadow-md border-2 border-blue-500">
              <div className="flex items-center mb-1">
                {structure.icon}
                <h3 className="text-lg font-semibold ml-2">{structure.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Classification Points Balance</h2>
        <p className="text-lg">{classificationPoints} Points</p>
        <p className="mt-2 text-sm text-gray-300">
          Points are earned for contributions and are required to unlock new technology. Each technology unlock costs 1 point.
        </p>
      </div>

      {technologies.some(tech => tech.category === 'Structures') && (
        <TechCategory category="Structures" />
      )}

      {/* {technologies.some(tech => tech.category === 'Automatons') && (
        <TechCategory category="Automatons" />
      )} */}
    </div>
  );
};