"use client";

import React from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Layout from "@/components/Layout";

export default function MissionGroupTwo() {
    const supabase = useSupabaseClient();
    const session = useSession();

    return (
        <Layout bg={false}>
            <div className="p-5">
                
            </div>
        </Layout>
    )
}