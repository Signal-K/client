import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient, SupabaseClient } from "@supabase/auth-helpers-react";
import CardForum from "./DiscussCard";
import Link from "next/link";

export default function ClassificationFeed() {
    const supabase: SupabaseClient = useSupabaseClient();
    const session = useSession();

    const [posts, setPosts] = useState([]);
    // const [profile, setProfile] = useState(null);
    const [planetPosts, setPlanetPosts] = useState([]);

    useEffect(() => {
        fetchPosts();
      }, []);  
    
    useEffect(() => {
        if (planetPosts.length > 0) {
          console.log("Comments: ", planetPosts.flatMap((post) => post.comments));
        }
    }, []);

    async function fetchPosts() {
        const postsResponse = await supabase
        .from("posts_duplicates")
        .select(
          "id, content, created_at, planets2, planetsss(id, temperature), profiles(id, avatar_url, full_name, username)"
        )
        .order('created_at', { ascending: false });
    
      const postIds = postsResponse.data.map((post) => post.id);
      const commentsResponse = await supabase
        .from("comments")
        .select("id, content, created_at, profiles(id, avatar_url, username), post_id") // Add the closing parenthesis for profiles select
        .in("post_id", postIds)
        .order("created_at", { ascending: true });

      const commentsByPostId: { [postId: number]: Comment[] } = commentsResponse.data.reduce((acc, comment) => {
        const postId = comment.post_id;
        if (!acc[postId]) {
          acc[postId] = [];
        }
        acc[postId].push(comment);
        return acc;
      }, {});
  
      // const postsWithComments: Post[] = postsResponse.data.map((post) => ({
      const postsWithComments = postsResponse.data.map((post) => ({
        ...post,
        comments: commentsByPostId[post.id] || [],
      }));
  
      setPosts(postsWithComments);
    }

    return (
        <div className="flex flex-col items-center gap-4" style={{ maxWidth: '100%', margin: 'auto' }}>
            <Link href="/planets/1">{posts.map((post) => (
                <CardForum key={post.id} {...post} />
            ))}</Link>
        </div>
    );
};