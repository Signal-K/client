"use client";

import React from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import MissionPathway from "@/components/Missions/Pathway";
import ProfileCardModal from "@/components/Profile/form";

export default function TestPage() {
    return (
        <StarnetLayout>
            <ProfileCardModal />
        </StarnetLayout>
    );
};