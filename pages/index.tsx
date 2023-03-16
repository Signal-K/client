import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React from "react";
import CoreLayout from "../components/Core/Layout";
import { SocialGraphHomeNoSidebar } from "./posts";

export default function Home() {
    const session = useSession();
    // add an iframe/ref to super.so dashboard

    return (
        <>
            <CoreLayout>      
                <SocialGraphHomeNoSidebar />          
            </CoreLayout>
        </>
    )
}