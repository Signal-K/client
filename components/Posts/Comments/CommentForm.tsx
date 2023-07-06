import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { PostCardAvatar } from "../../AccountAvatar";

interface CommentFormCardProps {
    postId: number;
    onComment: () => void;
};

const CommentFormCard: React.FC<CommentFormCardProps> = ({ postId, onComment }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [comment, setComment] = useState("");
    
    const [avatar_url, setAvatarUrl] = useState(null);

    useEffect(() => {
        supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", session?.user?.id)
            .then((result) => {
                setAvatarUrl(result?.data[0]?.avatar_url);
            });
    }, [session]);

    function createComment() {
        supabase.from("comments")
        .insert({
            author: session?.user?.id,
            content: comment,
            post_id: postId,
        })
        .then((response) => {
            if (!response.error) {
                alert(`Comment "${comment}" created`);
                setComment("");
                if (onComment) { onComment(); };
            }
        });
    }

    return (
        <div className="flex gap-2 ml-8">
            <div><PostCardAvatar url={avatar_url} size={30} /></div>
            {session?.user && (
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="grow p-1 h-8 rounded-lg"
                    placeholder={`Write a comment...`}
                />
            )}
            <button onClick={createComment} className="bg-socialBlue text-white px-3 py-1 rounded-md">Post</button>
        </div>
    )
}

export default CommentFormCard;