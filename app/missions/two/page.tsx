"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Layout from "@/components/Layout";
import { DeleteMineralsAtEndOfMission } from "@/components/Gameplay/Inventory/Counters";
import { useActivePlanet } from "@/context/ActivePlanet";
import { AllAutomatons, SingleAutomaton, SingleAutomatonCraftItem } from "@/components/Gameplay/Inventory/Automatons/Automaton";

import { Card, Carousel } from "@material-tailwind/react";
import { CreateStructureWithItemRequirementinfo, PlacedStructureSingle } from "@/components/Gameplay/Inventory/Structures/Structure";
import MiningStationPlaceable, { MeteorologyToolPlaceable } from "@/components/Gameplay/Inventory/Structures/Mining";
import PlanetCloudData from "@/components/Content/Anomalies/CloudList";
import { MeteorologyToolModal, MeteorologyToolModalPlaceable } from "@/components/Gameplay/Inventory/Structures/Terrestrial";
import { AUSM } from "@/components/Gameplay/Inventory/Structures/Automatons";

interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
    anomaly: number;
};

interface UserStructure {
    id: number;
    item: number; // Assuming this should be a number
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    // Function (what is executed upon click)
};

export default function MissionGroupTwo() {
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
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <MiningStationPlaceable /> {/*  target={11} />  */}
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        {/* <SingleAutomatonCraftItem craftItemId={26} /> */}
                        <CreateStructureWithItemRequirementinfo craftingItemId={26} />
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        {/* <MeteorologyToolModalPlaceable /> */}
                        <MeteorologyToolPlaceable />
                    </Card>
                    {/* <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <MiningStationPlaceable />
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <AUSM itemId={31} />
                    </Card> */}
                </Carousel>
            </div>
        </Layout>
    );
};