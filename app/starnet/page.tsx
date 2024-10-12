"use client";

import React, { useEffect, useState } from "react";
import { PostCardSingle } from "@/content/Posts/PostSingle";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import StarnetLayout from "@/components/Layout/Starnet";

export default function Starnet() {
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

                // Extract image URLs from media
                const processedData = data.map((classification) => {
                    const media = classification.media;
                    let images: string[] = [];

                    if (Array.isArray(media) && media.length === 2 && typeof media[1] === 'string') {
                        images.push(media[1]); // Array formatted media
                    } else if (media && media.uploadUrl) {
                        images.push(media.uploadUrl); // Object formatted media
                    }

                    return { ...classification, images };
                });

                setClassifications(processedData);
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
        <StarnetLayout>
            <h2 className="text-2xl font-semibold mb-6 text-primary">Latest Community Discoveries</h2>
            {classifications.map((classification, index) => (
                <div key={classification.id} className="relative mb-8">
                    <PostCardSingle
                        title={classification.content || "Untitled"}
                        author={classification.author}
                        content={classification.content}
                        votes={0}
                        comments={0}
                        category={"General"}
                        tags={[]} 
                        images={classification.images} 
                    />
                    {index < classifications.length - 1 && (
                        <div className="squiggly-divider">
                            <div
                                className="squiggly-shape"
                                style={{
                                    left: `${Math.random() * 80 + 10}%`,
                                    top: `${Math.random() * 60}%`,
                                    transform: `rotate(${Math.random() * 360}deg)`,
                                }}
                            />
                            <div
                                className="squiggly-shape"
                                style={{
                                    left: `${Math.random() * 80 + 10}%`,
                                    top: `${Math.random() * 60}%`,
                                    transform: `rotate(${Math.random() * 360}deg)`,
                                }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </StarnetLayout>
    );
};