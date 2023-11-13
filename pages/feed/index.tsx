import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
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

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      if (typeof window !== "undefined") {
        const checkIsMobile = () => {
          setIsMobile(window.innerWidth <= 768);
        };
        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => {
          window.removeEventListener("resize", checkIsMobile);
        };
      }
    }, []);
  
    if (session) {
      const customMaxWidth = isMobile ? "100%" : "70%";
  
      return (
        <Layout>
          <ClassificationFeed custommaxWidth={customMaxWidth} />
        </Layout>
      );
    }

    return (
        <Layout>Hello</Layout>
    );
}