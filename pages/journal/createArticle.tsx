import type { NextPage } from "next";
import React, { useState } from 'react';
import { useRouter } from "next/router";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import CoreLayout from "../../components/Core/Layout";

const CreateJournalArticle: NextPage = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const router = useRouter();

    const initialState = { title: '', content: '', };
    const [articleData, setArticleData] = useState(initialState);
    const handleChange = ( e: any ) => { setArticleData({ ...articleData, [ e.target.name ] : e.target.value }); };
    const createArticle = async () => {
        try {
            const { data, error } = await supabase
                .from("articles")
                .insert([{
                    title: articleData.title,
                    content: articleData.content,
                    //user_email: session?.user?.email,
                    user_id: session?.user?.id, // add getProfile() to get username/other info (including avatar)
                }])
                .single();

            if (error) throw error;
            setArticleData(initialState);
            router.push('/journal')
        } catch ( error: any ) {
            alert(error.message);
        };
    };

    console.log(articleData);

    return (
        <CoreLayout>
            <>
                <p>Posting as {session?.user?.id}</p><br />
                <textarea
                    name='title'
                    aria-label="title"
                    placeholder="Article title"
                    onChange={handleChange}
                />
                <br /><p>Article Text</p><br />
                <textarea
                    name='content'
                    aria-label="content"
                    placeholder="Article content"
                    onChange={handleChange}
                />
                <button onClick={createArticle}>Create Article</button>
            </>
        </CoreLayout>
    )
}

export default CreateJournalArticle;