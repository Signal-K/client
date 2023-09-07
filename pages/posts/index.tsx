import Layout from "../../components/Layout";
import PostFormCard from "../../components/PostFormCard";
import PostCard, { PostModal } from "../../components/PostCard";
import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "../../context/UserContext";
import { useRouter } from "next/router";
// import { StarSystem } from 'stellardream';
// import LoginPage from "../login/social-login";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Login from "../login";
TimeAgo.addDefaultLocale(en);

/* 
    // const starSystem = new StarSystem(1549748672440);
    // console.log(JSON.stringify(starSystem, null, 2));
    var myNumber1 = Math.floor(Math.random() * 10);
    var myNumber2 = Math.floor(Math.random() * 10);
    var myNumber3 = Math.floor(Math.random() * 10);
    var myNumber4 = Math.floor(Math.random() * 10);
    var myNumber5 = Math.floor(Math.random() * 10);
    var myNumber6 = Math.floor(Math.random() * 10);
    var myNumber7 = Math.floor(Math.random() * 10);
    var myNumber8 = Math.floor(Math.random() * 10);
    var myNumber9 = Math.floor(Math.random() * 10);
    var myNumber10 = Math.floor(Math.random() * 10);
    var myNumber11 = Math.floor(Math.random() * 10);
    var myNumber12 = Math.floor(Math.random() * 10);
    var myNumber13 = Math.floor(Math.random() * 10);
    var myNumber = myNumber1.toString() + myNumber2.toString() + myNumber3.toString() + myNumber4.toString() + myNumber5.toString() + myNumber6.toString() + myNumber7.toString() + myNumber8.toString() + myNumber9.toString() + myNumber10.toString() + myNumber11.toString() + myNumber12.toString() + myNumber13.toString();
    //const starSystem = new StarSystem(myNumber)
    //console.log(JSON.stringify(starSystem, null, 2));
  }, [session?.user?.id]); */

interface SocialGraphHomeNoSidebarProps {
  planets2: string;
  // Other props you have
}

interface SupabaseResponse<T> {
  data: T[] | null;
  error: Error | null;
}

interface PlanetPost {
  id: number;
  content: string;
  created_at: string;
  media: string[];
  planets2: string;
  planetsss: { id: number; temperature: string }[];
  profiles: {
    id: number;
    avatar_url: string;
    full_name: string;
    username: string;
  }[];
}

export default function SocialGraphHomeNoSidebar() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const user = session?.user?.id;
  const [profile, setProfile] = useState<any>(null); // Update the type as needed
  const [planetPosts, setPlanetPosts] = useState<PlanetPost[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchPlanetPosts();
  }, [user]);

  async function fetchProfile() {
    if (session) {
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq("id", user);

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    if (data.length) {
      setProfile(data[0]);
    }
  }

  async function fetchPlanetPosts() {
    const { data, error } = await supabase
      .from("posts_duplicates")
      .select("*")
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error fetching planet posts:", error);
      return;
    }
  
    setPlanetPosts(data || []);
  }
  
  

  return (
    <Layout hideNavigation={true}>
      <UserContext.Provider value={{ profile }}>
        <PostFormCard onPost={fetchPlanetPosts} />
        {planetPosts?.length > 0 &&
          planetPosts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
      </UserContext.Provider>
    </Layout>
  );
}


export function SocialGraphHomeModal1() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [planetPosts, setPlanetPosts] = useState<PlanetPost[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchProfile();
  }, [session?.user]);

  async function fetchPosts() {
    try {
      if (!session?.user?.id) {
        return;
      }

      const { data: planetPostsData, error: planetPostsError } = await supabase
        .from("posts_duplicates")
        .select("*")
        .limit(2)
        .order("created_at", { ascending: false });

      if (planetPostsError) {
        console.error("Error fetching planet posts:", planetPostsError);
      } else {
        setPlanetPosts(planetPostsData || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  async function fetchProfile() {
    try {
      if (!session?.user?.id) {
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", session.user.id);

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
        setProfile(profileData[0] || null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  return (
    <Layout hideNavigation={true}>
      <UserContext.Provider value={{ profile }}>
        {planetPosts?.length > 0 &&
          planetPosts.map((post) => (
            <PostModal key={post.id} {...post} />
          ))}
      </UserContext.Provider>
    </Layout>
  );
}
