import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient, SupabaseClient } from "@supabase/auth-helpers-react";
import CardForum from "../../_Core/ui/Content/DiscussCard";

export function ClassificationFeedForIndividualPlanet(planetId, backgroundColorSet) {
  const supabase: SupabaseClient = useSupabaseClient();
  const session = useSession();

  const [posts, setPosts] = useState([]);
  // const [profile, setProfile] = useState(null);
  const [planetPosts, setPlanetPosts] = useState([]);

  useEffect(() => {
      fetchPosts();
    }, []);  

  async function fetchPosts() {
    try {
      const postsResponse = await supabase
        .from("classifications")
        // .select("id, content, created_at, author, anomaly, basePlanets, profiles(id, avatar_url, full_name, username)")
        .select("id, created_at, content, anomaly, media, profiles(id, avatar_url, full_name, username)")
        .eq('anomaly', planetId.planetId.id)
        .order('created_at', { ascending: false });
  
      if (postsResponse.error || !postsResponse.data) {
        console.error("Error fetching posts:", postsResponse.error);
        return;
      }
  
      const postIds = postsResponse.data.map((post) => post.id);
  
      const commentsResponse = await supabase
        .from("comments")
        .select("id, content, created_at, profiles(id, avatar_url, username), post_id")
        .in("post_id", postIds)
        .order("created_at", { ascending: true });
  
      const commentsByPostId = commentsResponse.data.reduce((acc, comment) => {
        const postId = comment.post_id;
        if (!acc[postId]) {
          acc[postId] = [];
        }
        acc[postId].push(comment);
        return acc;
      }, {});
  
      const postsWithComments = postsResponse.data.map((post) => ({
        ...post,
        comments: commentsByPostId[post.id] || [],
      }));
  
      setPosts(postsWithComments);
      // console.log(posts);
    } catch (error) {
      console.error("Error fetching posts:", error.message);
    }
  }  

  return (
      <div className="flex flex-col items-center gap-4 py-5" style={{ maxWidth: '100%', margin: 'auto' }}>
          {posts.map((post) => (
              <>
                <CardForum key={post.id} {...post} backgroundColor={backgroundColorSet} />
                <p>{post.planetId}</p>
              </>
          ))}
      </div>
  );
};