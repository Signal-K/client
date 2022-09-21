import CommentItem from "./CommentsList";
import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const CommentSection: React.FC = () => {
    const [comments, setComments] = useState([]);
    const supabase = useSupabaseClient();

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase.from("comments").select("*");
            if (error) { throw error; };
            setComments(data);
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