"use client"

import ClassificationsFeed from "@/Classifications/ClassificationFeed";
import CreateBaseClassification from "@/Classifications/ClassificationForm";
import LaunchPad from "@/components/Animations/Travelling/Launchpad";
import MissionList, { MissionOverlay } from "@/components/Content/MissionList";
import { OverlayModal } from "@/components/Dials&Data/OverlayModal";
import { AllAutomatons, CreateAutomaton, SingleAutomaton } from "@/components/Gameplay/Inventory/Automatons/Automaton";
import { AllStructures, CreateStructure } from "@/components/Gameplay/Inventory/Structures/Structure";
import SkillTreeComp from "@/components/Gameplay/Inventory/Structures/TechTree";
import UserItems from "@/components/Gameplay/Inventory/UserInventory";
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
                    <Sidebar />
                    
                    {/* <UserItems /> 
                    <SkillTreeComp /> 
                    {/* <CreateBaseClassification assetMentioned={1} /> 
                    <ClassificationsFeed /> 
                    {/* <div className="my-4 mb-6 px-3"><AutomatonControlPanel /></div>
                    <RoverControlPanel /> 
                    {/* <AllStructures /> 
                    {/* <CreateAutomaton /> 
                    {/* <SingleAutomaton /> 
                    <AllAutomatons />
                    {/* <OverlayModal title="Hello" imageUrl="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/avatars/Base6.png" content="Mars" isOpen={true} onClose={() => {}} button1Text="Button 1" button2Text="Button 2" button1Action={() => {}} button2Action={() => {}} /> 
                    {/* <CreateStructure onStructureSelected={handleStructureSelected} activeSectorId={0} /> */}
                </div>
            </Layout>
        );
    };

    return (
        <>
            <MissionOverlay />
            <Sidebar />
            {/* <PickYourPlanet /> */}
        </>
    );
};