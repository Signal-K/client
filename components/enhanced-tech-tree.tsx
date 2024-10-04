import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Rocket, Microscope, BarChart3, Atom, Satellite, Zap, Globe, CircleDot } from "lucide-react"

const techIcons = {
  "Advanced Propulsion": Rocket,
  "Quantum Computing": Atom,
  "Nano-fabrication": Zap,
  "Fusion Reactor": Satellite,
  "Dark Matter Detector": Microscope,
  "Asteroid Mining": Globe,
};

type TechCategory = 'Structures' | 'Automatons'; // Update this for other values, described below
 
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

export function EnhancedTechTreeComponent() {
  const [researchedTech, setResearchedTech] = React.useState<Set<number>>(new Set())
  const [openModal, setOpenModal] = React.useState<number | null>(null)

  const sections = [
    { id: "discovery", name: "Discovery Stations", icon: Microscope },
    { id: "spacecraft", name: "Spacecraft", icon: Rocket },
    { id: "resources", name: "Resource Management", icon: BarChart3 },
  ]

  const technologies = [
    { id: 1, name: "Advanced Propulsion", section: "spacecraft", level: 1, planets: ["Mars", "Venus"] },
    { id: 2, name: "Quantum Computing", section: "discovery", level: 2, planets: ["Earth", "Moon Base"] },
    { id: 3, name: "Nano-fabrication", section: "resources", level: 1, planets: ["Asteroid Belt", "Titan"] },
    { id: 4, name: "Fusion Reactor", section: "spacecraft", level: 3, planets: ["Jupiter Station", "Saturn Ring"] },
    { id: 5, name: "Dark Matter Detector", section: "discovery", level: 3, planets: ["Pluto", "Kuiper Belt"] },
    { id: 6, name: "Asteroid Mining", section: "resources", level: 2, planets: ["Ceres", "Vesta"] },
  ]; // Link this to researched/tech tree component

  const handleResearch = (techId: number) => {
    setResearchedTech((prev) => new Set(prev).add(techId))
  }

  const toggleModal = (techId: number | null) => {
    setOpenModal(openModal === techId ? null : techId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C4F64] to-[#303F51] text-[#F7F5E9] p-4 md:p-8 bg-[url('/noise.png')] bg-repeat">
      <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#5FCBC3] to-[#FF695D]">
        Research Station
      </h1>
      <Tabs defaultValue="discovery" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-[#2C4F64] to-[#3A5A6D]">
          {sections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5FCBC3] data-[state=active]:to-[#4DBDB5] data-[state=active]:text-[#303F51]"
            >
              <section.icon className="mr-2 h-4 w-4" />
              {section.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <ScrollArea className="h-[calc(100vh-200px)] rounded-md border border-[#5FCBC3] p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {technologies
                  .filter((tech) => tech.section === section.id)
                  .map((tech) => {
                    // const TechIcon = techIcons[tech.name] || CircleDot
                    return (
                      <div key={tech.id} className="relative">
                        <div className="bg-gradient-to-br from-[#2C4F64] to-[#3A5A6D] p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                          <div className="flex items-center mb-2">
                            {/* <TechIcon className="w-6 h-6 mr-2 text-[#5FCBC3]" /> */}
                            <h3 className="text-xl font-semibold">{tech.name}</h3>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#5FCBC3]">Level {tech.level}</span>
                            {researchedTech.has(tech.id) ? (
                              <button
                                onClick={() => toggleModal(tech.id)}
                                className="bg-[#5FCBC3] text-[#303F51] px-3 py-1 rounded-md hover:bg-opacity-80 transition-colors duration-300"
                              >
                                Installed
                              </button>
                            ) : (
                              <button
                                onClick={() => handleResearch(tech.id)}
                                className="bg-gradient-to-r from-[#FF695D] to-[#FF8075] text-white px-3 py-1 rounded-md hover:from-[#FF8075] hover:to-[#FF695D] transition-colors duration-300"
                              >
                                Research
                              </button>
                            )}
                          </div>
                        </div>
                        {openModal === tech.id && (
                          <div className="absolute z-10 left-0 right-0 mt-2 p-4 bg-gradient-to-br from-[#2C4F64] to-[#3A5A6D] rounded-lg shadow-lg border border-[#5FCBC3] animate-slideDown">
                            <h4 className="text-[#5FCBC3] font-semibold mb-2">{tech.name} - Installed Locations</h4>
                            <ul className="space-y-1">
                              {tech.planets.map((planet) => (
                                <li key={planet} className="flex items-center">
                                  <CircleDot className="w-4 h-4 mr-2 text-[#FF695D]" />
                                  {planet}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
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
}