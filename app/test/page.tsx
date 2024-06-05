"use client"

import ClassificationsFeed from "@/Classifications/ClassificationFeed";
import CreateBaseClassification from "@/Classifications/ClassificationForm";
import { ProfileCard } from "@/auth/UserProfileFields";
import LaunchPad from "@/components/Animations/Travelling/Launchpad";
import MissionList, { MissionOverlay } from "@/components/Content/MissionList";
import { OverlayModal } from "@/components/Dials&Data/OverlayModal";
import CompletedMissionGroups from "@/components/Gameplay/CompletedMissions";
import SkillTreeComp from "@/components/Gameplay/Inventory/Structures/TechTree";
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
                <SkillTreeComp />
                <div className='p-1'>
                    <LaunchPad />
                    <button onClick={signoutUser}>Sign out</button>
                </div>
                <CompletedMissionGroups />
            </div>
        </Layout>
    );
};