"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import SwitchPlanet from "@/components/(scenes)/travel/SolarSystem";
import StarnetLayout from "@/components/Layout/Starnet";

export default function Travel() {
    return (
        <StarnetLayout>
            <main className="container mx-auto px-4 py-6 relative z-8">
                <center><SwitchPlanet /></center>
            </main>
        </StarnetLayout>
    )
};