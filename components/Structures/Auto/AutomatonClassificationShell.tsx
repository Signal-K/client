"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import { Anomaly } from "@/types/Anomalies";
import { RoverPhoto } from "@/components/Projects/Auto/Mars-Photos";

interface AnomalyClassificationProps {
    onAnomalyFetch: ( anomaly: Anomaly | null ) => void;
};

export function AnomalyRoverPhoto() {
    return (
        <div>
            <RoverPhoto />
        </div>
    );
};