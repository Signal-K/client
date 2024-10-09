"use client";

import React, { useState } from "react";
import { DiscoveryCards } from "@/components/Projects/(classifications)/Collections/All";
import { DiscoveryCardsByActivePlanet } from "@/components/Projects/(classifications)/Collections/ByActivePlanet";
import { DiscoveryCardsByUserAndAnomaly } from "@/components/Projects/(classifications)/Collections/ByAnomaly";

export default function AllClassifications() {
  const [activePlanet, setActivePlanet] = useState<number | null>(null);
  const [anomalyId, setAnomalyId] = useState<number | null>(null);

  const handleActivePlanetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivePlanet(Number(e.target.value));
  };

  const handleAnomalyIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnomalyId(Number(e.target.value));
  };

  return (
    <div className="py-2 space-y-8">
      <DiscoveryCards />

      <div>
        <h3>Select Active Planet</h3>
        <form className="space-y-4">
          <input
            type="number"
            placeholder="Enter Active Planet ID"
            value={activePlanet || ""}
            onChange={handleActivePlanetChange}
            className="border rounded p-2"
          />
        </form>
        {activePlanet !== null && (
          <DiscoveryCardsByActivePlanet activePlanet={activePlanet} />
        )}
      </div>

      <div>
        <h3>Select Anomaly</h3>
        <form className="space-y-4">
          <input
            type="number"
            placeholder="Enter Anomaly ID"
            value={anomalyId || ""}
            onChange={handleAnomalyIdChange}
            className="border rounded p-2"
          />
        </form>
        {anomalyId !== null && (
          <DiscoveryCardsByUserAndAnomaly anomalyId={anomalyId} />
        )}
      </div>
    </div>
  );
}