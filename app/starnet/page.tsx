"use client";

import React from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import MissionPathway from "@/components/Missions/Pathway";
import ProfileCardModal from "@/components/profile/form";
import StructureMissionGuide, { StructureMissionGuideMobile } from "@/components/Layout/Guide";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Starnet() {
    return (
        <StarnetLayout>
            <StructureMissionGuideMobile />
            <Link href='/scenes/earth/'><Button>Play older missions</Button></Link>
        </StarnetLayout>
    );
};