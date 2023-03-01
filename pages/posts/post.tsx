import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Layout from "../../components/Layout";
import Card from "../../components/Card";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import PostCard from "../../components/PostCard";

export default function IndividualPost () {
    const router = useRouter();
    const postId = router.query.id;

    const supabase = useSupabaseClient();
    const [post, setPost] = useState(null);

    useEffect(() => {
        if (!postId) { return; };
        fetchPost();
    }, [postId]);

    function fetchPost () {
        supabase.from('posts')
            .select() 
            .eq('id', postId)
            .then ( result => {
                if ( result.error ) { throw result.error; };
                if ( result.data ) {
                    console.log(result?.data[0]); 
                    setPost(result?.data[0]);
                };
            })
    }

    return (
        <>{/*<Layout hideNavigation={true}>
            <PostCard {...post} />
        </Layout>*/}
        <div>Test</div></>
    )
}