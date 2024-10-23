'use client'

import React, { useState, useEffect } from "react"
import { Moon, Sun, Lock, Unlock, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { CreateStructure } from "../Build/CreateDedicatedStructure"

type Project = {
  id: string
  name: string
  identifier: string
  isUnlocked: boolean
  level: number
  structure: string;
  missionId: number
  component: React.ComponentType;
  isCompleted: boolean
  missionRoute: number
};

type Mission = {
  id: string
  name: string
  project: string
  isUnlocked: boolean
  type: string
  completionRate: number
  level: number
};

type AnomalyPiece = {
  id: string
  name: string
  description: string
  file?: string
};

type CommunityStationProps = {
  stationName: string
  anomalies?: AnomalyPiece[]
  projects: Project[];
  inventoryItemId: number;
  missions: Mission[]
  imageSrc: string
  configuration: any
  onClick: () => void
};

export function CommunityScienceStation({
  stationName,
  anomalies = [],
  projects = [],
  missions = [],
  imageSrc,
  configuration,
  onClick,
  inventoryItemId,
}: CommunityStationProps) {
  const supabase = useSupabaseClient()
  const session = useSession()

  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [localProjects, setLocalProjects] = useState<Project[]>(projects)
  const [localMissions, setLocalMissions] = useState<Mission[]>(missions)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [projectDetails, setProjectDetails] = useState<any | null>(null)
  const [structureType, setStructureType] = useState<string | null>(null) 

  const toggleDarkMode = () => setIsDarkMode(prev => !prev)
  const baseColors = isDarkMode
    ? { bg: "#303F51", text: "#F7F5E9", accent1: "#85DDA2", accent2: "#5FCBC3" }
    : { bg: "#F7F5E9", text: "#303F51", accent1: "#FFD580", accent2: "#5FCBC3" }

  const handleBack = () => {
    setActiveSection(null)
    setSelectedProject(null)
    setProjectDetails(null)
    setStructureType(null) 
  }

  const handleProjectClick = (projectId: string) => {
    const project = configuration.projects.find((proj: Project) => proj.id === projectId)

    if (project) {
      setSelectedProject(project)
      setProjectDetails(project)
    } else {
      console.error("Project not found in configuration.")
      alert('Project not found in configuration.')
    }
  }

  const handleStructureSelection = (type: string) => {
    setStructureType(type);
  };

  return (
    <div 
      className={`flex flex-col items-center p-6 rounded-lg shadow-lg w-full max-w-md mx-auto transition-colors duration-300 ease-in-out overflow-hidden`}
      style={{ backgroundColor: baseColors.bg, color: baseColors.text }}
      onClick={onClick}
    >
      <div className="flex justify-between items-center w-full mb-6">
        <img src={imageSrc} alt={`${stationName} Image`} className="w-10 h-10 object-cover rounded-full" />
        <h2 className="text-2xl font-bold">{stationName}</h2>
        <Switch 
          checked={isDarkMode}
          onCheckedChange={toggleDarkMode}
          className="data-[state=checked]:bg-primary"
        >
          <Sun className={`h-4 w-4 ${isDarkMode ? 'hidden' : 'block'}`} />
          <Moon className={`h-4 w-4 ${isDarkMode ? 'block' : 'hidden'}`} />
        </Switch>
      </div>

      <div className="relative w-full h-[60vh] overflow-hidden">
        <div className={`absolute w-full h-full transition-transform duration-300 ${activeSection ? '-translate-x-full' : 'translate-x-0'}`}>
          <ScrollArea className="w-full h-full">
            <div className="space-y-6">
              {['Projects', 'Missions', 'Anomalies'].map(section => (
                <Button 
                  key={section}
                  className="w-full justify-between"
                  style={{ backgroundColor: baseColors.accent2, color: baseColors.text }}
                  onClick={() => setActiveSection(section)}
                >
                  {section}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className={`absolute w-full h-full transition-transform duration-300 ${activeSection ? 'translate-x-0' : 'translate-x-full'}`}>
          <ScrollArea className="w-full h-full">
            <div className="h-full flex flex-col">
              <Button 
                className="mb-4 self-start"
                variant="outline"
                onClick={handleBack}
                style={{ borderColor: baseColors.accent1, color: baseColors.text }}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {activeSection === 'Projects' && (
                <Section 
                  title="Projects" 
                  items={localProjects} 
                  baseColors={baseColors}
                  renderItem={(project: Project) => (
                    <div className="flex items-center justify-between">
                      {project.isCompleted ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      <span>{project.name}</span>
                      <div className="flex items-center">
                        <span className="mr-2">Lvl {project.level}</span>
                      </div>
                      <Button 
                        onClick={() => handleProjectClick(project.id)}  // Pass the clicked project id
                        style={{ backgroundColor: baseColors.accent2, color: baseColors.text }}
                      >
                        View Project
                      </Button>
                    </div>
                  )}
                />
              )}

              {activeSection === 'Missions' && (
                <Section 
                  title="Missions" 
                  items={localMissions} 
                  baseColors={baseColors}
                  renderItem={(mission: Mission) => (
                    <div className="flex items-center justify-between">
                      <span>{mission.name}</span>
                      <div className="flex items-center">
                        <span className="mr-2">Rate: {mission.completionRate}</span>
                        <span className="mr-2">Lvl {mission.level}</span>
                      </div>
                    </div>
                  )}
                />
              )}

              {activeSection === 'Anomalies' && (
                <Section 
                  title="Anomalies" 
                  items={anomalies} 
                  baseColors={baseColors}
                  renderItem={(anomaly: AnomalyPiece) => (
                    <div className="flex items-center justify-between">
                      <span>{anomaly.name}</span>
                      <span className="mr-2">{anomaly.description}</span>
                    </div>
                  )}
                />
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {selectedProject && (
        <div className="p-4 mt-4 rounded-lg shadow-md w-full" style={{ backgroundColor: baseColors.accent1 }}>
          <h3 className="text-lg font-bold mb-2">{selectedProject.name} - Details</h3>
          <pre className="whitespace-pre-wrap">
            {projectDetails ? JSON.stringify(projectDetails, null, 2) : "No configuration available."}
          </pre>
          <Button
            onClick={() => handleStructureSelection(selectedProject.structure)} 
            style={{ backgroundColor: baseColors.accent2, color: baseColors.text }}
          >
            Create Structure
          </Button>
          {structureType && (
            <CreateStructure structureType={structureType} />
          )}
        </div>
      )}
    </div>
  );
};

type SectionProps<T> = {
  title: string
  items: T[]
  baseColors: { bg: string, text: string, accent1: string, accent2: string }
  renderItem: (item: T) => React.ReactNode
}

function Section<T>({ title, items, baseColors, renderItem }: SectionProps<T>) {
  return (
    <div className="h-full flex flex-col">
      <h3 className="mb-4 text-lg font-bold">{title}</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <Button 
            key={index}
            className="w-full justify-between"
            style={{ backgroundColor: baseColors.accent1, color: baseColors.text }}
          >
            {renderItem(item)}
          </Button>
        ))}
      </div>
    </div>
  )
}