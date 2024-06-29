"use client"

import {
    CardTitle,
    CardDescription,
    CardHeader,
    CardContent,
    CardFooter,
    Card,
} from "@/components/ui/card";
import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

interface Mission {
    id: number;
    name: string;
    description: string;
    rewards: number[];
}

interface UserMissionInstance {
    id: number;
    user: string;
    time_of_completion: string;
    mission: number;
}

const MissionList: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
  
    const [missions, setMissions] = useState<Mission[]>([]);
    const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  
    useEffect(() => {
      async function fetchMissions() {
        const response = await fetch('/api/gameplay/missions');
        const data: Mission[] = await response.json();
        setMissions(data);
      }
  
      async function fetchCompletedMissions() {
        if (session) {
          const { data, error } = await supabase
            .from('missions')
            .select('*')
            .eq('user', session.user.id);
  
          if (error) {
            console.error('Error fetching completed missions:', error);
          } else {
            const completedMissionIds = data.map((mission: UserMissionInstance) => mission.mission);
            setCompletedMissions(completedMissionIds);
          }
        }
      }
  
      fetchMissions();
      fetchCompletedMissions();
    }, [session, supabase]);
  
    return (
      <div className="flex flex-col gap-4">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`p-4 border rounded-md ${completedMissions.includes(mission.id) ? 'line-through bg-gray-100' : ''}`}
          >
            <h3 className="text-lg font-bold">{mission.name}</h3>
            <p className="text-gray-600">{mission.description}</p>
          </div>
        ))}
      </div>
    );
  };
  
  export default MissionList;

export function MissionOverlay() {
    const [activeMission, setActiveMission] = useState(1)

    function updateMission() {
        setActiveMission(activeMission + 1);
    };

    function resetMissions() { // Purely a test function
        setActiveMission(1);
    };

    return (
        <div className="mx-0">
            <CardHeader>
                <CardTitle>Your missions</CardTitle>
                <CardDescription>These will be separated into groups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto max-h-[480px] pr-4">
                {activeMission == 1 && ( 
                    <div className="flex min-h-full flex-col justify-center p-2">
                        <p>Hello there 1</p>  {/* Divide these into sections, the idea being that each has to be completed before going onto the next */}
                        <button onClick={updateMission}>Update Mission</button>
                    </div>
                )}
                {activeMission == 2 && (
                    <div className="flex min-h-full flex-col justify-center p-2"> 
                        <p>Hello there 2</p> {/* No scrollbar, but you'd still swipe/scroll between them */}
                        <button onClick={updateMission}>Update Mission</button>
                    </div>
                )}
                {activeMission == 3 && ( // Add a swipey/scroll animation when updateMission() is called?
                    <div className="flex min-h-full flex-col justify-center p-2">
                        <p>Hello there 3</p>
                        <button onClick={updateMission}>Update Mission</button>
                    </div>
                )}
                {activeMission == 4 && ( 
                    <div className="flex min-h-full flex-col justify-center p-2">
                        <p>Hello there 4</p>
                        <button onClick={updateMission}>Update Mission</button>
                    </div>
                )}
                {activeMission == 5 && ( 
                    <div className="flex min-h-full flex-col justify-center p-2">
                        <p>Hello there 5</p>
                        <button onClick={resetMissions}>Update Mission</button>
                    </div>
                )}
            </CardContent>
        </div>
    );
};

function LinkIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    );
};