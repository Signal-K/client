'use client';

import React, { useEffect, useState } from "react";
import { PostCardSingle } from "@/content/Posts/PostSingle";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface Classification {
    id: number;
    created_at: string;
    content: string | null; 
    author: string | null;
    anomaly: number | null;
    media: any | null; 
    classificationtype: string | null;
    classificationConfiguration: any | null; 
};

export default function CommentVoteSunspot() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [classifications, setClassifications] = useState<any[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClassifications = async () => {
        if (!session) {
            setError('User session not found');
            setLoading(false);
            return(error);
        };

        setLoading(true);
        setError(null);

        try {
            const {
                data, error
            } = await supabase
                .from("classifications")
                .select("*")
                .eq('classificationtype', 'sunspot')
                .order('created_at', {
                    ascending: false
                }) as {
                    data: Classification[];
                    error: any
                };

            if (error) {
                throw error;
            };
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        };
    };

    return (
        <></>
    );
};