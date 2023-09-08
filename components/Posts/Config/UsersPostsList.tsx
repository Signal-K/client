import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import PostModalForUserList from "../FeedPostCard";
import { UserContext } from "../../../context/UserContext";

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
}

interface Post {
  id: number;
  content: string;
  created_at: string;
  planets2: string;
  planetsss: {
    id: number;
    temperature: string;
  }[];
  profiles: {
    id: number;
    avatar_url: string;
    full_name: string;
    username: string;
  }[];
}

export default function UserPostList() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const userId = session?.user?.id;

  const [posts, setPosts] = useState<Comment[]>([]);
  const [profile, setProfile] = useState<any>(null); // Update the type as needed
  const [planetPosts, setPlanetPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, [session?.user?.id]);

  useEffect(() => {
    if (planetPosts?.length > 0) {
      // console.log("Comments: ", planetPosts.flatMap((post) => post.comments));
    }
  }, [planetPosts]);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    supabase
      .from("profiles")
      .select()
      .eq("id", session?.user?.id)
      .then((result) => {
        if (result?.data?.length) {
          setProfile(result.data[0]);
        }
      });
  }, [session?.user?.id]);

  async function fetchPosts() {
    try {
      const { data: commentData, error: commentError } = await supabase
        .from("comments")
        .select("id, content, created_at, profiles(id, avatar_url, username), post_id")
        .order('created_at', { ascending: false });

      if (commentError) {
        throw commentError;
      }

      const comments = commentData?.reduce((acc, comment) => {
        if (!acc[comment.post_id]) {
          acc[comment.post_id] = [];
        }
        acc[comment.post_id].push(comment);
        return acc;
      }, {});

      const { data: postDuplicateData, error: postDuplicateError } = await supabase
        .from("posts_duplicates")
        .select(
          "id, content, created_at, planets2, planetsss(id, temperature), profiles(id, avatar_url, full_name, username)"
        )
        .eq("author", userId)
        .limit(2)
        .order("created_at", { ascending: false });

      if (postDuplicateError) {
        throw postDuplicateError;
      }

      const postsWithComments = postDuplicateData.map((post) => ({
        ...post,
        comments: comments[post.id] || [],
      }));

      // setPlanetPosts(postsWithComments);
    } catch (error) {
      console.error("Error fetching posts & comments: ", error.message);
    }
  }

  return (
    <div className="container mx-auto py-8">
      {/* <UserContext.Provider value={{profile}}><PostFormCard onPost={fetchPosts()} /></UserContext.Provider><br /> */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {planetPosts?.map((post) => (
          // <PostModalForUserList key={post.id} {...post} />
          <p>Test</p>
        ))}
      </div>
    </div>
  );
}