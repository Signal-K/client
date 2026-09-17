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
  const [activemission, setactivemission] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;

      try {
        const [modulesResponse, missionsData, profileData] = await Promise.all([
          fetch('/api/citizen/modules'),
          supabase.from('missions').select('mission').eq('user', session.user.id),
          supabase.from('profiles').select('activemission').eq('id', session.user.id).single()
        ]);

        const modulesData: CitizenScienceModule[] = await modulesResponse.json();
        setModules(modulesData);

        if (missionsData.error) throw missionsData.error;
        const missionIds = missionsData.data.map((mission: MissionData) => mission.mission);
        setCompletedMissions(missionIds);

        if (profileData.error) throw profileData.error;
        setactivemission(profileData.data.activemission);

      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to load mission data. Please try again.');
      }
    };

    fetchData();
  }, [session, supabase]);

  const isMissionCompleted = (starterMission: number | undefined): boolean => 
    starterMission !== undefined && completedMissions.includes(starterMission);

  const toggleMission = (id: number): void => 
    setExpandedMission(expandedMission === id ? null : id);

  const createInventoryEntry = async (module: CitizenScienceModule): Promise<void> => {
    if (!session || !activePlanet) return;

    try {
      const { data: existingEntries, error: checkError } = await supabase
        .from('inventory')
        .select('*')
        .eq('owner', session.user.id)
        .eq('item', module.structure)
        .eq('anomaly', activePlanet.id);

      if (checkError) throw checkError;

      if (existingEntries.length === 0) {
        const { error: insertError } = await supabase
          .from('inventory')
          .insert({
            owner: session.user.id,
            item: module.structure,
            anomaly: activePlanet.id,
            quantity: 1,
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error creating inventory entry:', error);
      setErrorMessage('Failed to update inventory. Please try again.');
    }
  };

  const updateactivemission = async (starterMission: number | undefined, module: CitizenScienceModule): Promise<void> => {
    if (!session) return;

    try {
      await supabase.from('missions').upsert({
        user: session.user.id,
        mission: 1370203,
        time_of_completion: null,
        configuration: {},
        rewarded_items: [],
      });

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ activemission: starterMission })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setactivemission(starterMission || null);
      setErrorMessage(null);
      console.log(`Active mission updated to: ${starterMission}`);

      await createInventoryEntry(module);
    } catch (error) {
      console.error('Error updating active mission:', error);
      setErrorMessage('Failed to update active mission. Please try again.');
    }
  };

  const handleSetactivemission = (module: CitizenScienceModule): void => {
    if (activemission === 1370203) {
      updateactivemission(module.starterMission, module);
    } else if (activemission) {
      setErrorMessage("You already have an active mission. You must complete or cancel it before starting a new one.");
    } else {
      updateactivemission(module.starterMission, module);
    }
  };

  const sortedModules = [...modules].sort((a, b) => 
    Number(isMissionCompleted(b.starterMission)) - Number(isMissionCompleted(a.starterMission))
  );

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-[#253B4A] rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-[#5FCBC3] p-4 border-b border-[#5FCBC3]">Mission Log</h2>
        
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
                    onClick={() => handleSetactivemission(module)}
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
}