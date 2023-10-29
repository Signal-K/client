import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState } from "react";
import CoreLayout from "../../components/Core/Layout";
import Layout from "../../components/Section/Layout";
import CardForum from "../../components/Content/DiscussCard";
import ClassificationFeed from "../../components/Content/ClassificationFeed";
import CreatePostForm from "../../components/Content/CreatePostForm";

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
        {/* <CreatePostForm planetId2={68} /> */}
        <iframe src="https://observablehq.com/d/464f8a61b073bb4d" width='100%' height='100%' />
        <iframe src="https://deepnote.com/@star-sailors/Step-by-step-50ad3984-69a9-496e-a121-efb59231e7e9" width='100%' height='100%' />
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