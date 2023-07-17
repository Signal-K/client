import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient, SupabaseClient } from "@supabase/auth-helpers-react";
import PostModal from "./FeedPostCard";

export default function SocialGraphHomeModal() {
  const supabase: SupabaseClient = useSupabaseClient();
  const session = useSession();
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [planetPosts, setPlanetPosts] = useState([]);

  const a = 0;

  useEffect(() => {
    fetchPosts();
  }, [a]); 

  useEffect(() => {
    if (planetPosts.length > 0) {
      console.log("Comments: ", planetPosts.flatMap((post) => post.comments));
    }
  }, [a]);

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
    <div className="container mx-auto py-8">
        {/* <UserContext.Provider value={{profile}}><PostFormCard onPost={fetchPosts()} /></UserContext.Provider><br /> */}
        <div className="flex-grow flex flex-col overflow-hidden">
        {posts?.map((post) => ( // planetPosts?.map
          <PostModal key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}