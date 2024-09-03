"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface Mission {
  id: number;
  name: string;
  description?: string;
  rewards?: number[];
  classificationModule?: string;
  chapter?: string;
  component?: React.ReactNode;
}

export default function MissionLog() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<Mission[]>([]);
  const [incompleteMissions, setIncompleteMissions] = useState<Mission[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [activeMissionComponent, setActiveMissionComponent] = useState<React.ReactNode | null>(null);

  const pastelColors = [
    "text-pink-300",
    "text-purple-300",
    "text-green-300",
    "text-yellow-300",
    "text-blue-300",
    "text-teal-300",
    "text-red-300",
  ];

  const getRandomColor = () =>
    pastelColors[Math.floor(Math.random() * pastelColors.length)];

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const { data: completedMissionData, error: missionError } = await supabase
          .from("missions")
          .select("mission")
          .eq("user", session?.user.id);

        const completedMissionIds = completedMissionData?.map((entry) => entry.mission);

        const missionResponse = await fetch("/api/gameplay/missions");

        let missionData: Mission[] = await missionResponse.json();

        missionData = missionData.filter((mission) => mission.id < 1 || mission.id > 100);

        const completedMissions = missionData.filter((mission) =>
          completedMissionIds?.includes(mission.id)
        );

        const incompleteMissions = missionData.filter((mission) =>
          !completedMissionIds?.includes(mission.id)
        );

        setCompletedMissions(completedMissions);
        setIncompleteMissions(incompleteMissions);

        const groupedIncompleteMissions = missionData.reduce((groups, mission) => {
          const keyParts = [
            mission.chapter,
            mission.classificationModule,
          ].filter(Boolean); // filter out undefined parts
          const key = keyParts.join("-");
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(mission);
          return groups;
        }, {} as Record<string, Mission[]>);

        const initialOpenGroups = Object.keys(groupedIncompleteMissions).slice(0, 3);
        setOpenGroups(initialOpenGroups);
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
        setErrorMessage(error.message);
      }
    };

    fetchMissions();
  }, [session, supabase]);

  const groupedIncompleteMissions = incompleteMissions.reduce((groups, mission) => {
    const keyParts = [
      mission.chapter,
      mission.classificationModule,
    ].filter(Boolean);
    const key = keyParts.join("-");
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(mission);
    return groups;
  }, {} as Record<string, Mission[]>);

  const groupedCompletedMissions = completedMissions.reduce((groups, mission) => {
    const keyParts = [
      mission.chapter,
      mission.classificationModule,
    ].filter(Boolean);
    const key = keyParts.join("-");
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(mission);
    return groups;
  }, {} as Record<string, Mission[]>);

  const toggleGroup = (groupKey: string) => {
    if (openGroups.includes(groupKey)) {
      setOpenGroups(openGroups.filter((key) => key !== groupKey));
    } else {
      setOpenGroups([...openGroups, groupKey]);
    }
  };

  const handleMissionClick = (mission: Mission) => {
    console.log("Mission clicked:", mission.name);
    if (mission.component) {
      setActiveMissionComponent(mission.component);
    } else {
      setActiveMissionComponent(null);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div
        className="w-full max-w-lg p-6 bg-white rounded-xl shadow-lg overflow-y-auto"
        style={{ maxHeight: "90vh" }}
      >
        {showCompleted && (
          <div className="mb-4">
            <h2 className={`text-lg font-bold ${getRandomColor()} mb-2`}>Active Missions</h2>
          </div>
        )}

        <div className="space-y-4">
          {Object.keys(groupedIncompleteMissions).map((groupKey, index) => {
            const isOpen = openGroups.includes(groupKey);
            const colorClass = getRandomColor();
            return (
              <div key={groupKey} className="w-full">
                <h3
                  className={`font-semibold text-xl ${colorClass} cursor-pointer shadow-lg`}
                  onClick={() => toggleGroup(groupKey)}
                >
                  {groupKey.replace("-", " - ")}
                </h3>
                {isOpen && (
                  <ul className="space-y-2 mt-2">
                    {groupedIncompleteMissions[groupKey].map((mission) => (
                      <li
                        key={mission.id}
                        className="bg-white p-3 rounded-md shadow-md cursor-pointer"
                        onClick={() => handleMissionClick(mission)}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-lg">{mission.name}</p>
                          <p
                            className={`text-sm ${
                              mission.component ? "text-blue-500" : "text-gray-500"
                            }`}
                          >
                            {mission.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <h2
            className="text-lg font-bold mt-4 cursor-pointer"
            onClick={() => {
              setShowCompleted(!showCompleted);
              if (!showCompleted) {
                setOpenGroups([]);
              }
            }}
          >
            {showCompleted ? "Hide" : "Show"} Completed Missions
          </h2>
          {showCompleted && (
            <div className="space-y-4 mt-4">
              {Object.keys(groupedCompletedMissions).map((groupKey) => {
                const colorClass = getRandomColor();
                return (
                  <div key={groupKey} className="w-full">
                    <h3 className={`font-semibold text-xl ${colorClass} shadow-lg`}>
                      {groupKey.replace("-", " - ")}
                    </h3>
                    <ul className="space-y-2 mt-2">
                      {groupedCompletedMissions[groupKey].map((mission) => (
                        <li
                          key={mission.id}
                          className="bg-gray-100 p-3 rounded-md shadow-md cursor-pointer"
                          onClick={() => handleMissionClick(mission)}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-lg">{mission.name}</p>
                            <p
                              className={`text-sm ${
                                mission.component ? "text-blue-500" : "text-gray-500"
                              }`}
                            >
                              {mission.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {activeMissionComponent && (
          <div className="mt-6 p-4 bg-gray-200 rounded-lg">
            {activeMissionComponent}
          </div>
        )}
      </div>
    </div>
  );
};