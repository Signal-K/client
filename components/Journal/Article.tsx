import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Text, Spacer, User, Button } from '@nextui-org/react';

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

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
            router.push('/journal/feed');
        } catch ( error: any ) {
            alert(error.message);
        }
    }

    return (
        <>
            <Text h2>{article.title}</Text>
            <Spacer y={.5} />
            <User
                name={article.user_email?.toLowerCase()}
                size="md"
            />
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
    )
}

export default JournalArticle;