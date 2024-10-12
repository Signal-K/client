"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import SwitchPlanet from "@/components/(scenes)/travel/SolarSystem";

export default function Travel() {
    return (
        <main className="container mx-auto px-4 py-6 relative z-8">
            <h1 className="text-5xl font-bold text-center mb-12 text-[#F7F5E9]">Travel UI</h1>
            <center><SwitchPlanet /></center>
        </main>
    )
};