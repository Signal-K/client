import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import PostModal from "./FeedPostCard";
import PostFormCard from "../PostFormCard";
import { UserContext } from "../../context/UserContext";

export default function SocialGraphHomeModal() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [planetPosts, setPlanetPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    supabase
      .from("profiles")
      .select()
      .eq("id", session?.user?.id)
      .then((result) => {
        if (result.data.length) {
          setProfile(result.data[0]);
        }
      });
  }, [session?.user?.id]);

  function fetchPosts() {
    supabase
      .from("posts")
      .select("id, content, created_at, profiles(id, avatar_url, username)")
      .order("created_at", { ascending: false })
      .then((result) => {
        setPosts(result.data);
      });

    supabase
      .from("posts_duplicate")
      .select(
        "id, content, created_at, planets2, planetsss(id, temperature), profiles(id, avatar_url, full_name, username)"
      )
      .order("created_at", { ascending: false })
      .then((result) => {
        setPlanetPosts(result.data);
      });
  }

  return (
    <div className="container mx-auto py-8">
        {/* <UserContext.Provider value={{profile}}><PostFormCard onPost={fetchPosts()} /></UserContext.Provider><br /> */}
        <div className="flex-grow flex flex-col overflow-hidden">
        {planetPosts?.map((post) => (
          <PostModal key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}