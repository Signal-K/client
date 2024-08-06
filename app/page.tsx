"use client"

import Layout from "@/components/Layout";
import UserPlanetPage from "@/components/Gameplay/Inventory/UserPlanets";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Landing } from "@/components/landing";
import { Panels } from "./(layout)/currentSections";
import { useEffect, useState } from "react";
import FirstScene from "./(scenes)/starterPlanets";

export default function Home() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [missionCompletionStatus, setMissionCompletionStatus] = useState(new Map());

  const fetchMissionCompletionStatus = async () => {
    if (session) {
      try {
        const { data, error } = await supabase
          .from('missions')
          .select('mission')
          .eq('user', session.user.id);

        if (error) {
          console.error('Error fetching missions: ', error.message);
          return;
        };

        const missionStatusMap = new Map();
        data.forEach((mission) => {
          missionStatusMap.set(mission.mission, true);
        });

        setMissionCompletionStatus(missionStatusMap);
      } catch (error: any) {
        console.error('Error fetching mission completion status:', error.message);
      };
    };
  };

  useEffect(() => {
    fetchMissionCompletionStatus();
  }, [session]);

  if (!session) {
    return (
      <Landing />
    );
  };

  const renderContent = () => {
    if (missionCompletionStatus.has(101)) {
      return (
        <Panels />
      );
    } else if (!missionCompletionStatus.has(101)) {
      return (
        <FirstScene />
      );
    };
  };

  return (
    <Layout bg={true}>
      {/* {renderContent()} */} {/* I'm temporarily disabling this because when we do pushes at the moment we don't have enough narrative content for this to be sufficient */}
      {/* <UserPlanetPage /> */}
      <Panels /> {/* Show this for certain mission sets' status */}
    </Layout>
  );
}; 

{/* <UserPlanets /> Add a block for sectors? */}