'use client';

import { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from 'framer-motion';
import { useActivePlanet } from "@/context/ActivePlanet";

interface TutorialMessageProps {
  isExpanded: boolean;
  toggleExpand: () => void;
}

interface UserActiveMission {
  id: number;
  name: string;
  starterMission: number;
  structure?: number;
  createStructure?: number;
}

export const CaptnCosmosGuideModal: React.FC<TutorialMessageProps> = ({ isExpanded, toggleExpand }) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [missions, setMissions] = useState<UserActiveMission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [activeMission, setActiveMission] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch all available missions
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetch('/api/gameplay/missions/active');
        const data: UserActiveMission[] = await response.json();
        setMissions(data);
      } catch (error) {
        console.error("Error fetching missions:", error);
      }
    };
    fetchMissions();
  }, []);

  // Fetch user's completed missions from the inventory table
useEffect(() => {
  const fetchCompletedMissions = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('missions')
        .select('mission')
        .eq('user', session.user.id);

      if (error) throw error;

      // Extract mission IDs from the missions data
      const completedMissionIds = data.map((entry: { mission: number }) => entry.mission);
      setCompletedMissions(completedMissionIds);
    } catch (error) {
      console.error("Error fetching completed missions:", error);
    }
  };

  fetchCompletedMissions();
}, [session, supabase]);


  // Fetch user's current active mission
  useEffect(() => {
    const fetchUserActiveMission = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('activeMission')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        setActiveMission(data.activeMission);
      } catch (error) {
        console.error("Error fetching active mission:", error);
      }
    };

    fetchUserActiveMission();
  }, [session, supabase]);

  // Function to determine the next mission the user should start
  const getNextMission = () => {
    return missions.find(
      (mission) =>
        !completedMissions.includes(mission.starterMission) &&
        (activeMission === null || mission.starterMission > activeMission)
    );
  };

  const startMission = async (mission: UserActiveMission) => {
    if (activeMission !== null) {
      setError("You already have an active mission.");
      return;
    }

    try {
      // Update active mission in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ activeMission: mission.starterMission })
        .eq('id', session?.user?.id);

      if (updateError) throw updateError;

      setActiveMission(mission.starterMission);

      // If the mission has a structure to create, insert it into the inventory
      if (mission.createStructure) {
        const { error: inventoryError } = await supabase
          .from('inventory')
          .insert({
            item: mission.createStructure,
            owner: session?.user?.id,
            anomaly: activePlanet.id,
            quantity: 1,
          });

        if (inventoryError) throw inventoryError;
      }

      setError(null);
    } catch (error: any) {
      console.error("Error starting mission:", error.message);
      setError("Failed to start mission.");
    }
  };

  const nextMission = getNextMission();

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
            {nextMission ? `Next mission: ${nextMission.name}` : "No missions available."}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white text-xs rounded-md"
              onClick={() => startMission(nextMission!)}
              disabled={!nextMission || activeMission !== null}
            >
              {activeMission === null ? 'Start Mission' : 'Mission Active'}
            </button>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
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