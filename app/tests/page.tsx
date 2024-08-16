"use client"

import { useSession } from "@supabase/auth-helpers-react";
import { Panels } from "../(layout)/sectionStructure"
import { SidebarLayout } from "../(layout)/sectionStructure";
import { useRouter } from "next/navigation";
import ClassificationsFeed from "@/Classifications/ClassificationFeed";
import SpaceGamePage from "../(scenes)/(spaceship)/spaceship";
import Layout, { OnboardingLayout } from "@/components/Layout";
import OnboardingWindow from "../(scenes)/(onboarding)/window";
import { ProfileCard } from "../auth/UserProfileFields";
import ProfileCardModal from "../(settings)/profile/form";
import SandpackBox from "../(anomalies)/(editor)/Sandbox";
import PythonSandpackTest from "../(anomalies)/(editor)/Python";

export default function PageLayout() {
    const session = useSession();
    const router = useRouter();

    return (
        // <SidebarLayout leftContent={<div></div>} middleContent={<Panels />} />
        // <Layout bg="true">
        <>
            {/* <Panels /> */}
            {/* <ClassificationsFeed /> */}
            {/* <SpaceGamePage /> */}
            <OnboardingLayout bg={true}>
          <OnboardingWindow />
        </OnboardingLayout>
            {/* <SandpackBox />
            <PythonSandpackTest /> */}
        {/* </Layout> */}
        </>
    );
};
