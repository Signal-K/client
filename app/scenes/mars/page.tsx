"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
 
import { EarthActionSceneLayout, EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import InitialisePlanet from "@/components/(scenes)/planetScene/initialisePlanet";
import StructuresOnPlanet, { AtmosphereStructuresOnPlanet, OrbitalStructuresOnPlanet } from "@/components/Structures/Structures";
import { InventoryStructureItem } from "@/types/Items";
import { PlanetarySystem } from "@/components/(scenes)/planetScene/orbitals/system";
import AllAutomatonsOnActivePlanet from "@/components/Structures/Auto/AllAutomatons";
import { MiningComponentComponent } from "@/components/mining-component";
import StructureMissionGuide from "@/components/Layout/Guide";
 
const MarsView: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet, updatePlanetLocation } = useActivePlanet();
    const handleUpdateToMars = () => {
        updatePlanetLocation(40);
    };

    if (activePlanet?.id !== 40) {
        return (
        <div className="min-h-screen w-full flex flex-col">
            {/* <img
              className="absolute inset-0 w-full h-full object-cover"
              src="/assets/Backdrops/Mars.png"
            /> */}
            <div className="bg-black/90">
                <p>Current planet is not Mars.</p>
                <button onClick={handleUpdateToMars}>Switch to Mars</button>
            </div>
          </div>
        );
    };

    return (
        <div className="min-h-screen w-full flex flex-col">
    <img
      className="absolute inset-0 w-full h-full object-cover"
      src="/assets/Backdrops/Mars.png"
    />
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={40} />
            <MarsStructures />
        </div>
        </div>
    );
};

export default MarsView;

const MarsStructures: React.FC = () => {
    return (
        <EarthActionSceneLayout>
        <MiningComponentComponent />
        <StructureMissionGuide />
    </EarthActionSceneLayout>
        // <EarthViewLayout>
        //     <div className="w-full">
        //         <div className="flex flex-row space-y-4"></div>
        //         <div className="py-3">
        //             <div className="py-1">
        //                 <PlanetarySystem />
        //             </div>
        //             <center>
        //                 <OrbitalStructuresOnPlanet />
        //             </center>
        //         </div>
        //     </div>
        //     <div className="w-full">
        //         <div className="py-2">
        //             <center>
        //                 <AtmosphereStructuresOnPlanet />
        //             </center>
        //         </div>
        //     </div>
        //     <div className="w-full">
        //         <center>
        //             <StructuresOnPlanet />
        //         </center>
        //     </div>
        //     <div className="relative flex-1">
        //         <AllAutomatonsOnActivePlanet />
        //     </div>
        // </EarthViewLayout>
    );
};