import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Text, Textarea, Grid, Button } from '@nextui-org/react';
import { useState } from "react";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const CreateJournalArticle: NextPage = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const router = useRouter();

    const initialState = { title: '', content: "", };
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
                    user_id: session?.user?.id,
                }])
                .single()
            
            if (error) throw error;
            setArticleData(initialState);
            router.push("/journal/");
        } catch ( error: any ) {
            alert(error.message);
        };
    };

    console.log(articleData);

    return (
        <Grid.Container gap={1}>
            <Text h3>Title</Text>
            <Grid xs={12}>
                <Textarea 
                    name="title" 
                    aria-label="title"
                    placeholder="Article Title"
                    fullWidth={true}
                    rows={1}
                    size="xl"
                    onChange={handleChange}
                />
            </Grid>
            <Text h3>Article Text</Text>
            <Grid xs={12}>
                <Textarea 
                    name="content" 
                    aria-label="content"
                    placeholder="Article Text"
                    fullWidth={true}
                    rows={6}
                    size="xl"
                    onChange={handleChange}
                />
            </Grid>
            <Grid xs={12}>
                <Text>Posting as {session?.user?.email}</Text>
            </Grid>
            <Button onPress={createArticle}>Create Article</Button>
        </Grid.Container>
    );
};

export default CreateJournalArticle;