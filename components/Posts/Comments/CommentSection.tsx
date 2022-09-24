import CommentItem from "./CommentsList";
import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { PostgrestResponse } from "@supabase/supabase-js";

const CommentSection: React.FC = () => {
    const [comments, setComments] = useState([]);
    const supabase = useSupabaseClient();

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const { data: commentsData, error } = await supabase.from("comments").select("*");
            if (error) { throw error; };

            const postIds = commentsData.map((comment) => comment.post_id)

            const { data: postsData, error: postsError } = await supabase
                .from("posts_duplicate")
                .select("id, content")
                .in("id", postIds);

            if (postsError) {
                throw postsError;
            }

            const commentsWithPosts = commentsData.map((comment) => {
                const post = postsData.find((post) => post.id === comment.post_id);
                return {
                    ...comment,
                    post: post ? post.content : null,
                };
            });

            setComments(commentsWithPosts);
        } catch (error) {
            console.error(error.message);
        };
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Comments</h2>
            <CommentItem comments={comments} />
        </div>
    );
};

export default CommentSection;