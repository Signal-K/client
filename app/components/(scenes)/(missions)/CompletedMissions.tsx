"use client";

import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { ChevronDown, ChevronUp, CheckCircle, Circle } from 'lucide-react';
import { useActivePlanet } from '@/context/ActivePlanet';

interface CitizenScienceModule {
  id: number;
  name: string; 
  level?: number;
  starterMission?: number;
  structure: number;
  description?: string;
}

interface MissionData {
  mission: number;
}

export default function StarterMissionsStats() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const { activePlanet } = useActivePlanet();

  const [modules, setModules] = useState<CitizenScienceModule[]>([]);
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [expandedMission, setExpandedMission] = useState<number | null>(null);
  const [activeMission, setActiveMission] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // To display error messages

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('/api/citizen/modules');
        const data: CitizenScienceModule[] = await response.json();
        setModules(data);
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };

    const fetchCompletedMissions = async () => {
      if (!session) return;

      try {
        const { data, error } = await supabase
          .from('missions')
          .select('mission')
          .eq('user', session.user.id);

        if (error) throw error;
        const missionIds = data.map((mission: MissionData) => mission.mission);
        setCompletedMissions(missionIds);
      } catch (error) {
        console.error('Error fetching completed missions:', error);
      }
    };

    const fetchActiveMission = async () => {
      if (!session) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('activeMission')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setActiveMission(data.activeMission);
      } catch (error) {
        console.error('Error fetching active mission:', error);
      }
    };

    fetchModules();
    fetchCompletedMissions();
    fetchActiveMission();
  }, [session, supabase]);

  const isMissionCompleted = (starterMission: number | undefined) => {
    return starterMission && completedMissions.includes(starterMission);
  };

  const toggleMission = (id: number) => {
    setExpandedMission(expandedMission === id ? null : id);
  };

  const updateActiveMission = async (starterMission: number | undefined) => {
    if (!starterMission || !session?.user?.id) return;

    try {
      // Insert the starter mission for the user
      const { error: insertError } = await supabase
        .from('missions')
        .insert({
          user: session.user.id,
          mission: starterMission,
          time_of_completion: null,
          configuration: {},
          rewarded_items: [],
        });

      if (insertError) throw insertError;

      // Assign mission 1370203 to the user if they don't have it
      const { data: mission1370203, error: mission1370203Error } = await supabase
        .from('missions')
        .select('mission')
        .eq('user', session.user.id)
        .eq('mission', 1370203)
        .single();

      if (!mission1370203 && mission1370203Error?.code === 'PGRST116') {
        // Insert mission 1370203
        const { error: insertMission1370203Error } = await supabase
          .from('missions')
          .insert({
            user: session.user.id,
            mission: 1370203,
            time_of_completion: null,
            configuration: {},
            rewarded_items: [],
          });

        if (insertMission1370203Error) throw insertMission1370203Error;
      }

      // Update the active mission in the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ activeMission: starterMission })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setActiveMission(starterMission);
      setErrorMessage(null); // Clear any previous errors
      console.log(`Active mission updated to: ${starterMission}`);
    } catch (error) {
      console.error('Error updating active mission:', error);
    }
  };

  const handleSetActiveMission = (starterMission: number | undefined) => {
    // If the user already has an active mission, show the error message
    if (activeMission) {
      setErrorMessage("You already have an active mission. You must complete or cancel it before starting a new one.");
    } else {
      // Otherwise, update the active mission
      updateActiveMission(starterMission);
    }
  };

  const sortedModules = [...modules].sort((a, b) => {
    const aCompleted = isMissionCompleted(a.starterMission);
    const bCompleted = isMissionCompleted(b.starterMission);
    return Number(bCompleted) - Number(aCompleted);
  });

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-[#253B4A] rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-[#5FCBC3] p-4 border-b border-[#5FCBC3]">Mission Log</h2>
        
        {/* Display the error message, if any */}
        {errorMessage && (
          <div className="text-red-500 text-center mb-4">
            {errorMessage}
          </div>
        )}

        <ul className="divide-y divide-[#5FCBC3]">
          {sortedModules.map((module) => (
            <li key={module.id} className="p-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleMission(module.id)}
              >
                <div className="flex items-center space-x-3">
                  {isMissionCompleted(module.starterMission) ? (
                    <CheckCircle className="text-[#5FCBC3]" />
                  ) : (
                    <Circle className="text-[#FF695D]" />
                  )}
                  <span className="text-[#FFD580] font-medium">{module.name} (Level {module.level})</span>
                </div>
                {expandedMission === module.id ? (
                  <ChevronUp className="text-[#5FCBC3]" />
                ) : (
                  <ChevronDown className="text-[#5FCBC3]" />
                )}
              </div>
              {expandedMission === module.id && module.description && (
                <div className="mt-2">
                  <p className="text-[#D689E3] text-sm">{module.description}</p>
                  <button
                    className="mt-2 px-4 py-2 bg-[#5FCBC3] text-white text-sm rounded-md"
                    onClick={() => handleSetActiveMission(module.starterMission)}
                  >
                    Set Active Mission
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};