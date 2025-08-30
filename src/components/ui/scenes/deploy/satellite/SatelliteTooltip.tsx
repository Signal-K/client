import React from "react";

interface SatelliteTooltipProps {
  timeSinceDeploy: string;
  timeRemaining: string;
  timeSinceLastAction: string;
  planetName?: string;
  classificationText?: string;
  deployTime: Date;
}

const SatelliteTooltip: React.FC<SatelliteTooltipProps> = ({
  timeSinceDeploy,
  timeRemaining,
  timeSinceLastAction,
  planetName,
  classificationText,
  deployTime,
}) => (
  <div className="bg-black/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs font-sans whitespace-nowrap shadow-lg border border-white/20">
    <div className="space-y-1">
      <div className="font-medium text-blue-300">🛰️ Satellite Status</div>
      <div>📍 Deployed: {timeSinceDeploy} ago</div>
      <div>⏱️ Time until redeployment: {timeRemaining}</div>
      <div>🎯 Last action: {timeSinceLastAction}</div>
      {planetName && (
        <div>🪐 Planet: <span className="font-semibold">{planetName}</span></div>
      )}
      {classificationText && (
        <div>📝 Classification: <span className="italic">{classificationText}</span></div>
      )}
    </div>
    {/* Arrow */}
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
  </div>
);

export default SatelliteTooltip;
