import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { Box } from "../../components/Journal/Box";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Comments, AuthModal, CommentsProvider } from 'supabase-comments-extension';
import Avatar from "../../components/Avatar";
import { NextUIProvider } from "@nextui-org/react";
import CoreLayout from "../../components/Core/Layout";

const JournalArticle: NextPage = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [article, setArticle] = useState<any>({});

    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        async function getArticle () {
            const { data, error } = await supabase
                .from('articles') // Should select from "posts" that are marked as articles (maybe?)
                .select("*")
                .filter("id", "eq", id)
                .single();
            if (error) {
                console.log( error );
            } else {
                setArticle(data);
            };
        };

        if ( typeof id !== "undefined" ) { getArticle(); };
    }, [id]);

    const deleteArticle = async () => {
        // if session?.user?.id == article?.author?.id...
        try {
            const { data, error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id);
            if (error) throw error;
            router.push('/journal');
        } catch ( error: any ) {
            alert(error.message);
        }
    }

    function editArticleLink () {
        router.push('/journal/editArticle?id=' + article.id);
    }

    return (
        <CoreLayout>
            <NextUIProvider>
                <Box css={{ px: "$12", py: "$15", mt: "$12", "@xsMax": {px: "$10"}, maxWidth: "800px", margin: "0 auto" }}>
                    <>
                        {/*<CommentsProvider
                            supabaseClient={supabase}
    >*/}
                            <h1 className="text-4xl mb-10">{article.title}</h1>
                            <p>{article.content}</p>
                            {/*{ session?.user && article.user_id === session?.user?.id ?
                                <>
                                    <Spacer y={.5} />
                                    <Button size="sm" onPress={() => router.push("/journal/editArticle?id=" + id)}> {/* localhost:3000/editArticle */}{/*
                                        Edit
                                    </Button>
                                    <Spacer y={.5} />
                                    <Button size="sm" color="error" onPress={() => deleteArticle()}>
                                        Delete
                                    </Button>
                                </>
                            : null}*/}
                            <br /><br /><br />
                            <button onClick={editArticleLink}>Edit article</button>
                            <div className="articleTags mt-10">
                            <h2 className="text-xl">Tags</h2>
                            <p>{article?.tags?.tag1}, {article?.tags?.tag2}</p></div>
                        
                    </>
                </Box>
            </NextUIProvider>
        </CoreLayout>
    )
}

export default JournalArticle;