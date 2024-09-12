'use client';

import { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from 'framer-motion';

interface TutorialMessageProps {
  isExpanded: boolean;
  toggleExpand: () => void;
}

export const CaptnCosmosGuideModal: React.FC<TutorialMessageProps> = ({ isExpanded, toggleExpand }) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [missions, setMissions] = useState<number[]>([]);
  const [activeMission, setActiveMission] = useState<number | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from("missions")
          .select("mission")
          .eq("user", session.user.id);

        if (error) throw error;

        // Extract unique missions and filter to include only specified missions
        const uniqueMissions = Array.from(new Set(data.map((item: { mission: number }) => item.mission)))
                                    .filter(mission => [1370201, 1370203, 1370204, 1370205, 1370206, 1370207, 1370208, 1370209].includes(mission));
        
        setMissions(uniqueMissions);
      } catch (error: any) {
        console.error("Error fetching missions:", error.message);
      }
    };

    fetchMissions();
  }, [session, supabase]);

  useEffect(() => {
    const determineActiveMission = () => {
      const missionOrder = [1370209, 1370208, 1370207, 1370206, 1370205, 1370204, 1370203, 1370201];
      for (const mission of missionOrder) {
        if (missions.includes(mission)) {
          setActiveMission(mission);
          break;
        }
      }
    };

    determineActiveMission();
  }, [missions]);

  const missionDescriptions: { [key: number]: string } = {
    1370201: "Begin your journey!",
    1370203: "Continue your exploration!",
    1370204: "Uncover new discoveries!",
    1370205: "Venture further!",
    1370206: "Reach new heights!",
    1370207: "The final frontier!",
    1370208: "Beyond the known universe!",
    1370209: "Complete the ultimate quest!",
  };

  const renderMissionText = () => {
    if (activeMission === null) return "No missions available.";
    return missionDescriptions[activeMission] || "Mission not found.";
  };

  const renderMissionList = () => {
    return missions
      .filter(mission => missionDescriptions[mission])
      .map(mission => (
        <li key={mission} className="text-white text-xs mt-1">
          Mission {mission}: {missionDescriptions[mission]}
        </li>
      ));
  };

  return (
    <motion.div
      initial={{ width: '52px', height: '56px' }}
      animate={{ 
        width: isExpanded ? '450px' : '52px',
        height: isExpanded ? 'auto' : '56px',
        minHeight: '56px'
      }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-0 right-16 bg-cyan-800 rounded-l-2xl overflow-hidden cursor-pointer"
      onClick={toggleExpand}
    >
      <div className="flex flex-col items-start p-2">
        <div className="flex items-start">
          <div className="w-10 h-10 rounded-full bg-red-600 flex-shrink-0 flex items-center justify-center">
            <img src="/assets/Captn.jpg" alt="AI Avatar" className="rounded-full" />
          </div>
          <div className={`ml-3 text-white ${isExpanded ? 'block' : 'hidden'}`}>
            <p className="font-bold text-sm">Capt'n Cosmos Says:</p>
            <p className="text-xs mt-1">
              {renderMissionText()}
            </p>
            <ul className="mt-4">
              {renderMissionList()}
            </ul>
          </div>
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronRight className="w-6 h-6 text-white" />
            ) : (
                <ChevronLeft className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};