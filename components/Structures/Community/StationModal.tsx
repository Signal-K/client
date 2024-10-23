"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Building2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

type Project = {
  id: string;
  name: string;
  identifier: string;
  isUnlocked: boolean;
  level: number;
};

type Mission = {
  id: string;
  name: string;
  project: string;
  isUnlocked: boolean;
  type: string;
  completionRate: number;
  level: number;
};

type AnomalyPiece = {
  id: string;
  name: string;
  description: string;
  file?: string;
};

type CommunityStationProps = {
  stationName: string;
  anomalies?: AnomalyPiece[];
  projects: Project[]; 
  missions: Mission[];   
  imageSrc: string;
  configuration: any; 
  onClick: () => void; 
};

export function CommunityScienceStation({
  stationName,
  anomalies = [],
  projects = [], 
  missions = [], 
  imageSrc,
  configuration,
  onClick,
}: CommunityStationProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Project | Mission | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const baseColors = isDarkMode
    ? { bg: "#303F51", text: "#F7F5E9", accent1: "#85DDA2", accent2: "#5FCBC3" }
    : {
        bg: "#F7F5E9",
        text: "#303F51",
        accent1: "#FFD580",
        accent2: "#5FCBC3",
      };

  useEffect(() => {
    console.log("Fetching projects and missions...");
    console.log("Projects:", projects);
    console.log("Missions:", missions);
    setIsLoading(false);
  }, [projects, missions]);

  const handleItemClick = (item: Project | Mission) => {
    setSelectedItem(item);
  };

  const handleBack = () => {
    setSelectedItem(null); // Reset selected item
    setActiveSection(null); // Reset active section
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div
      className={`flex flex-col items-center p-6 rounded-lg shadow-lg w-full max-w-md mx-auto transition-colors duration-300 ease-in-out overflow-hidden`}
      style={{ backgroundColor: baseColors.bg, color: baseColors.text }}
      onClick={onClick}
    >
      <div className="flex justify-between items-center w-full mb-6">
        <Building2 className="w-10 h-10" style={{ color: baseColors.accent1 }} />
        <h2 className="text-2xl font-bold">{stationName}</h2>
        <Switch
          checked={isDarkMode}
          onCheckedChange={toggleDarkMode}
          className="data-[state=checked]:bg-primary"
        >
          <Sun className={`h-4 w-4 ${isDarkMode ? "hidden" : "block"}`} />
          <Moon className={`h-4 w-4 ${isDarkMode ? "block" : "hidden"}`} />
        </Switch>
      </div>

      <div className="relative w-full h-[60vh] overflow-hidden">
        <img
          src={imageSrc}
          alt={stationName}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="relative z-10 flex flex-col items-center p-4">
          <h3 className="text-xl">Configuration Details:</h3>
          <pre className="bg-gray-200 p-2 rounded">{JSON.stringify(configuration, null, 2)}</pre>
        </div>
      </div>

      <ScrollArea className="my-4 h-40 w-full rounded-md border border-gray-300 overflow-y-auto">
        {activeSection === "projects" ? (
          <>
            {projects.map((project) => (
              <div key={project.id} onClick={() => handleItemClick(project)}>
                <h4>{project.name}</h4>
                <Button>{project.isUnlocked ? <Unlock /> : <Lock />}</Button>
              </div>
            ))}
            <Button onClick={handleBack} className="mt-2">Back to Menu</Button>
          </>
        ) : activeSection === "missions" ? (
          <>
            {missions.map((mission) => (
              <div key={mission.id} onClick={() => handleItemClick(mission)}>
                <h4>{mission.name}</h4>
                <Button>{mission.isUnlocked ? <Unlock /> : <Lock />}</Button>
              </div>
            ))}
            <Button onClick={handleBack} className="mt-2">Back to Menu</Button>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <h4 className="mb-2">Select an Option:</h4>
            <Button onClick={() => setActiveSection("projects")}>Projects</Button>
            <Button onClick={() => setActiveSection("missions")}>Missions</Button>
          </div>
        )}
      </ScrollArea>

      {selectedItem && (
        <div className="mt-4">
          <h5>{selectedItem.name}</h5>
          <Button onClick={handleBack}>Back</Button>
        </div>
      )}
    </div>
  );
};