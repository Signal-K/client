import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
import Layout from "../components/Section/Layout";
import { useRouter } from "next/router";
import { Metadata } from "next";
import FileUpload from "../components/Content/FileUpload";
import CreateNode from "../components/Content/CreateRepo";
import CheckPostsOld from "../components/Content/CheckUserData";

export const metadata: Metadata = {
  title: "Star Sailors",
}

export default function Home() {
    const session = useSession();
    const supabase = useSupabaseClient();
    const router = useRouter();

    async function logoutUser () { 
      const { error } = await supabase.auth.signOut() 
    };

    const userId = session?.user?.id;

    if (session) {
    return (
      <Layout>
        {/* {userId} */}
        <div className="flex flex-col gap-4">
          <CreateNode />
          <CheckPostsOld />
          <FileUpload />
        </div>
      </Layout>
        // <CoreLayout>
      );
    };

    return (
      <div className="grid grid-cols-2 h-screen-navbar">

      </div>
    );
};