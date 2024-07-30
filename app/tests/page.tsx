"use client"

import { useSession } from "@supabase/auth-helpers-react";
import { Panels } from "../(layout)/sectionStructure"
import { SidebarLayout } from "../(layout)/sectionStructure";
import { useRouter } from "next/navigation";
import ClassificationsFeed from "@/Classifications/ClassificationFeed";
import SpaceGamePage from "../(scenes)/(spaceship)/spaceship";
import Layout from "@/components/Layout";
import OnboardingWindow from "../(scenes)/(onboarding)/window";

export default function PageLayout() {
    const session = useSession();
    const router = useRouter();

    return (
        // <SidebarLayout leftContent={<div></div>} middleContent={<Panels />} />
        <Layout bg="true">
            {/* <Panels /> */}
            {/* <ClassificationsFeed /> */}
            {/* <SpaceGamePage /> */}
            <OnboardingWindow />
        </Layout>
    );
};
