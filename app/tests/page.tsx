"use client";

import React, { useEffect, useState } from "react";
import { PostCardSingle } from "@/content/Posts/PostSingle";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function TestPage() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [classifications, setClassifications] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClassifications = async () => {
            if (!session?.user) {
                setError('User session not found.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('classifications')
                    .select('*')
                    .eq('author', session.user.id); 

                if (error) throw error;

                setClassifications(data);
            } catch (error) {
                console.error('Error fetching classifications:', error);
                setError('Failed to load classifications.');
            } finally {
                setLoading(false);
            }
        };

        fetchClassifications();
    }, [session]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (classifications.length === 0) return <p>No classifications found for this user.</p>;

    return (
        <div>
            {classifications.map((classification) => (
                <PostCardSingle
                    key={classification.id}
                    title={classification.content || "Untitled"}
                    author={classification.author} 
                    content={classification.content}
                    votes={0} 
                    comments={0} 
                    category={"General"} 
                    tags={[]} 
                />
            ))}
        </div>
    );
}