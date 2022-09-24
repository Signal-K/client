import CommentItem from "./CommentsList";
import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const CommentSection: React.FC = () => {
    const [comments, setComments] = useState([]);
    const [posts, setPosts] = useState([])
    const supabase = useSupabaseClient();

    useEffect(() => {
        fetchPostsAndComments();
    }, []);

    const fetchPostsAndComments = async () => {
        try {
            const { data: postsData, error: postsError } = await supabase
                .from("posts_duplicates")
                .select("id, content, planets2")

            if (postsError) {
                throw postsError;
            }

            const { data: commentsData, error: commentsError } = await supabase
                // .from<Comment>("comments")
                .from("comments")
                .select("*");

            if (commentsError) {
                throw commentsError;
            }

            // Organise the comments based on each post
            const commentsHierarchy = commentsData.reduce((acc, comment) => {
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
            const postsWithComments = postsData.map((post) => ({
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
            {posts.map((post => (
                <div key={post.id}>
                    <h2 className="text-2xl font-bold mb-4">Post: {post.id}</h2>
                    <p>{post.content}</p>
                    <CommentItem comments={post.comments} />
                </div>
            )))}
        </div>
    );
};

export default CommentSection;