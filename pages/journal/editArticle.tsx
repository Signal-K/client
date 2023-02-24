import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Text, Textarea, Grid, Button } from '@nextui-org/react';
import { useState, useEffect } from "react";

import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const EditJournalArticle: NextPage = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    //const [profile, setProfile] = useState(null);
    const [username, setUsername] = useState('');
    
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(false);

    const initialState = { title: '', content: '', };
    const [articleData, setArticleData] = useState(initialState);
    const handleChange = ( e: any ) => { setArticleData({ ...articleData, [ e.target.name ] : e.target.value }); };
    
    useEffect(() => {
        async function getArticle () {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .filter("id", "eq", id)
                .single();
            if (error) {
                console.log(error);
            } else {
                setArticleData(data); // title, content
            }
        }

        if (typeof id !== "undefined") { getArticle(); };
    }, [id]);

    async function getProfile() {
        try {
            setLoading(true);
            if (!session?.user) throw new Error('No user authenticated');
            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, website, avatar_url, address`)
                .eq('id', session?.user?.id)
                .single()

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setUsername(data.username);
            }

        } catch (error) {
            alert('Error loading your user data');
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const editArticle = async () => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .update([
                    { title: articleData.title, content: articleData.content, }
                ])
                .eq("id", id)
            
            if (error) throw error;
            router.push('/journal/Article?id=' + id);
        } catch (error: any) {
            alert(error.message);
        }
    }
    
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
                    initialValue={articleData.title}
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
                    initialValue={articleData.content}
                />
            </Grid>
            <Grid xs={12}>
                <Text>Editing as {session?.user?.email} : {username}</Text>
            </Grid>
            <Button onPress={editArticle}>Update Article</Button>
        </Grid.Container>
    )
}

export default EditJournalArticle;
//export const getServerSidePropsForJournal = withPageAuth({ redirectTo: '/login' });