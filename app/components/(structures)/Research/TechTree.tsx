'use client'

import React, { useEffect, useState } from 'react'
import { Building, Cpu } from 'lucide-react'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import { useActivePlanet } from '@/context/ActivePlanet'

type TechCategory = 'Structures' | 'Automatons'

type Technology = {
  id: number
  name: string
  description: string
  icon: React.ReactNode
  requiredTech: number | null
  category: TechCategory
  requiresMission?: number
  item?: number // Points to an entry in `/api/gameplay/inventory`
}

type Structure = {
  id: number
  name: string
  icon: React.ReactNode
}

export function AdvancedTechTreeComponent() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const userId = session?.user?.id
  const { activePlanet } = useActivePlanet()

  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [unlockedTechs, setUnlockedTechs] = useState<number[]>([])
  const [userStructures, setUserStructures] = useState<Structure[]>([])

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
    
    // Fetch inventory items for the user and active planet
    const { data, error } = await supabase
      .from('inventory')
      .select('item')
      .eq('owner', userId)
      .eq('anomaly', activePlanet.id);
    
    if (error) {
      console.error('Error fetching user structures from inventory:', error);
      return;
    }
    
    // Fetch structures from the API route
    const structuresRes = await fetch('/api/gameplay/research/structures');
    const structuresData = await structuresRes.json();
    
    const structureIds = data.map((inventoryItem) => inventoryItem.item);
    
    // Match inventory items with structures from the API
    const userStructures = structuresData
      .filter((structure: any) => structure.item && structureIds.includes(structure.item))
      .map((structure: any) => ({
        id: structure.id,
        name: structure.name,
        icon: <Building className="w-6 h-6" />, // Adjust if you have a custom icon
      }));
    
    // Ensure only unique structures are shown
    const uniqueStructures = userStructures.filter(
      (structure: Structure, index: number, self: Structure[]) =>
        index === self.findIndex((s: Structure) => s.id === structure.id)
    );
    
    setUserStructures(uniqueStructures);
  
    // Automatically mark owned structures as unlocked
    const ownedStructureIds = userStructures.map((structure: { id: any }) => structure.id);
    setUnlockedTechs((prevUnlockedTechs) => [
      ...prevUnlockedTechs, 
      ...ownedStructureIds.filter((id: number) => !prevUnlockedTechs.includes(id)) // Avoid duplicates
    ]);
  };
  
  useEffect(() => {
    fetchTechnologies()
    fetchUserStructures()
  }, [userId, activePlanet])

  const handleUnlock = async (techId: number, techCategory: TechCategory, techItem?: number) => {
    if (userId && canUnlock(techId)) {
        // Add entry to unlocked_technologies in Supabase
        // Uncomment if needed

        // Add entry to inventory in Supabase (for structures)
        if (techCategory === 'Structures' && techItem) {
            const { error: inventoryError } = await supabase
                .from('inventory')
                .insert([{ 
                    owner: userId, 
                    anomaly: activePlanet?.id, 
                    item: techItem,  // Use the `item` value instead of `techId`
                    configuration: { "Uses": 1 },  // Pass as an object
                    quantity: 1 
                }])

            if (inventoryError) {
                console.error('Error adding structure to inventory:', inventoryError)
                return
            }
        }

        setUnlockedTechs((prevUnlockedTechs) => [...prevUnlockedTechs, techId])
    }
}

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
        <p className="text-sm text-gray-600 mb-2">{tech.description}</p>
        {tech.requiredTech && (
          <p className="text-xs text-gray-500 mb-2">
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
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isUnlocked ? 'Unlocked' : 'Unlock'}
        </button>
      </div>
    )
  }

  const TechCategory = ({ category }: { category: TechCategory }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{category}</h2>
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Advanced Technology Tree</h1>

      {/* Display the user's structures */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Structures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {userStructures.map((structure) => (
            <div key={structure.id} className="p-4 rounded-lg shadow-md border-2 border-blue-500">
              <div className="flex items-center mb-2">
                {structure.icon}
                <h3 className="text-lg font-semibold ml-2">{structure.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology categories */}
      <TechCategory category="Structures" />
      <TechCategory category="Automatons" />
    </div>
  )
};