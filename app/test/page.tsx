"use client"

import ClassificationsFeed from "@/Classifications/ClassificationFeed";
import CreateBaseClassification from "@/Classifications/ClassificationForm";
import FirstClassification from "@/Classifications/FirstClassification";
import { ProfileCard } from "@/auth/UserProfileFields";
import LaunchPad from "@/components/Animations/Travelling/Launchpad";
import MissionList, { MissionOverlay } from "@/components/Content/MissionList";
import { OverlayModal } from "@/components/Dials&Data/OverlayModal";
import CompletedMissionGroups from "@/components/Gameplay/CompletedMissions";
import CraftStructure from "@/components/Gameplay/Inventory/Actions/CraftStructure";
import { AllAutomatons } from "@/components/Gameplay/Inventory/Automatons/Automaton";
import UserItemsUndeployed from "@/components/Gameplay/Inventory/InactiveItems";
import { AllStructures } from "@/components/Gameplay/Inventory/Structures/Structure";
import SkillTreeComp from "@/components/Gameplay/Inventory/Structures/TechTree";
import GoToYourPlanet from "@/components/Gameplay/Travel/InitTravel";
import Layout from "@/components/Layout";
import PickYourPlanet from "@/components/Onboarding";
import { useActivePlanet } from "@/context/ActivePlanet";
// import Sidebar, { Slidebar } from "@/ui/Panels/Anomalies";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

export default function () {
    // const { activePlanet, activeSector } = useActivePlanet();
    const supabase = useSupabaseClient();

    async function signoutUser() {
        const { error } = await supabase.auth.signOut()
    };

    return (
        <Layout bg={false}>
            <div className="p-5">
                <PickYourPlanet onPlanetSelect={() => {}} />
                <ProfileCard />
                {/* <SkillTreeComp /> */}
                <div className='p-1'> {/* Going to planet component group */}
                    <LaunchPad />
                    <GoToYourPlanet />
                </div>
                <div className="p-5"> {/* Helper items/components */}
                    <UserItemsUndeployed />
                </div>
                <AllStructures />
                <AllAutomatons />
                <CraftStructure structureId={14} /><br /><br /><br /><br />
                <center><FirstClassification /></center>
                {/* <CompletedMissionGroups /> */}
                <button onClick={signoutUser}>Sign out</button>
            </div>
        </Layout>
    );
};