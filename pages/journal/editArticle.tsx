import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import CoreLayout from "../../components/Core/Layout";
import Card from "../../components/Card";

export const EditJournalArticle: NextPage = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [username, setUsername] = useState('');

    const initialState = { title: '', content: '', };
    const [articleData, setArticleData] = useState(initialState);
    const handleChange = ( e: any ) => { setArticleData({ ...articleData, [ e.target.name ] : e.target.value }); };

    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function getArticle () {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .filter('id', 'eq', id)
                .single();
            if (error) {
                console.log(error);
            } else {
                setArticleData(data); // title, content of article
            }
        }

        if (typeof id !== 'undefined') { getArticle(); };
    }, [id]);

    async function getProfile () {
        try {
            setLoading(true);
            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, avatar_url, address`)
                .eq('id', session?.user?.id)
                .single()

            if (error && status !== 406) { throw error; };
            if (data) { setUsername( data.username ); };
        } catch (error) {
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
                .eq('id', id)
            
            if (error) throw error;
            router.push('/journal/Article?id=' + id);
        } catch (error: any) {
            console.log(error);
        }
    }

    return (
        <CoreLayout>
            <div className="mx-20"><Card noPadding={false}>
                <textarea
                    name='title'
                    aria-label="title"
                    placeholder="Article title"
                    rows={1}
                    onChange={handleChange}
                    defaultValue={articleData.title}
                /> <br /> <br />
                <textarea
                    name='content'
                    aria-label="content"
                    placeholder='Article content'
                    rows={12}
                    onChange={handleChange}
                    defaultValue={articleData.content}
                /> <br /> <br />
                <p>Editing as {session?.user?.email} : { username }</p>
                <button onClick={editArticle}>Update article</button>
            </Card></div>
        </CoreLayout>
    )
}

export default EditJournalArticle;