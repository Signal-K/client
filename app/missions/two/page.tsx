"use client";

import React from "react";
import Layout from "@/components/Layout";
import { DeleteMineralsAtEndOfMission } from "@/components/Gameplay/Inventory/Counters";
import { SingleAutomatonCraftItem } from "@/components/Gameplay/Inventory/Automatons/Automaton";

import { Card, Carousel } from "@material-tailwind/react";
import { CreateStructureWithItemRequirementinfo } from "@/components/Gameplay/Inventory/Structures/Structure";
import MiningStationPlaceable, { MeteorologyToolPlaceable } from "@/components/Gameplay/Inventory/Structures/Mining";
import { CameraAutomatonModule } from "@/components/Gameplay/Inventory/Structures/Automatons/Modules";
import { AUSM } from "@/components/Gameplay/Inventory/Structures/Automatons/Automatons";
import { SurveyorStructureModal } from "@/components/Gameplay/Inventory/Structures/Telescopes/Telescopes";
import MissionList from "@/components/Content/MissionList";
import UserAnomaliesComponent from "@/components/Content/Anomalies/YourAnomalies";
import CraftStructure from "@/components/Gameplay/Inventory/Actions/CraftStructure";

export default function MissionGroupTwo() {
    return (
        <Layout bg={false}>
            <div className="flex justify-center items-center p-5">
                <Carousel className="rounded-xl " placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><MissionList /></center>
                    </Card>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><DeleteMineralsAtEndOfMission /></center>
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <SingleAutomatonCraftItem craftItemId={30} />
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <MiningStationPlaceable missionId={11} />
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        {/* <SingleAutomatonCraftItem craftItemId={26} /> */}
                        {/* <CreateStructureWithItemRequirementinfo craftingItemId={26} /> */}
                        <CraftStructure structureId={26} />
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        {/* <MeteorologyToolModalPlaceable /> */}
                        <MeteorologyToolPlaceable />
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <MiningStationPlaceable missionId={14}/>
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        {/* <CreateStructureWithItemRequirementinfo craftingItemId={31} /> */}
                        <CraftStructure structureId={31} />
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <AUSM itemId={31} />
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <CameraAutomatonModule />
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        {/* <CreateStructureWithItemRequirementinfo craftingItemId={24} /> */}
                        <CraftStructure structureId={24} />
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <SurveyorStructureModal />
                    </Card>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><UserAnomaliesComponent /></center>
                    </Card>
                </Carousel>
            </div>
        </Layout>
    );
};