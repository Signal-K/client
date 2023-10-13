import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState } from "react";
import CoreLayout from "../components/Core/Layout";
import Layout from "../components/Section/Layout";
import CardForum from "../components/Content/DiscussCard";

export default function Home() {
    const session = useSession();
    const supabase = useSupabaseClient();

    // add an iframe/ref to super.so dashboard

    async function logoutUser () { 
      const { error } = await supabase.auth.signOut() 
    }

    const userId = session?.user?.id;

    const posts = [
    {
      public_id: "1",
      content: "This is the first post content.",
      created_at: "2023-11-24T12:00:00Z",
      user: {
        name: "John Doe",
        username: "johndoe",
        image: "/path-to-your-image/johndoe.jpg", // Update the path accordingly
      },
      _count: {
        comments: 5,
      },
    },
    {
      public_id: "1",
      content: "This is the first post content.",
      created_at: "2023-11-24T12:00:00Z",
      user: {
        name: "John Doe",
        username: "johndoe",
        image: "/path-to-your-image/johndoe.jpg", // Update the path accordingly
      },
      _count: {
        comments: 5,
      },
    },
    {
      public_id: "1",
      content: "This is the first post content.",
      created_at: "2023-11-24T12:00:00Z",
      user: {
        name: "John Doe",
        username: "johndoe",
        image: "/path-to-your-image/johndoe.jpg", // Update the path accordingly
      },
      _count: {
        comments: 5,
      },
    },
    {
      public_id: "1",
      content: "This is the first post content.",
      created_at: "2023-11-24T12:00:00Z",
      user: {
        name: "John Doe",
        username: "johndoe",
        image: "/path-to-your-image/johndoe.jpg", // Update the path accordingly
      },
      _count: {
        comments: 5,
      },
    },
  ];

    if (session) {
    return (
      <Layout>
        {/* {userId} */}
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <CardForum key={post.public_id} {...post} />
          ))}
        </div>
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