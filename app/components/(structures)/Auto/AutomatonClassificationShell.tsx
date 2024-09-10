"use client"

import React, { useEffect, useState } from "react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useActivePlanet } from "@/context/ActivePlanet"
import { Anomaly } from "@/types/Anomalies"

interface AnomalyClassificationProps {
    onAnomalyFetch: ( anomaly: Anomaly | null ) => void;
};

export function AnomalyRoverPhoto() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(true);

    const resourceList = ["11", "15", "16", "17", "19", "20"];
}