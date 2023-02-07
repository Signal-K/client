import Layout from "../../components/Layout";
import PostFormCard from "../../components/PostFormCard";
import PostCard from "../../components/PostCard";
import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import LoginPage from "../login/social-login";

export default function SocialGraphHome() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [posts, setPosts] = useState([]);

  const [profile, setProfile] = useState(null);

  if (!session) { return <LoginPage /> };

  function fetchPosts () {
    supabase.from('posts')
      .select('id, content, created_at, profiles(id, avatar_url, username)') // Reset id on testing playground server later
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

  fetchProfile();
  fetchPosts();

  /*useEffect(() => { */fetchPosts();// }, []);

  return (
    <Layout hideNavigation={false}>
      <PostFormCard onPost={fetchPosts} />
      {posts?.length > 0 && posts.map(post => (
        <PostCard key = { post.id } {...post} />
      ))}
    </Layout>
  );
}