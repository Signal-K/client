"use client"

import React from "react";
import Layout from "@/components/Layout";

import { Card, Carousel } from "@material-tailwind/react";
import PickYourPlanet from "@/components/Onboarding";
import { ProfileCard } from "@/auth/UserProfileFields";
import LaunchPad from "@/components/Animations/Travelling/Launchpad";
import GoToYourPlanet from "@/components/Gameplay/Travel/InitTravel";
import UserItemsUndeployed from "@/components/Gameplay/Inventory/InactiveItems";
import { AllStructures } from "@/components/Gameplay/Inventory/Structures/Structure";
import { AllAutomatons } from "@/components/Gameplay/Inventory/Automatons/Automaton";
import CraftStructure from "@/components/Gameplay/Inventory/Actions/CraftStructure";
import FirstClassification from "@/Classifications/FirstClassification";
import UserAnomaliesComponent from "@/components/Content/Anomalies/YourAnomalies";

export default function MissionGroupOne() {
    return (
        <Layout bg={false}>
            <div className="flex justify-center items-center p-5">
                <Carousel className="rounded-xl " placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><PickYourPlanet onPlanetSelect={() => {}}></PickYourPlanet></center>
                    </Card>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><ProfileCard /></center>
                    </Card>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center>
                            <LaunchPad />
                            <GoToYourPlanet />
                        </center>
                    </Card>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><UserItemsUndeployed /></center>
                    </Card>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><AllStructures /></center> {/* Edit this to say "Your structures, on your home planet" */}
                    </Card>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><AllAutomatons /></center>
                    </Card>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><CraftStructure structureId={14} /></center>
                    </Card>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><FirstClassification /></center>
                    </Card>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><UserAnomaliesComponent /></center>
                    </Card>
                </Carousel>
            </div>
        </Layout>
    )
}