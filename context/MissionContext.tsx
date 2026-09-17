import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

interface CompletedMission {
  id: number;
  completed: boolean;
};

interface ContextTypeMission {
  missions: CompletedMission[];
};

const MissionContext = createContext<ContextTypeMission | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [missions, setMissions] = useState<CompletedMission[]>([]);
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    const fetchMissions = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('missions')
            .select('mission, time_of_completion')
            .eq('user', session.user.id);
          if (error) throw error;

          const completedMissions = data?.map((mission) => ({
            id: mission.mission,
            completed: !!mission.time_of_completion,
          })) || [];
          
          setMissions(completedMissions);
        } catch (error) {
          console.error('Failed to fetch missions:', error);
        }
      } else {
        console.error('User is not authenticated');
      }
    };

    fetchMissions();
  }, [supabase, session]);

  return (
    <MissionContext.Provider value={{ missions }}>
      {children}
    </MissionContext.Provider>
  );
};

export const useMissions = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMissions must be used within a MissionProvider');
  }
  return context;
};