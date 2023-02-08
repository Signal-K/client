import Layout from "../../components/Layout";
import PostFormCard from "../../components/PostFormCard";
import PostCard from "../../components/PostCard";
import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import LoginPage from "../login/social-login";
import { UserContext } from "../../context/UserContext";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
TimeAgo.addDefaultLocale(en);

export default function SocialGraphHome() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    supabase.from('profiles')
      .select()
      .eq('id', session.user.id)
      .then(result => {
        if (result.data.length) {
          setProfile(result.data[0]);
        }
      })
  }, [session?.user?.id]); // Run it again if auth/session state changes

  function fetchPosts () {
    supabase.from('posts')
      .select('id, content, created_at, media, profiles(id, avatar_url, username)') // Reset id on testing playground server later
      .order('created_at', { ascending: false })
      .then(result => { setPosts(result.data); })
  }

  function fetchProfile () {
    supabase.from('profiles')
      .select()
      .eq('id', session.user.id)
      .then(result => {
        if (result.data) {
          setProfile(result.data[0]);
        }
    })
  }

  if (!session) { return <LoginPage /> };

  return (
    <Layout hideNavigation={false}>
      <UserContext.Provider value={{profile}}> {/* Move this into `_app.tsx` later */}
        <PostFormCard onPost={fetchPosts} />
        {posts?.length > 0 && posts.map(post => (
          <PostCard key = { post.id } {...post} />
        ))}
      </UserContext.Provider>
    </Layout>
  );
}