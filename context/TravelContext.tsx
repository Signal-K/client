import React, { createContext, useContext, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';

interface TravelContextProps {
  handleTravel: (mission: any, session: any) => Promise<void>;
};

const TravelContext = createContext<TravelContextProps | undefined>(undefined);

export const TravelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = useSupabaseClient();
  const { activePlanet } = useActivePlanet();

  const handleTravel = useCallback(async (mission: any, session: any) => {
    if (!session) {
      return;
    }

    const initialMissionData = {
      user: session.user.id,
      time_of_completion: new Date().toISOString(),
      mission: mission.id,
    };

    const structureCreationData = {
      owner: session.user.id,
      item: mission.activeStructure,
      quantity: 1,
      notes: "Created for user's first classification",
      anomaly: activePlanet?.id || 69,
      configuration: {
        "Uses": 10,
        "missions unlocked": [mission.identifier],
      },
    };

    const researchedStructureData = {
      user_id: session.user.id,
      tech_type: mission.activeStructure,
      tech_id: mission.techId,
      created_at: new Date().toISOString(),
    };

    try {
      const { error: missionError } = await supabase
        .from("missions")
        .insert([initialMissionData]);

      if (missionError) throw missionError;

      const { error: inventoryError } = await supabase
        .from('inventory')
        .insert([structureCreationData]);

      if (inventoryError) throw inventoryError;

      const { error: researchedError } = await supabase
        .from("researched")
        .insert([researchedStructureData]);

      if (researchedError) throw researchedError;

    } catch (error: any) {
      console.log("Error adding mission: ", error.message);
    }
  }, [activePlanet, supabase]);

  return (
    <TravelContext.Provider value={{ handleTravel }}>
      {children}
    </TravelContext.Provider>
  );
};

export const useTravel = () => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error("useTravel must be used within a TravelProvider");
  }
  return context;
};