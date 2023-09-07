import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import UserPostList from "./UsersPostsList";
import { Card, Grid } from "@tremor/react";

interface Post {
    id: number;
    content: string;
    author: string;
    created_at: string;
};

interface userPostCountProps {
    userId: string;
}

const UserPostCount: React.FC<userPostCountProps> = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const userId = session?.user?.id;
    const [postCount, setPostCount] = useState(0);

    useEffect(() => {
        fetchPostCount();
    }, []);

    const fetchPostCount = async () => {
        try {
            const { data: posts, error } = await supabase
                .from('posts_duplicates')
                .select('id')
                .eq('author', userId);

            if (error) {
                throw new Error(error.message);
            }

            setPostCount(posts?.length || 0);
        } catch (error) {
            console.error("Error fetching post count, ", error);
        }
    };

    return (
        <>
            <p className="text-gray-800 text-lg font-semibold">You've made {postCount} posts</p>
            <UserPostList />
        </>
    );
}

export default UserPostCount;