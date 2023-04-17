export default function PostPage () {
    return (
        <div>Post page stub</div>
    )
}

/*import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ClickOutHandler from 'react-clickout-handler';
import Card from "../../components/Card";

import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import AccountAvatar, { PostCardAvatar } from "../../components/AccountAvatar";
import { GameplayLayout } from "../../components/Core/Layout";
import PostCard from "../../components/PostCard";

export default function PostPage () {
    const [post, setPost] = useState(null);
    const router = useRouter();
    const postId = router?.query?.id;

    const supabase = useSupabaseClient();
    const session = useSession();

    useEffect(() => {
        if (!postId) { return; };
        fetchPost();
    }, [postId]);

    function fetchPost () {
        supabase.from('posts')
            .select()
            .eq('id', postId)
            .then(result => {
                if (result.error) { throw result.error; };
                if (result.data) { setPost(result.data[0]); };
            }
        )
    }

    return (
        <GameplayLayout>
            <div className="mx-100">
                <PostCard key = { post?.id } {...post} />
            </div>
        </GameplayLayout>
    )
}*/