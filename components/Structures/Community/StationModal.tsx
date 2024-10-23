"use client";

import React, { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Building2,
  Lock,
  Unlock,
  Send,
  FileInput,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
  id: string; // points to id in `/api/gameplay/missions/route.ts`
  name: string;
  project: string;
  isUnlocked: boolean;
  type: string;
  completionRate: number;
  level: number;
};

type AnomalyPiece = {
  id: string; // points to `anomalies.id` in supabase > `anomalies` table
  name: string;
  description: string;
  file?: string;
};

type CommunityStationProps = {
  stationName: string;
  anomalies?: AnomalyPiece[];
  projects: Project[]; 
  missions: Mission[];   
};

type SectionProps = {
  title: string;
  items: Project[] | Mission[];
  baseColors: { bg: string; text: string; accent1: string; accent2: string; };
  onItemClick: (item: Project | Mission) => void;
  renderItem?: (item: Project | Mission) => JSX.Element;
};

const Section: React.FC<SectionProps> = ({
  title,
  items,
  baseColors,
  onItemClick,
  renderItem,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-2">
        {/* {items.map(renderItem)} */}
      </div>
    </div>
  );
};

export function CommunityScienceStation({
  stationName = "Greenhouse",
  anomalies = [
    {
      id: "1",
      name: "Hardened owl",
      description:
        "A hardened owl that is ready to be transported to another lush location.",
    },
  ],
  projects = [], 
  missions = [], 
}: CommunityStationProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Project | Mission | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true); // Loading state

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
    // Display projects and missions received as props
    console.log("Projects:", projects);
    console.log("Missions:", missions);
    setIsLoading(false);
  }, [projects, missions]);

  const handleItemClick = (item: Project | Mission) => {
    setSelectedItem(item);
  };

  const handleBack = () => {
    setSelectedItem(null);
    setActiveSection(null);
  };

  const toggleUnlock = (item: Project | Mission) => {
    console.log("Toggling unlock for item:", item);
    if (activeSection === "Projects") {
      const updatedProjects = projects.map((p) =>
        p.id === item.id ? { ...p, isUnlocked: !p.isUnlocked } : p
      );
      console.log("Updated projects:", updatedProjects);
    } else if (activeSection === "Missions") {
      const updatedMissions = missions.map((m) =>
        m.id === item.id ? { ...m, completionRate: m.completionRate + 1 } : m
      );
      console.log("Updated missions:", updatedMissions);
    }

    setSelectedItem({ ...item, isUnlocked: !item.isUnlocked });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div
      className={`flex flex-col items-center p-6 rounded-lg shadow-lg w-full max-w-md mx-auto transition-colors duration-300 ease-in-out overflow-hidden`}
      style={{ backgroundColor: baseColors.bg, color: baseColors.text }}
    >
      <div className="flex justify-between items-center w-full mb-6">
        <Building2
          className="w-10 h-10"
          style={{ color: baseColors.accent1 }}
        />
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
        <div
          className={`absolute w-full h-full transition-transform duration-300 ${
            activeSection ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <ScrollArea className="w-full h-full">
            <div className="space-y-6">
              <Button
                className="w-full justify-between"
                style={{
                  backgroundColor: baseColors.accent2,
                  color: baseColors.text,
                }}
                onClick={() => setActiveSection("Projects")}
              >
                Projects
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                className="w-full justify-between"
                style={{
                  backgroundColor: baseColors.accent2,
                  color: baseColors.text,
                }}
                onClick={() => setActiveSection("Missions")}
              >
                Missions
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                className="w-full justify-between"
                style={{
                  backgroundColor: baseColors.accent2,
                  color: baseColors.text,
                }}
                onClick={() => setActiveSection("Items")}
              >
                Items to Transfer
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                className="w-full justify-between"
                style={{
                  backgroundColor: baseColors.accent2,
                  color: baseColors.text,
                }}
                onClick={() => setActiveSection("AddData")}
              >
                Add Your Data
                <FileInput className="w-4 h-4" />
              </Button>
            </div>
          </ScrollArea>
        </div>

        <div
          className={`absolute w-full h-full transition-transform duration-300 ${
            activeSection ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ScrollArea className="w-full h-full">
            <div className="h-full flex flex-col">
              <Button
                className="mb-4 self-start"
                variant="outline"
                onClick={handleBack}
                style={{
                  borderColor: baseColors.accent1,
                  color: baseColors.text,
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              {activeSection === "Projects" && (
                <Section
                  title="Projects"
                  items={projects}
                  baseColors={baseColors}
                  onItemClick={handleItemClick}
                  // renderItem={(item) => {
                  //   if (isProject(item)) {
                  //     return (
                  //       <div
                  //         key={item.id}
                  //         onClick={() => handleItemClick(item)}
                  //         className={`flex justify-between items-center p-2 border-b ${
                  //           item.isUnlocked ? "text-green-600" : "text-red-600"
                  //         }`}
                  //       >
                  //         <span>{item.name}</span>
                  //         <Button
                  //           onClick={() => toggleUnlock(item)}
                  //           variant="outline"
                  //         >
                  //           {item.isUnlocked ? (
                  //             <Unlock className="w-4 h-4" />
                  //           ) : (
                  //             <Lock className="w-4 h-4" />
                  //           )}
                  //         </Button>
                  //       </div>
                  //     );
                  //   }
                  //   return null; // Should not reach here
                  // }}
                />
              )}

              {activeSection === "Missions" && (
                <Section
                  title="Missions"
                  items={missions}
                  baseColors={baseColors}
                  onItemClick={handleItemClick}
                  // renderItem={(item) => {
                  //   if (isMission(item)) {
                  //     return (
                  //       <div
                  //         key={item.id}
                  //         onClick={() => handleItemClick(item)}
                  //         className={`flex justify-between items-center p-2 border-b ${
                  //           item.isUnlocked ? "text-green-600" : "text-red-600"
                  //         }`}
                  //       >
                  //         <span>{item.name}</span>
                  //         <Button
                  //           onClick={() => toggleUnlock(item)}
                  //           variant="outline"
                  //         >
                  //           {item.isUnlocked ? (
                  //             <Unlock className="w-4 h-4" />
                  //           ) : (
                  //             <Lock className="w-4 h-4" />
                  //           )}
                  //         </Button>
                  //       </div>
                  //     );
                  //   }
                  //   return null; // Should not reach here
                  // }}
                />
              )}
              {/* Add additional sections e.g. SSC-14 upload */}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}