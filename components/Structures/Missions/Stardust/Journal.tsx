import { useState } from 'react';
import TotalPoints from './Total';

export default function JournalPage() {
  const [pointsData, setPointsData] = useState<{
    planetHuntersPoints: number;
    dailyMinorPlanetPoints: number;
    ai4mPoints: number;
    planetFourPoints: number;
    jvhPoints: number;
    cloudspottingPoints: number;
    totalPoints: number;
  } | null>(null);

  const handleExport = (points: {
    planetHuntersPoints: number;
    dailyMinorPlanetPoints: number;
    ai4mPoints: number;
    planetFourPoints: number;
    jvhPoints: number;
    cloudspottingPoints: number;
    totalPoints: number;
  }) => {
    setPointsData(points);
  };

  return (
    <div className="min-h-screen bg-[#1D2833] py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-[#5FCBC3]">Citizen Science Journal</h1>
          
          <TotalPoints onExport={handleExport} />
          
          {pointsData && (
            <JournalAchievement
              planetHuntersPoints={pointsData.planetHuntersPoints}
              dailyMinorPlanetPoints={pointsData.dailyMinorPlanetPoints}
              ai4mPoints={pointsData.ai4mPoints}
              planetFourPoints={pointsData.planetFourPoints}
              jvhPoints={pointsData.jvhPoints}
              cloudspottingPoints={pointsData.cloudspottingPoints}
            />
          )}
        </div>
      </div>
    </div>
  );
};

import { ChevronDown, ChevronRight, Award, Star } from 'lucide-react';
import { Category, Project, Mission } from '@/types/journal';
import { JournalProgressBar } from "@/components/ui/progress";

const categories: Category[] = [
    {
      id: '1',
      name: 'Astronomers',
      totalTally: 40,
      projects: [
        {
          id: '1',
          name: 'Planet Hunters',
          totalProgress: 15,
          missions: [
            {
              id: '1',
              name: 'Classify a Planet',
              xpReward: 100,
              coinReward: 50,
              progress: 3,
              totalSteps: 5,
              isComplete: false,
            },
            {
              id: '2',
              name: 'Propose 1 planetary candidate',
              xpReward: 120,
              coinReward: 60,
              progress: 2,
              totalSteps: 5,
              isComplete: false,
            },
            {
              id: '3',
              name: 'Propose a planet type',
              xpReward: 150,
              coinReward: 70,
              progress: 1,
              totalSteps: 5,
              isComplete: false,
            },
            {
              id: '4',
              name: 'Comment & vote on Planet Classifications',
              xpReward: 130,
              coinReward: 65,
              progress: 2,
              totalSteps: 5,
              isComplete: false,
            },
            {
              id: '5',
              name: 'Calculate planetary temperatures',
              xpReward: 200,
              coinReward: 100,
              progress: 0,
              totalSteps: 5,
              isComplete: false,
            },
            {
              id: '6',
              name: 'Make your own planet design',
              xpReward: 250,
              coinReward: 125,
              progress: 0,
              totalSteps: 5,
              isComplete: false,
            },
          ],
        },
        {
          id: '2',
          name: 'Sunspots',
          totalProgress: 8,
          missions: [
            {
              id: '2',
              name: 'Track Solar Activity',
              xpReward: 80,
              coinReward: 40,
              progress: 5,
              totalSteps: 5,
              isComplete: true,
            },
          ],
        },
        {
          id: '3',
          name: 'Daily Minor Planet',
          totalProgress: 12,
          missions: [
            {
              id: '3',
              name: 'Identify Minor Planets',
              xpReward: 90,
              coinReward: 45,
              progress: 2,
              totalSteps: 4,
              isComplete: false,
            },
          ],
        },
        {
          id: '4',
          name: 'Disk Detective',
          totalProgress: 5,
          missions: [
            {
              id: '4',
              name: 'Analyze Stellar Disks',
              xpReward: 120,
              coinReward: 60,
              progress: 1,
              totalSteps: 3,
              isComplete: false,
            },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Meteorologists',
      totalTally: 67,
      projects: [
        {
          id: '5',
          name: 'Planet Four',
          totalProgress: 20,
          missions: [
            {
              id: '5',
              name: 'Study Mars Surface',
              xpReward: 150,
              coinReward: 75,
              progress: 4,
              totalSteps: 6,
              isComplete: false,
            },
          ],
        },
        {
          id: '6',
          name: 'Cloudspotting',
          totalProgress: 30,
          missions: [
            {
              id: '6',
              name: 'Make a cloud classification',
              xpReward: 100,
              coinReward: 50,
              progress: 0,
              totalSteps: 5,
              isComplete: false,
            },
            {
              id: '7',
              name: 'Propose a cloud in your classifications',
              xpReward: 70,
              coinReward: 30,
              progress: 0,
              totalSteps: 5,
              isComplete: false,
            },
            {
              id: '8',
              name: 'Comment or vote on a cloud classification',
              xpReward: 50,
              coinReward: 20,
              progress: 0,
              totalSteps: 5,
              isComplete: false,
            },
            {
              id: '9',
              name: 'Create a cloud representation',
              xpReward: 150,
              coinReward: 70,
              progress: 0,
              totalSteps: 5,
              isComplete: false,
            },
          ],
        },
        {
          id: '7',
          name: 'AI4M',
          totalProgress: 7,
          missions: [
            {
              id: '10',
              name: 'Train Weather AI',
              xpReward: 200,
              coinReward: 100,
              progress: 2,
              totalSteps: 5,
              isComplete: false,
            },
          ],
        },
        {
          id: '8',
          name: 'Jovian Vortex Hunter',
          totalProgress: 10,
          missions: [
            {
              id: '11',
              name: 'Track Jupiter Storms',
              xpReward: 180,
              coinReward: 90,
              progress: 3,
              totalSteps: 6,
              isComplete: false,
            },
            {
              id: '12',
              name: 'Make a cloud classification',
              xpReward: 100,
              coinReward: 50,
              progress: 0,
              totalSteps: 5,
              isComplete: false,
            },
            {
              id: '13',
              name: 'Propose a cloud candidate',
              xpReward: 80,
              coinReward: 40,
              progress: 0,
              totalSteps: 5,
              isComplete: false,
            },
          ],
        },
      ],
    },
    {
      id: '3',
      name: 'Biologists',
      totalTally: 50,
      projects: [
        {
          id: '9',
          name: 'Animal & Plant observations',
          totalProgress: 50,
          missions: [
            {
              id: '14',
              name: 'Document Local Species',
              xpReward: 100,
              coinReward: 50,
              progress: 1,
              totalSteps: 12,
              isComplete: false,
            },
          ],
        },
      ],
    },
];  

function JournalAchievement({
    planetHuntersPoints,
    dailyMinorPlanetPoints,
    ai4mPoints,
    planetFourPoints,
    jvhPoints,
    cloudspottingPoints,
  }: {
    planetHuntersPoints: number;
    dailyMinorPlanetPoints: number;
    ai4mPoints: number;
    planetFourPoints: number;
    jvhPoints: number;
    cloudspottingPoints: number;
  }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projectPoints: { [key: string]: number } = {
    "1": planetHuntersPoints,
    "3": dailyMinorPlanetPoints,
    "7": ai4mPoints,
    "5": planetFourPoints,
    "8": jvhPoints,
    "6": cloudspottingPoints,
  };  

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project)
  };

  return (
    <div className="flex flex-col lg:flex-row bg-[#1D2833] rounded-lg shadow-lg overflow-hidden border border-[#2C4F64]/20">
      {/* Left column: Categories and Projects */}
      <div className="w-full lg:w-1/2 p-6 bg-gradient-to-b from-[#1D2833] to-[#2C4F64]/10">
        <h2 className="text-2xl font-bold mb-6 text-[#2C4F64] flex items-center gap-2">
          <Award className="w-6 h-6 text-[#FF695D]" />
          Journal & Achievements
        </h2>

        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            <button
              className="flex items-center justify-between w-full p-3 bg-[#2C4F64]/5 rounded-lg shadow-sm border border-[#2C4F64]/20 hover:bg-[#2C4F64]/20 transition-colors"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#2C4F64]">{category.name}</span>
                <span className="text-sm text-[#5FCBC3]">
                  (Total: {category.totalTally})
                </span>
              </div>
              {expandedCategory === category.id ? <ChevronDown /> : <ChevronRight />}
            </button>

            {expandedCategory === category.id && (
              <div className="mt-4 space-y-3">
                {category.projects.map((project) => (
                  <button
                    key={project.id}
                    className={`w-full p-3 bg-[#2C4F64]/10 rounded-lg shadow-sm border ${
                      selectedProject?.id === project.id
                        ? "border-[#5FCBC3]"
                        : "border-[#2C4F64]/20"
                    } hover:bg-[#2C4F64]/20 transition-colors`}
                    onClick={() => selectProject(project)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#5FCBC3]">
                        {project.name}
                      </span>
                      <span className="text-sm text-[#FFD700]">
                        Points: {projectPoints[project.id] || 0}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right column: Missions */}
      {selectedProject && (
        <div className="w-full lg:w-1/2 p-6 bg-gradient-to-b from-[#2C4F64]/10 to-[#1D2833]">
          <h3 className="text-xl font-bold mb-4 text-[#FFD700]">
            {selectedProject.name}
          </h3>
          <ul className="space-y-3">
            {selectedProject.missions.map((mission) => (
              <li
                key={mission.id}
                className="p-3 bg-[#1D2833] rounded-lg shadow-sm border border-[#2C4F64]/20"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[#5FCBC3] font-semibold">
                    {mission.name}
                  </span>
                  <div className="text-sm">
                    <span className="text-[#FFD700] font-bold">
                      XP: {mission.xpReward}
                    </span>{" "}
                    |{" "}
                    <span className="text-[#FF695D] font-bold">
                      Coins: {mission.coinReward}
                    </span>
                  </div>
                </div>
                <JournalProgressBar
                    progress={mission.progress}
                    total={mission.totalSteps}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

import { Sparkles, Coins } from 'lucide-react';

interface MissionCardProps {
  mission: Mission
};

function MissionCard({ mission }: MissionCardProps) {
  return (
    <div className="bg-[#2C4F64]/10 rounded-lg p-4 mb-2 shadow-sm border border-[#2C4F64]/20">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-[#5FCBC3]">{mission.name}</h4>
        <div className="flex gap-4">
          <div className="flex items-center gap-1 text-sm">
            <Sparkles className="w-4 h-4 text-[#5FCBC3]" />
            <span className="text-[#5FCBC3]">{mission.xpReward} XP</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Coins className="w-4 h-4 text-[#FF695D]" />
            <span className="text-[#5FCBC3]">{mission.coinReward}</span>
          </div>
        </div>
      </div>
      <JournalProgressBar 
        progress={mission.progress} 
        total={mission.totalSteps}
        showPercentage 
      />
      {mission.isComplete && (
        <div className="flex justify-end">
          <span className="text-[#FF695D] text-sm">✓ Complete</span>
        </div>
      )}
    </div>
  );
};