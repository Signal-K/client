"use client"

import { useSession } from "@supabase/auth-helpers-react";
import { Panels } from "../(layout)/sectionStructure"
import { SidebarLayout } from "../(layout)/sectionStructure";
import { useRouter } from "next/navigation";

export default function PageLayout() {
    const session = useSession();
    const router = useRouter();

    if (!session) {
        router.push('/auth')
    };

    return (
        // <SidebarLayout leftContent={<div></div>} middleContent={<Panels />} />
        <>
            <Panels />
        </>
    );
};
