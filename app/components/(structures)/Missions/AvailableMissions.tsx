import React, { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

interface Mission {
  id: number;
  name: string;
  classificationModule: string;
  completed?: boolean; // Indicate completion if needed
  structure?: number;
}

interface MissionsForStructureProps {
  structureItemId: number; // Passed item value (e.g., 3105)
}

const MissionsForStructure: React.FC<MissionsForStructureProps> = ({ structureItemId }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  
  const [structureMissions, setStructureMissions] = useState<Mission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchMissions = async () => {
      if (!session?.user) return;

      try {
        // Fetch rows in inventory where owner is the current user and item equals the passed structureItemId
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .eq('owner', session.user.id)
          .eq('item', structureItemId)
          .order('id', { ascending: true }) // Sort by primary key to get the lowest one
          .limit(1); // Only fetch the one with the lowest primary key

        if (inventoryError) throw new Error(inventoryError.message);

        if (inventoryData.length === 0) {
          console.error('No matching structure found in inventory for the user.');
          return;
        }

        // Fetch missions from the API route
        const response = await fetch('/api/gameplay/missions');
        if (!response.ok) {
          throw new Error('Failed to fetch missions');
        }
        const missions: Mission[] = await response.json();

        // Filter missions where structure matches the structureItemId
        const filteredMissions = missions.filter(mission => mission.structure === structureItemId);

        // Fetch user's completed missions from the missions table
        const { data: completedMissionsData, error: completedMissionsError } = await supabase
          .from('missions')
          .select('mission')
          .eq('user', session.user.id);

        if (completedMissionsError) throw new Error(completedMissionsError.message);

        // Create a Set of completed mission ids
        const completedMissionSet = new Set(completedMissionsData.map(m => m.mission));

        // Update state with fetched data
        setStructureMissions(filteredMissions);
        setCompletedMissions(completedMissionSet);
      } catch (error) {
        console.error('Error fetching missions:', error);
      }
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