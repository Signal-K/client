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
  mission: number; // 1370203
};

export default function StarterMissionsStats() {
  const session = useSession();
  const supabase = useSupabaseClient();

  const { activePlanet } = useActivePlanet();

  const [modules, setModules] = useState<CitizenScienceModule[]>([]);
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [expandedMission, setExpandedMission] = useState<number | null>(null);

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

    fetchModules();
    fetchCompletedMissions();
  }, [session, supabase]);

  const isMissionCompleted = (starterMission: number | undefined) => {
    return starterMission && completedMissions.includes(starterMission);
  };

  const toggleMission = (id: number) => {
    setExpandedMission(expandedMission === id ? null : id);
  };

  const updateActiveMission = async (starterMission: number | undefined) => {
    if (starterMission && session?.user?.id) {
      try {
        // Check if the user already has the mission with ID 1370203
        const { data, error } = await supabase
          .from('missions')
          .select('*')
          .eq('user', session.user.id)
          .eq('mission', starterMission) // Use the selected starter mission instead of hardcoding mission id.
          .single();
  
        if (error && error.code !== 'PGRST116') {
          throw error;
        };
  
        if (!data) {
          // If no mission found, insert it
          const { error: insertError } = await supabase
            .from('missions')
            .insert({
              user: session.user.id,
              mission: starterMission,
              time_of_completion: null,
              configuration: {},
              rewarded_items: [],
            });
  
          if (insertError) {
            throw insertError;
          };

          const { error: insertErrorTwo } = await supabase
          .from('missions')
          .insert({
            user: session.user.id,
            mission: "1370203",
            time_of_completion: null,
            configuration: {},
            rewarded_items: [],
          });

          if (insertErrorTwo) {
            throw insertError;
          };
  
          console.log(`Mission ${starterMission} added to the user's missions.`);
        } else {
          console.log(`Mission ${starterMission} already exists for the user.`);
        }
  
        // Update the active mission in the user's profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ activeMission: starterMission })
          .eq('id', session.user.id);
  
        if (updateError) {
          throw updateError;
        }
  
        console.log(`Active mission updated to: ${starterMission}`);
  
        // Fetch the modules after updating the active mission
        const res = await fetch('/api/citizen/modules');
        const modules = await res.json();
  
        // Find the module matching the selected starterMission
        const activeModule = modules.find((module: CitizenScienceModule) => module.starterMission === starterMission);
  
        if (activeModule) {
          // Check if the structure is already in the user's inventory
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('inventory')
            .select('*')
            .eq('anomaly', activePlanet.id) // Check based on active planet and user
            .eq('owner', session.user.id)
            .eq('item', activeModule.structure);
  
          if (inventoryError) {
            throw inventoryError;
          };
  
          if (inventoryData.length > 0) {
            console.log('Inventory items found:', inventoryData);
          } else {
            // No inventory items found, insert the new structure
            const { error: insertInventoryError } = await supabase
              .from('inventory')
              .insert({
                item: activeModule.structure,  // Insert the structure from the selected module
                owner: session.user.id,
                anomaly: activePlanet.id, // Active planet's id
                quantity: 1,  // Default to 1 for now
                time_of_deploy: new Date(),
              });
  
            if (insertInventoryError) {
              throw insertInventoryError;
            };
  
            console.log(`Inventory item ${activeModule.structure} added successfully.`);
          };
        };
      } catch (error) {
        console.error('Error updating active mission or inventory:', error);
      };
    };
  };  

  const sortedModules = [...modules].sort((a, b) => {
    const aCompleted = isMissionCompleted(a.starterMission);
    const bCompleted = isMissionCompleted(b.starterMission);
    return Number(bCompleted) - Number(aCompleted);
  });

  return (
    <div className=" flex items-center justify-center p-4">
      <div className="bg-[#253B4A] rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-[#5FCBC3] p-4 border-b border-[#5FCBC3]">Mission Log</h2>
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
                    onClick={() => updateActiveMission(module.starterMission)}
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