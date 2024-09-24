import React, { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';

interface Mission {
  id: number;
  name: string;
  classificationModule: string;
  completed?: boolean;
  structure?: number;
};

interface MissionsForStructureProps {
  structureItemId: number;
};

const MissionsForStructure: React.FC<MissionsForStructureProps> = ({ structureItemId }) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();
  
  const [structureMissions, setStructureMissions] = useState<Mission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchMissions = async () => {
      if (!session?.user) return;

      try {
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .eq('owner', session.user.id)
          .eq('item', structureItemId)
          .eq("anomaly", activePlanet.id)
          .order('id', { ascending: true })
          .limit(1);

        if (inventoryError) throw new Error(inventoryError.message);

        if (inventoryData.length === 0) {
          console.error('No matching structure found in inventory for the user.');
          return;
        };

        const response = await fetch('/api/gameplay/missions');
        if (!response.ok) {
          throw new Error('Failed to fetch missions');
        };
        const missions: Mission[] = await response.json();

        const filteredMissions = missions.filter(mission => mission.structure === structureItemId);

        const { data: completedMissionsData, error: completedMissionsError } = await supabase
          .from('missions')
          .select('mission')
          .eq('user', session.user.id);

        if (completedMissionsError) throw new Error(completedMissionsError.message);

        const completedMissionSet = new Set(completedMissionsData.map(m => m.mission));

        setStructureMissions(filteredMissions);
        setCompletedMissions(completedMissionSet);
      } catch (error) {
        console.error('Error fetching missions:', error);
      };
    };

    fetchMissions();
  }, [structureItemId, session]);

  return (
    <div className="missions-for-structure">
      <div className="structure-missions">
        <h3>Missions for Structure</h3>
        <ul>
          {structureMissions.map(mission => (
            <li key={mission.id} className="mission-item">
              <span
                style={{
                  textDecoration: completedMissions.has(mission.id) ? 'line-through' : 'none',
                  color: completedMissions.has(mission.id) ? 'green' : 'black',
                }}
              >
                {mission.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MissionsForStructure;