import React from "react";
import CoreLayout from "../components/Core/Layout";
import SocialGraphHomeNoSidebar from "./posts";

import { useSession } from "@supabase/auth-helpers-react";
import SocialGraphHomeModal from "../components/Posts/Feed";

export default function Feed () {
    const session = useSession();

    return (
        <>
            <CoreLayout>
                <SocialGraphHomeModal />
            </CoreLayout>
        </>
    );
};