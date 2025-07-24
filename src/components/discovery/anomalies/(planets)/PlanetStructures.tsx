"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import { InventoryStructureItem } from "@/types/Items";
import { EarthViewLayout } from "@/src/components/ui/scenes/planetScene/layout";
import { PlanetarySystem } from "@/src/components/ui/scenes/planetScene/orbitals/system";
// import StructuresOnPlanet, { OrbitalStructuresOnPlanet, AtmosphereStructuresOnPlanet } from "@/src/components/deployment/structures/Structures";
import AllAutomatonsOnActivePlanet from "@/src/components/deployment/structures/auto/AllAutomatons";
import Structures from "@/src/components/deployment/structures/Structures";

const PlanetStructures: React.FC = () => {
    return (
        <EarthViewLayout>
            <div className="w-full"> 
                <div className="flex flex-row space-y-4"></div>
                <div className="py-3">
                    <div className="py-1">
                        <PlanetarySystem />
                    </div>
                    <center>
                        {/* <OrbitalStructuresOnPlanet /> */}
                    </center>
                </div>
            </div>
            <div className="w-full">
                <div className="py-2">
                    {/* <center>
                        <AtmosphereStructuresOnPlanet />
                    </center> */}
                </div>
            </div>
            <div className="w-full">
                <center>
                    <Structures />
                    {/* <StructuresOnPlanet /> */}
                </center>
            </div>
            <div className="relative flex-1">
                <AllAutomatonsOnActivePlanet />
            </div>
        </EarthViewLayout>
    );
};

export default PlanetStructures;