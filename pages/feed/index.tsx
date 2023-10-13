import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState } from "react";
import CoreLayout from "../../components/Core/Layout";
import Layout from "../../components/Section/Layout";
import CardForum from "../../components/Content/DiscussCard";
import ClassificationFeed from "../../components/Content/ClassificationFeed";

export default function Home() {
    const session = useSession();
    const supabase = useSupabaseClient();

    // add an iframe/ref to super.so dashboard

    async function logoutUser () { 
      const { error } = await supabase.auth.signOut() 
    }

    const userId = session?.user?.id;

    if (session) {
    return (
      <Layout>
        {/* {userId} */}
        <ClassificationFeed />
      </Layout>
        // <CoreLayout>
      )
    }

    return (
            // <CoreLayout>
              <Layout>Hello</Layout>
            // </CoreLayout>
    )
}