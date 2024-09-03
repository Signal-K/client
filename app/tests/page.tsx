"use client";

import React from "react";
import { OnboardingLayout } from "../components/Template";
import { Header } from "../components/sections/Header";
import { AllStructures } from "../components/(structures)/Structures";
import MissionLog from "../components/(scenes)/(missions)/MissionList";

export default function TestPageForFuckingAround() {
    const handleActionClick = (action: string) => {
        console.log(`${action} clicked`);
    };

    const handleClose = () => {
        console.log("Dialog closed");
    };

    return (
        <OnboardingLayout bg={false}>
            <Header />
            <AllStructures />
            {/* <MissionLog /> */}
        </OnboardingLayout> //* Replace with regular layout */}
    );
};