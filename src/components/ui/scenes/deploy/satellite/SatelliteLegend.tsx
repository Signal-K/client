import React from "react";

const SatelliteLegend: React.FC = () => (
  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-sans">
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping flex-shrink-0"></div>
        <span className="text-xs whitespace-nowrap">Click to Scan</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-ping flex-shrink-0"></div>
        <span className="text-xs whitespace-nowrap">Click to Observe</span>
      </div>
    </div>
  </div>
);

export default SatelliteLegend;
