"use client";

import FirstClassification from "@/Classifications/FirstClassification";
import { ProfileCard } from "@/auth/UserProfileFields";
import LaunchPad from "@/components/Animations/Travelling/Launchpad";
import UserAnomaliesComponent from "@/components/Content/Anomalies/YourAnomalies";
import CraftStructure from "@/components/Gameplay/Inventory/Actions/CraftStructure";
import { AllAutomatons } from "@/components/Gameplay/Inventory/Automatons/Automaton";
import UserItemsUndeployed from "@/components/Gameplay/Inventory/InactiveItems";
import { AllStructures } from "@/components/Gameplay/Inventory/Structures/Structure";
import GoToYourPlanet from "@/components/Gameplay/Travel/InitTravel";
import Layout from "@/components/Layout";
import PickYourPlanet from "@/components/Onboarding";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function FirstMissionGroupPage() {
    const supabase = useSupabaseClient();

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
                <UserAnomaliesComponent />
                {/* <CompletedMissionGroups /> */}
            </div>
        </Layout>
    )
}