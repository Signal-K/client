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

    async function createComment(postId: number, content: string) {
        const { user } = session;
        if (!user) return;

        const { data, error } = await supabase
            .from("comments")
            .insert([
                {
                    author: session?.user?.id,
                    content: comment,
                    post_id: postId,
                    parent_comment_id: 1,
                },
            ]);
        
        if (error) {
            console.error(error);
        } else {
            console.log(data);
        }
    }

    const [commentsCount, setCommentsCount] = useState(0);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        await createComment(postId, comment);
        setComment("");
        setCommentsCount((prevCount) => prevCount + 1);
    };

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
            <button onClick={handleSubmit} className="bg-socialBlue text-white px-3 py-1 rounded-md">Post</button>
        </div>
    )
}

export default CommentFormCard;