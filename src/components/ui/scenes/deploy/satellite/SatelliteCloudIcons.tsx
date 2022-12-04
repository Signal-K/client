import React from "react";

export default function SatelliteCloudIcons({ cloudAnomalies, handleAnomalyClick, generateAnomalyFromDB }: {
  cloudAnomalies: any[];
  handleAnomalyClick: (a: any) => void;
  generateAnomalyFromDB: (a: any, x: number, y: number) => any;
}) {
  return (
    <>
      {cloudAnomalies.length > 0 && cloudAnomalies.map((a, i) => {
        const angle = (i / cloudAnomalies.length) * 2 * Math.PI;
        const radius = 180;
        return (
          <div
            key={a.id}
            className="absolute z-20 cursor-pointer"
            style={{ left: `calc(50% + ${radius * Math.cos(angle)}px)`, top: `calc(50% + ${radius * Math.sin(angle)}px)` }}
            title={a.content || `Cloud #${a.id}`}
            onClick={() => handleAnomalyClick(generateAnomalyFromDB(a, 0, i + 1))}
          >
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="#78cce2" fillOpacity="0.7" />
              <circle cx="18" cy="18" r="10" fill="#e4eff0" fillOpacity="0.5" />
            </svg>
          </div>
        );
      })}
    </>
  );
};