"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Anomaly } from "@/types/Anomalies";
import { useActivePlanet } from "@/context/ActivePlanet";

const PlanetGrid: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [planets, setPlanets] = useState<Anomaly[]>([]);
    const { activePlanet, setActivePlanet, updatePlanetLocation } = useActivePlanet();
    
    const [loading, setLoading] = useState(false);

    const fetchAnomalies = async () => {
        const { data, error } = await supabase
          .from('anomalies')
          .select('id, anomalytype, avatar_url')
          .in('id', [1, 2, 3, 4, 5, 6])
          .eq('anomalytype', 'planet');
    
        if (error) {
          console.error(error);
        } else {
          setPlanets(data);
        }
        setLoading(false);
    };

    return (
        <></>
    );
};

export default PlanetGrid;