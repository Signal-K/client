"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem } from "@/types/Items";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import { PlanetarySystem } from "@/components/(scenes)/planetScene/orbitals/system";
import StructuresOnPlanet, { OrbitalStructuresOnPlanet, AtmosphereStructuresOnPlanet } from "@/components/Structures/Structures";
import AllAutomatonsOnActivePlanet from "@/components/Structures/Auto/AllAutomatons";

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
                        <OrbitalStructuresOnPlanet />
                    </center>
                </div>
            </div>
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

export default PlanetStructures;