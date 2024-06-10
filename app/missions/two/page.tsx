"use client";

import React from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Layout from "@/components/Layout";
import { DeleteMineralsAtEndOfMission } from "@/components/Gameplay/Inventory/Counters";
import { useActivePlanet } from "@/context/ActivePlanet";
import { AllAutomatons, SingleAutomaton, SingleAutomatonCraftItem } from "@/components/Gameplay/Inventory/Automatons/Automaton";

import { Card, Carousel } from "@material-tailwind/react";

export default function MissionGroupTwo() {
    const supabase = useSupabaseClient();
    const session = useSession();

    return (
        <Layout bg={false}>
            <div className="flex justify-center items-center p-5">
                <Carousel className="rounded-xl " placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><DeleteMineralsAtEndOfMission /></center>
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <SingleAutomatonCraftItem craftItemId={30} />
                    </Card>
                </Carousel>
            </div>
        </Layout>
    );
};