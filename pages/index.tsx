import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
import CoreLayout from "../components/Core/Layout";
import Layout from "../components/Section/Layout";
import CardForum from "../components/Content/DiscussCard";
import { useRouter } from "next/router";
import Login from "./login";

import styles from '../styles/Landing.module.css';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Star Sailors"
}

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
      <div className="grid grid-cols-2 h-screen-navbar">
        <div className="bg-teal border-r">
          <div className="p-4">
            <div className="mx-auto tablet:mx-0">
              <div className="grid grid-cols-1 content-grid home-hero">
                <h1 className="text-4xl font-bold">Test</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}