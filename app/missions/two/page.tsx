"use client";

import React from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Layout from "@/components/Layout";
import { DeleteMineralsAtEndOfMission } from "@/components/Gameplay/Inventory/Counters";
import { useActivePlanet } from "@/context/ActivePlanet";
import { AllAutomatons, SingleAutomaton, SingleAutomatonCraftItem } from "@/components/Gameplay/Inventory/Automatons/Automaton";

export default function MissionGroupTwo() {
    const supabase = useSupabaseClient();
    const session = useSession();

    return (
        <Layout bg={false}>
            <div className="p-5">
                <DeleteMineralsAtEndOfMission />
                <SingleAutomatonCraftItem craftItemId={30} />
            </div>
        </Layout>
    );
};