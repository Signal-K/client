"use client";

import React, { useState } from "react";
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
  // project: Project;
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
  projects: Project[];
  missions: Mission[];
  anomalies?: AnomalyPiece[];
};

// Update these to be split between project pathway options

export function CommunityScienceStation({
  stationName = "Greenhouse",
  projects = [
    {
      id: "1",
      name: "Wildwatch Burrowing Owls",
      identifier: "zoodex-burrOwls",
      isUnlocked: false,
      level: 0,
    },
    {
      id: "2",
      name: "Iguanas from Above",
      identifier: "zoodex-iguanasFromAbove",
      isUnlocked: false,
      level: 0,
    },
  ],
  missions = [
    {
      id: "1",
      name: "Spot an owl in the wild",
      type: "Upload",
      completionRate: 4,
      project: "1",
      level: 2,
      isUnlocked: false,
    }, // add some new ones, not just upload. Maybe finding specific things/anomalies, a completion rate, moving things around and generating, etc
  ],
  anomalies = [
    {
      id: "1",
      name: "Hardened owl",
      description:
        "A hardened owl that is ready to be transported to another lush location.",
    },
  ],
}: CommunityStationProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const baseColors = isDarkMode
    ? { bg: "#303F51", text: "#F7F5E9", accent1: "#85DDA2", accent2: "#5FCBC3" }
    : {
        bg: "#F7F5E9",
        text: "#303F51",
        accent1: "#FFD580",
        accent2: "#5FCBC3",
      };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };

  const handleBack = () => {
    setSelectedItem(null);
    setActiveSection(null);
  };

  const toggleUnlock = (item: Project | Mission) => {
    if (activeSection === "Projects") {
      const updatedProjects = projects.map((p) =>
        p.id === item.id ? { ...p, isUnlocked: !p.isUnlocked } : p
      );
      console.log("Updated: ", updatedProjects);
    } else if (activeSection === "Missions") {
      const updatedMissions = missions.map((m) =>
        m.id === item.id ? { ...m, completionRate: m.completionRate + 1 } : m
      );

      console.log("Updated: ", updatedMissions);
    }

    setSelectedItem({ ...item, isUnlocked: !item.isUnlocked });
  };

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
                  renderItem={(project) => (
                    <div className="flex items-center justify-between">
                      <span>{project.name}</span>
                      <div className="flex items-center">
                        <span className="mr-2">Lvl {project.level}</span>
                        {project.isUnlocked ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  )}
                />
              )}
              {activeSection === "Missions" && (
                <Section
                  title="Missions"
                  items={missions}
                  baseColors={baseColors}
                  onItemClick={handleItemClick}
                  renderItem={(mission) => (
                    <div className="flex items-center justify-between">
                      <span>{mission.name}</span>
                      <div className="flex items-center">
                        <span className="mr-2">Lvl {mission.level}</span>
                        {mission.isUnlocked ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  )}
                />
              )}
              {activeSection === "Items" && (
                <Section
                  title="Items to Transfer"
                  items={anomalies || []}
                  baseColors={baseColors}
                  onItemClick={handleItemClick}
                  renderItem={(item) => (
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <Send className="w-4 h-4" />
                    </div>
                  )}
                />
              )}
              {activeSection === "AddData" && (
                <div
                  className="mt-4 p-4 rounded"
                  style={{ backgroundColor: baseColors.accent1 }}
                >
                  <h3 className="text-xl font-bold mb-4">Add Your Data</h3>
                  <p className="mb-2">Submit your research data here:</p>
                  <textarea
                    className="w-full p-2 rounded"
                    rows={4}
                    placeholder="Enter your data..."
                    style={{
                      backgroundColor: baseColors.bg,
                      color: baseColors.text,
                    }}
                  />
                  <Button
                    className="mt-2 w-full"
                    style={{
                      backgroundColor: baseColors.accent2,
                      color: baseColors.text,
                    }}
                  >
                    Submit Data
                  </Button>
                </div>
              )}
              {selectedItem && (
                <div className="mt-4">
                  <h3 className="text-xl font-bold mb-4">
                    {selectedItem.name}
                  </h3>
                  {(activeSection === "Projects" ||
                    activeSection === "Missions") && (
                    <div>
                      <p className="mb-2">Level: {selectedItem.level}</p>
                      <p className="mb-4">
                        Status:{" "}
                        {selectedItem.isUnlocked ? "Unlocked" : "Locked"}
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => toggleUnlock(selectedItem)}
                        style={{
                          backgroundColor: baseColors.accent2,
                          color: baseColors.text,
                        }}
                      >
                        {selectedItem.isUnlocked ? "Lock" : "Unlock"}{" "}
                        {activeSection === "Projects" ? "Project" : "Mission"}
                      </Button>
                    </div>
                  )}
                  {activeSection === "Items" && (
                    <Button
                      className="w-full"
                      style={{
                        backgroundColor: baseColors.accent2,
                        color: baseColors.text,
                      }}
                    >
                      Transfer Item
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

type SectionProps = {
  title: string;
  items: any[];
  baseColors: { bg: string; text: string; accent1: string; accent2: string };
  onItemClick: (item: any) => void;
  renderItem: (item: any) => React.ReactNode;
};

function Section({
  title,
  items,
  baseColors,
  onItemClick,
  renderItem,
}: SectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {items.map((item) => (
        <Button
          key={item.id}
          className="w-full justify-start"
          variant="outline"
          style={{ borderColor: baseColors.accent1, color: baseColors.text }}
          onClick={() => onItemClick(item)}
        >
          {renderItem(item)}
        </Button>
      ))}
    </div>
  );
};