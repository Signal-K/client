'use client'

import React, { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon, User } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { SkillTree } from "@/components/Research/SkillTree/tree"
import { SkillIcons } from "@/components/Research/SkillTree/skill-node"
import { SkillTreeExpandedPanelOverlay } from "@/components/ui/panel-overlay"
import { SkillCategory, Skill } from "@/types/Reseearch/skill-tree"
import { isSkillUnlockable } from "@/utils/research/skill-utils"

interface ExpandedPanelState {
  type: "structures" | "notifications" | "discoveries" | "missions" | "tech_tree"
  data: any[] // The full data array for the specific panel
};

export default function SkillTreePage() {
    const [isDark, setIsDark] = useState(false);
    const [activeExpandedPanel, setActiveExpandedPanel] = useState<ExpandedPanelState | null>(null);
    const [activeSkillDetailPanel, setActiveSkillDetailPanel] = useState<Skill | null>(null);
    const [unlockedSkills, setUnlockedSkills] = useState<string[]>([]);
    const [classifiedPlanets, setClassifiedPlanets] = useState(0);
    const [discoveredAsteroids, setDiscoveredAsteroids] = useState(0);

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [isDark]);

    useEffect(() => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setIsDark(prefersDark);
    }, []);

    useEffect(() => {
        setClassifiedPlanets(2);
        setDiscoveredAsteroids(1);
        setUnlockedSkills(['planet-hunters']);
    }, []);

    const handleThemeToggle = () => {
        setIsDark(( prev ) => !prev);
    };

    const handleExpandPanel = ( type: ExpandedPanelState['type'], data: any) => {
        setActiveExpandedPanel({
            type,
            data
        });
    };

    const handleCloseExpandedPanel = () => {
        setActiveExpandedPanel(null);
        setActiveSkillDetailPanel(null);
    }

    const handleViewSkillDetails = ( skill: Skill ) => {
        setActiveSkillDetailPanel(skill);
    };

    const handleUnlockSkill = ( skillId: string ) => {
        const skillToUnlock = skillTreeData[0].skills.find((s) => s.id === skillId);
        if (skillToUnlock && skillToUnlock.status === 'available') {
            setUnlockedSkills(( prev ) => [...prev, skillId])
            console.log(`Skill unlocked: ${skillId}`);
            handleCloseExpandedPanel();
        };
    };

    const skillTreeData: SkillCategory[] = [
        {
        id: "telescope",
        name: "Telescope Operations",
        skills: [
            {
            id: "planet-hunters",
            name: "Planet Hunters",
            description: "Master the art of discovering new exoplanets and celestial bodies.",
            status: unlockedSkills.includes("planet-hunters") ? "unlocked" : "available", // Always available/unlocked
            prerequisites: [],
            unlockCost: 0,
            icon: SkillIcons.PlanetHunters,
            details: ["Increases exoplanet discovery rate.", "Unlocks advanced planetary analysis tools."],
            },
            {
            id: "asteroid-hunting",
            name: "Asteroid Hunting",
            description: "Specialize in identifying and tracking asteroids, including potential resource-rich ones.",
            status:
                classifiedPlanets >= 4 && unlockedSkills.includes("planet-hunters")
                ? unlockedSkills.includes("asteroid-hunting")
                    ? "unlocked"
                    : "available"
                : "locked",
            prerequisites: [
                { type: "skill", value: "planet-hunters" },
                { type: "progress", value: "4 planets classified" },
            ],
            unlockCost: 100,
            icon: SkillIcons.AsteroidHunting,
            details: ["Improves asteroid detection range.", "Unlocks asteroid trajectory prediction."],
            },
            {
            id: "planet-exploration",
            name: "Planet Exploration",
            description:
                "Learn techniques for detailed surface analysis and environmental assessment of discovered planets.",
            status:
                classifiedPlanets >= 1 && unlockedSkills.includes("planet-hunters")
                ? unlockedSkills.includes("planet-exploration")
                    ? "unlocked"
                    : "available"
                : "locked",
            prerequisites: [
                { type: "skill", value: "planet-hunters" },
                { type: "progress", value: "1 planet explored" },
            ],
            unlockCost: 150,
            icon: SkillIcons.PlanetExploration,
            details: ["Enables detailed planetary surface scans.", "Unlocks environmental data collection."],
            },
            {
            id: "cloudspotting",
            name: "Cloudspotting",
            description:
                "Focus on atmospheric phenomena, identifying unique cloud formations and weather patterns on gas giants.",
            status: unlockedSkills.includes("planet-exploration")
                ? unlockedSkills.includes("cloudspotting")
                ? "unlocked"
                : "available"
                : "locked",
            prerequisites: [
                { type: "skill", value: "planet-exploration" },
                { type: "progress", value: "1 planet explored" },
            ],
            unlockCost: 200,
            icon: SkillIcons.Cloudspotting,
            details: ["Improves atmospheric analysis capabilities.", "Unlocks weather prediction models for gas giants."],
            },
            {
            id: "active-asteroids",
            name: "Active Asteroids",
            description: "Specialize in detecting and analyzing active asteroids, which exhibit comet-like activity.",
            status:
                discoveredAsteroids >= 2 && unlockedSkills.includes("asteroid-hunting")
                ? unlockedSkills.includes("active-asteroids")
                    ? "unlocked"
                    : "available"
                : "locked",
            prerequisites: [
                { type: "skill", value: "asteroid-hunting" },
                { type: "progress", value: "2 asteroids discovered" },
            ],
            unlockCost: 250,
            icon: SkillIcons.ActiveAsteroids,
            details: ["Enhances detection of active asteroids.", "Provides insights into their unique compositions."],
            },
        ],
        },
        // Add more categories and skills here later
    ];

    const updatedSkillTreeData: SkillCategory[] = skillTreeData.map(( category ) => ({
        ...category,
        skills: category.skills.map(( skill ) => {
            const isUnlocked = unlockedSkills.includes(skill.id);
            const isAvailable = isSkillUnlockable(skill, unlockedSkills, classifiedPlanets, discoveredAsteroids);
            return {
                ...skill,
                status: isUnlocked
                    ? "unlocked"
                    : isAvailable
                    ? "available"
                    : "locked"
            } as Skill;
        }),
    }));

    return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Top Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 lg:px-6 py-3 bg-card border-b border-border gap-4 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-chart-2" />
            <Switch checked={isDark} onCheckedChange={handleThemeToggle} />
            <Moon className="w-4 h-4 text-chart-4" />
          </div>
          {/* Profile Dropdown Menu */}

        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        <SkillTree
            skillTreeData={updatedSkillTreeData}
            classifiedPlanets={classifiedPlanets}
            discoveredAsteroids={discoveredAsteroids}
            onUnlockSkill={handleUnlockSkill}
            onViewSkillDetails={handleViewSkillDetails} // Use the new handler
            isFullTree={true} // This page always shows the full tree
            onViewDetails={function (): void {
                throw new Error("Function not implemented.")
            } }        
        />
      </div>
      
      {activeSkillDetailPanel && (
        <SkillTreeExpandedPanelOverlay
          skill={activeSkillDetailPanel}
          onClose={handleCloseExpandedPanel}
          onUnlockSkill={handleUnlockSkill}
          isUnlockable={isSkillUnlockable(
            activeSkillDetailPanel,
            unlockedSkills,
            classifiedPlanets,
            discoveredAsteroids,
          )}
        />
      )}
    </div>
  );
};