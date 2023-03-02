import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React from "react";
import CoreLayout from "../components/Core/Layout";
import CoreNavigation from "../components/Core/Navigation";
import { SocialGraphHomeNoSidebar } from "./posts";

export default function Home() {
    const session = useSession();

    return (
        <>
            <CoreLayout>      
                <SocialGraphHomeNoSidebar />          
            </CoreLayout>
        </>
    )
}