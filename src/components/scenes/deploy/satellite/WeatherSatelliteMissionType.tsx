import React from "react";

interface WeatherSatelliteMissionTypeProps {
  entries: any[];
  className?: string;
}

export default function WeatherSatelliteMissionType({ entries, className = "" }: WeatherSatelliteMissionTypeProps) {
  if (!entries || entries.length === 0) return null;

  // Mission step definitions
  const planetSteps = [
    { label: "Deploy satellite to your planet", description: "Satellite deployed and in transit.", time: 0 },
    { label: "Identify stellar temperature & radius", description: "Finding star’s temperature and radius", time: 10 * 60 * 1000 },
    { label: "Identify orbital period of planet", description: "User inputs orbital period", time: 20 * 60 * 1000 },
    { label: "Identify flux differential of planet", description: "Calculating flux differential", time: 30 * 60 * 1000 },
    { label: "Planet stats identified", description: "Planet stats revealed, ready to publish", time: 40 * 60 * 1000 },
  ];
  const weatherSteps = [
    { label: "Deploy satellite to chosen planet", description: "Satellite deployed and in transit.", time: 0 },
    { label: "Commence scanning", description: "Scanning for clouds and storms", time: 10 * 60 * 1000 },
    { label: "Finish scanning, cloud or storm identified", description: "Cloud or storm identified", time: 20 * 60 * 1000 },
    { label: "Commence scanning", description: "Scanning for clouds and storms", time: 30 * 60 * 1000 },
    { label: "Finish scanning, cloud or storm identified", description: "Cloud or storm identified", time: 40 * 60 * 1000 },
  ];

  // Determine mission type
  const isPlanetMission = entries.length === 1;
  const steps = isPlanetMission ? planetSteps : weatherSteps;

  // Calculate current step based on deploy time
  let currentStep = steps[0];
  if (entries[0]?.date) {
    const deployTime = new Date(entries[0].date);
    const now = new Date();
    const elapsedMs = now.getTime() - deployTime.getTime();
    for (let i = 0; i < steps.length; i++) {
      if (elapsedMs >= steps[i].time) {
        currentStep = steps[i];
      }
    }
  }

  return (
    <div className={`px-3 py-2 rounded bg-[#00304a]/80 border border-[#78cce2]/30 text-[#78cce2] text-xs font-semibold text-center ${className}`}>
      Mission: <span className="text-[#f2c572]">{isPlanetMission ? "Planet Investigation" : "Weather Investigation"}</span> <span className="text-[#e4eff0]">{isPlanetMission ? "(scanning planetary properties)" : "(searching for clouds and weather events)"}</span>
      <div className="mt-1 text-[#f2c572] font-bold">{currentStep.label}</div>
      <div className="text-[#e4eff0] text-xs mt-0.5">{currentStep.description}</div>
    </div>
  );
}
