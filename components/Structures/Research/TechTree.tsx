"use client"

import React, { ReactNode } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Rocket, Microscope, Atom, Satellite, Zap, Globe, Building, Cpu, CircleDot, Check, Plus, BarChart3 } from 'lucide-react'
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useActivePlanet } from "@/src/core/context/ActivePlanet"

const techIcons: { [key: string]: React.FC<any> } = {
  "Advanced Propulsion": Rocket,
  "Quantum Computing": Atom,
  "Nano-fabrication": Zap,
  "Fusion Reactor": Satellite,
  "Dark Matter Detector": Microscope,
  "Asteroid Mining": Globe,
}

type TechCategory = 'Structures' | 'Automatons'

type Technology = {
  planets: any
  level: ReactNode
  modules: any
  id: number
  name: string
  description: string
  icon: React.ReactNode
  requiredTech: number | null
  category: TechCategory
  requiresMission?: number
  item?: number
};

type SupabaseInventoryItem = {
  id: number
  item: number
  owner: string
  quantity: number
  anomaly: number
};

export default function ModernTechTree() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [technologies, setTechnologies] = React.useState<Technology[]>([]);
  const [unlockedTechs, setUnlockedTechs] = React.useState<number[]>([]);
  const [filteredItems, setFilteredItems] = React.useState<SupabaseInventoryItem[]>([]);
  const [openTech, setOpenTech] = React.useState<number | null>(null);

  const sections = [
    { id: "discovery", name: "Discovery Stations", icon: Microscope },
    { id: "spacecraft", name: "Spacecraft", icon: Rocket },
    { id: "resources", name: "Resource Management", icon: BarChart3 },
    { id: "structures", name: "Structures", icon: Building },
    { id: "automatons", name: "Automatons", icon: Cpu },
  ];

  const fetchTechnologies = async () => {
    const structuresRes = await fetch("/api/gameplay/research/structures")
    const structuresData = await structuresRes.json()

    const automatonsRes = await fetch("/api/gameplay/research/automatons")
    const automatonsData = await automatonsRes.json()

    const combinedTechnologies: Technology[] = [
      ...structuresData.map((structure: any) => ({
        id: structure.id,
        name: structure.name,
        description: structure.description || "No description available",
        icon: <Building className="w-6 h-6" />,
        requiredTech: structure.requires || null,
        category: "Structures" as TechCategory,
        requiresMission: structure.requiresMission || null,
        item: structure.item,
      })),
      ...automatonsData.map((automaton: any) => ({
        id: automaton.id,
        name: automaton.name,
        description: "Automaton component or ability",
        icon: <Cpu className="w-6 h-6" />,
        requiredTech: automaton.requires || null,
        category: "Automatons" as TechCategory,
        requiresMission: automaton.requiresMission || null,
      })),
    ]
    setTechnologies(combinedTechnologies)
  }

  const fetchUserStructures = async () => {
    if (!session?.user.id || !activePlanet?.id) return

    const { data: researchData, error: researchError } = await supabase
      .from("researched")
      .select("tech_type, tech_id")
      .eq("user_id", session?.user.id)

    if (researchError) {
      console.error("Error fetching user structures:", researchError)
      return
    };

    const structureIds = researchData.map((item: any) => item.tech_id)
    const researchedTech = new Set(structureIds)

    setUnlockedTechs(Array.from(researchedTech))
  };

  const fetchPlanetsWithItem = async (itemId: number) => {
    if (!session?.user?.id) return

    const { data, error } = await supabase
      .from('inventory')
      .select('anomaly') 
      .eq('owner', session.user.id)
      .eq('item', itemId)

    if (error) {
      console.error('Error fetching planets with item:', error)
      return
    }

    const anomalies = data?.map((inventoryItem: { anomaly: number }) => inventoryItem.anomaly) || []
    // Additional processing of anomalies (if needed)
  }

  const toggleTech = (techId: number) => {
    setOpenTech(openTech === techId ? null : techId)
  }

  const researchModule = (techId: number, moduleName: string) => {
    setTechnologies(techs =>
      techs.map(tech =>
        tech.id === techId
          ? {
              ...tech,
              modules: tech.modules.map((module: { name: string }) =>
                module.name === moduleName ? { ...module, researched: true } : module
              ),
            }
          : tech
      )
    ) 
  }

  React.useEffect(() => {
    fetchTechnologies()
    fetchUserStructures()
  }, [session?.user.id, activePlanet?.id])

  return (
    <div className="min-h-screen bg-[#1D2833] text-[#F7F5E9] p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#5FCBC3] to-[#FF695D]">
        Research Station
      </h1>
      <Tabs defaultValue="discovery" className="w-full">
        <TabsList className="flex justify-center mb-6 bg-transparent">
          {sections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="px-4 py-2 rounded-full text-[#F7F5E9] data-[state=active]:bg-[#2C4F64] data-[state=active]:text-[#5FCBC3] transition-all duration-300"
            >
              <section.icon className="w-4 h-4 mr-2 inline-block" />
              {section.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {technologies
                  .filter((tech) => tech.category.toLowerCase() === section.id)
                  .map((tech) => {
                    const TechIcon = techIcons[tech.name] || CircleDot
                    return (
                      <div key={tech.id} className="relative">
                        <div className="bg-[#2C4F64] p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                          <div className="flex items-center mb-4">
                            <TechIcon className="w-8 h-8 mr-3 text-[#5FCBC3]" />
                            <h3 className="text-2xl font-semibold">{tech.name}</h3>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-[#5FCBC3]">Level {tech.level}</span>
                            <button
                              onClick={() => toggleTech(tech.id)}
                              className="bg-[#5FCBC3] text-[#1D2833] px-4 py-2 rounded-full hover:bg-opacity-80 transition-colors duration-300"
                            >
                              {openTech === tech.id ? "Close" : "Details"}
                            </button>
                          </div>
                          {openTech === tech.id && (
                            <div className="mt-4 space-y-4">
                              <div>
                                <h4 className="text-[#5FCBC3] font-semibold mb-2">Planets</h4>
                                <ul className="space-y-2">
                                  {tech.planets.map((planet: { name: string; visited: boolean }) => (
                                    <li key={planet.name} className="flex items-center justify-between">
                                      <span className="flex items-center">
                                        <CircleDot className="w-4 h-4 mr-2 text-[#FF695D]" />
                                        {planet.name}
                                        {planet.visited && <Check className="w-4 h-4 ml-2 text-[#5FCBC3]" />}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="text-[#5FCBC3] font-semibold mb-2">Modules</h4>
                                <ul className="space-y-2">
                                  {tech.modules?.map((module: { name: string; researched: boolean }) => (
                                    <li key={module.name} className="flex items-center justify-between">
                                      <span>{module.name}</span>
                                      {module.researched ? (
                                        <Check className="w-4 h-4 text-[#5FCBC3]" />
                                      ) : (
                                        <button
                                          onClick={() => researchModule(tech.id, module.name)}
                                          className="bg-[#FF695D] text-[#F7F5E9] px-2 py-1 rounded-full hover:bg-opacity-80 transition-all duration-300"
                                        >
                                          Research
                                        </button>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
};