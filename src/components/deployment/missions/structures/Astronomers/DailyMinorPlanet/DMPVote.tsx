'use client';

import React, { useEffect, useState } from "react";
import { PostCardSingle } from "@/src/components/social/posts/PostSingle";
import { useSession, useSupabaseClient } from "@/src/lib/auth/session-context";
import { incrementClassificationVote } from "@/src/lib/gameplay/classification-vote";
import { fetchClassificationsForVoting } from "@/src/lib/gameplay/classification-list";

export default function VoteDMPClassifications() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [classifications, setClassifications] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClassifications = async () => {
        if (!session?.user) {
            setError("User session not found.");
            setLoading(false);
            return;
        };

        setLoading(true);
        setError(null);
        try {
            const processedData = await fetchClassificationsForVoting({
                supabase,
                classificationType: "telescope-minorPlanet",
                getImages: (media) => {
                    if (Array.isArray(media) && media.length > 1) {
                        return media[1] && Array.isArray(media[1]) ? media[1] : [];
                    }
                    if (media && typeof media === "object" && "uploadUrl" in media && typeof (media as any).uploadUrl === "string") {
                        return [(media as any).uploadUrl];
                    }
                    return [];
                },
            });

            setClassifications(processedData);
        } catch (error) {
            console.error("Error fetching classifications:", error);
            setError("Failed to load classifications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassifications();
    }, [session]);

    const handleVote = async (classificationId: number, currentConfig: any) => {
        const updatedVotes = await incrementClassificationVote(
            classificationId,
            currentConfig?.votes || 0
        );

        if (updatedVotes === null) {
            return;
        }

        setClassifications((prevClassifications) =>
            prevClassifications.map((classification) =>
                classification.id === classificationId
                    ? { ...classification, votes: updatedVotes }
                    : classification
            )
        );
    };

    return (
        <div className="space-y-8">
            {loading ? (
                <p>Loading classifications...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                classifications.map((classification) => (
                    <PostCardSingle
                        key={classification.id}
                        classificationId={classification.id}
                        title={classification.title}
                        author={classification.author}
                        content={classification.content}
                        votes={classification.votes || 0}
                        category={classification.category}
                        tags={classification.tags || []}
                        images={classification.images || []}
                        anomalyId={classification.anomaly}
                        classificationConfig={classification.classificationConfiguration}
                        classificationType={classification.classificationtype}
                        onVote={() => handleVote(classification.id, classification.classificationConfiguration)}
                    />
                ))
            )}
        </div>
    );
};
