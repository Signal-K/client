"use client";

import React, { useEffect, useState } from "react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { Button } from "@/app/components/_[archive]/ui/button";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface GoToYourPlanetProps {
  planetId: number;
}

export default function GoToYourPlanet({ planetId }: GoToYourPlanetProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet, setActivePlanet, updatePlanetLocation } = useActivePlanet();
  const [hasCompletedMission3, setHasCompletedMission3] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageState, setPageState] = useState(1);

  useEffect(() => {
    const checkMissionCompletion = async () => {
      if (session) {
        const { data, error } = await supabase
          .from('missions')
          .select('mission')
          .eq('user', session.user.id)
          .eq('mission', 3);

        if (error) {
          console.error('Error checking mission completion:', error);
        } else {
          setHasCompletedMission3(data.length > 0);
        }
      }
    };

    checkMissionCompletion();
  }, [session, supabase]);

  const handleGoToPlanet = async () => {
    try {
      const missionData = {
        user: session?.user?.id,
        time_of_completion: new Date().toISOString(),
        mission: 3,
        configuration: null,
        rewarded_items: [activePlanet?.id],
      };

      const inventoryData = {
        item: 12,
        owner: session?.user?.id,
        quantity: 1,
        notes: `Reward for completing mission 3`,
        parentItem: null,
        time_of_deploy: new Date().toISOString(),
        anomaly: activePlanet?.id,
      };

      const { data: newMission, error: missionError } = await supabase
        .from("missions")
        .insert([missionData]);

      const { error: inventoryError } = await supabase
        .from('inventory')
        .insert([inventoryData]);

      if (missionError) {
        throw missionError;
      }

      // Update planet location
      await updatePlanetLocation(planetId);

    } catch (error: any) {
      console.error("Error handling planet selection:", error.message);
    }
  };

  const handleTransition = () => {
    setIsTransitioning(true);
    setTimeout(async () => {
      setPageState(pageState === 1 ? 2 : 1);
      setIsTransitioning(false);

      if (pageState === 1) {
        await handleGoToPlanet();
      }
    }, 2000);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {isTransitioning && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-950">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] animate-spaceship">
              <img
                src="https://i.pinimg.com/originals/f7/be/aa/f7beaa7787bd55e9ac54135566d6af97.gif"
                width={200}
                height={200}
                alt="Spaceship"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">Transitioning...</h3>
              <p className="text-gray-500 dark:text-gray-400">Hold on tight, we're about to jump to hyperspace!</p>
            </div>
          </div>
        </div>
      )}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
          isTransitioning
            ? pageState === 1
              ? "translate-x-full opacity-0"
              : "-translate-x-full opacity-0"
            : "translate-x-0 opacity-100"
        }`}
      >
        {pageState === 1 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-4 space-y-4 dark:bg-gray-950">
            <img src="" />
            {hasCompletedMission3 ? (
              <Button disabled>You have already completed this mission</Button>
            ) : (
              <Button onClick={handleTransition}>Land</Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-4 space-y-4 dark:bg-gray-950">
            <Button onClick={handleTransition}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
