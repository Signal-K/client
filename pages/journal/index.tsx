import type { NextPage } from "next";
import CoreLayout from "../../components/Core/Layout";
import { useState, useEffect } from "react";
import { Text, NextUIProvider } from '@nextui-org/react';

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import JournalArticleCard from "../../components/Journal/ArticleCard";
import JournalNavbarComponent from "../../components/Journal/JournalNavbar";
import { Box } from "../../components/Journal/Box";

export default function JournalFeed () {
    const supabase = useSupabaseClient();
    const session = useSession();

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
            if (error) throw error;
        } catch (error: any) { alert(error.message) };
    };

    return (
        <><div></div>
        <NextUIProvider>
            <CoreLayout>
                <Box css={{ px: "$12", py: "$15", mt: "$12", "@xsMax": {px: "$10"}, maxWidth: "800px", margin: "0 auto" }}>
                    <>
                        {articles.map((article) => (
                            <JournalArticleCard article={article} />
                        ))}
                    </>
                </Box>
            </CoreLayout>
        </NextUIProvider></>
    )
}