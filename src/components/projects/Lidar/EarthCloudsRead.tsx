"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";

export function EarthCloudRead() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // const imageUrl = `${supabaseUrl}/storage/v1/object/public/clouds/${anomalyId}.png`;

    const [part, setPart] = useState(1);
    const [line, setLine] = useState(1);

    const nextLine = () => setLine((prevLine) => prevLine + 1);
    const nextPart = () => {
        setPart(2);
        setLine(1);
    };

    return (
        <>Test</>
    )
}