import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
import CoreLayout from "../components/Core/Layout";
import Layout from "../components/Section/Layout";
import CardForum from "../components/Content/DiscussCard";
import { useRouter } from "next/router";
import Login from "./login";

export default function Home() {
    const session = useSession();
    const supabase = useSupabaseClient();
    const router = useRouter();

    async function logoutUser () { 
      const { error } = await supabase.auth.signOut() 
    }

    const userId = session?.user?.id;

    useEffect(() => {
        if (session) {
            router.push('/feed');
        }
    }, [session, router]);

    if (session) {
    return (
      <Layout>
        {/* {userId} */}
        <div className="flex flex-col gap-4">
          
        </div>
      </Layout>
        // <CoreLayout>
      )
    }

    return (
      <Layout>Hello</Layout>
    )
}