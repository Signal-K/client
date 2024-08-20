"use client";

import React from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import PlanetViewLayout, { TestLayout } from "@/app/components/(scenes)/planetScene/layout";
import StructuresOnPlanet from "@/app/components/(structures)/Structures";

export default function PlanetViewPage() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    return (
        // <PlanetViewLayout>
        //     <div>
        //         Planet id: {activePlanet?.id}
        //         <br />
        //         Orbital & Orbital structures
        //     </div>
        //     <div>
        //         Atmosphere Structures
        //     </div>
        //     <div>
        //         Surface Structures
        //     </div>
        //     <div>
        //         Automatons
        //     </div>
        // </PlanetViewLayout>
        <TestLayout>
            <div>
                <StructuresOnPlanet />
            </div>
            <div>
                Automatons
            </div>
        </TestLayout>
    );
};