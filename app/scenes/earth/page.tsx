"use client";

import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import { InventoryStructureItem } from "@/types/Items";
import { PlanetarySystem } from "@/components/(scenes)/planetScene/orbitals/system";
import StructuresOnPlanet, {
  AtmosphereStructuresOnPlanet,
  OrbitalStructuresOnPlanet,
} from "@/components/Structures/Structures";
import AllAutomatonsOnActivePlanet from "@/components/Structures/Auto/AllAutomatons";
import InventoryPage from "@/components/Inventory/Grid/Grid";
import EnhancedWeatherEventsComponent from "@/components/enhanced-weather-events";
import TopographicMap from "@/components/topographic-map";

const EarthView: React.FC = () => {
  const { activePlanet, updatePlanetLocation } = useActivePlanet();
  const handleUpdateToEarth = () => {
    updatePlanetLocation(69);
  };

  if (activePlanet?.id !== 50) {
    return (
        <div className="min-h-screen w-full flex flex-col">
            <div className="bg-black/90">
                <p>Current planet is not "old" Earth.</p>
                <button onClick={handleUpdateToEarth}>Switch to 'old' Earth</button>
            </div>
        </div>
    );
};

  return (
    <div className="min-h-screen w-full flex flex-col">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/Backdrops/Earth.png"
      />
      <div className="relative min-h-screen">
        <EarthStructures />
      </div>
    </div>
  );
};

export default EarthView;

const EarthStructures: React.FC = () => {
  return (
    <EarthViewLayout>
      <EnhancedWeatherEventsComponent />
      <div className="w-full">
        <div className="py-2">
          <center>
            <AtmosphereStructuresOnPlanet />
          </center>
        </div>
      </div>
      <div className="w-full">
        <center>
          <StructuresOnPlanet />
        </center>
      </div>
      <div className="relative flex-1">
        <AllAutomatonsOnActivePlanet />
      </div>
    </EarthViewLayout>
  );
};

      {/* <div className="w-full">
        {/* <InventoryPage />
                <div className="py-3">
                    <div className="py-1">
                        <PlanetarySystem />
                    </div>
                    <center><OrbitalStructuresOnPlanet /></center>
                </div>
            </div> */}
      {/* <TopographicMap /> */}