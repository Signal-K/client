"use client";

import React, { useState, useEffect } from "react";

import { AnomalyData } from "@/types/AnomalyData";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

// This file is for bringing in data from citizen science modules where the images are stored inside supabase storage buckets. Obviously some/all modules will bring data in directly from a notebook
export default function DataFromImages({ fileType, anomalyId, fileTypes }: AnomalyData) {
    const { activePlanet } = useActivePlanet();
    const supabase = useSupabaseClient();
    const session = useSession();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imagesUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${activePlanet?.id}/`; // Or should this be from the anomalyId?

    // Bring in images based on the requests from the anomaly and their id
    return (
        <div className="mt-1">

        </div>
    );
};