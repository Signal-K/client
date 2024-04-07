import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient, SupabaseClient } from "@supabase/auth-helpers-react";
import CardForum from "../../_Core/ui/Content/DiscussCard";

interface Post {
  id: number;
  created_at: string;
  content: string;
  anomaly: number;
  media: any[];
  profiles?: { // Make it optional
    id?: number; // Make id optional
    avatar_url: string;
    full_name: string;
    username: string;
  }[];
  comments: Comment[];
  planetId?: string;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  profiles: {
    id: number;
    avatar_url: string;
    username: string;
  };
  post_id: number;
};

export function ClassificationFeedForIndividualPlanet(planetId, backgroundColorSet) {
  const supabase: SupabaseClient = useSupabaseClient();
  const session = useSession();

  const [posts, setPosts] = useState<Post[]>([]);
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
    
    const commentsByPostId = commentsResponse.data
      ? commentsResponse.data.reduce((acc, comment) => {
          const postId = comment.post_id;
          if (!acc[postId]) {
            acc[postId] = [];
          }
          acc[postId].push(comment);
          return acc;
        }, {})
      : {};
    
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
          {/* {posts.map((post) => (
              <>
                <CardForum _count={{
                comments: 0
              }} key={post.id} {...post} backgroundColor={backgroundColorSet} />
                <p>{post.planetId}</p>
              </>
          ))} */}
      </div>
  );
};