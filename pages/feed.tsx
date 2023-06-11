import React from "react";
import CoreLayout from "../components/Core/Layout";
import SocialGraphHomeNoSidebar from "./posts";

import { useSession } from "@supabase/auth-helpers-react";

export default function Feed () {
    const session = useSession();

    return (
        <>
            <CoreLayout>
                <SocialGraphHomeNoSidebar />
            </CoreLayout>
        </>
    )
}