"use client";

import React from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import PlanetViewLayout from "@/app/components/(scenes)/planetScene/layout";

export default function PlanetViewPage() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    return (
        <PlanetViewLayout>
            <div>
                Planet id: {activePlanet?.id}
                <br />
                Orbital & Orbital structures
            </div>
            <div>
                Atmosphere Structures
            </div>
            <div>
                Surface Structures
            </div>
            <div>
                Automatons
            </div>
        </PlanetViewLayout>
    );
};