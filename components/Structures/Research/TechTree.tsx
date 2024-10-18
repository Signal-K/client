import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Microscope, BarChart3, Atom, Satellite, Zap, Globe, CircleDot, Building, Cpu, ChevronDownCircle } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

const techIcons = {
  "Advanced Propulsion": Rocket,
  "Quantum Computing": Atom,
  "Nano-fabrication": Zap,
  "Fusion Reactor": Satellite,
  "Dark Matter Detector": Microscope,
  "Asteroid Mining": Globe,
};

type TechCategory = 'Structures' | 'Automatons';
 
type Technology = {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiredTech: number | null;
  category: TechCategory;
  requiresMission?: number;
  item?: number;
};

interface SupabaseInventoryItem {
  id: number;
  item: number;
  owner: string;
  quantity: number;
  anomaly: number;
};

export function AdvancedTechTreeComponent() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [unlockedTechs, setUnlockedTechs] = useState<number[]>([]);
  const [filteredItems, setFilteredItems] = useState<SupabaseInventoryItem[]>([]);
  const [planetsWithItem, setPlanetsWithItem] = useState<Array<{ id: number; content: string }>>([]);

  const fetchTechnologies = async () => {
    const structuresRes = await fetch("/api/gameplay/research/structures");
    const structuresData = await structuresRes.json();

    const automatonsRes = await fetch("/api/gameplay/research/automatons");
    const automatonsData = await automatonsRes.json();

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
    ];

    setTechnologies(combinedTechnologies);
  };

  const fetchUserStructures = async () => {
    if (!session?.user.id || !activePlanet?.id) return;

    const { data: researchData, error: researchError } = await supabase
      .from("researched")
      .select("tech_type, tech_id")
      .eq("user_id", session?.user.id);

    if (researchError) {
      console.error("Error fetching user structures:", researchError);
      return;
    }

    const structureIds = researchData.map((item: any) => item.tech_id);
    const researchedTech = new Set(structureIds);

    setUnlockedTechs(Array.from(researchedTech));
  };

  const fetchPlanetsWithItem = async (itemId: number) => {
    if (!session?.user?.id) return;
  
    const { data, error } = await supabase
      .from('inventory')
      .select('anomaly') 
      .eq('owner', session.user.id)
      .eq('item', itemId);
  
    if (error) {
      console.error('Error fetching planets with item:', error);
      return;
    }
  
    const anomalies = data?.map((inventoryItem: { anomaly: number }) => inventoryItem.anomaly) || [];
  
    const { data: planetsData, error: planetsError } = await supabase
      .from('anomalies')
      .select('id, content')
      .in('id', anomalies);
  
    if (planetsError) {
      console.error('Error fetching planet names:', planetsError);
      return;
    }
  
    const planetNames = planetsData.map((planet: { id: number; content: string }) => ({
      id: planet.id,
      content: planet.content,
    }));
    setPlanetsWithItem(planetNames);
  };  

  const canUnlock = (techId: number) => {
    const tech = technologies.find((t) => t.id === techId);
    return tech?.requiredTech === null || (tech?.requiredTech && unlockedTechs.includes(tech.requiredTech));
  };

  useEffect(() => {
    fetchTechnologies();
    fetchUserStructures();
  }, [session?.user.id, activePlanet]);

  return (
    <div className="bg-gradient-to-br from-[#2C4F64] to-[#303F51] text-[#F7F5E9] container mx-auto p-4 ">
      <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#5FCBC3] to-[#FF695D]">
        Research Station
      </h1>
      <Tabs defaultValue="Structures" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-[#2C4F64] to-[#3A5A6D]">
          <TabsTrigger value="Structures">Structures</TabsTrigger>
          <TabsTrigger value="Automatons">Automatons</TabsTrigger>
          <TabsTrigger value="Other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="Structures">
          <ScrollArea className="h-[calc(100vh-200px)] rounded-md border border-[#5FCBC3] p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technologies
  .filter((tech) => tech.category === "Structures")
  .map((tech) => (
    <div
      key={tech.id}
      className={`p-4 rounded-md ${unlockedTechs.includes(tech.id) ? 'bg-green-500' : 'bg-red-500'}`}
      onClick={() => fetchPlanetsWithItem(tech.item ?? 0)}
    >
      <div className="flex items-center space-x-4">
        {tech.icon}
        <h3 className="text-xl font-bold">{tech.name}</h3>
      </div>
      <p>{tech.description}</p>
      <button
        className="text-xs px-2 py-1 rounded bg-[#5FCBC3] text-[#303F51]"
        disabled={!canUnlock(tech.id)}
      >
        {unlockedTechs.includes(tech.id) ? "Researched" : "Research"}
      </button>

      <ChevronDownCircle className="mt-1" />

      {planetsWithItem.length > 0 && (
  <div className="mt-4 p-2 bg-[#F7F5E9] text-[#303F51] rounded-md">
    <h4 className="text-md font-semibold mb-2">Planets with this technology:</h4>
    <ul>
      {planetsWithItem.map((planet) => (
        <li key={planet.id}>Planet: {planet.content} (ID: {planet.id})</li>
      ))}
    </ul>
  </div>
)}
    </div>
  ))}

            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="Automatons">
          <ScrollArea className="h-[calc(100vh-200px)] rounded-md border border-[#5FCBC3] p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technologies
                .filter((tech) => tech.category === "Automatons")
                .map((tech) => (
                  <div
                    key={tech.id}
                    className={`p-4 rounded-md ${unlockedTechs.includes(tech.id) ? 'bg-green-500' : 'bg-red-500'}`}
                    onClick={() => fetchPlanetsWithItem(tech.item ?? 0)}
                  >
                    <div className="flex items-center space-x-4">
                      {tech.icon}
                      <h3 className="text-xl font-bold">{tech.name}</h3>
                    </div>
                    <p>{tech.description}</p>
                    <button
                      className="text-xs px-2 py-1 rounded bg-[#5FCBC3] text-[#303F51]"
                      disabled={!canUnlock(tech.id)}
                    >
                      {unlockedTechs.includes(tech.id) ? "Researched" : "Research"}
                    </button>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};