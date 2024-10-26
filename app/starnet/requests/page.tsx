import React from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import CommunityMissionList from "@/components/Missions/Requests";

export default function CMEPage() {
    return (
        <StarnetLayout>
            <CommunityMissionList />
        </StarnetLayout>
    );
};