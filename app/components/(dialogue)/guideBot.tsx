'use client';

import { useState, useEffect, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion } from 'framer-motion';
import { useActivePlanet } from "@/context/ActivePlanet";
import StarterMissionsStats from "../(scenes)/(missions)/CompletedMissions";

interface TutorialMessageProps {
  isExpanded: boolean;
  toggleExpand: () => void;
};


interface Useractivemission {
  id: number;
  name: string;
  structure?: number;
  createStructure?: number;
  starterMission?: number;
};


export const CaptnCosmosGuideModal: React.FC<TutorialMessageProps> = ({ isExpanded, toggleExpand }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [missions, setMissions] = useState<Useractivemission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [activemission, setactivemission] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* --- Start of changes ---
  Added useEffect to fetch missions and active mission
  */
  useEffect(() => {
    const fetchMissionsAndActiveMission = async () => {
      if (!session?.user?.id) return;

      try {
        const [missionsResponse, activeMissionResponse] = await Promise.all([
          fetch('/api/gameplay/missions/active'),
          supabase
            .from('profiles')
            .select('activemission')
            .eq('id', session.user.id)
            .single()
        ]);

        const missionsData: Useractivemission[] = await missionsResponse.json();
        setMissions(missionsData);

        if (activeMissionResponse.error) throw activeMissionResponse.error;
        setactivemission(activeMissionResponse.data.activemission);
      } catch (error) {
        console.error("Error fetching missions or active mission:", error);
      }
    };

    fetchMissionsAndActiveMission();
  }, [session, supabase]);
  /* --- End of changes --- */
  
  useEffect(() => {
    const fetchCompletedMissions = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('missions')
          .select('mission')
          .eq('user', session.user.id);

        if (error) throw error;

        const completedMissionIds = data.map((entry: { mission: number }) => entry.mission);
        setCompletedMissions(completedMissionIds);
      } catch (error) {
        console.error("Error fetching completed missions:", error);
      }
    };

    fetchCompletedMissions();
  }, [session, supabase]);

  useEffect(() => {
    const fetchUseractivemission = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('activemission')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        setactivemission(data.activemission);
      } catch (error) {
        console.error("Error fetching active mission:", error);
      }
    };

    fetchUseractivemission();
  }, [session, supabase]);

  const getNextMission = () => {
    /* --- Start of changes ---
    Sorted missions and updated logic to use 'starterMission' if available, otherwise 'id'
    */
    const sortedMissions = [...missions].sort((a, b) => 
      (a.starterMission || a.id) - (b.starterMission || b.id)
    );

    return sortedMissions.find(
      (mission) =>
        !completedMissions.includes(mission.starterMission || mission.id) &&
        (activemission === null || (mission.starterMission || mission.id) > activemission)
    );
    /* --- End of changes --- */
  };

  const resetMission = async (mission: Useractivemission) => {
    try {
      const { error: clearError } = await supabase
        .from('profiles')
        .update({ activemission: null })
        .eq('id', session?.user?.id);

      if (clearError) throw clearError;

      // Reset the mission after clearing
      const { error: resetError } = await supabase
        .from('profiles')
        .update({ activemission: mission.starterMission || mission.id })
        .eq('id', session?.user?.id);

      if (resetError) throw resetError;

      /* --- Start of changes ---
      Updated state setter to use 'starterMission' if available, otherwise 'id'
      */
      setactivemission(mission.starterMission || mission.id);
      /* --- End of changes --- */
      setError(null);
    } catch (error: any) {
      console.error("Error resetting mission:", error.message);
      setError("Failed to reset mission.");
    }
  };

  const startMission = async (mission: Useractivemission) => {
    if (activemission !== null) {
      setError("You already have an active mission.");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ activemission: mission.starterMission || mission.id })
        .eq('id', session?.user?.id);
      if (updateError) throw updateError;

      /* --- Start of changes ---
      Updated state setter to use 'starterMission' if available, otherwise 'id'
      */
      setactivemission(mission.starterMission || mission.id);
      /* --- End of changes --- */

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
        minHeight: '56px',
      }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-0 right-16 bg-cyan-800 rounded-l-2xl overflow-hidden"
    >
      <div className="flex flex-col items-start p-2">
        <div className="flex items-start">
          <div className="w-10 h-10 rounded-full bg-red-600 flex-shrink-0 flex items-center justify-center cursor-pointer" onClick={toggleExpand}>
            <img src="/assets/Captn.jpg" alt="AI Avatar" className="rounded-full" />
          </div>
          <div className={`ml-3 text-white ${isExpanded ? 'block' : 'hidden'}`}>
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-white bg-transparent border-none cursor-pointer"
              onClick={toggleExpand}
            >
              <X size={24} />
            </button>

            <p className="font-bold text-sm">Capt'n Cosmos Says:</p>

            {/* Display StarterMissionsStats if the active mission is 1370203 or 1370204 */}
            {(activemission === 1370203 || activemission === 1370204) ? (
              <StarterMissionsStats />
            ) : (
              <>
                {/* Display the current mission */}
                {activemission && (
                  <div className="mb-4">
                    {/* --- Start of changes ---
                    Updated to use 'starterMission' if available, otherwise 'id'
                    */}
                    <p className="text-sm mt-1">Current Mission: {missions.find(m => (m.starterMission || m.id) === activemission)?.name || "Unknown Mission"}</p>
                    <button
                      className="mt-2 px-4 py-2 bg-red-500 text-white text-xs rounded-md"
                      onClick={() => resetMission(missions.find(m => (m.starterMission || m.id) === activemission)!)}
                    >
                      Reset Mission
                    </button>
                    {/* --- End of changes --- */}
                  </div>
                )}

                {/* Display the next mission */}
                {nextMission && (
                  <div className="mt-4">
                    <p className="text-sm mt-1">Next Mission: {nextMission.name}</p>
                    <button
                      className="mt-2 px-4 py-2 bg-blue-500 text-white text-xs rounded-md"
                      onClick={() => startMission(nextMission)}
                      disabled={activemission !== null}
                    >
                      {activemission === null ? 'Start Mission' : 'Complete Current Mission'}
                    </button>
                    <StarterMissionsStats />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};