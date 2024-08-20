"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { SceneLayout } from "@/app/components/(scenes)/planetScene/layout";

export default function MiningScene() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    return (
        <SceneLayout>
            <p></p>
            <p></p>
        </SceneLayout>
    );
};