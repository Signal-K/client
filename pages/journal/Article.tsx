import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Text, Spacer, User, Button, NextUIProvider } from '@nextui-org/react';
import { Box } from "../../components/Journal/Box";
import JournalNavbarComponent from "../../components/Journal/JournalNavbar";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Avatar from "../../components/Avatar";

const JournalArticle: NextPage = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [article, setArticle] = useState<any>({});

    const router = useRouter();
    const { id } = router.query;

    useEffect (() => {
        async function getArticle () {
            const { data, error } = await supabase
                .from('articles') // Should select from "posts" that are marked as articles (maybe?)
                .select("*")
                .filter("id", "eq", id)
                .single();
            if (error) {
                console.log ( error );
            } else {
                setArticle(data);
            };
        };

        if ( typeof id !== "undefined" ) { getArticle(); };
    }, [id]);

    const deleteArticle = async () => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id)
            if (error) throw error;
            router.push('/journal/');
        } catch ( error: any ) {
            alert(error.message);
        }
    }

    return (
        <NextUIProvider>
            <JournalNavbarComponent />
            <Box css={{ px: "$12", py: "$15", mt: "$12", "@xsMax": {px: "$10"}, maxWidth: "800px", margin: "0 auto" }}>
                <>
                    <Text h2>{article.title}</Text>
                    <Spacer y={.5} />
                    <Avatar url={article?.user_id?.avatar_url} size='lg' />
                    <Spacer y={1} />
                    <Text size="$lg">
                        {article.content}
                    </Text>
                    { session?.user && article.user_id === session?.user?.id ?
                        <>
                            <Spacer y={.5} />
                            <Button size="sm" onPress={() => router.push("/journal/editArticle?id=" + id)}> {/* localhost:3000/editArticle */}
                                Edit
                            </Button>
                            <Spacer y={.5} />
                            <Button size="sm" color="error" onPress={() => deleteArticle()}>
                                Delete
                            </Button>
                        </>
                    : null}
                </>
            </Box>
        </NextUIProvider>
    )
}

export default JournalArticle;