import { useState } from 'react';
import TotalPoints from './Total';
import { ChevronDown, ChevronRight, Award, Star } from 'lucide-react';
import { Category, Project, Mission } from '@/types/journal';
import { JournalProgressBar } from "@/src/components/ui/progress";

function OverallCategoryPoints({
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
  const astronomyTotal =
    planetHuntersPoints + dailyMinorPlanetPoints;
  const meteorologyTotal =
    ai4mPoints + planetFourPoints + jvhPoints + cloudspottingPoints;
  const biologyTotal = 0; // No point input yet for biology project

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <h2 className="text-xl font-bold mb-4 text-[#5FCBC3] flex items-center gap-2">
        <Star className="w-5 h-5 text-[#FFD700]" />
        Category Points Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#1D2833] rounded-lg border border-[#2C4F64]/30">
          <div className="text-sm text-[#5FCBC3]">Astronomy</div>
          <div className="text-2xl font-bold text-[#FFD700]">{astronomyTotal}</div>
        </div>
        <div className="p-4 bg-[#1D2833] rounded-lg border border-[#2C4F64]/30">
          <div className="text-sm text-[#5FCBC3]">Meteorology</div>
          <div className="text-2xl font-bold text-[#FFD700]">{meteorologyTotal}</div>
        </div>
        <div className="p-4 bg-[#1D2833] rounded-lg border border-[#2C4F64]/30">
          <div className="text-sm text-[#5FCBC3]">Biology</div>
          <div className="text-2xl font-bold text-[#FFD700]">{biologyTotal}</div>
        </div>
      </div>
    </div>
  );
};

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
    <div>          
          <TotalPoints onExport={handleExport} />
          
          {pointsData && (
            // <JournalAchievement
            <><MinimalJournalPage
              planetHuntersPoints={pointsData.planetHuntersPoints}
              dailyMinorPlanetPoints={pointsData.dailyMinorPlanetPoints}
              ai4mPoints={pointsData.ai4mPoints}
              planetFourPoints={pointsData.planetFourPoints}
              jvhPoints={pointsData.jvhPoints}
              cloudspottingPoints={pointsData.cloudspottingPoints}
            />
            <OverallCategoryPoints
            planetHuntersPoints={pointsData.planetHuntersPoints}
            dailyMinorPlanetPoints={pointsData.dailyMinorPlanetPoints}
            ai4mPoints={pointsData.ai4mPoints}
            planetFourPoints={pointsData.planetFourPoints}
            jvhPoints={pointsData.jvhPoints}
            cloudspottingPoints={pointsData.cloudspottingPoints}
          /></>
          )}
    </div>
  );
};

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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openCategories, setOpenCategories] = useState<number[]>([]); // Track open categories

  const projectPoints: { [key: string]: number } = {
    "1": planetHuntersPoints,
    "3": dailyMinorPlanetPoints,
    "7": ai4mPoints,
    "5": planetFourPoints,
    "8": jvhPoints,
    "6": cloudspottingPoints,
  };

  const toggleCategory = (categoryId: number) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
  };

  return (
    <div className="flex w-full h-full">
      {/* Left Panel: Categories and Projects */}
      <div className="flex-1 p-6 bg-gradient-to-b from-[#1D2833] to-[#2C4F64]/10 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-[#2C4F64] flex items-center gap-2">
          <Award className="w-6 h-6 text-[#FF695D]" />
          Journal & Achievements
        </h2>
        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            <button
              className="flex items-center justify-between w-full p-3 bg-[#2C4F64]/5 rounded-lg shadow-sm border border-[#2C4F64]/20 hover:bg-[#2C4F64]/20 transition-colors"
              onClick={() => toggleCategory(Number(category.id))} 
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#2C4F64]">{category.name}</span>
              </div>
              <ChevronDown
                className={`transition-transform ${
                  openCategories.includes(Number(category.id)) ? "rotate-180" : ""
                }`}
              />
              </button>
              <div
                className={`mt-4 space-y-3 transition-all duration-300 ease-in-out ${
                  openCategories.includes(Number(category.id)) ? "max-h-screen" : "max-h-0"
                } overflow-hidden`}
              >
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
          </div>
        ))}
      </div>

      {/* Right Panel: Selected Project Details */}
      <div className="flex-1 p-6 bg-gradient-to-b from-[#2C4F64]/10 to-[#1D2833] overflow-y-auto">
        {selectedProject ? (
          <>
            <h3 className="text-xl font-bold mb-4 text-[#FFD700]">
              {selectedProject.name}
            </h3>
            <ul className="space-y-3">
              {selectedProject?.missions?.map((mission) => (
                <li
                  key={mission.id}
                  className="p-3 bg-[#1D2833] rounded-lg shadow-sm border border-[#2C4F64]/20"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[#5FCBC3] font-semibold">
                      {mission.name}
                    </span>
                  </div>
                  <JournalProgressBar
                    progress={mission.progress}
                    total={mission.totalSteps}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-[#5FCBC3]">
            <span>Select a project to see details</span>
          </div>
        )}
      </div>
    </div>
  );
};

function MinimalJournalPage({
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
    const [openCategories, setOpenCategories] = useState<number[]>([]); // Track open categories
  
    const projectPoints: { [key: string]: number } = {
      "1": planetHuntersPoints,
      "3": dailyMinorPlanetPoints,
      "7": ai4mPoints,
      "5": planetFourPoints,
      "8": jvhPoints,
      "6": cloudspottingPoints,
    };
  
    const toggleCategory = (categoryId: number) => {
      setOpenCategories((prev) =>
        prev.includes(categoryId) 
          ? prev.filter((id) => id !== categoryId)
          : [...prev, categoryId]
      );
    };
    
    return (
      <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-b from-[#0f172a] to-[#020617] text-white rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-[#581c87]">
        {/* Left Panel: Categories and Projects */}
        <div className="flex-1 p-6  bg-gradient-to-b from-[#0f172a] to-[#020617] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-[#2C4F64] flex items-center gap-2">
            <Award className="w-6 h-6 text-[#FF695D]" />
            Your progress
          </h2>
          {categories.map((category) => (
            <div key={category.id} className="mb-4">
              <button
                className="flex items-center justify-between w-full p-3 bg-[#2C4F64]/5 rounded-lg shadow-sm border border-[#2C4F64]/20 hover:bg-[#2C4F64]/20 transition-colors"
                onClick={() => toggleCategory(Number(category.id))} 
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#2C4F64]">{category.name}</span>
                </div>
                <ChevronDown
                  className={`transition-transform ${
                    openCategories.includes(Number(category.id)) ? "rotate-180" : ""
                  }`}
                />
                </button>
                <div
                  className={`mt-4 space-y-3 transition-all duration-300 ease-in-out ${
                    openCategories.includes(Number(category.id)) ? "max-h-screen" : "max-h-0"
                  } overflow-hidden`}
                >
                {category.projects.map((project) => (
                  <button
                    key={project.id}
                    className={`w-full p-3 bg-[#2C4F64]/10 rounded-lg shadow-sm border hover:bg-[#2C4F64]/20 transition-colors`}
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
            </div>
          ))}
        </div>
      </div>
    );
};