"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { Progress } from "@/src/components/ui/progress";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { TestTube } from "lucide-react";

type TechItem = {
  id: string;
  name: string;
  tech_type: string;
  level: number;
  maxLevel: number;
  progress: number;
};

async function fetchTechTreeData(): Promise<TechItem[]> {
  const response = await fetch("/api/gameplay/research/summary", { cache: "no-store" });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    throw new Error(payload?.error ?? "Error loading research");
  }

  const techTypes: string[] = Array.isArray(payload.researchedTechTypes) ? payload.researchedTechTypes : [];
  const counts: Record<string, number> = {};
  for (const techType of techTypes) {
    counts[techType] = (counts[techType] || 0) + 1;
  }

  const techDefinitions: Omit<TechItem, "level" | "progress">[] = [
    { id: "probecount", name: "Probe Count", tech_type: "probecount", maxLevel: 3 },
    { id: "proberange", name: "Probe Range", tech_type: "proberange", maxLevel: 5 },
    { id: "ballooncount", name: "Balloon Count", tech_type: "ballooncount", maxLevel: 3 },
    { id: "stationcount", name: "Station Count", tech_type: "stationcount", maxLevel: 2 },
    { id: "cameracount", name: "Camera Count", tech_type: "cameracount", maxLevel: 3 },
  ];

  return techDefinitions.map((tech) => {
    const level = counts[tech.tech_type] || 0;
    return {
      ...tech,
      level,
      progress: Math.min((level / tech.maxLevel) * 100, 100),
    };
  });
}

export default function TechnologyPopover() {
  const session = useSession();
  const [techTree, setTechTree] = useState<TechItem[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetchUserTechData();
    }
  }, [session]);

  const fetchUserTechData = async () => {
    try {
      const fullTree = await fetchTechTreeData();
      setTechTree(fullTree);
    } catch (error) {
      console.error("Error loading research:", error);
      return;
    }
  };

  return (
    <Popover>
        <PopoverTrigger asChild>
            <Button variant="ghost" className="relative group flex items-center h-8">
                <TestTube className="h-4 w-4 flex-shrink-0" />
                <span className="ml-1 text-sm whitespace-nowrap">Tech Tree</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-black/80 backdrop-blur-md border border-purple-500/20 rounded-md">
<div className="w-80 p-0 bg-black/80 backdrop-blur-md border border-purple-500/20 rounded-md">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-purple-400">Technology</h3>
        <div className="grid gap-3">
          {techTree.map((tech) => (
            <div key={tech.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-white">{tech.name}</h4>
                <div className="text-purple-400 text-sm font-bold">
                  Lvl {tech.level}/{tech.maxLevel}
                </div>
              </div>
              <Progress value={tech.progress} className="h-1.5 mt-2 bg-white/10" />
            </div>
          ))}
        </div>
        <Link href="/research">
          <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white">
            Full Tech Tree
          </Button>
        </Link>
      </div>
    </div>
    </PopoverContent>
    </Popover>
  );
};

export function TechnologySection() {
  // For mobile, only

  const session = useSession();
  const [techTree, setTechTree] = useState<TechItem[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetchUserTechData();
    }
  }, [session]);

  const fetchUserTechData = async () => {
    try {
      const fullTree = await fetchTechTreeData();
      setTechTree(fullTree);
    } catch (error) {
      console.error("Error loading research:", error);
      return;
    }
  };

  return (
    <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-purple-400">Technology</h3>
        <div className="grid gap-3">
          {techTree.map((tech) => (
            <div key={tech.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-white">{tech.name}</h4>
                <div className="text-purple-400 text-sm font-bold">
                  Lvl {tech.level}/{tech.maxLevel}
                </div>
              </div>
              <Progress value={tech.progress} className="h-1.5 mt-2 bg-white/10" />
            </div>
          ))}
        </div>
        <Link href="/research">
          <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white">
            Full Tech Tree
          </Button>
        </Link>
      </div>
  );
};
