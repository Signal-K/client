"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Star,
  Target,
  Eye,
  Rocket,
  Palette,
  Wrench,
  Zap,
  Search,
  Lock,
  CheckCircle2,
  Coins,
  User,
  ArrowLeft,
} from "lucide-react"
import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

interface Skill {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    unlocked: boolean;
    completed: boolean;
    progress: number;
    maxProgress: number;
    cost: number;
    prerequisites: string[];
    category: "planet" | "asteroid" | "sunspot" | "disk" | "";
    level: number;
    xpReward: number;
};

interface SkillTreeViewProps {
    onBack: () => void;
    userXP: number; // stardust
    userCoins: number; // Or is this stardust?
};

const skills: Skill[] = [
  // Planet Hunting Branch
  {
    id: "planet-hunting",
    name: "Planet Hunting",
    description: "Discover and identify exoplanets in distant star systems",
    icon: <Star className="h-4 w-4" />,
    unlocked: true,
    completed: true,
    progress: 100,
    maxProgress: 100,
    cost: 0,
    prerequisites: [],
    category: "planet",
    level: 1,
    xpReward: 50,
  },
  {
    id: "planet-analysis",
    name: "Planetary Analysis",
    description: "Study planetary characteristics: radius, temperature, orbital period, and atmospheric composition",
    icon: <Eye className="h-4 w-4" />,
    unlocked: true,
    completed: false,
    progress: 25,
    maxProgress: 100,
    cost: 100,
    prerequisites: ["planet-hunting"],
    category: "planet",
    level: 2,
    xpReward: 75,
  },
  {
    id: "planet-exploration",
    name: "Virtual Exploration",
    description: "Take virtual journeys to discovered planets and explore their surfaces",
    icon: <Rocket className="h-4 w-4" />,
    unlocked: true,
    completed: false,
    progress: 0,
    maxProgress: 100,
    cost: 200,
    prerequisites: ["planet-analysis"],
    category: "planet",
    level: 3,
    xpReward: 100,
  },
  {
    id: "planet-visualization",
    name: "3D Visualization",
    description: "Generate detailed 3D models and visualizations of planetary systems",
    icon: <Palette className="h-4 w-4" />,
    unlocked: true,
    completed: false,
    progress: 0,
    maxProgress: 100,
    cost: 300,
    prerequisites: ["planet-exploration"],
    category: "planet",
    level: 4,
    xpReward: 125,
  },
  {
    id: "terraforming",
    name: "Terraforming Simulation",
    description: "Advanced planetary engineering and atmospheric modification simulations",
    icon: <Wrench className="h-4 w-4" />,
    unlocked: false,
    completed: false,
    progress: 0,
    maxProgress: 100,
    cost: 500,
    prerequisites: ["planet-visualization"],
    category: "planet",
    level: 5,
    xpReward: 200,
  },

  // Asteroid Branch
  {
    id: "asteroid-hunting",
    name: "Asteroid Detection",
    description: "Identify and track near-Earth asteroids and minor planets",
    icon: <Target className="h-4 w-4" />,
    unlocked: false,
    completed: false,
    progress: 0,
    maxProgress: 100,
    cost: 150,
    prerequisites: ["planet-hunting"],
    category: "asteroid",
    level: 2,
    xpReward: 75,
  },
  {
    id: "active-asteroids",
    name: "Active Asteroid Study",
    description: "Observe and analyze asteroids with active surfaces, tails, and outgassing",
    icon: <Zap className="h-4 w-4" />,
    unlocked: false,
    completed: false,
    progress: 0,
    maxProgress: 100,
    cost: 250,
    prerequisites: ["asteroid-hunting"],
    category: "asteroid",
    level: 3,
    xpReward: 100,
  },
  {
    id: "collision-observation",
    name: "Impact Analysis",
    description: "Study asteroid collisions and their effects on planetary systems",
    icon: <Zap className="h-4 w-4" />,
    unlocked: false,
    completed: false,
    progress: 0,
    maxProgress: 100,
    cost: 400,
    prerequisites: ["active-asteroids"],
    category: "asteroid",
    level: 4,
    xpReward: 150,
  },
  {
    id: "collision-simulation",
    name: "Impact Simulation",
    description: "Advanced modeling of asteroid impacts and trajectory modifications",
    icon: <Target className="h-4 w-4" />,
    unlocked: false,
    completed: false,
    progress: 0,
    maxProgress: 100,
    cost: 600,
    prerequisites: ["collision-observation"],
    category: "asteroid",
    level: 5,
    xpReward: 200,
  },
];

export default function TelescopeTechTreeView({
    onBack,
    userXP,
    userCoins,
}: SkillTreeViewProps) {
    const supabase = useSupabaseClient();

    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

    const getSkillPosition = ( skillId: string ) => {
        const positions: Record<string, { x: number; y: number }> = {
            "planet-hunting": { x: 100, y: 150 },
            "planet-analysis": { x: 250, y: 125 },
            "planet-exploration": { x: 400, y: 100 },
            "planet-visualization": { x: 550, y: 75 },
            terraforming: { x: 700, y: 50 },
            "asteroid-hunting": { x: 250, y: 175 },
            "active-asteroids": { x: 400, y: 200 },
            "collision-observation": { x: 550, y: 225 },
            "collision-simulation": { x: 700, y: 250 },
        };

        return positions[skillId] || { x: 0, y: 0 };
    };

    const getConnectionPath = ( from: string, to: string ) => {
        const fromPos = getSkillPosition(from);
        const toPos = getSkillPosition(to);
        return `M ${fromPos.x + 25} ${fromPos.y + 25} L ${toPos.x + 25} ${toPos.y + 25}`
    };

    const canUnlockSkill = ( skill: Skill ) => {
        if (skill.unlocked) return false;
        const prerequisitesMet = skill.prerequisites.every((prereqId) => {
            const prereq = skills.find((s) => s.id === prereqId);
            return prereq?.completed;
        });
        return prerequisitesMet && userCoins >= skill.cost;
    };

    const unlockSkill = ( skillId: string ) => {
        console.log(`Unlocking skill: ${skillId}`);
    };

    return (
        <div className="h-full bg-gradient-to-br from=[#002439] to-[#005066] flex flex-col overflow-hidden">
            <div className="flex-shrink-0 p-4 lg:p-6 border-b border-[#78cce2]/30 bg-[#005066]/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button onClick={onBack} variant="ghost" size="sm" className="text-[#78cce2] hover:bg-[78cce2]/20">
                            <ArrowLeft className="h-4 w-4 mr-2" />Back (Telescope)
                        </Button>
                        <div className="hidden lg:block w-px h-6 bg-[#78cce2]/30 mx-2"></div>
                        <div className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-[#78cce2]" />
                            <h1 className="text-[#e4eff0] font-bold text-lg lg:text-xl font-mono">RESEARCH & DEVELOPMENT</h1>
                        </div>
                    </div>
                              <div className="flex items-center gap-3">
            <Badge className="bg-[#78cce2] text-[#002439] font-mono text-xs">
              <User className="h-3 w-3 mr-1" />
              LVL {Math.floor(userXP / 100) + 1}
            </Badge>
            <Badge className="bg-[#EBCB8B] text-[#002439] font-mono text-xs">
              <Coins className="h-3 w-3 mr-1" />
              {userCoins}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Skill Tree Visualization */}
        <div className="flex-1 relative overflow-auto bg-gradient-to-br from-[#002439] to-[#005066] border-r border-[#78cce2]/30">
          <div className="relative p-4" style={{ minWidth: "800px", minHeight: "400px" }}>
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ minWidth: "800px", minHeight: "400px" }}
            >
              {/* Connection Lines */}
              {skills.flatMap((skill) =>
                skill.prerequisites.map((prereqId) => (
                  <path
                    key={`${prereqId}-${skill.id}`}
                    d={getConnectionPath(prereqId, skill.id)}
                    stroke={skill.unlocked ? "#78cce2" : "#4e7988"}
                    strokeWidth="2"
                    strokeDasharray={skill.unlocked ? "0" : "5,5"}
                    opacity={0.7}
                  />
                )),
              )}
            </svg>

            {/* Skill Nodes */}
            {skills.map((skill) => {
              const position = getSkillPosition(skill.id)
              const canUnlock = canUnlockSkill(skill)

              return (
                <div
                  key={skill.id}
                  className={`absolute w-12 h-12 lg:w-14 lg:h-14 rounded-full border-3 cursor-pointer transition-all duration-300 flex items-center justify-center ${
                    skill.completed
                      ? "bg-[#A3BE8C] border-[#A3BE8C] shadow-lg shadow-[#A3BE8C]/50"
                      : skill.unlocked
                        ? "bg-[#78cce2] border-[#78cce2] shadow-lg shadow-[#78cce2]/50 hover:scale-110"
                        : canUnlock
                          ? "bg-[#EBCB8B] border-[#EBCB8B] shadow-lg shadow-[#EBCB8B]/50 hover:scale-110"
                          : "bg-[#4e7988] border-[#4e7988] opacity-50"
                  }`}
                  style={{
                    left: position.x,
                    top: position.y,
                  }}
                  onClick={() => setSelectedSkill(skill)}
                >
                  {skill.completed ? (
                    <CheckCircle2 className="h-6 w-6 lg:h-7 lg:w-7 text-[#002439]" />
                  ) : skill.unlocked || canUnlock ? (
                    <div className="text-[#002439]">{skill.icon}</div>
                  ) : (
                    <Lock className="h-5 w-5 lg:h-6 lg:w-6 text-[#002439]" />
                  )}

                  {/* Progress Ring */}
                  {skill.unlocked && !skill.completed && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="50%" cy="50%" r="22" fill="none" stroke="#002439" strokeWidth="2" opacity="0.3" />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="22"
                        fill="none"
                        stroke="#002439"
                        strokeWidth="2"
                        strokeDasharray={`${(skill.progress / skill.maxProgress) * 138.2} 138.2`}
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Skill Details Panel */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-[#005066]/50 overflow-y-auto">
          <div className="p-4 space-y-4">
            {selectedSkill ? (
              <Card className="bg-[#005066] border border-[#78cce2]/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedSkill.completed
                          ? "bg-[#A3BE8C]"
                          : selectedSkill.unlocked
                            ? "bg-[#78cce2]"
                            : "bg-[#4e7988]"
                      }`}
                    >
                      {selectedSkill.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-[#002439]" />
                      ) : (
                        <div className="text-[#002439]">{selectedSkill.icon}</div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-[#e4eff0] font-mono text-sm">{selectedSkill.name}</CardTitle>
                      <Badge className="bg-[#4e7988] text-[#e4eff0] text-xs mt-1">LEVEL {selectedSkill.level}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[#78cce2] text-sm">{selectedSkill.description}</p>

                  {/* Progress */}
                  {selectedSkill.unlocked && !selectedSkill.completed && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#e4eff0]">Progress</span>
                        <span className="text-[#78cce2]">
                          {selectedSkill.progress}/{selectedSkill.maxProgress}
                        </span>
                      </div>
                      <Progress
                        value={(selectedSkill.progress / selectedSkill.maxProgress) * 100}
                        className="h-2 bg-[#002439]"
                      />
                    </div>
                  )}

                  {/* Prerequisites */}
                  {selectedSkill.prerequisites.length > 0 && (
                    <div>
                      <h4 className="text-[#e4eff0] text-sm font-mono mb-2">PREREQUISITES:</h4>
                      <div className="space-y-1">
                        {selectedSkill.prerequisites.map((prereqId) => {
                          const prereq = skills.find((s) => s.id === prereqId)
                          return (
                            <div key={prereqId} className="flex items-center gap-2 text-xs">
                              {prereq?.completed ? (
                                <CheckCircle2 className="h-3 w-3 text-[#A3BE8C]" />
                              ) : (
                                <div className="w-3 h-3 rounded-full bg-[#4e7988]" />
                              )}
                              <span className={prereq?.completed ? "text-[#A3BE8C]" : "text-[#4e7988]"}>
                                {prereq?.name}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#002439] p-2 rounded">
                      <div className="text-[#78cce2]">XP Reward</div>
                      <div className="text-[#e4eff0] font-mono">+{selectedSkill.xpReward}</div>
                    </div>
                    <div className="bg-[#002439] p-2 rounded">
                      <div className="text-[#78cce2]">Cost</div>
                      <div className="text-[#EBCB8B] font-mono">{selectedSkill.cost} coins</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!selectedSkill.unlocked && canUnlockSkill(selectedSkill) && (
                    <Button
                      onClick={() => unlockSkill(selectedSkill.id)}
                      className="w-full bg-[#EBCB8B] text-[#002439] hover:bg-[#D08770] font-mono text-sm"
                    >
                      UNLOCK SKILL
                    </Button>
                  )}

                  {selectedSkill.completed && (
                    <Badge className="w-full justify-center bg-[#A3BE8C] text-[#002439] font-mono">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      COMPLETED
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#005066] border border-[#78cce2]/30">
                <CardContent className="p-6 text-center">
                  <Search className="h-10 w-10 text-[#78cce2] mx-auto mb-3" />
                  <h3 className="text-[#e4eff0] font-mono text-sm mb-2">SELECT A SKILL</h3>
                  <p className="text-[#78cce2] text-xs">
                    Click on any skill node to view details and unlock new capabilities
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Legend */}
            <Card className="bg-[#005066] border border-[#78cce2]/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#e4eff0] font-mono text-sm">LEGEND</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#A3BE8C] flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-[#002439]" />
                  </div>
                  <span className="text-[#e4eff0] text-xs">Completed</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#78cce2] flex items-center justify-center">
                    <Star className="h-3 w-3 text-[#002439]" />
                  </div>
                  <span className="text-[#e4eff0] text-xs">Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#EBCB8B] flex items-center justify-center">
                    <Star className="h-3 w-3 text-[#002439]" />
                  </div>
                  <span className="text-[#e4eff0] text-xs">Can Unlock</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#4e7988] opacity-50 flex items-center justify-center">
                    <Lock className="h-3 w-3 text-[#002439]" />
                  </div>
                  <span className="text-[#e4eff0] text-xs">Locked</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};