"use client";

import React from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import MissionPathway from "@/components/Missions/Pathway";
import ProfileCardModal from "@/components/profile/form";

export default function Starnet() {
    return (
        <StarnetLayout>
            <MissionPathway />
        </StarnetLayout>
    );
};