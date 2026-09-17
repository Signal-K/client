import CommentItem from "./CommentsList";
import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

// Define types for posts and comments
interface Post {
  id: number;
  content: string;
  planets2: string;
  comments: Comment[];
}

// Component code
interface Comment {
    id: number;
    parent_id: number | null;
    post_id: number;
    content: string;
    author: string; // Add the 'author' property
}  

const CommentSection: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]); // Specify the type as Post[]
  const supabase = useSupabaseClient();
  const session = useSession();
  const a = 0;

  useEffect(() => {
    fetchPostsAndComments();
  }, [a]);

  const fetchPostsAndComments = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts_duplicates")
        .select("id, content, planets2");

      if (postsError) {
        throw postsError;
      }

      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*");

      if (commentsError) {
        throw commentsError;
      }

      // Organize the comments based on each post
      const commentsHierarchy: Comment[] = commentsData.reduce((acc, comment) => {
        if (comment.parent_id === null) {
          acc.push(comment);
        } else {
          const parentComment = commentsData.find((c) => c.id === comment.parent_id);
          if (parentComment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }
            parentComment.replies.push(comment);
          }
        }
        return acc;
      }, []);

      // Merge the comments hierarchy into the posts data
      const postsWithComments: Post[] = postsData.map((post) => ({
        ...post,
        comments: commentsHierarchy.filter((c) => c.post_id === post.id),
      }));

      setPosts(postsWithComments);
    } catch (error) {
      console.error("Error fetching posts & comments, ", error.message);
    }
  };

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>
          <h2 className="text-2xl font-bold mb-4">Post: {post.id}</h2>
          <p>{post.content}</p>
          <CommentItem comments={post.comments} />
        </div>
      ))}
    </div>
  );
};

export default CommentSection;