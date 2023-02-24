import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Text, NextUIProvider } from '@nextui-org/react';

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import JournalArticleCard from "../../components/Journal/ArticleCard";
import JournalNavbarComponent from "../../components/Journal/JournalNavbar";
import { Box } from "../../components/Journal/Box";

const JournalFeed: NextPage = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const router = useRouter();
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        getArticles();
    }, []);

    const getArticles = async () => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select("*")
                .limit(10)
            console.log(data);
            if (data != null) { setArticles(data); };
        } catch (error: any) { alert(error.message) };
    };

    return (
        <NextUIProvider>
            <JournalNavbarComponent />
            <Box css={{ px: "$12", py: "$15", mt: "$12", "@xsMax": {px: "$10"}, maxWidth: "800px", margin: "0 auto" }}>
                <>
                    <Text h2>Main Feed</Text>
                    <Text size="$lg" css={{my: "$8"}}>
                        Check out articles from users here
                    </Text>
                    {articles.map((article) => (
                        <JournalArticleCard article={article}/>
                    ))}
                </>
            </Box>
        </NextUIProvider>
    );
};

export default JournalFeed;