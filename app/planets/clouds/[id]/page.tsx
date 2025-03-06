'use client';

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Navbar from "@/components/Layout/Navbar";
import { PostCardSingleWithGenerator } from "@/content/Posts/PostWithGen";

interface Classification {
    id: number;
    content: string | null;
    author: string | null;
    anomaly: Anomaly | null;
    media: (string | { uploadUrl?: string })[] | null;
    classificationtype: string | null;
    classificationConfiguration?: any;
    created_at: string;
    title?: string;
    votes?: number;
    category?: string;
    tags?: string[];
    images?: string[];
    relatedClassifications?: Classification[];
};

type Anomaly = {
    id: number;
    content: string | null;
    anomalytype: string | null;
    mass: number | null;
    radius: number | null;
    density: number | null;
    gravity: number | null;
    temperature: number | null;
    orbital_period: number | null;
    avatar_url: string | null;
    created_at: string;
};

export default function CloudDetails({
    params
}: {
    params: {
        id: string;
    }
}) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [classification, setClassification] = useState<Classification | null>(null);
    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!params.id || !session) {
            setLoading(false);
            return;
        };

        const fetchClassification = async () => {
            if (!params.id || !session) return;

            const { data, error } = await supabase
                .from("classifications")
                .select("*, anomaly:anomalies(*), classificationConfiguration, media")
                .eq("id", params.id)
                .single();

            if (error) {
                setError("Failed to fetch classification.");
                setLoading(false);
                return;
            };

            setClassification(data);
            setAnomaly(data.anomaly)


        };
    }, []);

    if (classification) {
        return (
            <div className="p-6 bg-black text-white border border-gray-200 rounded-md shadow-md">
                <Navbar />
                <div className="py-5"></div>
                <h1 className="text-2xl font-bold">{classification.content || `Cloud #${classification.id}`}</h1>
                {classification.author && (
                    <PostCardSingleWithGenerator
                        key={classification.id}
                        classificationId={classification.id}
                        title={classification.title || "Untitled"}
                        author={classification.author || "Unknown"}
                        content={classification.content || "No content available"}
                        votes={classification.votes || 0}
                        category={classification.classificationtype || "Uncategorized"}
                        tags={classification.tags || []}
                        images={classification.images || []}
                        anomalyId={classification.anomaly ? String(classification.anomaly.id) : ""}
                        classificationConfig={classification.classificationConfiguration}
                        classificationType={classification.classificationtype || "Unknown"}
                    />
                )}
            </div>
        );
    };

    return (
        <p>Loading...</p>
    );
};