"use client"

import ClassificationsFeed from "@/Classifications/ClassificationFeed";
import CreateBaseClassification from "@/Classifications/ClassificationForm";
import FillInProfile from "@/auth/UserProfileFields";
import LaunchPad from "@/components/Animations/Travelling/Launchpad";
import MissionList, { MissionOverlay } from "@/components/Content/MissionList";
import { OverlayModal } from "@/components/Dials&Data/OverlayModal";
import SkillTreeComp from "@/components/Gameplay/Inventory/Structures/TechTree";
import Layout from "@/components/Layout";
import PickYourPlanet from "@/components/Onboarding";
import { useActivePlanet } from "@/context/ActivePlanet";
import Sidebar, { Slidebar } from "@/ui/Panels/Anomalies";
import { useState } from "react";

export default function () {
    // const { activePlanet, activeSector } = useActivePlanet();
    const { activePlanet } = useActivePlanet();

    if (activePlanet) {
        return (
            <Layout bg={false}>
                <div className="p-5">
                    <PickYourPlanet onPlanetSelect={() => {}} />
                    <FillInProfile />
                    <SkillTreeComp />
                    <div className='p-1'>
                        <LaunchPad />
                    </div>

                    
                </div>
            </Layout>
        );
    };

    return (
        <>
            <MissionOverlay />
            <Sidebar />
            <PickYourPlanet onPlanetSelect={() => {}} />
            {/* <PickYourPlanet /> */}

            {/* <CreateBaseClassification assetMentioned={1} /> Look into these...
                    <ClassificationsFeed /> 
                    {/* <div className="my-4 mb-6 px-3"><AutomatonControlPanel /></div>
                    <RoverControlPanel /> 
                    {/* <OverlayModal title="Hello" imageUrl="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/avatars/Base6.png" content="Mars" isOpen={true} onClose={() => {}} button1Text="Button 1" button2Text="Button 2" button1Action={() => {}} button2Action={() => {}} />  */}
        </>
    );
};