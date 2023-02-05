import Layout from "../../components/Layout";
import PostFormCard from "../../components/PostFormCard";
import PostCard from "../../components/PostCard";
import React from "react";
import { useSession } from "@supabase/auth-helpers-react";
import LoginPage from "../login/social-login";

export default function SocialGraphHome() {
  const session = useSession();
  console.log(session);
  if (!session) { return <LoginPage /> };

  return (
    <Layout hideNavigation={false}>
      <PostFormCard />
      <PostCard />
    </Layout>
  )
}