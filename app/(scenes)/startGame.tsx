"use client";

import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";

const StartGame: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet, setActivePlanet, updatePlanetLocation } = useActivePlanet();

    const [loading, setLoading] = useState(false);

    const handlePlanetSelect = async ( planetId: number ) => {
        try {
            
        }
    }

    return (
        <></>
    )
}