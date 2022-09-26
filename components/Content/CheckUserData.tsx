import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import dayjs from "dayjs";

interface Post {
  id: number;
  content: string;
  author: string;
  created_at: string;
  planets: string;
}

const CheckPostsOld: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("posts_old")
          .select("*")
          .eq("author", session?.user?.id)
          .gte("created_at", dayjs("2024-01-01").toISOString()); // Filter posts after Jan 1, 2024

        if (error) {
          console.error("Error fetching posts:", error.message);
          return;
        }

        if (data) {
          setPosts(data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error.message);
      }
    };

    if (session?.user?.id) {
      fetchPosts();
    }
  }, [supabase, session]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your project nodes after January 1, 2024:</h2>
      {posts.length === 0 ? (
        <p>No project nodes found after January 1, 2024.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id} className="mb-4">
              <p>{post.content}</p>
              <p className="text-sm text-gray-500">Created at: {post.created_at}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CheckPostsOld;
