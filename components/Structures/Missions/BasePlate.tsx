import { useState } from "react";
import { Button } from "@/components/ui/button"; 
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion"; 

interface MissionConfig {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  points: number;
  internalComponent: React.ElementType;
  color: string;
  action: () => void;
  completedCount?: number;
}

interface MissionShellProps {
  missions: MissionConfig[]; 
  experiencePoints: number; 
  level: number; 
  currentChapter: number; 
}

const MissionShell = ({ missions, experiencePoints, level, currentChapter }: MissionShellProps) => {
    const [selectedMission, setSelectedMission] = useState<MissionConfig | null>(null);
  
    const renderMission = (mission: MissionConfig) => {
      const completedCount = mission.completedCount ?? 0;
  
      return (
        <div
          key={mission.id}
          className={`flex items-center p-6 rounded-2xl cursor-pointer${
            mission.id > 2 ? "bg-[#74859A]" : mission.id < 3 ?  "bg-gray-000" : completedCount > 0 ? "bg-gray-700" : ""
          }`}
          onClick={() => setSelectedMission(mission)}
        >
          <mission.icon className={`w-10 h-10 ${mission.color}`} />
          <div className="ml-4">
            <h2 className={`text-lg font-bold ${mission.color}`}>{mission.title}</h2>
            <p className={`text-sm ${mission.color}`}>{mission.description}</p>
            <p className={`text-sm ${mission.color}`}>Points: {mission.points}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs">Completed: {completedCount}</p>
            <p className="text-xl font-bold">{completedCount}</p>
          </div>
        </div>
      );
    };
  
    return (
      <div className="flex flex-col items-center bg-[#1D2833] text-white rounded-2xl shadow-lg p-6 w-full max-w-4xl mx-auto">
        <div className="flex justify-between w-full mb-6">
          <h1 className="text-xl font-bold">Chapter {currentChapter}</h1>
        </div>
        <div className="flex-1 overflow-y-auto w-full">
          <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
            <div
              className="bg-[#5FCBC3] h-4 rounded-full"
              style={{ width: `${(experiencePoints % 9) * 10.5}%` }}
            ></div>
          </div>
        </div>
        <p className="text-sm text-center mb-6">
          Level {level} ({experiencePoints} points)
        </p>
        <div className="bg-gray-700 p-6 rounded-2xl w-full mb-6">
          <div className="grid grid-cols-2 gap-4 w-full">
            {missions.slice(0, 2).map((mission) => renderMission(mission))}
          </div>
        </div>
        <div className="grid gap-4 w-full mt-6">
          {missions.slice(2).map((mission) => renderMission(mission))}
        </div>
        <AnimatePresence>
          {selectedMission && (
            <motion.div
              className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-[#2C4F64] p-6 rounded-lg max-w-md w-full">
                <h3 className="text-xl font-semibold mb-2">{selectedMission.title}</h3>
                <p>{selectedMission.description}</p>
                <div className="mt-4">
                  {selectedMission.internalComponent && <selectedMission.internalComponent />}
                </div>
                <Button onClick={() => setSelectedMission(null)} className="mt-4">
                  Close
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
};
  
export default MissionShell;